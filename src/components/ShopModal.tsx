import React from 'react';
import { ShoppingBag, X, Check, Lock, Sparkles } from 'lucide-react';
import { soundManager } from '../utils/audio';
import { SHOP_ITEMS } from '../data/birdsData';
import { PlayerState } from '../types/game';

interface ShopModalProps {
  isOpen: boolean;
  onClose: () => void;
  playerState: PlayerState;
  onEquipItem: (itemId: string, cost: number) => void;
}

export const ShopModal: React.FC<ShopModalProps> = ({
  isOpen,
  onClose,
  playerState,
  onEquipItem
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-sm max-h-[92vh] flex flex-col rounded-3xl overflow-hidden bg-slate-900 border-2 border-teal-500 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-950 border-b border-teal-900/60">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-teal-400" />
            <div>
              <h3 className="font-bold text-sm text-white">TIENDA BOTÁNICA SCHUEL</h3>
              <p className="text-[10px] text-amber-300">Tus Puntos de Experiencia: {playerState.xp} XP</p>
            </div>
          </div>
          <button
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center border border-slate-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* List of items */}
        <div className="p-3.5 space-y-2.5 flex-1 overflow-y-auto">
          {SHOP_ITEMS.map((item) => {
            const isEquipped =
              playerState.equippedGear.hat === item.id ||
              playerState.equippedGear.backpack === item.id ||
              playerState.equippedGear.binoculars === item.id;
            const canAfford = playerState.xp >= item.cost;

            return (
              <div
                key={item.id}
                className="bg-slate-950/80 border border-teal-900/60 rounded-2xl p-3 flex items-center justify-between gap-3"
              >
                <div className="text-3xl p-2 rounded-xl bg-teal-950/80 border border-teal-800/40 shrink-0">
                  {item.icon}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-xs font-bold text-white truncate">{item.name}</h4>
                  </div>
                  <p className="text-[10px] text-slate-300 line-clamp-2 leading-tight mt-0.5">
                    {item.description}
                  </p>
                  <div className="mt-1 text-[11px] font-bold text-amber-400">
                    Costo: {item.cost} XP
                  </div>
                </div>

                <div className="shrink-0">
                  {isEquipped ? (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-xl border border-emerald-500/40">
                      <Check className="w-3.5 h-3.5" />
                      Equipado
                    </span>
                  ) : (
                    <button
                      disabled={!canAfford}
                      onClick={() => {
                        soundManager.playSuccess();
                        onEquipItem(item.id, item.cost);
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        canAfford
                          ? 'game-btn-orange text-white'
                          : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed flex items-center gap-1'
                      }`}
                    >
                      {!canAfford && <Lock className="w-3 h-3" />}
                      <span>{canAfford ? 'Canjear' : 'Bloqueado'}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          <div className="bg-teal-950/40 border border-teal-800/30 rounded-xl p-3 text-center text-xs text-teal-200">
            <Sparkles className="w-4 h-4 text-amber-300 inline mr-1" />
            ¡Realiza avistamientos y responde preguntas en la selva para ganar más XP y canjear accesorios!
          </div>
        </div>
      </div>
    </div>
  );
};
