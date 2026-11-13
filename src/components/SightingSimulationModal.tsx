import React, { useState, useRef, useEffect } from 'react';
import {
  Binoculars,
  X,
  Battery,
  ShieldCheck,
  Sparkles,
  Star,
  CheckCircle2,
  Volume2,
  Camera,
  RefreshCw,
  HelpCircle,
  Eye,
  Pause,
  ScanSearch
} from 'lucide-react';
import { soundManager } from '../utils/audio';
import { requestMobileCameraStream, switchToOtherCamera, countVideoInputs } from '../utils/camera';
import { CATALOG_BIRDS_DATA } from '../data/birdsData';
import { CatalogBird, PlayerProfile } from '../types/game';
import type { IdentifyBirdResult } from '../../api/identify-bird';

interface SightingSimulationModalProps {
  isOpen: boolean;
  onClose: () => void;
  playerProfile: PlayerProfile;
  onSightingSuccess: (birdId: string, stars: number) => void;
  onOpenQuizConsignas: () => void;
}

const XR_TUTORIAL_SEEN_KEY = 'senial_nativa_xr_tutorial_seen_v1';
const XR_MAX_SCAN_ATTEMPTS = 4;

type ScanState = 'scanning' | 'detected' | 'other_bird' | 'no_bird' | 'error' | 'no_camera';

const SCAN_LABELS: Record<ScanState, string> = {
  scanning: 'Buscando aves…',
  detected: '¡Especie detectada!',
  other_bird: 'Ave en proceso de carga',
  no_bird: 'No veo un ave',
  error: 'No se pudo identificar',
  no_camera: 'Activa la cámara'
};

const SCAN_HINTS: Record<ScanState, string> = {
  scanning: 'Apunta hacia un ave y espera…',
  detected: '',
  other_bird: 'Esta ave todavía no está en el catálogo',
  no_bird: 'No veo un ave. Apunta a una y busca de nuevo',
  error: 'No se pudo identificar ahora. Busca de nuevo',
  no_camera: 'Activa la cámara para identificar aves'
};

// #020 is presented in XR as the park's featured Chinchero Chico
const XR_CHINCHERO: CatalogBird = {
  id: '020-ticotico-cejicanelo',
  catalogNumber: '020',
  commonName: 'Chinchero Chico / Ticotico',
  scientificName: 'Lepidocolaptes angustirostris',
  size: '21 cm',
  weight: '36 g',
  family: 'FURNARIIDAE',
  habitat: 'Bosques abiertos y troncos de Selva Montana (Yungas)',
  stratum: 'Subdosel',
  conservationStatus: 'NA',
  presence: 'R',
  observationPossibility: 'A',
  beakDescription: 'Pico delgado y decurvado',
  songDescription: 'Trino descendente de llamada',
  plumageDescription: 'Dorso pardo-rufo y ceja blanca',
  cp: 2579,
  hp: '125 / 125 HP',
  hints: {
    size: '21 cm',
    habitat: 'Subdosel',
    morphology: 'Pico curvo',
    loreOrFact: 'Trepa cortezas'
  },
  soundType: '020-ticotico-cejicanelo',
  image: '/assets/aistudio/chinchero_chico_portrait.jpg',
  audioUrl: '/assets/aves/20-Ticotico cejicanelo.mp3',
  silhouetteIcon: '🪵'
};

