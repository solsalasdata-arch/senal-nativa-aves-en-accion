import React, { useState, useRef, useLayoutEffect } from 'react';
import { ArrowLeft, Volume2, Info, Users, Binoculars } from 'lucide-react';
import { soundManager } from '../utils/audio';
import { PlayerProfile } from '../types/game';
import { useLanguage, LanguageSelector } from '../utils/i18n';
import { AvatarIcon } from './AvatarIcon';
import { Button, IconButton, ModalHeader } from './ui';

interface Screen3HostPresentationProps {
  activeProfile: PlayerProfile;
  onAdvanceToMainHub: () => void;
  onBack: () => void;
  onChangePlayer: () => void;
  onOpenMiroAvatar?: () => void;
}

export const Screen3HostPresentation: React.FC<Screen3HostPresentationProps> = ({ activeProfile, onAdvanceToMainHub, onBack, onChangePlayer, onOpenMiroAvatar }) => {
  const { tx, lang } = useLanguage();
  const [showSilhouettesModal, setShowSilhouettesModal] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [welcomeScene, setWelcomeScene] = useState<'entrance' | 'branch'>('entrance');
  const bgImage = welcomeScene === 'entrance' ? '/assets/aistudio/En_el_dialogo_que_diga_c420835e.jpg' : '/assets/aistudio/Toucan_perched_on_branch_8ab41bfc_230157f9.jpg';

  // Keep the painted toucan above the measured welcome panel on short screens.
  const bottomPanelRef = useRef<HTMLDivElement | null>(null);
  const [bottomPanelHeight, setBottomPanelHeight] = useState(0);
  useLayoutEffect(() => {
    const panel = bottomPanelRef.current;
    if (!panel) return;
    const measure = () => setBottomPanelHeight(panel.offsetHeight);
    measure();
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(measure);
    observer.observe(panel);
    return () => observer.disconnect();
  }, []);
  const artBottomOffset = welcomeScene === 'entrance' ? Math.max(0, bottomPanelHeight - 28) : 0;
  const openInfo = () => { soundManager.playClick(); setShowInfoModal(true); };
  return <div className="relative flex h-full flex-col justify-between overflow-hidden bg-forest-950 text-ink">
    <div className={`absolute inset-x-0 top-0 bg-cover transition-all duration-300 ${welcomeScene === 'entrance' ? 'bg-bottom' : 'bg-center'}`} style={{ backgroundImage: `url('${bgImage}')`, bottom: artBottomOffset }} />
    <header className="pt-safe relative z-10 flex items-center gap-2 bg-forest-950/90 px-3 pb-3">
      <IconButton label={tx('Volver', 'Back')} onClick={() => { soundManager.playClick(); onBack(); }}><ArrowLeft className="h-5 w-5" /></IconButton>
      <button className="flex min-h-11 min-w-0 flex-1 items-center gap-2 rounded-full border border-white/25 px-2 text-xs" title={tx('Abrir perfil YO / JUGADORES', 'Open ME / PLAYERS profile')} onClick={() => { soundManager.playClick(); if (onOpenMiroAvatar) onOpenMiroAvatar(); else onChangePlayer(); }}><AvatarIcon icon={activeProfile.avatarIcon} alt="" className="h-7 w-7 shrink-0" /><span className="truncate">{activeProfile.name}</span></button>
      <div className="flex shrink-0 gap-2"><IconButton label={tx('Escuchar la bienvenida del Tucán Grande', 'Listen to the Toco Toucan welcome')} onClick={() => soundManager.playToucanVoice('welcome', lang)}><Volume2 className="h-5 w-5" /></IconButton><IconButton label={tx('Ficha científica del tucán', 'Toucan scientific fact sheet')} onClick={openInfo}><Info className="h-5 w-5" /></IconButton></div>
    </header>
    <div className="min-h-0 flex-1" />
    <section ref={bottomPanelRef} className="pb-safe relative z-10 max-h-[55%] shrink-0 overflow-y-auto bg-gradient-to-t from-forest-950 via-forest-950 to-forest-950/90 px-5 pt-4">
      <h1 className="text-2xl font-semibold">{tx(`¡Hola, ${activeProfile.name}!`, `Hello, ${activeProfile.name}!`)}</h1>
      <p className="mb-4 mt-2 text-sm leading-relaxed text-ink-muted">{tx('Soy el Tucán Grande, tu guía en el Parque Botánico. Explorá senderos, escaneá señales y descubrí aves.', 'I am the Toco Toucan, your guide at the Botanical Park. Explore trails, scan signs and discover birds.')}</p>
      <Button fullWidth icon={<Binoculars className="h-5 w-5" />} onClick={() => { soundManager.playSuccess(); onAdvanceToMainHub(); }}>{tx('Empezar a explorar', 'Start exploring')}</Button>
      <Button fullWidth variant="ghost" className="mt-2" onClick={openInfo}>{tx('Conocer al tucán', 'Meet the toucan')}</Button>
    </section>
    {showInfoModal && <div className="ui-overlay z-50 flex items-center justify-center p-4 animate-fadeIn">
      <section role="dialog" aria-modal="true" aria-labelledby="toucan-info-title" className="ui-card max-h-[90dvh] w-full max-w-sm overflow-y-auto p-0">
        <ModalHeader title={tx('Ficha científica', 'Scientific fact sheet')} subtitle="Ramphastidae · Ramphastos toco" titleId="toucan-info-title" onClose={() => setShowInfoModal(false)} />
        <div className="space-y-4 p-4 text-sm leading-relaxed">
          <p><strong>{tx('Características:', 'Characteristics:')}</strong> {tx('Longitud promedio de 55 a 63 cm. Destaca su descomunal pico amarillo-anaranjado de 20 cm con mancha negra en la punta, piel periocular turquesa y babero blanco.', 'Average length of 55 to 63 cm. Notable for its massive 20 cm yellow-orange bill with a black tip, turquoise periocular skin, and white bib.')}</p>
          <p><strong>{tx('Reserva Schuel:', 'Schuel Reserve:')}</strong> {tx('Habita el dosel superior y las copas de higuerones y laureles de las Yungas en San Salvador de Jujuy.', 'Inhabits the upper canopy and crowns of fig and laurel trees in the Yungas of San Salvador de Jujuy.')}</p>
          <dl className="grid grid-cols-2 gap-3 rounded-xl bg-surface-950 p-3"><div><dt className="text-xs text-ink-muted">{tx('Longitud', 'Length')}</dt><dd>55–63 cm</dd></div><div><dt className="text-xs text-ink-muted">{tx('Peso', 'Weight')}</dt><dd>500–860 g</dd></div></dl>
          <Button variant="secondary" fullWidth onClick={() => { soundManager.playClick(); setWelcomeScene(prev => prev === 'entrance' ? 'branch' : 'entrance'); setShowInfoModal(false); }}>{welcomeScene === 'entrance' ? tx('Ver escena del dosel', 'View canopy scene') : tx('Ver entrada del parque', 'View park entrance')}</Button>
          <Button variant="ghost" fullWidth onClick={() => { soundManager.playClick(); setShowInfoModal(false); setShowSilhouettesModal(true); }}>{tx('Ver siluetas de aves', 'View bird silhouettes')}</Button>
          <div className="flex flex-wrap items-center justify-between gap-2"><LanguageSelector className="min-h-11 text-[11px]" /><Button variant="ghost" icon={<Users className="h-4 w-4" />} onClick={onChangePlayer}>{tx('Cambiar de jugador', 'Switch player')}</Button></div>
          <Button fullWidth onClick={() => setShowInfoModal(false)}>{tx('Cerrar ficha', 'Close sheet')}</Button>
        </div>
      </section>
    </div>}
    {showSilhouettesModal && <div className="ui-overlay z-50 flex items-center justify-center p-4 animate-fadeIn"><section role="dialog" aria-modal="true" aria-labelledby="silhouettes-title" className="ui-card max-h-[90dvh] w-full max-w-sm overflow-y-auto p-0">
      <ModalHeader title={tx('Siluetas aladas de las Yungas', 'Winged silhouettes of the Yungas')} titleId="silhouettes-title" onClose={() => setShowSilhouettesModal(false)} />
      <div className="space-y-4 p-4 text-sm">
        <div><h3 className="font-semibold text-emerald-200">{tx('Jote Real / Rapaces', 'King Vulture / Raptors')}</h3><p>{tx('Alas rectas anchas para planear sobre las corrientes térmicas.', 'Broad straight wings to soar on rising thermal currents.')}</p></div>
        <div><h3 className="font-semibold text-emerald-200">{tx('Loro Alisero / Maracaná', 'Alder Amazon / Parrots')}</h3><p>{tx('Vuelo rápido en cuña, cola puntiaguda y aleteo continuo.', 'Fast wedge-shaped flight, pointed tail, and continuous wingbeats.')}</p></div>
        <div><h3 className="font-semibold text-emerald-200">{tx('Picaflor Cometa / Común', 'Red-tailed Comet / Hummingbirds')}</h3><p>{tx('Vuelo suspendido estacionario en figura de ocho.', 'Hovering stationary flight in a figure-eight pattern.')}</p></div>
        <Button fullWidth onClick={() => setShowSilhouettesModal(false)}>{tx('Entendido', 'Got it')}</Button>
      </div>
    </section></div>}
  </div>;
};
