/// <reference types="node" />
import type { IncomingMessage, ServerResponse } from 'node:http';
import { GoogleGenAI, Type } from '@google/genai';

// Server-side bird identification for the XR viewer. The Gemini key never reaches the browser.
// Species the app has loaded: `number` must match `catalogNumber` in src/data/birdsData.ts.
const CATALOG_SPECIES = [
  { number: '001', common: 'Chingolo', scientific: 'Zonotrichia capensis' },
  { number: '002', common: 'Tangara sayaca (Celestino)', scientific: 'Thraupis sayaca' },
  { number: '003', common: 'Chercán (Ratona)', scientific: 'Troglodytes aedon' },
  { number: '004', common: 'Zorzal colorado', scientific: 'Turdus rufiventris' },
  { number: '005', common: 'Paloma picazuró', scientific: 'Patagioenas picazuro' },
  { number: '006', common: 'Saltator de pico dorado (Rey del bosque)', scientific: 'Saltator aurantiirostris' },
  { number: '007', common: 'Benteveo', scientific: 'Pitangus sulphuratus' },
  { number: '008', common: 'Tero', scientific: 'Vanellus chilensis' },
  { number: '009', common: 'Jilguero azafranado', scientific: 'Sicalis flaveola' },
  { number: '010', common: 'Tordo renegrido', scientific: 'Molothrus bonariensis' },
  { number: '011', common: 'Urraca morada (Urraca criolla)', scientific: 'Cyanocorax chrysops' },
  { number: '012', common: 'Suirirí real', scientific: 'Tyrannus melancholicus' },
  { number: '013', common: 'Carancho', scientific: 'Caracara plancus' },
  { number: '014', common: 'Hornero', scientific: 'Furnarius rufus' },
  { number: '015', common: 'Candelita de gorro pardo (Arañero corona rojiza)', scientific: 'Myioborus brunniceps' },
  { number: '016', common: 'Parula tropical (Pitiayumí)', scientific: 'Setophaga pitiayumi' },
  { number: '017', common: 'Pava de las yungas (Pava de monte yungueña)', scientific: 'Penelope bridgesi' },
  { number: '018', common: 'Aratinga mitrada (Calancate cara roja)', scientific: 'Psittacara mitratus' },
  { number: '019', common: 'Tangara azul y amarilla (Naranjero)', scientific: 'Pipraeidea bonariensis' },
  { number: '020', common: 'Chinchero chico / Ticotico cejicanelo', scientific: 'Lepidocolaptes angustirostris o Syndactyla rufosuperciliata' },
  { number: '021', common: 'Tordo bayo (Músico)', scientific: 'Agelaioides badius' },
];

const MAX_IMAGE_BASE64_LENGTH = 1_500_000;

// Abuse limits on calls that reach Gemini. A whole school group can share one IP, so the per-IP
// limit is generous. They live in this instance's memory and reset on a cold start: the hard
// ceiling on spending is the quota configured on the Gemini key itself.
const RATE_WINDOW_MS = 60_000;
const MAX_CALLS_PER_IP = 60;
const MAX_CALLS_TOTAL = 240;
const recentCalls = new Map<string, number[]>();

function isRateLimited(ip: string, now: number): boolean {
  let total = 0;
  for (const [key, times] of recentCalls) {
    const fresh = times.filter((t) => now - t < RATE_WINDOW_MS);
    if (fresh.length > 0) recentCalls.set(key, fresh);
    else recentCalls.delete(key);
    total += fresh.length;
  }
  const mine = recentCalls.get(ip) || [];
  if (mine.length >= MAX_CALLS_PER_IP || total >= MAX_CALLS_TOTAL) return true;
  mine.push(now);
  recentCalls.set(ip, mine);
  return false;
}

export type IdentifyBirdResult =
  | { kind: 'catalog'; catalogNumber: string }
  | { kind: 'other_bird'; name: string }
  | { kind: 'no_bird' };

