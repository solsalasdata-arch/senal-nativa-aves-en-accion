import { mkdir, writeFile } from 'node:fs/promises';
import { lookup } from 'node:dns/promises';
import { isIP } from 'node:net';
import { fileURLToPath } from 'node:url';
import QRCode from 'qrcode';
import { CHECKPOINTS_DATA } from '../src/data/birdsData';
import { buildStationQrUrl, buildStationToken, DEFAULT_PUBLIC_APP_URL } from '../src/utils/stationQr';

function isPrivateAddress(address: string): boolean {
  if (isIP(address) === 6) {
    const ip = address.toLowerCase();
    return !/^[23]/.test(ip);
  }
  const [a, b] = address.split('.').map(Number);
  return a === 0 || a === 10 || a === 127 || (a === 169 && b === 254)
    || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168)
    || (a === 100 && b >= 64 && b <= 127) || a >= 224;
}

const base = new URL(process.env.PUBLIC_APP_URL || DEFAULT_PUBLIC_APP_URL);
const hostname = base.hostname.replace(/^\[|\]$/g, '').toLowerCase();
if (!['http:', 'https:'].includes(base.protocol) || base.username || base.password
  || base.pathname !== '/' || base.search || base.hash
  || !hostname.includes('.') && !isIP(hostname)
  || /(^|\.)(localhost|local|internal)$/.test(hostname)) {
  throw new Error('PUBLIC_APP_URL must be a public http(s) origin');
}
const addresses = isIP(hostname) ? [{ address: hostname }] : await lookup(hostname, { all: true });
if (!addresses.length || addresses.some(item => isPrivateAddress(item.address))) {
  throw new Error('PUBLIC_APP_URL must not use a loopback or private host');
}

const output = fileURLToPath(new URL('../public/qr/estaciones/', import.meta.url));
await mkdir(output, { recursive: true });
const escapeXml = (value: string) => value.replace(/[&<>"']/g, char => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;'
})[char]!);
const manifest = [];
for (const station of CHECKPOINTS_DATA) {
  const token = buildStationToken(station.id);
  const url = buildStationQrUrl(station.id, base.origin);
  const slug = station.name.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const prefix = `estacion-${String(station.id).padStart(2, '0')}-${slug}`;
  const files = { svg: `${prefix}.svg`, png: `${prefix}-qr.png` };
  const options = { errorCorrectionLevel: 'Q' as const, margin: 4, color: { dark: '#072A21', light: '#FFFFFF' } };
  const qr = await QRCode.toString(url, { ...options, type: 'svg' });
  const embeddedQr = qr.slice(qr.indexOf('<svg')).replace('<svg ', '<svg x="65" y="200" width="470" height="470" ');
  const card = `<svg xmlns="http://www.w3.org/2000/svg" width="105mm" height="148mm" viewBox="0 0 600 846">
<rect width="600" height="846" fill="#FFFFFF"/>
<rect width="600" height="96" fill="#0B3B2E"/>
<rect y="96" width="600" height="8" fill="#F59E0B"/>
<g font-family="Arial, sans-serif" text-anchor="middle">
<text x="300" y="56" font-size="25" font-weight="bold" fill="#FFFFFF">Señal Nativa · Aves en Acción</text>
<rect x="172" y="118" width="256" height="49" rx="14" fill="#F59E0B"/>
<text x="300" y="152" font-size="32" font-weight="bold" fill="#072A21">Estación ${station.id}</text>
<text x="300" y="187" font-size="23" fill="#0B3B2E">${escapeXml(station.name)}</text>
${embeddedQr}
<rect x="100" y="697" width="400" height="4" fill="#14B8A6"/>
<text x="300" y="732" font-size="20" fill="#0B3B2E">Escaneá con la cámara del teléfono</text>
<text x="300" y="760" font-size="20" fill="#0B3B2E">o desde el mapa de Señal Nativa</text>
<text x="300" y="798" font-size="15" fill="#0B3B2E">${token}</text>
</g></svg>
`;
  await writeFile(`${output}${files.svg}`, card);
  await QRCode.toFile(`${output}${files.png}`, url, { ...options, width: 1200 });
  manifest.push({ id: station.id, name: station.name, token, url, files });
}
await writeFile(`${output}manifest.json`, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`Generated ${manifest.length} station cards, ${manifest.length} QR PNGs and manifest.json`);
