import React, { useEffect, useRef } from 'react';
import {
  Menu, Map, ScanLine, Bird, Award, Volume2, ShoppingBag, Users,
  HelpCircle, Camera, Cloud, Settings, LogOut, BookOpen, UserRound,
  ChevronRight, Check, Lock, Sparkles, Footprints,
} from 'lucide-react';
import { soundManager } from '../utils/audio';
import { PlayerProfile, Mission } from '../types/game';
import { useLanguage, LanguageSelector, localizeMission, localizeDifficultyLabel } from '../utils/i18n';
import { PWAInstallButton } from './PWAInstallButton';
import { AvatarIcon } from './AvatarIcon';
import { Button, IconButton, Card, ModalHeader, ProgressBar, EmptyState, StatusPill } from './ui';

export type HubSheet = 'more' | 'progress' | 'missions' | null;

interface Screen4MainHubProps {
  playerProfile: PlayerProfile;
  missions: Mission[];
  hubSheet: HubSheet;
  onHubSheetChange: (sheet: HubSheet) => void;
  onOpenOptions: () => void;
  onOpenTips: () => void;
  onOpenMap: () => void;
  onOpenShop: () => void;
  onOpenBirds: () => void;
  onOpenSighting: () => void;
  onOpenCompanionPhoto: () => void;
  onOpenJournal: () => void;
  onOpenBadge?: () => void;
  onOpenDrive: () => void;
  onOpenSquadsAndSeasons: () => void;
  onOpenMiroAvatar?: () => void;
  onChangePlayer: () => void;
  onBackToSplash: () => void;
}

function MenuRow({ icon, title, text, onClick }: { icon: React.ReactNode; title: string; text: string; onClick: () => void }) {
  return <button type="button" onClick={onClick} className="flex min-h-14 w-full items-center gap-3 rounded-xl px-3 py-3 text-left hover:bg-surface-800">
    <span aria-hidden="true" className="shrink-0 text-action-turquoise">{icon}</span>
    <span className="min-w-0 flex-1"><span className="block text-sm font-semibold">{title}</span><span className="mt-1 block text-xs leading-relaxed text-ink-muted">{text}</span></span>
    <ChevronRight aria-hidden="true" className="h-4 w-4 shrink-0 text-ink-muted" />
  </button>;
}

