import React, { useState, useEffect } from 'react';
import { Download, Smartphone, WifiOff, X, Share } from 'lucide-react';
import { useLanguage } from '../utils/i18n';
import { soundManager } from '../utils/audio';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export const OfflineIndicator: React.FC = () => {
  const { tx } = useLanguage();
  const [isOffline, setIsOffline] = useState<boolean>(
    typeof navigator !== 'undefined' ? !navigator.onLine : false
  );

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className="bg-amber-500 text-slate-950 px-3 py-1 text-[10px] font-black flex items-center justify-center gap-1.5 shadow-md z-50">
      <WifiOff className="w-3.5 h-3.5 shrink-0" />
      <span>
        {tx(
          'Modo Sendero Offline Activo · Datos y cantos guardados en tu teléfono',
          'Offline Trail Mode Active · Data & bird calls saved on your phone'
        )}
      </span>
    </div>
  );
};

export const PWAInstallButton: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { tx } = useLanguage();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showHelperModal, setShowHelperModal] = useState(false);

  useEffect(() => {
    const checkStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsStandalone(checkStandalone);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsStandalone(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  if (isStandalone) return null;

  const handleInstallClick = async () => {
    soundManager.playClick();
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    } else {
      setShowHelperModal(true);
    }
  };

  return (
    <>
      {compact ? (
        <button
          onClick={handleInstallClick}
          className="w-8 h-8 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 game-btn-circle flex items-center justify-center active:scale-95 cursor-pointer shadow-md shrink-0"
          title={tx('Instalar App en el Teléfono (Offline)', 'Install App on Phone (Offline)')}
          aria-label={tx('Instalar App', 'Install App')}
        >
          <Download className="w-4 h-4 text-slate-950 stroke-[2.5]" />
        </button>
      ) : (
        <button
          onClick={handleInstallClick}
          className="w-full p-2.5 rounded-xl bg-gradient-to-r from-teal-700 to-emerald-700 hover:from-teal-600 hover:to-emerald-600 text-white text-xs font-bold border border-emerald-400/70 flex items-center gap-2.5 transition-all cursor-pointer shadow-lg"
        >
          <Smartphone className="w-4 h-4 text-amber-300 shrink-0" />
          <div className="text-left flex-1">
            <div>{tx('Instalar App en el Teléfono (PWA Offline)', 'Install App on Phone (Offline PWA)')}</div>
            <div className="text-[9px] text-teal-100 font-normal">
              {tx(
                'Agrega Señal Nativa a tu pantalla de inicio para usar en el sendero sin señal',
                'Add Señal Nativa to your Home Screen to use on the trail without signal'
              )}
            </div>
          </div>
          <Download className="w-4 h-4 text-amber-300 shrink-0" />
        </button>
      )}

      {showHelperModal && (
        <div
          onClick={() => setShowHelperModal(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-md animate-fadeIn"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-xs rounded-3xl overflow-hidden bg-slate-900 border-2 border-teal-400 p-4 text-slate-100 shadow-2xl space-y-3"
          >
            <div className="flex items-center justify-between pb-2 border-b border-teal-800">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-amber-400" />
                <h4 className="text-xs font-black text-white uppercase">
                  {tx('INSTALAR EN TU CELULAR', 'INSTALL ON YOUR PHONE')}
                </h4>
              </div>
              <button
                onClick={() => setShowHelperModal(false)}
                className="w-7 h-7 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-[11px] text-teal-200 leading-snug">
              {tx(
                'Esta aplicación es una PWA 100% Offline diseñada para funcionar en la Selva Montana de las Yungas incluso sin datos móviles:',
                'This app is a 100% Offline PWA designed to work inside the Yungas Mountain Forest even without mobile data:'
              )}
            </p>

            <div className="space-y-2 text-[11px] bg-slate-950 p-3 rounded-2xl border border-teal-900">
              <div className="flex items-start gap-2">
                <span className="text-amber-400 font-black">1.</span>
                <span>
                  {tx(
                    'En Android (Chrome): toca el menú (⋮) del navegador y selecciona "Instalar aplicación" o "Agregar a la pantalla principal".',
                    'On Android (Chrome): tap the browser menu (⋮) and select "Install app" or "Add to Home screen".'
                  )}
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-amber-400 font-black">2.</span>
                <span className="flex-1">
                  {tx(
                    'En iPhone / iPad (Safari): toca el botón Compartir ',
                    'On iPhone / iPad (Safari): tap the Share button '
                  )}
                  <Share className="w-3 h-3 inline text-sky-400" />
                  {tx(
                    ' y elige "Agregar a Inicio".',
                    ' and select "Add to Home Screen".'
                  )}
                </span>
              </div>
            </div>

            <button
              onClick={() => setShowHelperModal(false)}
              className="w-full py-2.5 rounded-xl game-btn-orange text-white text-xs font-black uppercase"
            >
              {tx('¡Entendido!', 'Got it!')}
            </button>
          </div>
        </div>
      )}
    </>
  );
};