const PROMPT = `Eres el identificador de aves de una app educativa del Parque Botánico Barón Schuel (Yungas de Jujuy, Argentina).
Mira la imagen, que viene de la cámara de un teléfono, y responde:
- "catalog": se ve claramente un ave real (en vivo, o en una foto, pantalla o lámina) y es una de las especies de la lista. Indica su número en catalogNumber.
- "other_bird": se ve claramente un ave real pero NO es ninguna especie de la lista, o no puedes distinguir cuál es. Indica en name su nombre común en español si lo reconoces, o deja name vacío.
- "no_bird": no hay un ave reconocible (personas, objetos, muebles, plantas, paisajes, texto, logos, juguetes, imagen borrosa u oscura).
Sé estricto: nunca elijas una especie de la lista por parecido vago ni para no dejar la respuesta vacía.

Lista de especies cargadas:
${CATALOG_SPECIES.map((s) => `${s.number}: ${s.common} (${s.scientific})`).join('\n')}`;

function send(res: ServerResponse, status: number, body: unknown) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(body));
}

async function readJsonBody(req: IncomingMessage): Promise<unknown> {
  // Vercel already parses JSON bodies; a plain Node server (vite dev) does not
  const parsed = (req as IncomingMessage & { body?: unknown }).body;
  if (parsed !== undefined) return typeof parsed === 'string' ? JSON.parse(parsed) : parsed;

  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of req) {
    size += (chunk as Buffer).length;
    if (size > MAX_IMAGE_BASE64_LENGTH + 2048) throw new Error('payload too large');
    chunks.push(chunk as Buffer);
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return send(res, 405, { error: 'method_not_allowed' });
  }

  // Only the app itself may spend the key. Browsers always send Origin on a POST fetch,
  // so a missing one is not the app either.
  let originHost = '';
  try {
    originHost = new URL(req.headers.origin || '').host;
  } catch {
    // missing or malformed Origin
  }
  if (!originHost || originHost !== req.headers.host) return send(res, 403, { error: 'forbidden' });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return send(res, 503, { error: 'not_configured' });

  let image = '';
  try {
    const body = (await readJsonBody(req)) as { image?: unknown } | null;
    if (typeof body?.image === 'string') image = body.image;
  } catch {
    return send(res, 400, { error: 'invalid_body' });
  }
  const match = /^data:image\/(jpeg|png|webp);base64,([A-Za-z0-9+/=]+)$/.exec(image);
  if (!match || match[2].length > MAX_IMAGE_BASE64_LENGTH) {
    return send(res, 400, { error: 'invalid_image' });
  }

  const forwardedFor = req.headers['x-forwarded-for'];
  const clientIp =
    String(req.headers['x-real-ip'] || '') ||
    String(Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor || '').split(',')[0].trim() ||
    req.socket?.remoteAddress ||
    'unknown';
  if (isRateLimited(clientIp, Date.now())) {
    res.setHeader('Retry-After', '60');
    return send(res, 429, { error: 'rate_limited' });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: process.env.GEMINI_MODEL || 'gemini-flash-latest',
      contents: [
        {
          role: 'user',
          parts: [{ inlineData: { mimeType: `image/${match[1]}`, data: match[2] } }, { text: PROMPT }]
        }
      ],
      config: {
        temperature: 0,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            kind: { type: Type.STRING, enum: ['catalog', 'other_bird', 'no_bird'] },
            catalogNumber: { type: Type.STRING },
            name: { type: Type.STRING }
          },
          required: ['kind']
        }
      }
    });

    const answer = JSON.parse(response.text || '{}') as { kind?: string; catalogNumber?: string; name?: string };
    let result: IdentifyBirdResult = { kind: 'no_bird' };
    if (answer.kind === 'catalog') {
      const number = String(answer.catalogNumber || '').replace(/\D/g, '').padStart(3, '0');
      // A number outside the list means the model saw a bird we have not loaded
      result = CATALOG_SPECIES.some((s) => s.number === number)
        ? { kind: 'catalog', catalogNumber: number }
        : { kind: 'other_bird', name: '' };
    } else if (answer.kind === 'other_bird') {
      result = { kind: 'other_bird', name: String(answer.name || '').slice(0, 60) };
    }
    return send(res, 200, result);
  } catch (err) {
    console.error('identify-bird failed', err);
    return send(res, 502, { error: 'identification_failed' });
  }
}
