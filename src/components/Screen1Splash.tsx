import React from 'react';
import { Volume2, VolumeX, Compass, ScanLine, BookOpen } from 'lucide-react';
import { soundManager } from '../utils/audio';
import { useLanguage, LanguageSelector } from '../utils/i18n';
import { PlayerProfile } from '../types/game';
import { AvatarIcon } from './AvatarIcon';
import { Button, IconButton } from './ui';

interface Screen1SplashProps {
  onStartAdventure: () => void;
  returningProfile?: PlayerProfile | null;
  onContinue: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const Screen1Splash: React.FC<Screen1SplashProps> = ({ onStartAdventure, returningProfile, onContinue, soundEnabled, onToggleSound }) => {
  const { tx } = useLanguage();
  const start = (action: () => void) => { soundManager.playClick(); action(); };
  const concepts = [
    { icon: Compass, title: tx('Explorar', 'Explore'), text: tx('Recorré los senderos y conocé las aves de las Yungas', 'Walk the trails and meet the birds of the Yungas') },
    { icon: ScanLine, title: tx('Descubrir', 'Discover'), text: tx('Escaneá señales y usá tecnología interactiva para identificar aves', 'Scan signs and use interactive technology to identify birds') },
    { icon: BookOpen, title: tx('Aprender', 'Learn'), text: tx('Respondé desafíos y registrá tu progreso en tu diario', 'Answer challenges and record your progress in your journal') },
  ];
  return <div className="relative h-full overflow-y-auto bg-forest-950 text-ink">
    <div className="pointer-events-none absolute inset-x-0 top-0 bg-cover bg-top" style={{ backgroundImage: "url('/assets/aistudio/Botanical_park_start_screen_logo_11198c3d_2d966cdf.jpg')", backgroundSize: '100% auto', height: 'min(56%, 100vw, 440px)', maskImage: 'linear-gradient(to bottom, black calc(100% - 32px), transparent)' }} />
    <div className="relative flex min-h-full flex-col">
      <header className="pt-safe flex items-center justify-between gap-2 px-4">
        <span className="max-w-40 rounded-xl bg-forest-950/90 px-2 py-1 text-[11px] font-semibold">{tx('PARQUE BOTÁNICO SCHUEL · JUJUY', 'SCHUEL BOTANICAL PARK · JUJUY')}</span>
        <div className="flex items-center gap-2"><LanguageSelector className="min-h-11 text-[11px]" /><IconButton label={tx('Sonido y brisa de selva', 'Sound & jungle breeze')} onClick={onToggleSound}>{soundEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}</IconButton></div>
      </header>
      <div className="min-h-[235px] flex-1" aria-label={tx('Aves en Acción', 'Birds in Action')} role="img" />
      <section className="relative bg-forest-950 px-5 pt-4 pb-safe">
        <div className="pointer-events-none absolute inset-x-0 -top-12 h-12 bg-gradient-to-b from-transparent to-forest-950" />
        <div className="mb-4 flex items-center gap-3"><img src="/assets/aistudio/toucan_waving_cutout.png" alt={tx('Tu guía Tucán Grande', 'Your Toco Toucan guide')} className="h-16 w-16 shrink-0 object-contain" /><p className="text-sm font-medium leading-relaxed">{tx('Guía interactiva de aves del Parque Botánico Barón Schuel · Yungas de Jujuy', 'Interactive bird guide to Barón Schuel Botanical Park · Yungas of Jujuy')}</p></div>
        <div className="mb-5 space-y-3">{concepts.map(({ icon: Icon, title, text }) => <div key={title} className="flex gap-3"><Icon aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-action-turquoise" /><div><h2 className="text-sm font-semibold">{title}</h2><p className="text-xs leading-relaxed text-ink-muted">{text}</p></div></div>)}</div>
        <Button fullWidth onClick={() => start(returningProfile ? onContinue : onStartAdventure)} icon={returningProfile && <AvatarIcon icon={returningProfile.avatarIcon} alt="" className="h-6 w-6" />}>{returningProfile ? tx(`Continuar como ${returningProfile.name}`, `Continue as ${returningProfile.name}`) : tx('Comenzar exploración', 'Start exploring')}</Button>
        {returningProfile && <Button variant="ghost" fullWidth className="mt-2" onClick={() => start(onStartAdventure)}>{tx('Comenzar con otro explorador', 'Start with another explorer')}</Button>}
        <p className="mt-4 text-center text-[11px] text-ink-muted">{tx('Selva Montana de las Yungas · 1334 a 1463 m.s.n.m.', 'Yungas Mountain Forest · 1334 to 1463 m.a.s.l.')}</p>
      </section>
    </div>
  </div>;
};