export const SightingSimulationModal: React.FC<SightingSimulationModalProps> = ({
  isOpen,
  onClose,
  onSightingSuccess,
  onOpenQuizConsignas
}) => {
  // The XR viewer identifies the species from the camera image: null until a catalog bird is recognised
  const [detectedBird, setDetectedBird] = useState<CatalogBird | null>(null);
  const [scanState, setScanState] = useState<ScanState>('scanning');
  const [otherBirdName, setOtherBirdName] = useState('');
  const [isSongPlaying, setIsSongPlaying] = useState(false);
  const [canFlipCamera, setCanFlipCamera] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [useRealCamera, setUseRealCamera] = useState(false);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [nativePhotoUrl, setNativePhotoUrl] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [focusSlider, setFocusSlider] = useState(85);
  const [isPhotoCapturing, setIsPhotoCapturing] = useState(false);
  const [showBirdInfoSheet, setShowBirdInfoSheet] = useState(false);
  const [cleanViewMode, setCleanViewMode] = useState(false);
  const [photoResult, setPhotoResult] = useState<{
    stars: number;
    criteria: { centered: boolean; focus: boolean; respectful: boolean };
    birdName: string;
    photoUrl: string;
  } | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const scanTimerRef = useRef<number | null>(null);
  const scanIdRef = useRef(0);
  const scanAbortRef = useRef<AbortController | null>(null);
  const cameraStartingRef = useRef(false);
  const nativePhotoRef = useRef<string | null>(null);

  useEffect(() => {
    nativePhotoRef.current = nativePhotoUrl;
  }, [nativePhotoUrl]);

  const stopSong = () => {
    soundManager.stopCurrentAudio();
    setIsSongPlaying(false);
  };

  // Also invalidates an identification request that is still in flight
  const clearScanTimer = () => {
    scanIdRef.current += 1;
    scanAbortRef.current?.abort();
    scanAbortRef.current = null;
    if (scanTimerRef.current !== null) {
      window.clearTimeout(scanTimerRef.current);
      scanTimerRef.current = null;
    }
  };

  // Current camera frame (or the photo taken with the phone camera) as a small JPEG
  const captureFrameForIdentification = async (): Promise<string | null> => {
    const video = videoRef.current;
    let source: HTMLVideoElement | HTMLImageElement | null = null;
    let sourceW = 0;
    let sourceH = 0;
    if (streamRef.current && video && video.readyState >= 2 && video.videoWidth > 0) {
      source = video;
      sourceW = video.videoWidth;
      sourceH = video.videoHeight;
    } else if (nativePhotoRef.current) {
      const photo = new Image();
      photo.src = nativePhotoRef.current;
      try {
        await photo.decode();
        source = photo;
        sourceW = photo.naturalWidth;
        sourceH = photo.naturalHeight;
      } catch {
        // unreadable photo
      }
    }
    if (!source || !sourceW || !sourceH) return null;

    const scale = Math.min(1, 640 / Math.max(sourceW, sourceH));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(sourceW * scale);
    canvas.height = Math.round(sourceH * scale);
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.8);
  };

  const runScanAttempt = (scanId: number, attempt: number, missingFrames: number) => {
    const delay = missingFrames > 0 ? 500 : attempt === 1 ? 900 : 2500;
    scanTimerRef.current = window.setTimeout(async () => {
      scanTimerRef.current = null;
      const frame = await captureFrameForIdentification();
      if (scanIdRef.current !== scanId) return;
      if (!frame) {
        // Nothing to look at yet: wait while the camera is opening, otherwise ask for it
        if (missingFrames < (cameraStartingRef.current ? 12 : 2)) runScanAttempt(scanId, attempt, missingFrames + 1);
        else setScanState('no_camera');
        return;
      }

      let result: IdentifyBirdResult | null = null;
      const controller = new AbortController();
      scanAbortRef.current = controller;
      const timeout = window.setTimeout(() => controller.abort(), 25000);
      try {
        const res = await fetch('/api/identify-bird', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: frame }),
          signal: controller.signal
        });
        if (res.ok) result = (await res.json()) as IdentifyBirdResult;
      } catch {
        // offline, timed out or cancelled
      } finally {
        window.clearTimeout(timeout);
      }
      if (scanIdRef.current !== scanId) return;

      if (!result) {
        setScanState('error');
        return;
      }
      if (result.kind === 'catalog') {
        const catalogNumber = result.catalogNumber;
        const bird = CATALOG_BIRDS_DATA.find((b) => b.catalogNumber === catalogNumber);
        if (bird) {
          setDetectedBird(bird.catalogNumber === '020' ? XR_CHINCHERO : bird);
          setScanState('detected');
          soundManager.playSuccess();
          return;
        }
      }
      if (result.kind === 'catalog' || result.kind === 'other_bird') {
        setOtherBirdName(result.kind === 'other_bird' ? result.name : '');
        setScanState('other_bird');
        soundManager.playSuccess();
        return;
      }
      // No bird in view: look again a few times before asking the player to retry
      if (attempt < XR_MAX_SCAN_ATTEMPTS) runScanAttempt(scanId, attempt + 1, 0);
      else setScanState('no_bird');
    }, delay);
  };

  const startScan = () => {
    clearScanTimer();
    stopSong();
    setDetectedBird(null);
    setShowBirdInfoSheet(false);
    setScanState('scanning');
    runScanAttempt(scanIdRef.current, 1, 0);
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setUseRealCamera(false);
  };

  const startCamera = async (mode: 'environment' | 'user' = facingMode, avoidDeviceId?: string) => {
    cameraStartingRef.current = true;
    try {
      setCameraError(null);
      setFacingMode(mode);

      let stream = await requestMobileCameraStream(mode, streamRef.current, videoRef.current);
      // Some phones ignore facingMode: if we got the same lens again, force the other one
      if (avoidDeviceId) {
        stream = await switchToOtherCamera(stream, avoidDeviceId, mode);
      }

      streamRef.current = stream;
      const actualFacing = stream.getVideoTracks()[0]?.getSettings?.().facingMode;
      if (actualFacing === 'user' || actualFacing === 'environment') {
        setFacingMode(actualFacing);
      }
      // Hide the flip button only when the device is known to have a single camera
      countVideoInputs().then((n) => setCanFlipCamera(n !== 1));
      setNativePhotoUrl(null);
      setUseRealCamera(true);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        videoRef.current.setAttribute('webkit-playsinline', 'true');
        videoRef.current.muted = true;
        await videoRef.current.play().catch(() => {});
      }
    } catch {
      setCameraError('No se pudo abrir la cámara. Revisa el permiso del navegador o usa la cámara del teléfono.');
      setUseRealCamera(false);
    } finally {
      cameraStartingRef.current = false;
    }
  };

  useEffect(() => {
    if (isOpen) {
      startCamera('environment');
      let tutorialSeen = false;
      try {
        tutorialSeen = window.localStorage.getItem(XR_TUTORIAL_SEEN_KEY) === '1';
      } catch {
        // storage unavailable: show the tutorial
      }
      if (tutorialSeen) {
        startScan();
      } else {
        setDetectedBird(null);
        setScanState('scanning');
        setShowTutorial(true);
      }
    } else {
      stopCamera();
      clearScanTimer();
      stopSong();
      setDetectedBird(null);
      setShowTutorial(false);
      setPhotoResult(null);
      setNativePhotoUrl(null);
      setShowBirdInfoSheet(false);
      setCleanViewMode(false);
    }
    return () => {
      clearScanTimer();
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleFlipCamera = () => {
    soundManager.playClick();
    const nextMode: 'environment' | 'user' = facingMode === 'environment' ? 'user' : 'environment';
    const currentDeviceId = streamRef.current?.getVideoTracks()[0]?.getSettings?.().deviceId;
    startCamera(nextMode, currentDeviceId);
    startScan();
  };

  const closeTutorial = () => {
    soundManager.playClick();
    try {
      window.localStorage.setItem(XR_TUTORIAL_SEEN_KEY, '1');
    } catch {
      // ignore
    }
    setShowTutorial(false);
    if (scanState !== 'detected') startScan();
  };

  const handleNativeFileCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        stopCamera();
        setCameraError(null);
        setNativePhotoUrl(reader.result);
        nativePhotoRef.current = reader.result;
        startScan();
      }
    };
    reader.readAsDataURL(file);
  };

  if (!isOpen) return null;

  const toggleBirdSong = () => {
    if (!detectedBird) return;
    if (isSongPlaying) {
      soundManager.pauseCurrentAudio();
      setIsSongPlaying(false);
      return;
    }
    setIsSongPlaying(true);
    if (!soundManager.resumeCurrentAudio()) {
      soundManager.playBirdSound(detectedBird.audioUrl || detectedBird.id, () => setIsSongPlaying(false));
    }
  };

  const loadImage = (src: string): Promise<HTMLImageElement | null> =>
    new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = src.includes('%') || src.startsWith('data:') ? src : encodeURI(src);
    });

  // Handle Foto Perfecta Capture (draws live <video> frame + bird AR overlay onto <canvas>)
  const handleShutterCapture = async () => {
    if (!detectedBird) return;
    const activeBirdData = detectedBird;
    stopSong();
    soundManager.playShutter();
    setIsPhotoCapturing(true);

    const isFocused = focusSlider >= 65 && focusSlider <= 95;
    const centered = true;
    const respectful = true;
    const stars = isFocused ? 3 : 2;

    let finalPhotoUrl = encodeURI(activeBirdData.image);

    try {
      const canvas = canvasRef.current || document.createElement('canvas');
      const width = 540;
      const height = 720;
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      if (ctx) {
        let drewBase = false;
        if (useRealCamera && videoRef.current && videoRef.current.readyState >= 2) {
          const vid = videoRef.current;
          const vw = vid.videoWidth || width;
          const vh = vid.videoHeight || height;
          const scale = Math.max(width / vw, height / vh);
          const sw = width / scale;
          const sh = height / scale;
          const sx = (vw - sw) / 2;
          const sy = (vh - sh) / 2;

          ctx.drawImage(vid, sx, sy, sw, sh, 0, 0, width, height);
          drewBase = true;
        } else if (nativePhotoUrl) {
          const nativeImg = await loadImage(nativePhotoUrl);
          if (nativeImg) {
            ctx.drawImage(nativeImg, 0, 0, width, height);
            drewBase = true;
          }
        }

        if (!drewBase) {
          const grad = ctx.createLinearGradient(0, 0, 0, height);
          grad.addColorStop(0, '#073B32');
          grad.addColorStop(1, '#0F172A');
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, width, height);
        }

        const birdImg = await loadImage(activeBirdData.image);
        if (birdImg) {
          const boxSize = 230;
          const bx = (width - boxSize) / 2;
          const by = (height - boxSize) / 2;
          const pad = 12;

          // Rounded card container without circular clipping so the full bird is visible
          ctx.save();
          ctx.fillStyle = 'rgba(12, 35, 30, 0.78)';
          ctx.strokeStyle = '#38BDF8';
          ctx.lineWidth = 4;
          ctx.beginPath();
          if (typeof ctx.roundRect === 'function') {
            ctx.roundRect(bx, by, boxSize, boxSize, 22);
          } else {
            ctx.rect(bx, by, boxSize, boxSize);
          }
          ctx.fill();
          ctx.stroke();

          // Draw bird with object-fit: contain inside padded box
          const availW = boxSize - pad * 2;
          const availH = boxSize - pad * 2;
          const imgW = birdImg.naturalWidth || birdImg.width || boxSize;
          const imgH = birdImg.naturalHeight || birdImg.height || boxSize;
          const containScale = Math.min(availW / imgW, availH / imgH);
          const drawW = imgW * containScale;
          const drawH = imgH * containScale;
          const dx = bx + (boxSize - drawW) / 2;
          const dy = by + (boxSize - drawH) / 2;

          ctx.drawImage(birdImg, dx, dy, drawW, drawH);
          ctx.restore();
        }

        ctx.fillStyle = 'rgba(2, 6, 23, 0.8)';
        ctx.fillRect(0, height - 90, width, 90);
        ctx.fillStyle = '#FDE047';
        ctx.font = 'bold 20px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(
          `#${activeBirdData.catalogNumber} ${activeBirdData.commonName} (${'★'.repeat(stars)})`,
          width / 2,
          height - 50
        );
        ctx.fillStyle = '#5EEAD4';
        ctx.font = '13px sans-serif';
        ctx.fillText(
          `${activeBirdData.scientificName} · Parque Botánico Barón Schuel`,
          width / 2,
          height - 24
        );

        finalPhotoUrl = canvas.toDataURL('image/jpeg', 0.92);
      }
    } catch {
      // Fallback to bird image
    }

    setTimeout(() => {
      setPhotoResult({
        stars,
        criteria: { centered, focus: isFocused, respectful },
        birdName: activeBirdData.commonName,
        photoUrl: finalPhotoUrl
      });

      soundManager.playSuccess();
      onSightingSuccess(activeBirdData.id, stars);
      setIsPhotoCapturing(false);
    }, 350);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-3 bg-black/90 backdrop-blur-md animate-fadeIn">
      {/* Hidden Canvas & Native Mobile Camera Input Fallback */}
      <canvas ref={canvasRef} className="hidden" />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleNativeFileCapture}
        className="hidden"
      />

      <div className="relative w-full max-w-sm h-[94vh] max-h-[860px] flex flex-col rounded-3xl overflow-hidden bg-slate-950 border-2 border-teal-500 shadow-2xl">
        {/* HUD Top Bar: Title, Flash OFF, Battery, Close */}
        <div className="relative z-30 px-3 py-2 bg-slate-950 border-b border-teal-900/60 flex items-center justify-between text-xs text-white">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <span className="font-extrabold text-[11px] text-teal-300 tracking-wider uppercase truncate">
              XR AVISTAMIENTO{detectedBird ? ` · #${detectedBird.catalogNumber}` : ''}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Environmental Care Status */}
            <div className="flex items-center gap-1 text-[9px] px-2 py-0.5 rounded-full bg-teal-950/80 border border-teal-500/40 text-teal-200">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <span className="whitespace-nowrap">Flash: OFF</span>
            </div>

            {/* Battery Indicator */}
            <div className="flex items-center gap-1 text-[10px] font-mono text-emerald-300">
              <Battery className="w-3.5 h-3.5 text-emerald-400" />
              <span>98%</span>
            </div>

            {/* Close */}
            <button
              onClick={() => {
                soundManager.playClick();
                stopCamera();
                clearScanTimer();
                stopSong();
                onClose();
              }}
              className="w-7 h-7 rounded-full bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center border border-slate-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Dedicated Non-Overlapping Camera Controls Bar (Flex with gap-2, no conflicting absolute positions) */}
        <div className="relative z-30 px-3 py-1.5 bg-slate-900/95 border-b border-teal-900/60 flex items-center justify-between gap-2">
          {canFlipCamera ? (
            <button
              type="button"
              onClick={handleFlipCamera}
              className="px-2.5 py-1 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-[10px] border border-slate-900 shadow flex items-center gap-1 active:scale-95 transition-all cursor-pointer shrink-0"
              title="Cambiar entre cámara trasera y delantera"
            >
              <RefreshCw className="w-3 h-3 stroke-[2.5]" />
              <span>Girar ({facingMode === 'environment' ? 'Trasera' : 'Delantera'})</span>
            </button>
          ) : (
            <span className="text-[10px] font-bold text-teal-300/80 truncate">
              {useRealCamera ? 'Cámara activa' : 'Cámara apagada'}
            </span>
          )}

          <button
            type="button"
            onClick={() => {
              soundManager.playClick();
              setShowTutorial(true);
            }}
            className="ml-auto px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-amber-300 font-black text-[10px] border border-amber-400/60 shadow flex items-center gap-1 active:scale-95 transition-all cursor-pointer shrink-0"
            title="Ver cómo se usa el avistamiento"
          >
            <HelpCircle className="w-3 h-3" />
            <span>Ayuda</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (!useRealCamera) {
                startCamera(facingMode);
                startScan();
              }
              else fileInputRef.current?.click();
            }}
            className="px-2.5 py-1 rounded-full bg-teal-600 hover:bg-teal-500 text-white font-black text-[10px] border border-teal-300 shadow flex items-center gap-1 active:scale-95 transition-all cursor-pointer shrink-0"
          >
            <Camera className="w-3 h-3" />
            <span>{useRealCamera ? 'Cámara Nativa' : 'Activar Cámara'}</span>
          </button>
        </div>

        {/* Clean Unobstructed Camera Viewport (>80% free area) */}
        <div className="relative flex-1 bg-black overflow-hidden flex items-center justify-center">
          {/* Live Video Feed with Mandatory Mobile Attributes OR Native Photo OR Illustrated Backdrop */}
          {useRealCamera ? (
            <video
              ref={(el) => {
                videoRef.current = el;
                if (el && streamRef.current && el.srcObject !== streamRef.current) {
                  el.srcObject = streamRef.current;
                  el.setAttribute('playsinline', 'true');
                  el.setAttribute('webkit-playsinline', 'true');
                  el.muted = true;
                  el.play().catch(() => {});
                }
              }}
              autoPlay
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : nativePhotoUrl ? (
            <img
              src={nativePhotoUrl}
              alt="Captura de cámara del teléfono"
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <img
              src="/assets/aistudio/Botanical_park_start_screen_logo_546dfb3b_47fb3d00.jpg"
              alt="Fondo XR Yungas"
              className={`absolute inset-0 w-full h-full object-cover transition-all duration-300 ${
                focusSlider >= 65 && focusSlider <= 95 ? 'blur-none' : 'blur-[2px]'
              }`}
            />
          )}

          {/* Binocular view: everything outside the two overlapping lenses is blacked out */}
          <svg
            className="absolute inset-0 w-full h-full z-10 pointer-events-none"
            viewBox="0 0 200 150"
            preserveAspectRatio="xMidYMid meet"
            aria-hidden="true"
          >
            <defs>
              <mask id="xrBinocularMask" maskUnits="userSpaceOnUse" x="-2000" y="-2000" width="4200" height="4200">
                <rect x="-2000" y="-2000" width="4200" height="4200" fill="white" />
                <circle cx="75" cy="75" r="72" fill="black" />
                <circle cx="125" cy="75" r="72" fill="black" />
              </mask>
              <radialGradient id="xrLensShade">
                <stop offset="72%" stopColor="#000" stopOpacity="0" />
                <stop offset="93%" stopColor="#000" stopOpacity="0.55" />
                <stop offset="100%" stopColor="#000" stopOpacity="0.95" />
              </radialGradient>
              <clipPath id="xrLeftHalf">
                <rect x="-2000" y="-2000" width="2100" height="4200" />
              </clipPath>
              <clipPath id="xrRightHalf">
                <rect x="100" y="-2000" width="2100" height="4200" />
              </clipPath>
            </defs>
            <circle cx="75" cy="75" r="72" fill="url(#xrLensShade)" clipPath="url(#xrLeftHalf)" />
            <circle cx="125" cy="75" r="72" fill="url(#xrLensShade)" clipPath="url(#xrRightHalf)" />
            <rect x="-2000" y="-2000" width="4200" height="4200" fill="#000" mask="url(#xrBinocularMask)" />
          </svg>

          {cameraError && !useRealCamera && !cleanViewMode && (
            <div className="absolute top-2.5 inset-x-3 z-30 bg-slate-950/90 border border-amber-500/60 rounded-xl p-2 flex items-center justify-between gap-2 text-[10px] text-amber-200 pointer-events-auto">
              <span className="leading-tight">{cameraError}</span>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-2.5 py-1 rounded-lg bg-amber-400 text-slate-950 font-black shrink-0"
              >
                📷 Usar Teléfono
              </button>
            </div>
          )}

          {/* Flash Shutter Animation */}
          {isPhotoCapturing && (
            <div className="absolute inset-0 bg-white z-40 animate-ping opacity-90" />
          )}

          {/* HUD CORNERS (Hidden in Clean View Mode) */}
          {!cleanViewMode && (
            <div className="absolute inset-3 pointer-events-none z-20 flex flex-col justify-between">
              <div className="flex justify-between">
                <div className="w-5 h-5 border-t-2 border-l-2 border-teal-300/60 rounded-tl-md" />
                <div className="w-5 h-5 border-t-2 border-r-2 border-teal-300/60 rounded-tr-md" />
              </div>
              <div className="flex justify-between">
                <div className="w-5 h-5 border-b-2 border-l-2 border-teal-300/60 rounded-bl-md" />
                <div className="w-5 h-5 border-b-2 border-r-2 border-teal-300/60 rounded-br-md" />
              </div>
            </div>
          )}

          {/* CENTER OF VIEWPORT: Subtle & Transparent Reticle with Moderate-Sized Perched Bird */}
          <div className="relative z-20 flex flex-col items-center justify-center pointer-events-none">
            <div className="relative w-28 h-28 flex items-center justify-center">
              {/* Subtle transparent crosshair reticle */}
              <div className="absolute inset-0 rounded-full border border-sky-300/45 border-dashed" />
              <div className="absolute w-full h-[1px] bg-sky-300/25" />
              <div className="absolute h-full w-[1px] bg-sky-300/25" />

              {detectedBird ? (
                <div
                  className="w-22 h-22 rounded-2xl border border-sky-300/70 shadow-lg flex items-center justify-center overflow-visible animate-fadeIn"
                  style={{ backgroundColor: 'rgba(12, 35, 30, 0.55)', padding: '5px' }}
                >
                  <img
                    src={encodeURI(detectedBird.image)}
                    alt={detectedBird.commonName}
                    style={{ objectPosition: detectedBird.imageFocus || 'center' }}
                    className="w-full h-full object-cover rounded-xl drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)]"
                  />
                </div>
              ) : scanState === 'scanning' ? (
                <div className="absolute inset-2 rounded-full border-2 border-amber-300/80 animate-ping" />
              ) : null}
            </div>
            <span
              className={`mt-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wide border shadow ${
                detectedBird
                  ? 'bg-emerald-400 text-slate-950 border-slate-900'
                  : 'bg-slate-950/85 text-amber-300 border-amber-400/60'
              }`}
            >
              {SCAN_LABELS[scanState]}
            </span>
          </div>

          {/* COLLAPSIBLE TECHNICAL / RPG SHEET (Only visible when player taps "ℹ️ Ver Ficha") */}
          {showBirdInfoSheet && !cleanViewMode && detectedBird && (
            <div className="absolute bottom-13 inset-x-3 z-30 bg-slate-950/92 backdrop-blur-md rounded-2xl p-3 border-2 border-sky-400 shadow-2xl text-[10px] text-slate-200 space-y-1.5 animate-fadeIn pointer-events-auto">
              <div className="flex items-center justify-between border-b border-sky-800 pb-1 gap-2">
                <div className="min-w-0">
                  <span className="font-black text-xs text-white block truncate">
                    #{detectedBird.catalogNumber} {detectedBird.commonName}
                  </span>
                  <span className="text-[9px] italic text-teal-300 block truncate">
                    {detectedBird.scientificName}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="px-2 py-0.5 rounded-full bg-amber-400/20 border border-amber-400/50 font-extrabold text-amber-300 text-[10px]">
                    PC {detectedBird.cp} · {detectedBird.hp}
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowBirdInfoSheet(false)}
                    className="w-6 h-6 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center border border-slate-600 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-1.5 text-[9px]">
                <span className="px-2 py-0.5 rounded-md bg-teal-950 border border-teal-600/50 text-teal-200 font-bold">
                  Estrato: {detectedBird.stratum}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-700 text-emerald-300 font-bold">
                  Peso: {detectedBird.weight} · Tamaño: {detectedBird.size}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-700 text-amber-300 font-bold">
                  Familia: {detectedBird.family}
                </span>
              </div>

              <div className="text-[9px] text-teal-200">
                <span className="text-slate-400 font-semibold">Hábitat:</span> {detectedBird.habitat}
              </div>

              <div className="text-[9px] text-slate-300 pt-1 border-t border-slate-800 leading-snug space-y-0.5">
                <div>• {detectedBird.beakDescription}</div>
                <div>• {detectedBird.songDescription}</div>
                <div>• {detectedBird.plumageDescription}</div>
              </div>
            </div>
          )}

          {/* BOTTOM EDGE OF VIEWPORT: Compact Pill with Focused Bird Name + "ℹ️ Ver Ficha" + "👁️ Limpiar Pantalla" */}
          <div className="absolute bottom-2 inset-x-2.5 z-30 flex items-center justify-between gap-1.5 pointer-events-auto">
            {!cleanViewMode ? (
              <div className="flex-1 min-w-0 px-2.5 py-1.5 rounded-full bg-slate-950/85 backdrop-blur-md border border-teal-500/60 shadow-lg flex items-center justify-between gap-1.5">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span
                    className={`w-2 h-2 rounded-full shrink-0 ${
                      detectedBird ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'
                    }`}
                  />
                  <span className="text-[10px] font-black text-white truncate">
                    {detectedBird
                      ? `#${detectedBird.catalogNumber} ${detectedBird.commonName}`
                      : SCAN_HINTS[scanState]}
                  </span>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    disabled={!detectedBird}
                    onClick={() => {
                      soundManager.playClick();
                      setShowBirdInfoSheet((prev) => !prev);
                    }}
                    className={`px-2 py-0.5 disabled:opacity-40 disabled:cursor-default rounded-full text-[9px] font-black border transition-all cursor-pointer ${
                      showBirdInfoSheet
                        ? 'bg-sky-400 text-slate-950 border-white'
                        : 'bg-sky-950/90 text-sky-200 border-sky-400/60 hover:bg-sky-900'
                    }`}
                  >
                    ℹ️ {showBirdInfoSheet ? 'Ocultar Ficha' : 'Ver Ficha'}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      soundManager.playClick();
                      setCleanViewMode(true);
                      setShowBirdInfoSheet(false);
                    }}
                    className="px-2 py-0.5 rounded-full bg-slate-800/90 hover:bg-slate-700 text-teal-200 text-[9px] font-black border border-teal-500/40 cursor-pointer"
                    title="Limpiar Pantalla / Modo Visor Limpio"
                  >
                    👁️ Limpiar
                  </button>
                </div>
              </div>
            ) : (
              <div className="ml-auto">
                <button
                  type="button"
                  onClick={() => {
                    soundManager.playClick();
                    setCleanViewMode(false);
                  }}
                  className="px-3 py-1 rounded-full bg-slate-950/80 hover:bg-slate-900 text-amber-300 text-[10px] font-black border border-amber-400/60 shadow-lg cursor-pointer"
                >
                  👁️ Mostrar HUD
                </button>
              </div>
            )}
          </div>

          {/* A real bird that is not one of the loaded species */}
          {scanState === 'other_bird' && !photoResult && !showTutorial && (
            <div className="absolute inset-0 z-40 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-3 animate-fadeIn pointer-events-auto overflow-y-auto">
              <div className="w-full max-w-xs bg-slate-900 border-2 border-amber-400 rounded-3xl p-4 shadow-2xl text-center text-slate-100 my-auto">
                <div className="w-12 h-12 mx-auto rounded-full bg-amber-400 text-slate-950 flex items-center justify-center border-2 border-slate-900">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h4 className="mt-2 text-sm font-black text-amber-300 uppercase tracking-wide">
                  ¡Felicitaciones, explorador!
                </h4>
                <p className="mt-1.5 text-xs text-slate-100 leading-snug">
                  {otherBirdName ? `Viste un ave (${otherBirdName}) que` : 'Viste un ave que'} todavía no está en
                  nuestro catálogo: hay aves en proceso de carga.
                </p>
                <p className="mt-1.5 text-[11px] text-teal-200 leading-snug">
                  Gracias por seguir aportando al catálogo de aves del Parque Botánico.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    soundManager.playClick();
                    startScan();
                  }}
                  className="w-full mt-3 py-2.5 rounded-xl game-btn-orange text-white text-xs font-black cursor-pointer"
                >
                  SEGUIR BUSCANDO
                </button>
              </div>
            </div>
          )}

          {/* TUTORIAL: 3 short steps, shown the first time and from "¿Cómo se usa?" */}
          {showTutorial && !photoResult && (
            <div className="absolute inset-0 z-40 bg-slate-950/90 backdrop-blur-sm flex items-center justify-center p-3 animate-fadeIn pointer-events-auto overflow-y-auto">
              <div className="w-full max-w-xs bg-slate-900 border-2 border-teal-400 rounded-3xl p-3.5 shadow-2xl text-slate-100 my-auto">
                <h4 className="text-sm font-black text-white text-center uppercase tracking-wide">
                  ¿Cómo avistar un ave?
                </h4>
                <ol className="mt-2.5 space-y-2">
                  {[
                    {
                      icon: <Binoculars className="w-4 h-4" />,
                      title: 'Apunta',
                      text: 'Mira por los binoculares hacia los árboles.'
                    },
                    {
                      icon: <ScanSearch className="w-4 h-4" />,
                      title: 'Espera',
                      text: 'El visor detecta el ave y te dice qué especie es.'
                    },
                    {
                      icon: <Camera className="w-4 h-4" />,
                      title: 'Toma la foto',
                      text: 'Toca el botón blanco y queda guardada en tu catálogo.'
                    }
                  ].map((step, idx) => (
                    <li
                      key={step.title}
                      className="flex items-center gap-2.5 p-2 rounded-2xl bg-teal-950/60 border border-teal-800/50"
                    >
                      <span className="w-8 h-8 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center shrink-0 border-2 border-slate-900">
                        {step.icon}
                      </span>
                      <div className="min-w-0">
                        <div className="text-xs font-black text-amber-300">
                          {idx + 1}. {step.title}
                        </div>
                        <div className="text-[11px] text-slate-200 leading-snug">{step.text}</div>
                      </div>
                    </li>
                  ))}
                </ol>
                <button
                  type="button"
                  onClick={closeTutorial}
                  className="w-full mt-3 py-2.5 rounded-xl game-btn-orange text-white text-xs font-black cursor-pointer"
                >
                  ¡ENTENDIDO!
                </button>
              </div>
            </div>
          )}

          {/* POPUP DE RESULTADO DE "FOTO PERFECTA" */}
          {photoResult && (
            <div className="absolute inset-0 z-50 bg-slate-950/92 backdrop-blur-md flex flex-col items-center justify-center p-5 text-center animate-fadeIn">
              <div
                className="w-27 h-36 rounded-2xl border-3 border-amber-400 mb-2 shadow-xl flex items-center justify-center overflow-hidden"
                style={{ backgroundColor: 'rgba(12, 35, 30, 0.85)' }}
              >
                <img
                  src={photoResult.photoUrl}
                  alt={photoResult.birdName}
                  className="w-full h-full object-cover"
                />
              </div>

              <h4 className="text-base font-black text-white uppercase tracking-wide">
                ¡FOTO PERFECTA REGISTRADA!
              </h4>
              <p className="text-xs text-amber-300 font-bold mb-2">{photoResult.birdName}</p>

              {/* Star Rating Display */}
              <div className="flex items-center justify-center gap-1.5 mb-3">
                {[1, 2, 3].map((starIdx) => (
                  <Star
                    key={starIdx}
                    className={`w-7 h-7 ${
                      starIdx <= photoResult.stars
                        ? 'text-amber-400 fill-amber-400 filter drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]'
                        : 'text-slate-600'
                    }`}
                  />
                ))}
              </div>

              {/* 3 Evaluated Criteria */}
              <div className="w-full max-w-xs bg-slate-900/90 border border-teal-700/60 rounded-2xl p-3 text-left text-xs space-y-1.5 mb-4">
                <div className="text-[10px] font-bold text-teal-300 uppercase">CRITERIOS SCHUEL:</div>
                <div className="flex items-center gap-2 text-emerald-300 text-[11px]">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Ave centrada en visor (100% encuadre)</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-300 text-[11px]">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Nitidez óptica en dosel de selva</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-300 text-[11px]">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Distancia respetuosa sin flash (Norma Schuel)</span>
                </div>
              </div>

              <div className="w-full flex gap-2">
                <button
                  onClick={() => {
                    soundManager.playClick();
                    setPhotoResult(null);
                    startScan();
                  }}
                  className="flex-1 py-3 rounded-2xl bg-slate-800 text-slate-200 text-xs font-bold hover:bg-slate-700"
                >
                  Seguir en XR
                </button>
                <button
                  onClick={() => {
                    soundManager.playClick();
                    setPhotoResult(null);
                    onOpenQuizConsignas();
                  }}
                  className="flex-1 py-3 rounded-2xl game-btn-orange text-white text-xs font-black"
                >
                  Ir a las 5 Consignas
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Controls Bar: search another bird, shutter, bird song play/pause and 5 Consignas Button */}
        {!photoResult && (
          <div className="p-2.5 bg-slate-950 border-t border-teal-900/80 space-y-2">
            {/* Top row of bottom controls: search another bird and camera switch */}
            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => {
                  soundManager.playClick();
                  startScan();
                }}
                className="flex items-center gap-1 text-[11px] font-bold text-slate-950 px-2.5 py-1 rounded-xl bg-sky-400 hover:bg-sky-300 border border-slate-900 shadow-md cursor-pointer active:scale-95 transition-all"
                title="Volver a buscar un ave con el visor"
              >
                <ScanSearch className="w-3.5 h-3.5" />
                <span>
                  {detectedBird ? 'Buscar otra ave' : scanState === 'scanning' ? 'Buscando…' : 'Buscar de nuevo'}
                </span>
              </button>

              {/* Camera mode toggle */}
              <button
                onClick={() => {
                  soundManager.playClick();
                  if (useRealCamera) stopCamera();
                  else startCamera();
                  startScan();
                }}
                className="flex items-center gap-1 text-[10px] text-teal-300 px-2.5 py-1 rounded-xl bg-slate-900 border border-teal-800/60 hover:text-white cursor-pointer"
              >
                <RefreshCw className="w-3 h-3 text-teal-400" />
                <span>{useRealCamera ? 'Modo Selva XR' : 'Activar Cámara'}</span>
              </button>
            </div>

            {/* Shutter Section (Botón circular blanco de obturador abajo al centro) */}
            <div className="flex items-center justify-between pt-0.5">
              <div className="text-[10px] text-teal-300 font-semibold flex items-center gap-1">
                <Eye className="w-3.5 h-3.5 text-amber-400" />
                <span>Enfocar:</span>
                <input
                  type="range"
                  min="30"
                  max="100"
                  value={focusSlider}
                  onChange={(e) => setFocusSlider(Number(e.target.value))}
                  className="w-20 accent-amber-400 cursor-pointer"
                />
              </div>

              {/* WHITE CIRCULAR SHUTTER BUTTON */}
              <button
                onClick={handleShutterCapture}
                disabled={!detectedBird}
                className="w-14 h-14 rounded-full bg-white p-1 border-4 border-slate-900 shadow-[0_0_20px_rgba(255,255,255,0.4)] flex items-center justify-center hover:scale-105 active:scale-95 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-default disabled:hover:scale-100"
                title="Tomar Foto Perfecta"
              >
                <div className="w-10 h-10 rounded-full border-2 border-slate-400 bg-slate-100 flex items-center justify-center">
                  <div className="w-7 h-7 rounded-full bg-white shadow-inner" />
                </div>
              </button>

              {/* Bird song: one button to play and to pause it */}
              <button
                type="button"
                onClick={toggleBirdSong}
                disabled={!detectedBird}
                className={`flex items-center gap-1 text-[10px] px-2.5 py-1.5 rounded-xl border cursor-pointer disabled:opacity-40 disabled:cursor-default ${
                  isSongPlaying
                    ? 'bg-amber-400 text-slate-950 border-slate-900 font-black'
                    : 'bg-slate-900 text-teal-300 border-teal-800/60 hover:border-teal-400'
                }`}
                title={isSongPlaying ? 'Pausar el canto' : 'Escuchar el canto del ave detectada'}
              >
                {isSongPlaying ? (
                  <Pause className="w-3.5 h-3.5" />
                ) : (
                  <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                )}
                <span>{isSongPlaying ? 'Pausar' : 'Canto'}</span>
              </button>
            </div>

            {/* Button: "Responder las 5 Consignas del Tucán" */}
            <button
              onClick={() => {
                soundManager.playClick();
                onOpenQuizConsignas();
              }}
              className="w-full py-2 rounded-2xl game-btn-orange text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg cursor-pointer"
            >
              <HelpCircle className="w-4 h-4 text-amber-200" />
              <span>RESPONDER LAS 5 CONSIGNAS DEL TUCÁN</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
