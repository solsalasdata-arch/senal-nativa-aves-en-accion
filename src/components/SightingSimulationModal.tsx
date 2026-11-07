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
import { PlayerProfile } from '../types/game';

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
  playerProfile,
  onSightingSuccess,
  onOpenQuizConsignas
}) => {
  // Active AR bird mode: 'chinchero' | 'benteveo'
  const [selectedBirdKey, setSelectedBirdKey] = useState<'chinchero' | 'benteveo'>('chinchero');
  const [useRealCamera, setUseRealCamera] = useState(false);
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

  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      setPhotoResult(null);
    }
  }, [isOpen]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 720 }, height: { ideal: 1280 } },
        audio: false
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setUseRealCamera(true);
    } catch {
      setUseRealCamera(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setUseRealCamera(false);
  };

  if (!isOpen) return null;

  // Handle Foto Perfecta Capture
  const handleShutterCapture = () => {
    soundManager.playShutter();
    setIsPhotoCapturing(true);

    if (selectedBirdKey === 'chinchero') {
      soundManager.playChincheroCall();
    } else {
      soundManager.playBenteveoCall();
    }

    setTimeout(() => {
      // Evaluate 3 criteria:
      // 1. Centered: True
      // 2. Sharpness: True if focusSlider is between 65 and 95
      // 3. Respectful distance without flash: Always true per Schuel rules
      const isFocused = focusSlider >= 65 && focusSlider <= 95;
      const centered = true;
      const respectful = true;
      const stars = isFocused ? 3 : 2;

      const birdName = selectedBirdKey === 'chinchero' ? 'Chinchero Chico' : 'Benteveo';
      const birdId = selectedBirdKey === 'chinchero' ? 'chinchero-chico' : 'benteveo-comun';

      setPhotoResult({
        stars,
        criteria: { centered, focus: isFocused, respectful },
        birdName,
        photoUrl:
          selectedBirdKey === 'chinchero'
            ? '/assets/aistudio/c3da3f37-f246-40f4-8d25-1958fb93d2f1_0d2a7f41.jpeg'
            : '/assets/aistudio/Toucan_perched_on_branch_8ab41bfc_230157f9.jpg'
      });

      soundManager.playSuccess();
      onSightingSuccess(birdId, stars);
      setIsPhotoCapturing(false);
    }, 450);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-3 bg-black/90 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-sm h-[94vh] max-h-[860px] flex flex-col rounded-3xl overflow-hidden bg-slate-950 border-2 border-teal-500 shadow-2xl">
        {/* HUD Top Bar: Battery, Flash OFF, Respectful Distance, Close */}
        <div className="relative z-30 px-3 py-2 bg-slate-950/80 backdrop-blur-md border-b border-teal-900/60 flex items-center justify-between text-xs text-white">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-extrabold text-[11px] text-teal-300 tracking-wider uppercase">
              XR AVISTAMIENTO
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
          {/* Live Video Feed or Illustrated Backdrop */}
          {useRealCamera ? (
            <video
              ref={videoRef}
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <div
              className="absolute inset-0 bg-cover bg-center transition-all duration-300"
              style={{
                backgroundImage: `url('/assets/aistudio/Botanical_park_start_screen_logo_546dfb3b_47fb3d00.jpg')`,
                filter: `blur(${Math.max(0, Math.abs(80 - focusSlider) / 12)}px)`
              }}
            />
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
          {selectedBirdKey === 'chinchero' && (
            <div className="relative z-20 w-full h-full p-3 flex flex-col justify-between pointer-events-none">
              {/* Top Subtitle */}
              <div className="self-start pointer-events-auto">
                <span className="px-2.5 py-1 rounded-full bg-teal-950/80 backdrop-blur-sm border border-teal-400/50 text-[10px] font-bold text-teal-200">
                  Estrato: Troncos de Selva Montana
                </span>
              </div>

              {/* Center Sighting Reticle + RPG Card on Right */}
              <div className="flex items-center justify-between w-full my-auto px-1">
                {/* Bird Image inside Cyan Target Reticle */}
                <div className="relative w-36 h-36 flex items-center justify-center">
                  {/* Cyan Circular Reticle */}
                  <div className="absolute inset-0 rounded-full border-2 border-sky-400 border-dashed animate-spin-slow flex items-center justify-center">
                    <div className="w-2.5 h-2.5 rounded-full bg-sky-300" />
                  </div>
                  {/* Target Crosshairs */}
                  <div className="absolute w-full h-0.5 bg-sky-400/50" />
                  <div className="absolute h-full w-0.5 bg-sky-400/50" />

                  {/* Bird illustration */}
                  <div className="w-28 h-28 rounded-full overflow-hidden border-2 border-sky-300 shadow-xl bg-slate-900/60">
                    <img
                      src="/assets/aistudio/c3da3f37-f246-40f4-8d25-1958fb93d2f1_0d2a7f41.jpeg"
                      alt="Chinchero Chico"
                      className="w-full h-full object-cover scale-110"
                    />
                  </div>
                </div>

                {/* RPG / Pokémon GO-Style Card on Right */}
                <div className="w-48 bg-slate-950/85 backdrop-blur-md rounded-2xl p-2.5 border-2 border-sky-400 shadow-2xl text-[10px] text-slate-200 pointer-events-auto space-y-1">
                  <div className="flex items-center justify-between border-b border-sky-800 pb-1">
                    <span className="font-black text-xs text-white">Chinchero Chico</span>
                    <span className="font-extrabold text-amber-300 text-[11px]">PC 2579</span>
                  </div>
                  <div className="flex items-center justify-between text-emerald-300 font-bold text-[9px]">
                    <span>125/125 HP</span>
                    <span>Peso: 36g · Alt: 21cm</span>
                  </div>
                  <div className="text-[9px] text-teal-300">
                    <span className="text-slate-400">Familia:</span> FURNARIIDAE
                  </div>
                  <div className="text-[9px] text-teal-300">
                    <span className="text-slate-400">Hábitat:</span> BOSQUES ABIERTOS (Dosel y subdosel)
                  </div>
                  <div className="text-[9px] text-slate-300 pt-0.5 border-t border-slate-800 leading-tight">
                    • Pico delgado y decurvado<br />
                    • Canto de llamada<br />
                    • Plumaje: Dorso pardo-rufo
                  </div>
                </div>
              </div>

              {/* Bottom: Toucan Speech Bubble */}
              <div className="self-center max-w-xs bg-white text-slate-900 p-2 rounded-2xl border-2 border-teal-900 shadow-xl text-[10px] font-bold text-center pointer-events-auto">
                "¡Hola, explorador! ¿Qué tal se ve este bosque en realidad virtual? ¿Listo para buscar más aves?"
              </div>
            </div>
          )}

          {/* Mode b) BENTEVEO (Mira circular con "BENTEVEO DETECTADO" + Tarjeta a la izquierda) */}
          {selectedBirdKey === 'benteveo' && (
            <div className="relative z-20 w-full h-full p-3 flex flex-col justify-between pointer-events-none">
              {/* Top Subtitle */}
              <div className="self-end pointer-events-auto">
                <span className="px-2.5 py-1 rounded-full bg-teal-950/80 backdrop-blur-sm border border-amber-400/50 text-[10px] font-bold text-amber-300">
                  Estrato: Bordes y Claro de Selva
                </span>
              </div>

              {/* Center Sighting Reticle + Card on Left */}
              <div className="flex items-center justify-between w-full my-auto px-1">
                {/* RPG Card on Left */}
                <div className="w-48 bg-slate-950/85 backdrop-blur-md rounded-2xl p-2.5 border-2 border-amber-400 shadow-2xl text-[10px] text-slate-200 pointer-events-auto space-y-1">
                  <div className="flex items-center justify-between border-b border-amber-800 pb-1">
                    <span className="font-black text-xs text-white">Benteveo</span>
                    <span className="font-extrabold text-amber-300 text-[11px]">PC 2579</span>
                  </div>
                  <div className="flex items-center justify-between text-emerald-300 font-bold text-[9px]">
                    <span>125/125 HP</span>
                    <span>Peso: 60g · Alt: 22cm</span>
                  </div>
                  <div className="text-[9px] text-amber-300">
                    <span className="text-slate-400">Familia:</span> TYRANNIDAE
                  </div>
                  <div className="text-[9px] text-amber-300">
                    <span className="text-slate-400">Hábitat:</span> CAMPOS, BOSQUES Y CIUDADES (Zona urbanizada)
                  </div>
                  <div className="text-[9px] text-slate-300 pt-0.5 border-t border-slate-800 leading-tight">
                    • Pico fuerte y robusto<br />
                    • Canto "bien-te-veo"<br />
                    • Plumaje: Pecho amarillo, dorso pardo y cabeza rayada
                  </div>
                </div>

                {/* Bird Image inside Cyan Circular Reticle with "BENTEVEO DETECTADO" */}
                <div className="relative w-36 h-36 flex flex-col items-center justify-center">
                  <div className="absolute -top-3 px-2 py-0.5 rounded-full bg-sky-500 text-slate-950 font-extrabold text-[8px] tracking-wider uppercase shadow-md">
                    BENTEVEO DETECTADO
                  </div>
                  <div className="absolute inset-0 rounded-full border-3 border-sky-400 shadow-[0_0_20px_rgba(56,189,248,0.5)] flex items-center justify-center">
                    <div className="w-2.5 h-2.5 rounded-full bg-sky-300" />
                  </div>

                  <div className="w-28 h-28 rounded-full overflow-hidden border-2 border-sky-300 shadow-xl bg-slate-900/60">
                    <img
                      src="/assets/aistudio/Toucan_perched_on_branch_8ab41bfc_230157f9.jpg"
                      alt="Benteveo"
                      className="w-full h-full object-cover object-[center_18%] scale-110"
                    />
                  </div>
                </div>
              </div>

              {/* Bottom: Toucan Speech Bubble */}
              <div className="self-center max-w-xs bg-white text-slate-900 p-2 rounded-2xl border-2 border-amber-900 shadow-xl text-[10px] font-bold text-center pointer-events-auto">
                "¡Oye! ¿Cuál es la característica principal del Benteveo?"
              </div>
            </div>
          )}

          {/* POPUP DE RESULTADO DE "FOTO PERFECTA" */}
          {photoResult && (
            <div className="absolute inset-0 z-50 bg-slate-950/92 backdrop-blur-md flex flex-col items-center justify-center p-5 text-center animate-fadeIn">
              <div className="w-16 h-16 rounded-full bg-amber-400 flex items-center justify-center text-slate-950 mb-2 shadow-xl">
                <Camera className="w-8 h-8" />
              </div>

              <h4 className="text-base font-black text-white uppercase tracking-wide">
                ¡FOTO PERFECTA REGISTRADA!
              </h4>
              <p className="text-xs text-amber-300 font-bold mb-3">{photoResult.birdName}</p>

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

        {/* Bottom Controls Bar: Bird Toggles, Shutter, and 5 Consignas Button */}
        {!photoResult && (
          <div className="p-3 bg-slate-950 border-t border-teal-900/80 space-y-2.5">
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
                    setSelectedBirdKey('benteveo');
                  }}
                  className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all ${
                    selectedBirdKey === 'benteveo'
                      ? 'bg-amber-400 text-slate-950 shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Benteveo
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
            <div className="flex items-center justify-between pt-1">
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
                className="w-16 h-16 rounded-full bg-white p-1 border-4 border-slate-900 shadow-[0_0_20px_rgba(255,255,255,0.4)] flex items-center justify-center hover:scale-105 active:scale-95 transition-transform cursor-pointer"
                title="Tomar Foto Perfecta"
              >
                <div className="w-12 h-12 rounded-full border-2 border-slate-400 bg-slate-100 flex items-center justify-center">
                  <div className="w-9 h-9 rounded-full bg-white shadow-inner" />
                </div>
              </button>

              {/* Sound sample of the bird */}
              <button
                onClick={() => {
                  if (selectedBirdKey === 'chinchero') soundManager.playChincheroCall();
                  else soundManager.playBenteveoCall();
                }}
                className="flex items-center gap-1 text-[10px] text-teal-300 px-2 py-1 rounded-xl bg-slate-900 border border-teal-800/60 cursor-pointer hover:border-teal-400"
              >
                <Volume2 className="w-3.5 h-3.5 text-teal-400" />
                <span>Canto</span>
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
