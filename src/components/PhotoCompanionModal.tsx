import React, { useState, useRef, useEffect } from 'react';
import { ModalHeader } from './ui';
import { useModalEscape } from './ui/useModalEscape';
import { Camera, X, ShieldAlert, Sparkles, RefreshCw, CheckCircle2, Download, Upload } from 'lucide-react';
import { soundManager } from '../utils/audio';
import { requestMobileCameraStream } from '../utils/camera';
import { CompanionBirdId } from '../types/game';
import { SAVE_ERROR, SaveResult, saveResultMessage } from '../utils/profileActions';
import { downloadPhoto } from '../utils/photoStore';

interface PhotoCompanionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSavePhoto?: (photoUrl: string, bird: CompanionBirdId) => Promise<SaveResult>;
  currentBirdName?: string;
  onSelectCompanionBird?: (birdName: 'Tucán Grande' | 'Benteveo' | 'Chinchero Chico' | 'Picaflor Cometa') => void;
}

const COMPANIONS = [
  {
    id: 'tucan',
    name: 'Tucán Grande' as const,
    scientific: 'Ramphastos toco',
    badge: 'Ave Emblema',
    color: 'from-amber-400 to-orange-500',
    asset: '/assets/aistudio/toucan_waving_cutout.png',
    speech: '¡Hola explorador! Posaré contigo para nuestra foto en el Parque.'
  },
  {
    id: 'benteveo',
    name: 'Benteveo' as const,
    scientific: 'Pitangus sulphuratus',
    badge: 'Centinela',
    color: 'from-yellow-400 to-amber-600',
    asset: '/assets/aves/7-Benteveo.jpg',
    speech: '¡Bien-te-veo! No te muevas que capturamos la luz de la selva.'
  },
  {
    id: 'chinchero',
    name: 'Chinchero Chico' as const,
    scientific: 'Lepidocolaptes angustirostris',
    badge: 'Trepador',
    color: 'from-emerald-400 to-teal-600',
    asset: '/assets/aistudio/chinchero_chico_portrait.jpg',
    speech: '¡Sujétate bien al tronco que sale la toma perfecta!'
  },
  {
    id: 'picaflor',
    name: 'Picaflor Cometa' as const,
    scientific: 'Sappho sparganurus',
    badge: 'Joya Alada',
    color: 'from-rose-400 to-amber-500',
    asset: '/assets/aves/15-Candelita de gorro pardo.jpg',
    speech: '¡Zumbido de alas! Mira cómo brillan los colores en la quebrada.'
  }
];

