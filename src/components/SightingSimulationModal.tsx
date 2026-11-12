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
  Eye
} from 'lucide-react';
import { soundManager } from '../utils/audio';
import { requestMobileCameraStream } from '../utils/camera';
import { CATALOG_BIRDS_DATA } from '../data/birdsData';
import { CatalogBird, PlayerProfile } from '../types/game';

interface SightingSimulationModalProps {
  isOpen: boolean;
  onClose: () => void;
  playerProfile: PlayerProfile;
  onSightingSuccess: (birdId: string, stars: number) => void;
  onOpenQuizConsignas: () => void;
}

export const SightingSimulationModal: React.FC<SightingSimulationModalProps> = ({
  isOpen,
  onClose,
  onSightingSuccess,
  onOpenQuizConsignas
}) => {
  // Active AR bird mode: 'chinchero' | 'benteveo' | 'catalog'
  const [selectedBirdKey, setSelectedBirdKey] = useState<'chinchero' | 'benteveo' | 'catalog'>('benteveo');
  const [selectedCatalogBird, setSelectedCatalogBird] = useState<CatalogBird>(
    CATALOG_BIRDS_DATA.find((b) => b.catalogNumber === '007') || CATALOG_BIRDS_DATA[0]
  );
  const [useRealCamera, setUseRealCamera] = useState(false);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [nativePhotoUrl, setNativePhotoUrl] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [focusSlider, setFocusSlider] = useState(85);
  const [isPhotoCapturing, setIsPhotoCapturing] = useState(false);
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

  const startCamera = async (mode: 'environment' | 'user' = facingMode) => {
    try {
      setCameraError(null);
      setFacingMode(mode);

      const stream = await requestMobileCameraStream(mode, streamRef.current, videoRef.current);

      streamRef.current = stream;
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
      setCameraError('Permiso de cámara bloqueado o navegador interno. Usa el botón de Cámara del Teléfono abajo.');
      setUseRealCamera(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      startCamera('environment');
    } else {
      stopCamera();
      soundManager.stopCurrentAudio();
      setPhotoResult(null);
      setNativePhotoUrl(null);
    }
    return () => {
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
    setFacingMode(nextMode);
    startCamera(nextMode);
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
      }
    };
    reader.readAsDataURL(file);
  };

  if (!isOpen) return null;

  const activeBirdData: CatalogBird =
    selectedBirdKey === 'chinchero'
      ? {
          id: '020-ticotico-cejicanelo',
          catalogNumber: '020',
          commonName: 'Chinchero Chico / Ticotico',
          scientificName: 'Lepidocolaptes angustirostris',
          size: '21 cm',
          weight: '36 g',
          family: 'FURNARIIDAE',
          habitat: 'Bosques abiertos y troncos de Yungas',
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
          image: '/assets/aistudio/c3da3f37-f246-40f4-8d25-1958fb93d2f1_0d2a7f41.jpeg',
          audioUrl: '/assets/aves/20-Ticotico cejicanelo.mp3',
          silhouetteIcon: '🪵'
        }
      : selectedCatalogBird;

  const playActiveBirdAudio = () => {
    soundManager.playBirdSound(activeBirdData.audioUrl || activeBirdData.id);
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
    soundManager.playShutter();
    setIsPhotoCapturing(true);
    playActiveBirdAudio();

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

          ctx.save();
          if (facingMode === 'user') {
            ctx.translate(width, 0);
            ctx.scale(-1, 1);
          }
          ctx.drawImage(vid, sx, sy, sw, sh, 0, 0, width, height);
          ctx.restore();
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
        {/* HUD Top Bar: Battery, Flash OFF, Respectful Distance, Close */}
        <div className="relative z-30 px-3 py-2 bg-slate-950/80 backdrop-blur-md border-b border-teal-900/60 flex items-center justify-between text-xs text-white">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-extrabold text-[11px] text-teal-300 tracking-wider uppercase">
              XR AVISTAMIENTO · #{activeBirdData.catalogNumber}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Environmental Care Status */}
            <div className="flex items-center gap-1 text-[9px] px-2 py-0.5 rounded-full bg-teal-950/80 border border-teal-500/40 text-teal-200">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <span>Flash: OFF | Distancia: OK</span>
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
                soundManager.stopCurrentAudio();
                onClose();
              }}
              className="w-7 h-7 rounded-full bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center border border-slate-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Viewport Frame with HUD and AR Content */}
        <div className="relative flex-1 bg-black overflow-hidden flex items-center justify-center">
          {/* Live Video Feed with Mandatory Mobile Attributes OR Native Photo OR Illustrated Backdrop */}
          {useRealCamera ? (
            <video
              key={facingMode}
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
              style={{
                transform: facingMode === 'user' ? 'scaleX(-1)' : 'none'
              }}
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
              src={
                selectedBirdKey === 'chinchero'
                  ? '/assets/aistudio/Toucan_asking_user_question_1451548d.jpg'
                  : '/assets/aistudio/Toucan_presenting_benteveo_data_…_1e5a6f2b.jpg'
              }
              alt="Fondo XR Yungas"
              className={`absolute inset-0 w-full h-full object-cover transition-all duration-300 ${
                focusSlider >= 65 && focusSlider <= 95 ? 'blur-none' : 'blur-[2px]'
              }`}
            />
          )}

          {/* Floating Camera Controls Inside XR Viewport: Flip Camera + Native Mobile Camera Fallback */}
          <div className="absolute top-2.5 left-2.5 right-2.5 z-30 flex items-center justify-between gap-1.5 pointer-events-auto">
            <button
              type="button"
              onClick={handleFlipCamera}
              className="px-2.5 py-1 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-[10px] border border-slate-900 shadow-lg flex items-center gap-1 active:scale-95 transition-all cursor-pointer"
            >
              <RefreshCw className="w-3 h-3 stroke-[2.5]" />
              <span>🔄 Girar Cámara ({facingMode === 'environment' ? 'Trasera' : 'Frontal'})</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (!useRealCamera) startCamera(facingMode);
                else fileInputRef.current?.click();
              }}
              className="px-2.5 py-1 rounded-full bg-teal-600/95 hover:bg-teal-500 text-white font-black text-[10px] border border-teal-300 shadow-lg flex items-center gap-1 active:scale-95 transition-all cursor-pointer"
            >
              <Camera className="w-3 h-3" />
              <span>{useRealCamera ? '📱 Cámara Nativa' : '📷 Activar Cámara'}</span>
            </button>
          </div>

          {cameraError && !useRealCamera && (
            <div className="absolute top-11 inset-x-3 z-30 bg-slate-950/90 border border-amber-500/60 rounded-xl p-2 flex items-center justify-between gap-2 text-[10px] text-amber-200 pointer-events-auto">
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

          {/* HUD CORNERS (Cuatro esquinas de encuadre HUD) */}
          <div className="absolute inset-4 pointer-events-none z-20 flex flex-col justify-between">
            <div className="flex justify-between">
              <div className="w-6 h-6 border-t-3 border-l-3 border-teal-300/80 rounded-tl-lg" />
              <div className="w-6 h-6 border-t-3 border-r-3 border-teal-300/80 rounded-tr-lg" />
            </div>
            <div className="flex justify-between">
              <div className="w-6 h-6 border-b-3 border-l-3 border-teal-300/80 rounded-bl-lg" />
              <div className="w-6 h-6 border-b-3 border-r-3 border-teal-300/80 rounded-br-lg" />
            </div>
          </div>

          {/* Mode a) CHINCHERO CHICO (Mira celeste en centro + tarjeta RPG a la derecha) */}
          {selectedBirdKey === 'chinchero' ? (
            <div className="relative z-20 w-full h-full p-3 flex flex-col justify-between pointer-events-none">
              <div className="self-start pointer-events-auto">
                <span className="px-2.5 py-1 rounded-full bg-teal-950/80 backdrop-blur-sm border border-teal-400/50 text-[10px] font-bold text-teal-200">
                  Estrato: Troncos de Selva Montana
                </span>
              </div>

              <div className="flex items-center justify-between w-full my-auto px-1">
                <div className="relative w-36 h-36 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border-2 border-sky-400 border-dashed animate-spin-slow flex items-center justify-center">
                    <div className="w-2.5 h-2.5 rounded-full bg-sky-300" />
                  </div>
                  <div className="absolute w-full h-0.5 bg-sky-400/50" />
                  <div className="absolute h-full w-0.5 bg-sky-400/50" />

                  <div
                    className="w-28 h-28 rounded-2xl border-2 border-sky-300 shadow-xl flex items-center justify-center overflow-visible"
                    style={{ backgroundColor: 'rgba(12, 35, 30, 0.75)', padding: '6px' }}
                  >
                    <img
                      src={encodeURI(activeBirdData.image)}
                      alt={activeBirdData.commonName}
                      className="w-full h-full object-contain rounded-xl drop-shadow-[0_4px_10px_rgba(0,0,0,0.75)]"
                    />
                  </div>
                </div>

                <div className="w-48 bg-slate-950/85 backdrop-blur-md rounded-2xl p-2.5 border-2 border-sky-400 shadow-2xl text-[10px] text-slate-200 pointer-events-auto space-y-1">
                  <div className="flex items-center justify-between border-b border-sky-800 pb-1">
                    <span className="font-black text-xs text-white truncate">{activeBirdData.commonName}</span>
                    <span className="font-extrabold text-amber-300 text-[11px] shrink-0">PC 2579</span>
                  </div>
                  <div className="flex items-center justify-between text-emerald-300 font-bold text-[9px]">
                    <span>125/125 HP</span>
                    <span>Peso: {activeBirdData.weight} · Alt: {activeBirdData.size}</span>
                  </div>
                  <div className="text-[9px] text-teal-300">
                    <span className="text-slate-400">Familia:</span> {activeBirdData.family}
                  </div>
                  <div className="text-[9px] text-teal-300">
                    <span className="text-slate-400">Hábitat:</span> {activeBirdData.habitat} ({activeBirdData.stratum})
                  </div>
                  <div className="text-[9px] text-slate-300 pt-0.5 border-t border-slate-800 leading-tight">
                    • {activeBirdData.beakDescription}<br />
                    • {activeBirdData.songDescription}<br />
                    • {activeBirdData.plumageDescription}
                  </div>
                </div>
              </div>

              <div className="self-center max-w-xs bg-white text-slate-900 p-2 rounded-2xl border-2 border-teal-900 shadow-xl text-[10px] font-bold text-center pointer-events-auto">
                "¡Hola, explorador! ¿Qué tal se ve este bosque en realidad virtual? ¿Listo para buscar más aves?"
              </div>
            </div>
          ) : (
            /* Mode b) 21 ESPECIES DE /assets/aves/ (incluyendo #007 Benteveo) */
            <div className="relative z-20 w-full h-full p-3 flex flex-col justify-between pointer-events-none">
              <div className="self-end pointer-events-auto">
                <span className="px-2.5 py-1 rounded-full bg-teal-950/80 backdrop-blur-sm border border-amber-400/50 text-[10px] font-bold text-amber-300">
                  Estrato: {activeBirdData.stratum} · #{activeBirdData.catalogNumber}
                </span>
              </div>

              <div className="flex items-center justify-between w-full my-auto px-1">
                {/* RPG Card on Left */}
                <div className="w-48 bg-slate-950/85 backdrop-blur-md rounded-2xl p-2.5 border-2 border-amber-400 shadow-2xl text-[10px] text-slate-200 pointer-events-auto space-y-1">
                  <div className="flex items-center justify-between border-b border-amber-800 pb-1 gap-1">
                    <span className="font-black text-xs text-white truncate">{activeBirdData.commonName}</span>
                    <span className="font-extrabold text-amber-300 text-[10px] shrink-0">PC 2579</span>
                  </div>
                  <div className="flex items-center justify-between text-emerald-300 font-bold text-[9px]">
                    <span>125/125 HP</span>
                    <span>{activeBirdData.weight} · {activeBirdData.size}</span>
                  </div>
                  <div className="text-[9px] text-amber-300 truncate">
                    <span className="text-slate-400">Familia:</span> {activeBirdData.family}
                  </div>
                  <div className="text-[9px] text-amber-300 leading-tight">
                    <span className="text-slate-400">Hábitat:</span> {activeBirdData.habitat}
                  </div>
                  <div className="text-[9px] text-slate-300 pt-0.5 border-t border-slate-800 leading-tight line-clamp-3">
                    • {activeBirdData.beakDescription}<br />
                    • {activeBirdData.songDescription}
                  </div>
                </div>

                {/* Real Bird Image from /assets/aves/ inside Cyan Reticle with object-contain (no cropping) */}
                <div className="relative w-36 h-36 flex flex-col items-center justify-center">
                  <div className="absolute -top-3 px-2 py-0.5 rounded-full bg-sky-500 text-slate-950 font-extrabold text-[8px] tracking-wider uppercase shadow-md truncate max-w-[140px]">
                    #{activeBirdData.catalogNumber} DETECTADO
                  </div>
                  <div className="absolute inset-0 rounded-full border-3 border-sky-400 shadow-[0_0_20px_rgba(56,189,248,0.5)] flex items-center justify-center">
                    <div className="w-2.5 h-2.5 rounded-full bg-sky-300" />
                  </div>

                  <div
                    className="w-28 h-28 rounded-2xl border-2 border-sky-300 shadow-xl flex items-center justify-center overflow-visible"
                    style={{ backgroundColor: 'rgba(12, 35, 30, 0.75)', padding: '6px' }}
                  >
                    <img
                      src={encodeURI(activeBirdData.image)}
                      alt={activeBirdData.commonName}
                      className="w-full h-full object-contain rounded-xl drop-shadow-[0_4px_10px_rgba(0,0,0,0.75)]"
                    />
                  </div>
                </div>
              </div>

              <div className="self-center max-w-xs bg-white text-slate-900 p-2 rounded-2xl border-2 border-amber-900 shadow-xl text-[10px] font-bold text-center pointer-events-auto">
                "¡Mira en el visor XR: {activeBirdData.commonName} ({activeBirdData.scientificName})!"
              </div>
            </div>
          )}

          {/* POPUP DE RESULTADO DE "FOTO PERFECTA" */}
          {photoResult && (
            <div className="absolute inset-0 z-50 bg-slate-950/92 backdrop-blur-md flex flex-col items-center justify-center p-5 text-center animate-fadeIn">
              <div
                className="w-24 h-24 rounded-2xl border-3 border-amber-400 mb-2 shadow-xl flex items-center justify-center overflow-hidden"
                style={{ backgroundColor: 'rgba(12, 35, 30, 0.85)', padding: '4px' }}
              >
                <img
                  src={photoResult.photoUrl}
                  alt={photoResult.birdName}
                  className="w-full h-full object-contain rounded-xl"
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

        {/* Bottom Controls Bar: 21 Species Selector, Bird Toggles, Shutter, and 5 Consignas Button */}
        {!photoResult && (
          <div className="p-3 bg-slate-950 border-t border-teal-900/80 space-y-2">
            {/* Selector of the 21 Species from /assets/aves/ */}
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] font-black text-teal-300 uppercase shrink-0">Especie XR:</span>
              <select
                value={selectedCatalogBird.id}
                onChange={(e) => {
                  const found = CATALOG_BIRDS_DATA.find((b) => b.id === e.target.value);
                  if (found) {
                    setSelectedCatalogBird(found);
                    setSelectedBirdKey('catalog');
                    soundManager.playBirdSound(found.audioUrl);
                  }
                }}
                className="flex-1 bg-slate-900 border border-teal-700/80 rounded-xl px-2 py-1 text-[10px] font-bold text-white outline-none"
              >
                {CATALOG_BIRDS_DATA.map((b) => (
                  <option key={b.id} value={b.id}>
                    #{b.catalogNumber} - {b.commonName} ({b.scientificName})
                  </option>
                ))}
              </select>
            </div>

            {/* Top row of bottom controls: Bird AR switch and camera switch */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex gap-1.5 p-1 bg-slate-900 rounded-xl border border-teal-900/50">
                <button
                  onClick={() => {
                    soundManager.playClick();
                    setSelectedBirdKey('chinchero');
                  }}
                  className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all ${
                    selectedBirdKey === 'chinchero'
                      ? 'bg-sky-500 text-slate-950 shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Chinchero Chico
                </button>
                <button
                  onClick={() => {
                    soundManager.playClick();
                    const benteveo = CATALOG_BIRDS_DATA.find((b) => b.catalogNumber === '007') || CATALOG_BIRDS_DATA[0];
                    setSelectedCatalogBird(benteveo);
                    setSelectedBirdKey('benteveo');
                  }}
                  className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all ${
                    selectedBirdKey !== 'chinchero' && selectedCatalogBird.catalogNumber === '007'
                      ? 'bg-amber-400 text-slate-950 shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  #007 Benteveo
                </button>
              </div>

              {/* Camera mode toggle */}
              <button
                onClick={() => {
                  soundManager.playClick();
                  if (useRealCamera) stopCamera();
                  else startCamera();
                }}
                className="flex items-center gap-1 text-[10px] text-teal-300 px-2.5 py-1 rounded-xl bg-slate-900 border border-teal-800/60 hover:text-white"
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
                className="w-15 h-15 rounded-full bg-white p-1 border-4 border-slate-900 shadow-[0_0_20px_rgba(255,255,255,0.4)] flex items-center justify-center hover:scale-105 active:scale-95 transition-transform cursor-pointer"
                title="Tomar Foto Perfecta"
              >
                <div className="w-11 h-11 rounded-full border-2 border-slate-400 bg-slate-100 flex items-center justify-center">
                  <div className="w-8 h-8 rounded-full bg-white shadow-inner" />
                </div>
              </button>

              {/* Real MP3 Sound sample of the bird */}
              <button
                onClick={playActiveBirdAudio}
                className="flex items-center gap-1 text-[10px] text-teal-300 px-2.5 py-1.5 rounded-xl bg-slate-900 border border-teal-800/60 cursor-pointer hover:border-teal-400"
              >
                <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                <span>Canto MP3</span>
              </button>
            </div>

            {/* Button: "Responder las 5 Consignas del Tucán" */}
            <button
              onClick={() => {
                soundManager.playClick();
                onOpenQuizConsignas();
              }}
              className="w-full py-2.5 rounded-2xl game-btn-orange text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg"
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
