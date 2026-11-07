import React from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { soundManager } from '../utils/audio';

interface Screen1SplashProps {
  onStartAdventure: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const Screen1Splash: React.FC<Screen1SplashProps> = ({
  onStartAdventure,
  soundEnabled,
  onToggleSound
}) => {
  const handleScreenClick = () => {
    soundManager.playClick();
    onStartAdventure();
  };

  return (
    <div
      onClick={handleScreenClick}
      className="relative w-full h-full flex flex-col justify-between overflow-hidden bg-cover bg-center select-none cursor-pointer"
      style={{ backgroundImage: `url('/assets/aistudio/Botanical_park_start_screen_logo_11198c3d_2d966cdf.jpg')` }}
    >
      {/* Top Header: Ambient control badge */}
      <div className="relative z-20 flex items-center justify-between p-4 pointer-events-auto">
        <div className="px-3 py-1 rounded-full bg-slate-950/70 backdrop-blur-md border border-teal-400/40 text-[10px] text-teal-200 tracking-wider font-semibold shadow">
          PARQUE BOTÁNICO SCHUEL · JUJUY
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleSound();
          }}
          className="w-9 h-9 rounded-full bg-slate-950/70 backdrop-blur-md border border-teal-400/40 flex items-center justify-center text-teal-300 hover:text-white shadow active:scale-95 transition-transform"
          title="Sonido y Brisa de Selva"
        >
          {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
        </button>
      </div>

      {/* 
        Exact transparent button placed directly on the illustration's painted button:
        position: absolute; bottom: 18%; left: 20%; width: 60%; height: 14%; cursor: pointer;
        background: transparent, border: none, with subtle hover/active glow and scale
      */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleScreenClick();
        }}
        aria-label="Comienza tu aventura"
        style={{
          position: 'absolute',
          bottom: '18%',
          left: '20%',
          width: '60%',
          height: '14%',
          cursor: 'pointer',
          background: 'transparent',
          border: 'none',
          outline: 'none'
        }}
        className="z-30 rounded-[28px] transition-transform duration-150 hover:scale-[1.02] active:scale-95 hover:bg-white/5 focus:outline-none"
      />

      {/* Bottom Subtitle Caption */}
      <div className="relative z-10 w-full pb-3 text-center pointer-events-none">
        <p className="text-[11px] text-teal-100/90 font-medium tracking-wide drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
          Selva Montana de las Yungas · 1334 a 1463 m.s.n.m.
        </p>
      </div>
    </div>
  );
};