export const PhotoCompanionModal: React.FC<PhotoCompanionModalProps> = ({
  isOpen,
  onClose,
  onSavePhoto,
  currentBirdName,
  onSelectCompanionBird
}) => {
  const [selectedCompanion, setSelectedCompanion] = useState(() => {
    if (currentBirdName) {
      const match = COMPANIONS.find((c) => c.name === currentBirdName);
      if (match) return match;
    }
    return COMPANIONS[0];
  });
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [useRealCamera, setUseRealCamera] = useState(false);
  const [nativePhotoUrl, setNativePhotoUrl] = useState<string | null>(null);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [saveResult, setSaveResult] = useState<SaveResult | null>(null);
  const [saving, setSaving] = useState(false);
  const saveLock = useRef(false);
  const captureLock = useRef(false);
  const capturedBird = useRef<CompanionBirdId>(selectedCompanion.name);
  const persistCapture = async (source: string) => {
    if (saveLock.current) return;
    saveLock.current = true;
    setSaving(true);
    try {
      const result = onSavePhoto ? await onSavePhoto(source, capturedBird.current) : { saved: false, status: 'unavailable', error: SAVE_ERROR };
      setSaveResult(result);
      if (result.saved) soundManager.playSuccess();
    } catch { setSaveResult({ saved: false, status: 'error', error: SAVE_ERROR }); }
    finally { saveLock.current = false; setSaving(false); }
  };

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setUseRealCamera(false);
  };

  // Real hardware camera switcher (stops tracks, requests exact environment or enumerateDevices back camera, or user front camera)
  const startCamera = async (mode: 'user' | 'environment') => {
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
      setCameraError(
        'Permiso de cámara bloqueado o navegador interno detectado. Pulsa "📷 Activar Cámara / Usar Cámara del Teléfono" abajo.'
      );
      setUseRealCamera(false);
    }
  };

  // Sync companion with prop
  useEffect(() => {
    if (currentBirdName) {
      const match = COMPANIONS.find((c) => c.name === currentBirdName);
      if (match) setSelectedCompanion(match);
    }
  }, [currentBirdName, isOpen]);

  // Only run when modal opens/closes (never re-run on facingMode change so rear camera is not overwritten!)
  useEffect(() => {
    if (isOpen) {
      startCamera('user');
    } else {
      stopCamera();
      setCapturedPhoto(null);
      setSaveResult(null);
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

  // Toggle Front / Rear Camera ("user" <-> "environment")
  const handleFlipCamera = () => {
    soundManager.playClick();
    const nextMode: 'user' | 'environment' = facingMode === 'user' ? 'environment' : 'user';
    startCamera(nextMode);
  };

  // Handle native <input type="file" accept="image/*" capture="..." /> fallback
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

  // Helper to load an image URL into HTMLImageElement
  const loadImage = (src: string): Promise<HTMLImageElement | null> =>
    new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = src.includes('%') || src.startsWith('data:') ? src : encodeURI(src);
    });

  // Real Canvas Capture: draws <video> frame + FULL UNCROPPED companion bird illustration inside a rounded card
  const handleTakePhoto = async () => {
    if (captureLock.current) return;
    captureLock.current = true;
    try {
    soundManager.playShutter();
    setIsCapturing(true);

    const canvas = canvasRef.current || document.createElement('canvas');
    const width = 540;
    const height = 720;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas no disponible');

    if (ctx) {
      // 1. Draw base layer: Live <video> frame, or Native Phone Photo, or Jungle Backdrop
      let drewCameraFrame = false;

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
        // Mirror ONLY when front camera (mode === 'user') is active
        if (facingMode === 'user') {
          ctx.translate(width, 0);
          ctx.scale(-1, 1);
        }
        ctx.drawImage(vid, sx, sy, sw, sh, 0, 0, width, height);
        ctx.restore();
        drewCameraFrame = true;
      } else if (nativePhotoUrl) {
        const nativeImg = await loadImage(nativePhotoUrl);
        if (nativeImg) {
          const scale = Math.max(width / nativeImg.width, height / nativeImg.height);
          const sw = width / scale;
          const sh = height / scale;
          const sx = (nativeImg.width - sw) / 2;
          const sy = (nativeImg.height - sh) / 2;
          ctx.drawImage(nativeImg, sx, sy, sw, sh, 0, 0, width, height);
          drewCameraFrame = true;
        }
      }

      if (!drewCameraFrame) {
        const bgImg = await loadImage('/assets/aistudio/Botanical_park_start_screen_logo_546dfb3b_47fb3d00.jpg');
        if (bgImg) {
          ctx.drawImage(bgImg, 0, 0, width, height);
        } else {
          const grad = ctx.createLinearGradient(0, 0, 0, height);
          grad.addColorStop(0, '#0C6E5A');
          grad.addColorStop(0.5, '#149B7E');
          grad.addColorStop(1, '#064E3B');
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, width, height);
        }
      }

      // 2. Draw subtle top & bottom gradient vignettes for legibility
      const topGrad = ctx.createLinearGradient(0, 0, 0, 110);
      topGrad.addColorStop(0, 'rgba(6, 38, 32, 0.85)');
      topGrad.addColorStop(1, 'rgba(6, 38, 32, 0)');
      ctx.fillStyle = topGrad;
      ctx.fillRect(0, 0, width, 110);

      const botGrad = ctx.createLinearGradient(0, height - 160, 0, height);
      botGrad.addColorStop(0, 'rgba(6, 38, 32, 0)');
      botGrad.addColorStop(1, 'rgba(6, 38, 32, 0.9)');
      ctx.fillStyle = botGrad;
      ctx.fillRect(0, height - 160, width, 160);

      // 3. Draw Companion Bird Illustration Overlay in bottom-right WITHOUT circular cropping (object-fit: contain inside rounded card)
      const birdImg = await loadImage(selectedCompanion.asset);
      if (birdImg) {
        const cardW = 196;
        const cardH = 196;
        const pad = 10;
        const bx = width - cardW - 24;
        const by = height - cardH - 56;

        // Draw dark semi-transparent rounded card rgba(12, 35, 30, 0.75)
        ctx.save();
        ctx.fillStyle = 'rgba(12, 35, 30, 0.78)';
        ctx.strokeStyle = '#FDBA2E';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.roundRect(bx, by, cardW, cardH, 22);
        ctx.fill();
        ctx.stroke();
        ctx.restore();

        // Draw full bird inside card preserving aspect ratio (object-fit: contain)
        const maxW = cardW - pad * 2;
        const maxH = cardH - pad * 2;
        const ratio = Math.min(maxW / birdImg.width, maxH / birdImg.height);
        const drawW = birdImg.width * ratio;
        const drawH = birdImg.height * ratio;
        const dx = bx + (cardW - drawW) / 2;
        const dy = by + (cardH - drawH) / 2;

        ctx.drawImage(birdImg, dx, dy, drawW, drawH);
      }

      // 4. Draw Header & Footer Park Stamp
      ctx.strokeStyle = '#FDBA2E';
      ctx.lineWidth = 6;
      ctx.strokeRect(14, 14, width - 28, height - 28);

      ctx.fillStyle = '#FDE047';
      ctx.font = 'bold 20px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`🦜 ¡Con ${selectedCompanion.name}!`, 30, 48);

      ctx.fillStyle = '#A7F3D0';
      ctx.font = '13px sans-serif';
      ctx.fillText(`${selectedCompanion.scientific} · Parque Botánico Barón Schuel`, 30, 70);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText(
        `San Salvador de Jujuy · ${new Date().toLocaleDateString('es-AR')}`,
        30,
        height - 28
      );

      const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
      setCapturedPhoto(dataUrl);
      capturedBird.current = selectedCompanion.name;
      setSaveResult(null);
      await persistCapture(dataUrl);
    }

    } catch {
      setCameraError('No se pudo crear la composición. Reintentá la captura.');
    } finally {
      setIsCapturing(false);
      captureLock.current = false;
    }
  };

  useModalEscape(isOpen, onClose);

  if (!isOpen) return null;

  return (
    <div role="dialog" aria-modal="true" aria-label="FOTO CON TU AVE COMPAÑERA" className="ui-overlay z-50 flex items-center justify-center sm:p-3 animate-fadeIn">
      {/* Hidden Canvas & Native Mobile Camera Input Fallback */}
      <canvas ref={canvasRef} className="hidden" />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture={facingMode === 'user' ? 'user' : 'environment'}
        onChange={handleNativeFileCapture}
        className="hidden"
      />

      <div className="relative flex h-[100dvh] w-full flex-col overflow-y-auto [&>*]:shrink-0 bg-surface-900 text-ink sm:max-h-[94dvh] sm:max-w-md sm:rounded-3xl sm:border sm:border-white/20 shadow-xl">
        {/* Top Header */}
        <div className="pt-safe shrink-0 bg-forest-950"><ModalHeader title="FOTO CON TU AVE COMPAÑERA" subtitle={`Cámara ${facingMode === 'user' ? 'Frontal (Selfie)' : 'Trasera (Sendero)'} · Sin Flash`} icon={<Camera aria-hidden="true" className="h-5 w-5" />} onClose={() => {
              soundManager.playClick();
              stopCamera();
              onClose();
            }} /></div>

        {/* Environmental Care Warning Banner */}
        <div className="bg-amber-950/90 border-b border-amber-600/40 px-3 py-1.5 flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
          <div className="text-[11px] leading-tight text-amber-200">
            <span className="font-bold text-amber-300">Flash OFF obligatorio:</span> Cuida la fauna de las Yungas.
          </div>
        </div>

        {/* Main Camera / Photo Viewport */}
        <div className="relative flex-1 min-h-[290px] max-h-[350px] bg-surface-950 overflow-hidden flex items-center justify-center">
          {capturedPhoto ? (
            <div className="relative w-full h-full flex flex-col items-center justify-center p-3 bg-teal-950/80">
              <img
                src={capturedPhoto}
                alt="Foto compañera tomada"
                className="max-h-[250px] rounded-2xl border border-amber-400 shadow-xl object-contain"
              />
              <div className="mt-1.5 flex items-center gap-1.5 text-xs text-emerald-300 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>¡Foto guardada en tu perfil y Diario de Campo!</span>
              </div>
            </div>
          ) : (
            <>
              {/* 1) Live Video Feed with key={facingMode} & Mandatory Mobile Attributes */}
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
                  style={{ transform: facingMode === 'user' ? 'scaleX(-1)' : 'none' }}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : nativePhotoUrl ? (
                <img
                  src={nativePhotoUrl}
                  alt="Foto capturada desde el teléfono"
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <div
                  className="absolute inset-0 w-full h-full bg-cover bg-center"
                  style={{
                    backgroundImage: `url('/assets/aistudio/Botanical_park_start_screen_logo_546dfb3b_47fb3d00.jpg')`
                  }}
                >
                  <div className="absolute inset-0 bg-emerald-950/45 backdrop-blur-[1px]" />
                </div>
              )}

              {/* 2) Top Controls Overlay Inside Viewport: Flip Camera ("🔄 Girar Cámara") */}
              <div className="absolute top-2.5 inset-x-2.5 z-20 flex items-center justify-between gap-1.5">
                <div className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-xs text-[11px] text-teal-200 border border-teal-500/40 font-bold">
                  🌿 Parque Botánico Barón Schuel
                </div>

                <button
                  type="button"
                  onClick={handleFlipCamera}
                  className="min-h-11 min-w-11 px-2.5 py-1 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-[11px] border border-slate-900 shadow-lg flex items-center gap-1 active:scale-95 transition-all cursor-pointer"
                  title="Alternar entre cámara frontal y trasera"
                >
                  <RefreshCw className="w-3 h-3 stroke-[2.5]" />
                  <span>🔄 Girar Cámara ({facingMode === 'user' ? 'Frontal' : 'Trasera'})</span>
                </button>
              </div>

              {/* 3) Companion Bird Overlay: Uncropped Full-Body Floating Card (object-fit: contain, padding: 6px, rgba(12, 35, 30, 0.75)) */}
              <div className="absolute bottom-2.5 right-2.5 z-20 flex flex-col items-end pointer-events-none">
                <div className="ui-card bg-surface-950 px-2.5 py-1 rounded-2xl border border-teal-400/50 text-[11px] text-white max-w-32 mb-1.5 shadow-lg">
                  {selectedCompanion.speech}
                </div>
                <div
                  style={{ backgroundColor: 'rgba(12, 35, 30, 0.75)', padding: '6px' }}
                  className="relative w-32 h-32 rounded-2xl border border-amber-400 shadow-2xl overflow-visible flex items-center justify-center"
                >
                  <img
                    src={encodeURI(selectedCompanion.asset)}
                    alt={selectedCompanion.name}
                    className="w-full h-full object-contain rounded-xl drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)]"
                  />
                </div>
              </div>

              {/* Shutter flash animation overlay */}
              {isCapturing && (
                <div className="absolute inset-0 bg-white z-30  opacity-90" />
              )}
            </>
          )}

          {/* Fallback Button when permission is blocked or user is in WhatsApp/Instagram in-app browser */}
          {!capturedPhoto && (!useRealCamera || cameraError) && (
            <div className="absolute bottom-2.5 left-2.5 z-20 max-w-[56%] space-y-1">
              {cameraError && (
                <div className="bg-surface-950 text-amber-300 text-[11px] p-1.5 rounded-lg border border-amber-500/50 leading-tight">
                  {cameraError}
                </div>
              )}
              <div className="flex flex-col gap-1">
                <button
                  type="button"
                  onClick={() => startCamera(facingMode)}
                  className="min-h-11 min-w-11 px-2.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-black text-[11px] border border-teal-300 shadow-lg flex items-center gap-1 cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5 shrink-0" />
                  <span>📷 Activar Cámara en Vivo</span>
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="min-h-11 min-w-11 px-2.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-[11px] border border-slate-900 shadow-lg flex items-center gap-1 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5 shrink-0" />
                  <span>📱 Usar Cámara del Teléfono</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Companion Selector Tabs */}
        {!capturedPhoto && (
          <div className="p-2.5 bg-surface-950 border-t border-teal-900/60 space-y-2">
            <div className="text-[11px] font-bold text-teal-300 flex items-center justify-between gap-1">
              <span>ELIGE TU AVE COMPAÑERA:</span>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="min-h-11 min-w-11 text-[11px] text-amber-300 underline hover:text-amber-200 flex items-center gap-1 cursor-pointer"
              >
                <Camera className="w-3 h-3" />
                <span>Abrir Cámara Nativa del Celular</span>
              </button>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {COMPANIONS.map((bird) => {
                const isSelected = selectedCompanion.id === bird.id;
                return (
                  <button
                    key={bird.id}
                    type="button"
                    onClick={() => {
                      soundManager.playClick();
                      setSelectedCompanion(bird);
                      if (onSelectCompanionBird) {
                        onSelectCompanionBird(bird.name);
                      }
                    }}
                    className={`min-h-11 min-w-11 p-2 rounded-xl border text-left transition-all flex items-center justify-between ${
                      isSelected
                        ? 'border-amber-400 bg-teal-900/90 shadow-md ring-2 ring-amber-400/40'
                        : 'border-teal-900/60 bg-surface-900 text-slate-300 hover:text-white'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="text-[11px] font-bold text-white truncate">{bird.name}</div>
                      <div className="text-[11px] text-teal-300/90 truncate">{bird.badge}</div>
                    </div>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <p className="px-3 text-xs text-amber-200">Composición ilustrativa · no es evidencia de un avistamiento real</p>
        {(saving || saveResult) && <p role={saveResult?.saved === false ? 'alert' : 'status'} className="px-3 py-2 text-xs text-white">
          {saving ? 'Guardando…' : saveResultMessage(saveResult!)}
        </p>}
        {capturedPhoto && saveResult?.saved === false && <button disabled={saving} onClick={() => persistCapture(capturedPhoto)} className="min-h-11 text-amber-200">Reintentar guardar</button>}
        {/* Bottom Shutter Action Bar */}
        <div className="pb-safe p-3 bg-surface-950 border-t border-teal-900/80 flex items-center justify-between gap-2">
          {capturedPhoto ? (
            <>
              <button
                type="button"
                disabled={saving}
                onClick={() => {
                  soundManager.playClick();
                  setCapturedPhoto(null);
                  setSaveResult(null);
                }}
                className="min-h-11 min-w-11 flex-1 py-2.5 px-2.5 rounded-xl bg-slate-800 text-slate-200 text-xs font-semibold hover:bg-slate-700 transition-colors"
              >
                Otra foto
              </button>
              <button
                disabled={!saveResult?.photo}
                onClick={() => saveResult?.photo && downloadPhoto(saveResult.photo).catch(() => setCameraError('No se pudo descargar la fotografía'))}
                className="min-h-11 py-2.5 px-3 rounded-xl bg-teal-700 hover:bg-teal-600 text-white text-xs font-bold flex items-center gap-1"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Descargar</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  soundManager.playClick();
                  stopCamera();
                  onClose();
                }}
                className="min-h-11 min-w-11 flex-1 py-2.5 px-2.5 rounded-xl game-btn-orange text-white text-xs font-bold"
              >
                Volver
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={handleTakePhoto}
              disabled={isCapturing || saving}
              className="min-h-11 min-w-11 w-full py-3 rounded-2xl game-btn-orange flex items-center justify-center gap-2 text-white font-bold text-sm tracking-wide cursor-pointer"
            >
              <Camera className="w-5 h-5 text-amber-200" />
              <span>CAPTURAR FOTO CON {selectedCompanion.name.toUpperCase()}</span>
              <Sparkles className="w-4 h-4 text-amber-200" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
