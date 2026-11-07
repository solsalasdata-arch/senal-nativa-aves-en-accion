import React, { useState } from 'react';
import {
  ShoppingBag,
  X,
  Check,
  Lock,
  Sparkles,
  PackageOpen,
  Eye,
  Award,
  ShieldCheck
} from 'lucide-react';
import { soundManager } from '../utils/audio';
import { SHOP_ITEMS, PACK_EXTRA_BIRDS_DATA } from '../data/birdsData';
import { PlayerProfile, CatalogBird } from '../types/game';

interface ShopModalProps {
  isOpen: boolean;
  onClose: () => void;
  playerState: PlayerProfile;
  onEquipItem: (itemId: string, cost: number) => void;
  onBuySilhouettePack: (mode: 'hints' | 'silhouettes', cost: number) => CatalogBird[];
  onOpenBirdsCatalog?: () => void;
}

export const ShopModal: React.FC<ShopModalProps> = ({
  isOpen,
  onClose,
  playerState,
  onEquipItem,
  onBuySilhouettePack,
  onOpenBirdsCatalog
}) => {
  const [activeSection, setActiveSection] = useState<'gear' | 'packs'>('gear');
  const [packRevealResult, setPackRevealResult] = useState<{
    mode: 'hints' | 'silhouettes';
    birds: CatalogBird[];
  } | null>(null);

  if (!isOpen) return null;

  const purchasedList = playerState.purchasedGear || ['visera-oficial'];
  const equippedList = playerState.equippedItems || ['visera-oficial'];
  const addedPackIds = playerState.addedPackBirdIds || [];
  const freeHintsCount = playerState.freeSilhouetteHints || 0;
  const remainingPackBirds = PACK_EXTRA_BIRDS_DATA.filter(b => !addedPackIds.includes(b.id));
  const canAffordPack = playerState.xp >= 100;

  const handleOpenPack = (mode: 'hints' | 'silhouettes') => {
    if (!canAffordPack) return;
    soundManager.playSuccess();
    const unlockedBirds = onBuySilhouettePack(mode, 100);
    setPackRevealResult({
      mode,
      birds: unlockedBirds
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-3 bg-black/85 backdrop-blur-md animate-fadeIn select-none">
      <div className="relative w-full max-w-sm max-h-[94vh] flex flex-col rounded-3xl overflow-hidden bg-slate-900 border-2 border-teal-500 shadow-2xl">
        {/* Header */}
        <div className="px-4 py-3 bg-slate-950 border-b border-teal-900/60 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full bg-amber-500/20 border border-amber-400 flex items-center justify-center text-amber-300 shadow">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-xs sm:text-sm text-white uppercase tracking-wider">
                  TIENDA BOTÁNICA SCHUEL
                </h3>
                <p className="text-[10px] text-teal-300 font-semibold">
                  Canje de Recompensas · Paso 9
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                soundManager.playClick();
                onClose();
              }}
              className="px-2.5 py-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-teal-200 hover:text-white text-[10px] font-bold flex items-center gap-1 border border-teal-700/60 shrink-0 shadow active:scale-95 transition-all"
            >
              <span>← Volver al Menú</span>
            </button>
          </div>

          {/* Player Avatar Preview + Active XP Balance */}
          <div className="mt-2.5 p-2.5 rounded-2xl bg-gradient-to-r from-teal-950 via-slate-900 to-teal-950 border border-teal-700/60 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-teal-900/90 border border-amber-400/70 flex items-center justify-center text-xl shrink-0 shadow">
                {playerState.avatarIcon || '🧢'}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-black text-white truncate">
                  {playerState.name}
                </div>
                <div className="flex items-center gap-1 flex-wrap mt-0.5">
                  {SHOP_ITEMS.filter(item => equippedList.includes(item.id)).map(eq => (
                    <span
                      key={eq.id}
                      className="text-[10px] px-1.5 py-0.2 rounded bg-slate-950 border border-teal-500/50 text-teal-200 font-bold"
                      title={eq.name}
                    >
                      {eq.icon}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="text-right shrink-0 bg-amber-500/20 border border-amber-400/70 px-3 py-1.5 rounded-xl">
              <span className="text-[9px] font-black text-amber-200 block uppercase">
                SALDO DISPONIBLE
              </span>
              <span className="text-sm font-black text-amber-300">
                {playerState.xp} XP
              </span>
            </div>
          </div>

          {/* Section Switcher: Prendas y Equipo vs Sobres de Siluetas */}
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-900 rounded-xl border border-teal-900/80 mt-2.5 text-[10px] font-black">
            <button
              onClick={() => {
                soundManager.playClick();
                setActiveSection('gear');
              }}
              className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                activeSection === 'gear'
                  ? 'bg-teal-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>🧢 Prendas y Equipo</span>
            </button>
            <button
              onClick={() => {
                soundManager.playClick();
                setActiveSection('packs');
              }}
              className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                activeSection === 'packs'
                  ? 'bg-amber-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <PackageOpen className="w-3.5 h-3.5" />
              <span>Sobres de Siluetas</span>
            </button>
          </div>
        </div>

        {/* ============================================================== */}
        {/* SECCIÓN A: PRENDAS Y EQUIPO PARA EL AVATAR */}
        {/* ============================================================== */}
        {activeSection === 'gear' && (
          <div className="p-3.5 space-y-2.5 flex-1 overflow-y-auto">
            <div className="flex items-center justify-between px-1">
              <span className="text-[11px] font-black text-teal-300 uppercase tracking-wider">
                a) Prendas y Equipo para el Avatar
              </span>
              <span className="text-[10px] text-amber-300 font-bold">
                {purchasedList.length}/{SHOP_ITEMS.length} desbloqueados
              </span>
            </div>

            {SHOP_ITEMS.map((item) => {
              const isPurchased = item.defaultEquipped || purchasedList.includes(item.id);
              const isEquipped = equippedList.includes(item.id);
              const canAfford = playerState.xp >= item.cost;

              return (
                <div
                  key={item.id}
                  className={`border rounded-2xl p-3 flex items-center justify-between gap-3 transition-all ${
                    isEquipped
                      ? 'bg-teal-950/70 border-teal-400 shadow-lg'
                      : 'bg-slate-950/90 border-teal-900/60'
                  }`}
                >
                  <div className="text-2xl w-12 h-12 rounded-2xl bg-slate-900 border border-teal-700/50 flex items-center justify-center shrink-0 shadow-inner">
                    {item.icon}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h4 className="text-xs font-black text-white leading-tight">
                        {item.name}
                      </h4>
                    </div>
                    <p className="text-[10px] text-slate-300 leading-snug mt-0.5">
                      {item.description}
                    </p>
                    <div className="mt-1 flex items-center gap-2 text-[10px] font-black">
                      {item.cost === 0 ? (
                        <span className="text-emerald-400">Equipada por defecto</span>
                      ) : isPurchased ? (
                        <span className="text-teal-300">✓ Adquirida ({item.cost} XP)</span>
                      ) : (
                        <span className="text-amber-400">Costo: {item.cost} XP</span>
                      )}
                    </div>
                  </div>

                  <div className="shrink-0">
                    {isPurchased ? (
                      <button
                        onClick={() => {
                          soundManager.playClick();
                          onEquipItem(item.id, 0);
                        }}
                        className={`px-2.5 py-1.5 rounded-xl text-[10px] font-black flex items-center gap-1 border transition-all cursor-pointer ${
                          isEquipped
                            ? 'bg-emerald-950 text-emerald-300 border-emerald-400 shadow'
                            : 'bg-slate-800 text-teal-200 border-teal-600 hover:bg-teal-900'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>{isEquipped ? 'Equipada' : 'Equipar'}</span>
                      </button>
                    ) : (
                      <button
                        disabled={!canAfford}
                        onClick={() => {
                          soundManager.playSuccess();
                          onEquipItem(item.id, item.cost);
                        }}
                        className={`px-3 py-1.5 rounded-xl text-[11px] font-black transition-all ${
                          canAfford
                            ? 'game-btn-orange text-white cursor-pointer shadow-lg'
                            : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed flex items-center gap-1'
                        }`}
                      >
                        {!canAfford && <Lock className="w-3 h-3" />}
                        <span>{canAfford ? 'Canjear' : `${item.cost} XP`}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ============================================================== */}
        {/* SECCIÓN B: SOBRES DE SILUETAS (SOBRE SELVA MONTANA - 100 XP) */}
        {/* ============================================================== */}
        {activeSection === 'packs' && (
          <div className="p-3.5 space-y-3 flex-1 overflow-y-auto">
            <div className="flex items-center justify-between px-1">
              <span className="text-[11px] font-black text-amber-300 uppercase tracking-wider">
                b) Sobres de Siluetas de la Guía
              </span>
              <span className="text-[10px] text-teal-300 font-bold">
                Pistas gratis: {freeHintsCount}
              </span>
            </div>

            {/* Featured Card: Sobre Selva Montana (100 XP) */}
            <div className="relative rounded-3xl overflow-hidden border-2 border-amber-400 bg-gradient-to-b from-emerald-950 via-slate-950 to-slate-950 p-4 shadow-xl space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-slate-950 flex items-center justify-center text-3xl shadow-lg shrink-0 border-2 border-amber-200">
                  🃏
                </div>
                <div className="flex-1">
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/60 text-[9px] font-black text-amber-300 uppercase">
                    COLECCIÓN YUNGAS · 100 XP
                  </span>
                  <h4 className="text-sm font-black text-white uppercase mt-1">
                    Sobre Selva Montana
                  </h4>
                  <p className="text-[11px] text-teal-200 leading-snug mt-0.5">
                    Expande tu Guía de Aves del Parque Botánico o consigue pistas automáticas para descifrar siluetas difíciles.
                  </p>
                </div>
              </div>

              {/* Preview of the 6 Selva Montana Pack Species */}
              <div className="p-2.5 rounded-2xl bg-slate-900/90 border border-teal-800/70 space-y-1.5">
                <div className="flex items-center justify-between text-[10px] font-black text-teal-300">
                  <span>Especies del Sobre Selva Montana:</span>
                  <span className="text-amber-300">
                    {addedPackIds.length}/{PACK_EXTRA_BIRDS_DATA.length} en catálogo
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-1 text-[10px]">
                  {PACK_EXTRA_BIRDS_DATA.map(b => {
                    const isAdded = addedPackIds.includes(b.id);
                    return (
                      <div
                        key={b.id}
                        className={`px-2 py-1 rounded-lg border flex items-center gap-1.5 truncate ${
                          isAdded
                            ? 'bg-emerald-950/80 border-emerald-500/60 text-emerald-200 font-bold'
                            : 'bg-slate-950 border-slate-800 text-slate-400'
                        }`}
                      >
                        <span>{b.silhouetteIcon}</span>
                        <span className="truncate">{b.commonName}</span>
                        {isAdded && <Check className="w-3 h-3 text-emerald-400 shrink-0 ml-auto" />}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 2 Redemption Options for Sobre Selva Montana (100 XP) */}
              <div className="space-y-2 pt-1">
                {/* Option 1: Add 3 new silhouettes to catalog */}
                <button
                  disabled={!canAffordPack || remainingPackBirds.length === 0}
                  onClick={() => handleOpenPack('silhouettes')}
                  className={`w-full py-3 px-3 rounded-2xl text-xs font-black uppercase tracking-wide flex items-center justify-between transition-all ${
                    canAffordPack && remainingPackBirds.length > 0
                      ? 'game-btn-orange text-white cursor-pointer shadow-lg'
                      : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                  }`}
                >
                  <span className="flex items-center gap-1.5 text-left">
                    <PackageOpen className="w-4 h-4 shrink-0" />
                    <span>
                      {remainingPackBirds.length > 0
                        ? 'Abrir Sobre: +3 Nuevas Siluetas al Catálogo'
                        : '¡6/6 Siluetas del Sobre ya agregadas!'}
                    </span>
                  </span>
                  <span className="px-2 py-0.5 rounded bg-black/30 text-amber-200 text-[10px] shrink-0">
                    100 XP
                  </span>
                </button>

                {/* Option 2: Reveal 2 free hints in Silueta Misteriosa */}
                <button
                  disabled={!canAffordPack}
                  onClick={() => handleOpenPack('hints')}
                  className={`w-full py-2.5 px-3 rounded-2xl text-xs font-black uppercase tracking-wide flex items-center justify-between transition-all border ${
                    canAffordPack
                      ? ' game-btn-mint text-emerald-950 border-teal-300 cursor-pointer shadow'
                      : 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed'
                  }`}
                >
                  <span className="flex items-center gap-1.5 text-left">
                    <Sparkles className="w-4 h-4 shrink-0" />
                    <span>Canjear Sobre: Revelar +2 Pistas Gratis</span>
                  </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-950/20 text-emerald-950 text-[10px] shrink-0 font-black">
                    100 XP
                  </span>
                </button>
              </div>

              {!canAffordPack && (
                <p className="text-[10px] text-amber-300/90 text-center">
                  Necesitas 100 XP para abrir un Sobre Selva Montana (tienes {playerState.xp} XP). ¡Suma XP en Avistamientos, Mapa o Diario!
                </p>
              )}
            </div>

            {/* Pack Opening Reveal Banner */}
            {packRevealResult && (
              <div className="p-3.5 rounded-2xl bg-emerald-950 border-2 border-amber-400 text-white space-y-2 animate-fadeIn shadow-xl">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-amber-300 uppercase flex items-center gap-1.5">
                    <Award className="w-4 h-4" />
                    ¡SOBRE SELVA MONTANA ABIERTO!
                  </span>
                  <button
                    onClick={() => setPackRevealResult(null)}
                    className="text-slate-400 hover:text-white text-xs"
                  >
                    ✕
                  </button>
                </div>

                {packRevealResult.mode === 'silhouettes' ? (
                  <>
                    <p className="text-[11px] text-emerald-200">
                      Se agregaron <strong>{packRevealResult.birds.length} nuevas siluetas</strong> a tu Catálogo de Aves (además de <strong>+2 pistas gratis</strong> para Silueta Misteriosa):
                    </p>
                    <div className="grid grid-cols-3 gap-1.5 pt-1">
                      {packRevealResult.birds.map(b => (
                        <div
                          key={b.id}
                          className="p-2 rounded-xl bg-slate-900 border border-teal-500/60 text-center"
                        >
                          <div className="text-xl">{b.silhouetteIcon}</div>
                          <div className="text-[10px] font-black text-white leading-tight mt-1">
                            {b.commonName}
                          </div>
                          <div className="text-[8px] text-teal-300">#{b.catalogNumber}</div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <p className="text-[11px] text-emerald-200">
                    ¡Has obtenido <strong>+2 Pistas Gratis</strong> automáticas! Cuando abras cualquier Silueta Misteriosa en la Guía, verás pistas adicionales reveladas sin perder bonificación de XP.
                  </p>
                )}

                {onOpenBirdsCatalog && (
                  <button
                    onClick={() => {
                      soundManager.playClick();
                      onClose();
                      onOpenBirdsCatalog();
                    }}
                    className="w-full py-2 rounded-xl game-btn-orange text-white text-[11px] font-black uppercase flex items-center justify-center gap-1.5 mt-1"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Ir al Catálogo de Aves Ahora</span>
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
