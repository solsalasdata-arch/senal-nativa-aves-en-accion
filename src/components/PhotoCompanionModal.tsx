import React, { useState, useRef, useEffect } from 'react';
import { Camera, X, ShieldAlert, Sparkles, RefreshCw, CheckCircle2 } from 'lucide-react';
import { soundManager } from '../utils/audio';

interface PhotoCompanionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSavePhoto?: (photoUrl: string) => void;
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
    asset: '/assets/aistudio/Toucan_perched_on_branch_8ab41bfc_230157f9.jpg',
    speech: '¡Hola explorador! Posaré de perfil para lucir mi pico.'
  },
  {
    id: 'benteveo',
    name: 'Benteveo' as const,
    scientific: 'Pitangus sulphuratus',
    badge: 'Centinela',
    color: 'from-yellow-400 to-amber-600',
    asset: '/assets/aistudio/Toucan_perched_on_branch_8ab41bfc_230157f9.jpg',
    speech: '¡Bicho feo! No te muevas que capturamos la luz de la selva.'
  },
  {
    id: 'chinchero',
    name: 'Chinchero Chico' as const,
    scientific: 'Lepidocolaptes angustirostris',
    badge: 'Trepador',
    color: 'from-emerald-400 to-teal-600',
    asset: '/assets/aistudio/c3da3f37-f246-40f4-8d25-1958fb93d2f1_0d2a7f41.jpeg',
    speech: '¡Sujétate bien al tronco que sale la toma perfecta!'
  },
  {
    id: 'picaflor',
    name: 'Picaflor Cometa' as const,
    scientific: 'Sappho sparganurus',
    badge: 'Joya Alada',
    color: 'from-rose-400 to-amber-500',
    asset: '/assets/aistudio/Botanical_park_start_screen_logo_546dfb3b_47fb3d00.jpg',
    speech: '¡Zumbido de alas! Mira cómo brilla mi cola en la quebrada.'
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
      const match = COMPANIONS.find(c => c.name === currentBirdName);
      if (match) return match;
    }
    return COMPANIONS[0];
  });
  const [useRealCamera, setUseRealCamera] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (currentBirdName) {
      const match = COMPANIONS.find(c => c.name === currentBirdName);
      if (match) setSelectedCompanion(match);
    }
  }, [currentBirdName, isOpen]);

  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      setCapturedPhoto(null);
    }
  }, [isOpen]);

  const startCamera = async () => {
    try {
      setCameraError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 720 }, height: { ideal: 1280 } },
        audio: false
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setUseRealCamera(true);
    } catch {
      setCameraError('Cámara física no disponible o permiso denegado. Se activará el visor digital XR de simulación ambiental.');
      setUseRealCamera(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setUseRealCamera(false);
  };

  const handleTakePhoto = () => {
    soundManager.playShutter();
    setIsCapturing(true);

    setTimeout(() => {
      // Synthesize photo on canvas
      const canvas = canvasRef.current || document.createElement('canvas');
      canvas.width = 450;
      canvas.height = 700;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Background
        const grad = ctx.createLinearGradient(0, 0, 0, 700);
        grad.addColorStop(0, '#0C6E5A');
        grad.addColorStop(0.5, '#149B7E');
        grad.addColorStop(1, '#064E3B');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 450, 700);

        // Watermark stamp
        ctx.strokeStyle = 'rgba(140, 231, 211, 0.25)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(225, 300, 140, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = 'rgba(140, 231, 211, 0.4)';
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('PARQUE BOTÁNICO MUNICIPAL', 225, 290);
        ctx.fillText('BARÓN CARLOS MARÍA SCHUEL', 225, 310);
        ctx.fillText('YUNGAS · 1334-1463 msnm', 225, 330);

        // Decorative borders
        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        ctx.font = 'bold 22px Fredoka, sans-serif';
        ctx.fillText(`¡Con ${selectedCompanion.name}!`, 225, 80);

        ctx.fillStyle = '#8CE7D3';
        ctx.font = '14px sans-serif';
        ctx.fillText(`${selectedCompanion.scientific} · Reserva Natural Urbana`, 225, 110);

        // Frame
        ctx.strokeStyle = '#FDBA2E';
        ctx.lineWidth = 6;
        ctx.strokeRect(16, 16, 418, 668);

        // Date stamp
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '12px sans-serif';
        ctx.fillText(new Date().toLocaleDateString('es-AR', { dateStyle: 'long' }), 225, 650);

        const dataUrl = canvas.toDataURL('image/jpeg');
        setCapturedPhoto(dataUrl);
        if (onSavePhoto) onSavePhoto(dataUrl);
      }
      setIsCapturing(false);
    }, 400);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-sm max-h-[92vh] flex flex-col rounded-3xl overflow-hidden bg-slate-900 border-2 border-emerald-500/50 shadow-2xl">
        {/* Top Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-950/80 border-b border-teal-800/40">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-teal-400" />
            <h3 className="font-bold text-sm tracking-wide text-white">FOTO COMPAÑERA</h3>
          </div>
          <button
            onClick={() => {
              soundManager.playClick();
              stopCamera();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center border border-slate-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Environmental Care Warning Banner */}
        <div className="bg-amber-950/90 border-b border-amber-600/40 px-3.5 py-2 flex items-start gap-2.5">
          <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-[11px] leading-tight text-amber-200">
            <span className="font-bold text-amber-300 block">CUIDADO AMBIENTAL OBLIGATORIO</span>
            Flash desactivado por defecto — Mantén una distancia respetuosa sin acercarte al ave para no perturbar su hábitat.
          </div>
        </div>

        {/* Main Viewport */}
        <div className="relative flex-1 min-h-[300px] max-h-[360px] bg-slate-950 overflow-hidden flex items-center justify-center">
          {capturedPhoto ? (
            <div className="relative w-full h-full flex flex-col items-center justify-center p-4 bg-teal-950/80">
              <img
                src={capturedPhoto}
                alt="Foto compañera tomada"
                className="max-h-[260px] rounded-2xl border-2 border-amber-400 shadow-xl object-contain"
              />
              <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-300 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ¡Foto guardada en tu Diario de Campo!
              </div>
            </div>
          ) : (
            <>
              {useRealCamera ? (
                <video
                  ref={videoRef}
                  playsInline
                  muted
                  className="w-full h-full object-cover transform -scale-x-100"
                />
              ) : (
                <div
                  className="w-full h-full bg-cover bg-center flex flex-col justify-between p-4 relative"
                  style={{ backgroundImage: `url('/assets/aistudio/Botanical_park_start_screen_logo_546dfb3b_47fb3d00.jpg')` }}
                >
                  <div className="absolute inset-0 bg-emerald-950/50 backdrop-blur-[1px]" />
                  
                  {/* Subtle target crosshair */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-44 h-44 rounded-full border-2 border-teal-300/40 border-dashed animate-pulse flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-teal-300" />
                    </div>
                  </div>

                  {/* Watermark stamp inside camera */}
                  <div className="relative z-10 self-start px-2.5 py-1 rounded-full bg-black/40 text-[10px] text-teal-200 border border-teal-500/30">
                    🌿 Parque Botánico Barón Schuel · Selva Montana
                  </div>

                  {/* Bird Companion Overlay */}
                  <div className="relative z-10 self-end flex flex-col items-end">
                    <div className="bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-teal-400/40 text-[11px] text-white max-w-[200px] mb-2 shadow-lg">
                      {selectedCompanion.speech}
                    </div>
                    <div className="relative w-28 h-28 rounded-full border-4 border-amber-400 shadow-xl overflow-hidden bg-slate-900">
                      <img
                        src={selectedCompanion.asset}
                        alt={selectedCompanion.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Shutter flash animation overlay */}
              {isCapturing && (
                <div className="absolute inset-0 bg-white z-30 animate-ping opacity-90" />
              )}
            </>
          )}

          {cameraError && (
            <div className="absolute bottom-2 left-2 right-2 bg-slate-900/90 text-amber-300 text-[10px] p-2 rounded-lg border border-amber-600/50">
              {cameraError}
            </div>
          )}
        </div>

        {/* Companion Selector Tabs */}
        {!capturedPhoto && (
          <div className="p-3 bg-slate-950/95 border-t border-teal-900/60">
            <div className="text-[11px] font-semibold text-teal-300 mb-2 flex items-center justify-between">
              <span>ELIGE TU AVE COMPAÑERA:</span>
              <button
                onClick={() => {
                  soundManager.playClick();
                  if (useRealCamera) {
                    stopCamera();
                  } else {
                    startCamera();
                  }
                }}
                className="text-[10px] text-teal-400 underline hover:text-teal-200 flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                {useRealCamera ? 'Modo XR Selva' : 'Activar Cámara'}
              </button>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {COMPANIONS.map((bird) => {
                const isSelected = selectedCompanion.id === bird.id;
                return (
                  <button
                    key={bird.id}
                    onClick={() => {
                      soundManager.playClick();
                      setSelectedCompanion(bird);
                      if (onSelectCompanionBird) {
                        onSelectCompanionBird(bird.name);
                      }
                    }}
                    className={`p-2 rounded-xl border text-left transition-all flex items-center justify-between ${
                      isSelected
                        ? 'border-amber-400 bg-teal-900/90 shadow-md ring-2 ring-amber-400/40'
                        : 'border-teal-900/60 bg-slate-900/70 text-slate-300 hover:text-white'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="text-[11px] font-bold text-white truncate">{bird.name}</div>
                      <div className="text-[9px] text-teal-300/90 truncate">{bird.badge}</div>
                    </div>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Bottom Shutter Action Bar */}
        <div className="p-3 bg-slate-950 border-t border-teal-900/80 flex items-center justify-between gap-3">
          {capturedPhoto ? (
            <>
              <button
                onClick={() => {
                  soundManager.playClick();
                  setCapturedPhoto(null);
                }}
                className="flex-1 py-2.5 px-3 rounded-xl bg-slate-800 text-slate-200 text-xs font-semibold hover:bg-slate-700 transition-colors"
              >
                Tomar otra foto
              </button>
              <button
                onClick={() => {
                  soundManager.playClick();
                  onClose();
                }}
                className="flex-1 py-2.5 px-3 rounded-xl game-btn-orange text-white text-xs font-bold"
              >
                Guardar y Volver
              </button>
            </>
          ) : (
            <button
              onClick={handleTakePhoto}
              className="w-full py-3 rounded-2xl game-btn-orange flex items-center justify-center gap-2 text-white font-bold text-sm tracking-wide"
            >
              <Camera className="w-5 h-5 text-amber-200" />
              <span>CAPTURAR RECUERDO</span>
              <Sparkles className="w-4 h-4 text-amber-200 animate-spin" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
