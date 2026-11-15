import jsQR from 'jsqr';

export function decodeQrPixels(data: Uint8ClampedArray, width: number, height: number): string | null {
  return jsQR(data, width, height, { inversionAttempts: 'attemptBoth' })?.data || null;
}

type Frame = HTMLVideoElement | HTMLCanvasElement | ImageBitmap | HTMLImageElement;
type NativeDetector = { detect(source: Frame): Promise<{ rawValue: string }[]> };
type DetectorConstructor = { new(options: { formats: string[] }): NativeDetector; getSupportedFormats(): Promise<string[]> };
export interface QrDecoder {
  readonly engine: 'barcode-detector' | 'jsqr';
  decode(source: Frame, maxSide?: number): Promise<string | null>;
}

export async function createQrDecoder(): Promise<QrDecoder> {
  const Detector = (globalThis as typeof globalThis & { BarcodeDetector?: DetectorConstructor }).BarcodeDetector;
  let native: NativeDetector | null = null;
  try {
    if (Detector && (await Detector.getSupportedFormats()).includes('qr_code')) native = new Detector({ formats: ['qr_code'] });
  } catch { /* use bundled decoder */ }
  let canvas: HTMLCanvasElement | undefined;
  return {
    get engine() { return native ? 'barcode-detector' : 'jsqr'; },
    async decode(source, maxSide = 768) {
      if (native) {
        try { return (await native.detect(source))[0]?.rawValue || null; }
        catch { native = null; }
      }
      const width = 'videoWidth' in source ? source.videoWidth : 'naturalWidth' in source ? source.naturalWidth : source.width;
      const height = 'videoHeight' in source ? source.videoHeight : 'naturalHeight' in source ? source.naturalHeight : source.height;
      if (!width || !height) return null;
      canvas ||= document.createElement('canvas');
      const scale = Math.min(1, maxSide / Math.max(width, height));
      canvas.width = Math.max(1, Math.round(width * scale));
      canvas.height = Math.max(1, Math.round(height * scale));
      const context = canvas.getContext('2d', { willReadFrequently: true });
      if (!context) throw new Error('Canvas no disponible');
      context.drawImage(source, 0, 0, canvas.width, canvas.height);
      return decodeQrPixels(context.getImageData(0, 0, canvas.width, canvas.height).data, canvas.width, canvas.height);
    }
  };
}

export interface QrScanOptions {
  intervalMs?: number;
  dedupeMs?: number;
  now?: () => number;
  schedule?: (callback: () => void, delay: number) => unknown;
  cancel?: (handle: unknown) => void;
  onError?: (error: unknown) => void;
}

export function startQrScanLoop(video: HTMLVideoElement, decoder: QrDecoder,
  onText: (text: string) => boolean | Promise<boolean>, opts: QrScanOptions = {}) {
  const schedule = opts.schedule || ((callback, delay) => setTimeout(callback, delay));
  const cancel = opts.cancel || (handle => clearTimeout(handle as ReturnType<typeof setTimeout>));
  const now = opts.now || Date.now;
  let stopped = false;
  let handle: unknown;
  const seen = new Map<string, number>();
  const stop = () => { stopped = true; if (handle !== undefined) cancel(handle); };
  const tick = async () => {
    if (stopped) return;
    try {
      if (video.readyState >= 2 && video.videoWidth > 0) {
        const text = await decoder.decode(video);
        if (stopped) return;
        const time = now();
        for (const [key, timestamp] of seen) if (time - timestamp >= (opts.dedupeMs ?? 2000)) seen.delete(key);
        if (text && !seen.has(text)) {
          seen.set(text, time);
          if (await onText(text)) stop();
        }
      }
    } catch (error) { if (!stopped) opts.onError?.(error); }
    if (!stopped) handle = schedule(() => { void tick(); }, opts.intervalMs ?? 200);
  };
  handle = schedule(() => { void tick(); }, 0);
  return { stop };
}

export function stopMediaStream(stream?: MediaStream | null): void {
  stream?.getTracks().forEach(track => { try { track.stop(); } catch { /* already released */ } });
}

export async function decodeQrFromFile(file: File): Promise<string | null> {
  let source: ImageBitmap | HTMLImageElement;
  let objectUrl: string | undefined;
  try {
    try { source = await createImageBitmap(file); }
    catch {
      objectUrl = URL.createObjectURL(file);
      source = await new Promise<HTMLImageElement>((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = () => reject(new Error('No se pudo leer la foto'));
        image.src = objectUrl!;
      });
    }
    try {
      const decoder = await createQrDecoder();
      const text = await decoder.decode(source, 2400);
      if (text) return text;
      // Native misses and large photos also get the bundled pixel decoder.
      const canvas = document.createElement('canvas');
      canvas.width = 'naturalWidth' in source ? source.naturalWidth : source.width;
      canvas.height = 'naturalHeight' in source ? source.naturalHeight : source.height;
      const context = canvas.getContext('2d');
      if (!context) throw new Error('Canvas no disponible');
      context.drawImage(source, 0, 0);
      for (const size of [2400, 768]) {
        // A canvas pixel frame bypasses native detection for reliable photo fallback.
        const scale = Math.min(1, size / Math.max(canvas.width, canvas.height));
        const frame = document.createElement('canvas');
        frame.width = Math.max(1, Math.round(canvas.width * scale));
        frame.height = Math.max(1, Math.round(canvas.height * scale));
        const ctx = frame.getContext('2d', { willReadFrequently: true });
        if (!ctx) continue;
        ctx.drawImage(canvas, 0, 0, frame.width, frame.height);
        const result = decodeQrPixels(ctx.getImageData(0, 0, frame.width, frame.height).data, frame.width, frame.height);
        if (result) return result;
      }
      return null;
    } finally { if ('close' in source) source.close(); }
  } finally { if (objectUrl) URL.revokeObjectURL(objectUrl); }
}