export const Screen4MainHub: React.FC<Screen4MainHubProps> = ({
  playerProfile, missions, hubSheet, onHubSheetChange, onOpenOptions, onOpenTips,
  onOpenMap, onOpenShop, onOpenBirds, onOpenSighting, onOpenCompanionPhoto,
  onOpenJournal, onOpenBadge, onOpenDrive, onOpenSquadsAndSeasons,
  onOpenMiroAvatar, onChangePlayer, onBackToSplash,
}) => {
  const { lang, tx } = useLanguage();
  const sheetRef = useRef<HTMLElement>(null);
  const completed = missions.filter(mission => mission.completed).length;
  const percent = missions.length ? Math.min(100, Math.round(completed / missions.length * 100)) : 0;
  const openSheet = (sheet: HubSheet) => { soundManager.playClick(); onHubSheetChange(sheet); };
  const navigate = (action: () => void) => { soundManager.playClick(); onHubSheetChange(null); action(); };

  useEffect(() => {
    if (!hubSheet) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    const sheet = sheetRef.current;
    sheet?.querySelector<HTMLButtonElement>('button')?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); onHubSheetChange(null); }
      if (event.key !== 'Tab' || !sheet) return;
      const targets = [...sheet.querySelectorAll<HTMLElement>('button:not(:disabled), a[href], input, [tabindex="0"]')].filter(el => el.getClientRects().length);
      const first = targets[0];
      const last = targets[targets.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => { document.removeEventListener('keydown', onKeyDown); previousFocus?.focus(); };
  }, [hubSheet, onHubSheetChange]);

  const stats = [
    [tx('Avistamientos', 'Sightings'), playerProfile.sightingsCompleted],
    [tx('Aves descubiertas', 'Birds discovered'), playerProfile.unlockedSilhouettes?.length ?? 0],
    [tx('Descubrimientos MindAR', 'MindAR discoveries'), playerProfile.mindarDiscoveries?.length ?? 0],
    [tx('Registros en diario', 'Journal entries'), playerProfile.fieldJournal?.length ?? 0],
    [tx('Estaciones', 'Stations'), `${playerProfile.completedCheckpoints?.length ?? 0} / 8`],
  ];
  const badges = [
    { name: tx('Observador en Ascenso', 'Rising Observer'), earned: playerProfile.hasRisingObserverBadge },
    { name: tx('Observador de Detalles', 'Detail Observer'), earned: playerProfile.hasDetailObserverBadge },
    { name: tx('Sello Ruta Completa', 'Complete Route Seal'), earned: playerProfile.hasRouteCompleteSeal },
  ];
  const titles = { more: tx('Más opciones', 'More options'), progress: tx('Mi progreso', 'My progress'), missions: tx('Misiones del día', 'Daily missions') };

  return <div className="relative flex h-full flex-col overflow-hidden bg-forest-950 text-ink">
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "linear-gradient(#072A2180, #072A21AD 55%, #072A2170), url('/assets/aistudio/Botanical_park_start_screen_logo_546dfb3b_47fb3d00.jpg')" }} />
    <header className="pt-safe relative flex shrink-0 items-center justify-between gap-3 px-4 pb-3">
      <button type="button" className="flex min-h-11 min-w-0 items-center gap-3 rounded-2xl border border-white/20 bg-forest-950 px-3 py-2 text-left" aria-label={tx(`Mi progreso: ${playerProfile.name}`, `My progress: ${playerProfile.name}`)} onClick={() => openSheet('progress')}>
        <AvatarIcon icon={playerProfile.avatarIcon} alt="" className="h-10 w-10 shrink-0" />
        <span className="min-w-0"><span className="block truncate text-sm font-semibold">{playerProfile.name}</span><span className="block text-[11px] text-ink-muted">{tx('Nv', 'Lv')} {playerProfile.level} · {playerProfile.xp} XP</span></span>
      </button>
      <div className="flex shrink-0 flex-col items-center"><IconButton label={tx('Más opciones', 'More options')} onClick={() => openSheet('more')}><Menu aria-hidden="true" className="h-5 w-5" /></IconButton><span className="mt-1 text-[11px] font-semibold">{tx('Más', 'More')}</span></div>
    </header>

    <main className="relative min-h-0 flex-1 space-y-4 overflow-y-auto px-4 pb-6 pt-3">
      <div><p className="text-xs font-semibold tracking-wide text-emerald-200">{tx('PARQUE BOTÁNICO SCHUEL', 'SCHUEL BOTANICAL PARK')}</p><h1 className="mt-1 text-3xl font-semibold">{tx('Tu aventura en las Yungas', 'Your Yungas adventure')}</h1></div>
      <Card className="flex gap-3 bg-forest-900"><img src="/assets/aistudio/toucan_guide_portrait.jpg" alt={tx('Tucán Grande, tu guía', 'Toco Toucan, your guide')} className="h-[88px] w-[88px] shrink-0 rounded-2xl object-cover" /><div className="min-w-0 flex-1"><p className="text-sm leading-relaxed">{tx(`¡Hola, ${playerProfile.name}! Tu objetivo: completar las misiones del día y descubrir aves en el parque.`, `Hello, ${playerProfile.name}! Your goal: complete today's missions and discover birds in the park.`)}</p><IconButton className="mt-2" label={tx('Escuchar al tucán', 'Listen to the toucan')} onClick={() => soundManager.playToucanGreeting(lang)}><Volume2 aria-hidden="true" className="h-5 w-5" /></IconButton></div></Card>
      <Card className="space-y-3"><div className="flex items-center justify-between gap-2"><h2 className="text-lg font-semibold">{tx('Objetivo de hoy', "Today's goal")}</h2><StatusPill text={`${completed}/${missions.length}`} icon={<Check className="h-3 w-3" />} /></div><p className="text-xs text-ink-muted">{tx(`${completed} de ${missions.length} misiones completadas`, `${completed} of ${missions.length} missions completed`)}</p><ProgressBar label={tx('Misiones completadas', 'Completed missions')} value={percent} /><Button variant="secondary" fullWidth onClick={() => openSheet('missions')}>{tx('Ver misiones', 'View missions')}</Button>
        {playerProfile.hasRisingObserverBadge && <button type="button" className="flex min-h-11 w-full items-center gap-2 rounded-xl border border-discovery-amber/50 p-2 text-left text-xs text-amber-200" onClick={() => onOpenBadge && navigate(onOpenBadge)}><Award aria-hidden="true" className="h-5 w-5 shrink-0" />{tx('Observador en Ascenso · Ver insignia', 'Rising Observer · View badge')}</button>}
      </Card>
      <div className="grid grid-cols-2 gap-3"><Button variant="ghost" className="min-h-16 bg-forest-950 text-xs" icon={<BookOpen className="h-5 w-5 shrink-0" />} onClick={() => navigate(onOpenJournal)}>{tx('Diario de campo', 'Field journal')}</Button><Button variant="ghost" className="min-h-16 bg-forest-950 text-xs" icon={<Users className="h-5 w-5 shrink-0" />} onClick={() => navigate(onOpenSquadsAndSeasons)}>{tx('Cuadrillas', 'Squads')}</Button></div>
    </main>

    <nav aria-label={tx('Navegación principal', 'Main navigation')} className="pb-safe relative grid shrink-0 grid-cols-4 items-end gap-1 border-t border-white/20 bg-forest-950 px-2 pt-3">
      <button type="button" className="flex min-h-16 flex-col items-center justify-center gap-2 rounded-xl px-1 text-[11px] font-semibold" onClick={() => navigate(onOpenMap)}><Map aria-hidden="true" className="h-6 w-6 text-action-turquoise" />{tx('Explorar', 'Explore')}</button>
      <button type="button" className="flex min-h-16 flex-col items-center justify-center gap-1 rounded-xl px-1 text-[11px] font-semibold text-amber-200" onClick={() => navigate(onOpenSighting)}><span className="flex h-12 w-12 items-center justify-center rounded-full bg-discovery-amber text-forest-950 shadow-md"><ScanLine aria-hidden="true" className="h-6 w-6" /></span>{tx('Escanear', 'Scan')}</button>
      <button type="button" className="flex min-h-16 flex-col items-center justify-center gap-2 rounded-xl px-1 text-[11px] font-semibold" onClick={() => navigate(onOpenBirds)}><Bird aria-hidden="true" className="h-6 w-6 text-action-turquoise" />{tx('Mis aves', 'My birds')}</button>
      <button type="button" className="flex min-h-16 flex-col items-center justify-center gap-2 rounded-xl px-1 text-[11px] font-semibold" onClick={() => openSheet('progress')}><Award aria-hidden="true" className="h-6 w-6 text-action-turquoise" />{tx('Mi progreso', 'My progress')}</button>
    </nav>

    {hubSheet && <div className="ui-overlay z-50 flex items-end justify-center animate-fadeIn">
      <section ref={sheetRef} role="dialog" aria-modal="true" aria-labelledby="hub-sheet-title" className="ui-sheet flex max-h-[94dvh] w-full max-w-md flex-col overflow-hidden">
        <div className="shrink-0"><ModalHeader title={titles[hubSheet]} titleId="hub-sheet-title" onClose={() => onHubSheetChange(null)} /></div>
        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          {hubSheet === 'more' && <div className="space-y-5">
            <section><h3 className="mb-1 px-3 text-xs font-semibold uppercase tracking-wide text-ink-muted">{tx('Actividades', 'Activities')}</h3>
              <MenuRow icon={<ShoppingBag className="h-5 w-5" />} title={tx('Tienda', 'Shop')} text={tx('Equipo y recompensas para explorar', 'Gear and rewards for exploring')} onClick={() => navigate(onOpenShop)} />
              <MenuRow icon={<Users className="h-5 w-5" />} title={tx('Cuadrillas y temporadas', 'Squads and seasons')} text={tx('Explorá en equipo y compartí tus hallazgos', 'Explore together and share discoveries')} onClick={() => navigate(onOpenSquadsAndSeasons)} />
              <MenuRow icon={<HelpCircle className="h-5 w-5" />} title={tx('Consejos y regla de nivel', 'Tips and level rule')} text={tx('Prepará tu próxima aventura', 'Prepare for your next adventure')} onClick={() => navigate(onOpenTips)} />
            </section>
            <section><h3 className="mb-1 px-3 text-xs font-semibold uppercase tracking-wide text-ink-muted">{tx('Cuenta y datos', 'Account and data')}</h3>
              <MenuRow icon={<Users className="h-5 w-5" />} title={tx('Cambiar explorador', 'Switch explorer')} text={tx('Elegí o creá otro perfil en este dispositivo', 'Choose or create another profile on this device')} onClick={() => navigate(onChangePlayer)} />
              <MenuRow icon={<Camera className="h-5 w-5" />} title={tx('Cambiar ave compañera / foto', 'Change companion bird / photo')} text={tx('Elegí tu ave y tomá una foto sin flash', 'Choose your bird and take a no-flash photo')} onClick={() => navigate(onOpenCompanionPhoto)} />
              <MenuRow icon={<Cloud className="h-5 w-5" />} title={tx('Sincronizar con Google Drive', 'Sync with Google Drive')} text={tx('Respaldo de tu perfil y diario de campo', 'Back up your profile and field journal')} onClick={() => navigate(onOpenDrive)} />
              <MenuRow icon={<Settings className="h-5 w-5" />} title={tx('Opciones y sonido', 'Options and sound')} text={tx('Idioma, audio y ajustes de la aventura', 'Language, audio and adventure settings')} onClick={() => navigate(onOpenOptions)} />
            </section>
            <section className="space-y-3"><h3 className="px-3 text-xs font-semibold uppercase tracking-wide text-ink-muted">{tx('App', 'App')}</h3>
              <div className="flex min-h-14 items-center justify-between gap-3 px-3"><div><p className="text-sm font-semibold">{tx('Idioma', 'Language')}</p><p className="text-xs text-ink-muted">{tx('Español / Inglés', 'Spanish / English')}</p></div><LanguageSelector className="min-h-11 text-[11px]" /></div>
              <div className="[&_button]:min-h-11 [&_button]:min-w-11 [&_*]:text-[11px]"><PWAInstallButton /></div>
              <MenuRow icon={<LogOut className="h-5 w-5" />} title={tx('Volver a la portada', 'Back to cover')} text={tx('Tu progreso queda guardado', 'Your progress stays saved')} onClick={() => navigate(onBackToSplash)} />
            </section>
          </div>}

          {hubSheet === 'progress' && <div className="space-y-5">
            <div className="flex items-center gap-3"><AvatarIcon icon={playerProfile.avatarIcon} alt="" className="h-16 w-16 shrink-0" /><div className="min-w-0"><h3 className="break-words text-xl font-semibold">{playerProfile.name}</h3><p className="text-sm text-ink-muted">{playerProfile.favoriteBird}</p><p className="mt-1 text-xs text-amber-200">{tx('Nivel', 'Level')} {playerProfile.level} · {playerProfile.xp} XP</p></div></div>
            <dl className="grid grid-cols-2 gap-3">{stats.map(([label, value]) => <div key={label} className="rounded-xl border border-white/15 bg-surface-950 p-3"><dt className="text-xs text-ink-muted">{label}</dt><dd className="mt-1 text-xl font-semibold">{value}</dd></div>)}</dl>
            {!(playerProfile.mindarDiscoveries?.length) && <EmptyState icon={<ScanLine className="h-6 w-6" />} title={tx('Tu próximo descubrimiento te espera', 'Your next discovery awaits')} text={tx('Escaneá una señal del parque para descubrir un ave con MindAR.', 'Scan a park sign to discover a bird with MindAR.')} action={<Button variant="secondary" onClick={() => navigate(onOpenSighting)}>{tx('Ir a escanear', 'Go scan')}</Button>} />}
            <section><h3 className="mb-2 text-base font-semibold">{tx('Insignias', 'Badges')}</h3><ul className="space-y-2">{badges.map(badge => <li key={badge.name} className="flex items-center gap-3 rounded-xl border border-white/15 p-3">{badge.earned ? <Award aria-hidden="true" className="h-5 w-5 shrink-0 text-amber-200" /> : <Lock aria-hidden="true" className="h-5 w-5 shrink-0 text-ink-muted" />}<div><p className="text-sm font-semibold">{badge.name}</p><p className="text-xs text-ink-muted">{badge.earned ? tx('Conseguida', 'Earned') : tx('Pendiente', 'Pending')}</p></div></li>)}</ul></section>
            <div className="border-t border-white/15 pt-2">
              <MenuRow icon={<BookOpen className="h-5 w-5" />} title={tx('Ver diario de campo', 'View field journal')} text={tx('Tus registros y observaciones', 'Your records and observations')} onClick={() => navigate(onOpenJournal)} />
              <MenuRow icon={<Footprints className="h-5 w-5" />} title={tx('Misiones del día', 'Daily missions')} text={tx('Consultá tus objetivos y recompensas', 'View your goals and rewards')} onClick={() => openSheet('missions')} />
              {onOpenMiroAvatar && <MenuRow icon={<UserRound className="h-5 w-5" />} title={tx('Perfil y avatar', 'Profile and avatar')} text={tx('Tu personaje y ave compañera', 'Your character and companion bird')} onClick={() => navigate(onOpenMiroAvatar)} />}
              <MenuRow icon={<ShoppingBag className="h-5 w-5" />} title={tx('Recompensas / tienda', 'Rewards / shop')} text={tx('Explorá el equipo disponible', 'Explore available gear')} onClick={() => navigate(onOpenShop)} />
            </div>
          </div>}

          {hubSheet === 'missions' && <div className="space-y-4">
            <p className="text-sm text-ink-muted">{tx('Meta recomendada: 20 a 40 minutos de sendero', 'Recommended goal: 20 to 40 minutes on the trail')}</p>
            <Card className="space-y-3 bg-surface-950"><h3 className="flex items-center gap-2 text-sm font-semibold text-amber-200"><Sparkles aria-hidden="true" className="h-5 w-5 shrink-0" />{tx('Misión Semanal de Fin de Semana', 'Weekend Weekly Mission')}</h3><p className="text-xs text-ink-muted">{percent}% · {completed}/{missions.length}</p><ProgressBar value={percent} label={tx('Progreso semanal', 'Weekly progress')} /><p className="text-xs leading-relaxed text-ink-muted">{tx('Completa las 3 misiones para obtener el "Sobre de Siluetas Raras de las Yungas".', 'Complete all 3 missions to earn the "Rare Yungas Silhouettes Pack".')}</p></Card>
            {missions.length === 0 && <EmptyState icon={<Footprints className="h-6 w-6" />} title={tx('Sin misiones por ahora', 'No missions right now')} text={tx('Podés seguir explorando las aves del parque.', 'You can keep exploring the birds of the park.')} />}
            {missions.map(rawMission => {
              const mission = localizeMission(rawMission, lang);
              return <Card key={mission.id} className="space-y-3 bg-surface-950"><h3 className="text-base font-semibold">{mission.title}</h3><StatusPill text={`${localizeDifficultyLabel(rawMission.difficulty, lang)} · ${mission.duration}`} tone={mission.completed ? 'success' : 'neutral'} /><p className="text-sm leading-relaxed text-ink-muted">{mission.description}</p><div className="flex items-start justify-between gap-3 border-t border-white/15 pt-3"><p className="text-xs leading-relaxed text-amber-200">+{mission.xpReward} XP · {mission.extraReward}</p><span className="shrink-0 text-xs">{mission.progress}/{mission.target}</span></div>{mission.completed && <StatusPill icon={<Check className="h-3 w-3" />} text={tx('Completada', 'Completed')} tone="success" />}</Card>;
            })}
          </div>}
        </div>
        {hubSheet === 'missions' && <footer className="shrink-0 border-t border-white/15 px-4 pt-3"><Button fullWidth onClick={() => navigate(onOpenSighting)}>{tx('Ir a escanear', 'Go scan')}</Button></footer>}
      </section>
    </div>}
  </div>;
};
