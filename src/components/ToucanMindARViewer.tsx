import React, { useEffect, useMemo, useRef, useState } from 'react';
import { BIRDS_DATA, CATALOG_BIRDS_DATA } from '../data/birdsData';
import { MINDAR_CHALLENGES } from '../data/mindarChallenges';
import type { PlayerProfile } from '../types/game';
import { getMindARStatus, MindARActionResult } from '../utils/mindarProgress';
import { ArrowLeft, HelpCircle, LoaderCircle, ScanLine, Check, CheckCircle2, BookOpen, AlertTriangle, ChevronUp, ChevronDown, Volume2, Sparkles } from 'lucide-react';
import { useLanguage } from '../utils/i18n';
import { Button, IconButton } from './ui';

interface Props {
  onClose: () => void;
  profile: PlayerProfile;
  onRegister: (targetIndex: number) => MindARActionResult;
  onComplete: (targetIndex: number) => MindARActionResult;
  onRetrySave: () => boolean;
  onJournal: () => void;
}
type TrackingState = 'starting' | 'searching' | 'found' | 'error';

const TARGET_SPECIES = ['001-chingolo', 'tucan-grande', '007-benteveo', '014-hornero'] as const;
const TARGET_BIRDS = TARGET_SPECIES.map(id => {
  const bird = CATALOG_BIRDS_DATA.find(candidate => candidate.id === id);
  if (!bird) {
    const gameBird = BIRDS_DATA.find(candidate => candidate.id === id)!;
    return {
      ...gameBird,
      image: '/assets/aistudio/toucan_guide_portrait.jpg',
      detail: gameBird.diet,
    };
  }
  return {
    ...bird,
    description: bird.plumageDescription,
    detail: bird.beakDescription,
    funFact: bird.hints.loreOrFact,
  };
});

// MindAR owns the camera in this isolated iframe. The legacy Gemini viewer must NOT
// start its own getUserMedia stream while this component is mounted.
export const ToucanMindARViewer: React.FC<Props> = ({ onClose, profile, onRegister, onComplete, onRetrySave, onJournal }) => {
  const { tx } = useLanguage();
  const frameRef = useRef<HTMLIFrameElement>(null);
  const onRegisterRef = useRef(onRegister);
  onRegisterRef.current = onRegister;
  const recognizedRef = useRef<number | null>(null);
  const readyRef = useRef(false);
  const errorReceivedRef = useRef(false);
  const [recognizedTarget, setRecognizedTarget] = useState<number | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [correct, setCorrect] = useState(false);
  const [saved, setSaved] = useState<boolean | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [revealTarget, setRevealTarget] = useState<number | null>(null);
  const [challengeStatus, setChallengeStatus] = useState<string>('');
  const [audioStatus, setAudioStatus] = useState<string>('');
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const activeTarget = recognizedTarget ?? 1;
  const activeBird = TARGET_BIRDS[activeTarget];
  const progress = getMindARStatus(profile, activeTarget);
  const question = MINDAR_CHALLENGES[activeTarget as keyof typeof MINDAR_CHALLENGES];
  const playBirdAudio = (targetIndex = activeTarget) => {
    const bird = TARGET_BIRDS[targetIndex];
    const audioUrl = (bird as typeof bird & { audioUrl?: string }).audioUrl;
    if (!audioUrl) return;
    audioRef.current?.pause();
    const audio = new Audio(encodeURI(audioUrl));
    audioRef.current = audio;
    setAudioStatus('');
    void audio.play().catch(() => setAudioStatus(tx('El navegador bloqueó el canto automático. Tocá “Escuchar canto” para reproducirlo.', 'Autoplay was blocked. Tap “Listen to bird call” to play it.')));
  };
  const runAction = (action: () => MindARActionResult) => {
    const result = action();
    setSaved(result.saved);
  };
  const [tracking, setTracking] = useState<TrackingState>('starting');
  const [message, setMessage] = useState('Preparando reconocimiento de imagen…');
  const retry = () => {
    readyRef.current = false; errorReceivedRef.current = false; setTracking('starting'); setMessage('Preparando reconocimiento de imagen…'); setAttempt(value => value + 1);
  };

  const scene = useMemo(() => `<!doctype html>
<html lang="es"><head><meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no"/>
<style>html,body{margin:0;width:100%;height:100%;overflow:hidden;background:#020617}
body{position:relative}
video{position:absolute!important;z-index:0!important;display:block!important;visibility:visible!important}
a-scene{position:absolute!important;inset:0!important;width:100%!important;height:100%!important;z-index:1!important;background:transparent!important}
a-scene canvas,.a-canvas{background:transparent!important} .a-enter-vr,.a-enter-ar{display:none!important}</style>
<script src="https://aframe.io/releases/1.4.2/aframe.min.js"><\/script>
<script src="https://cdn.jsdelivr.net/npm/mind-ar@1.2.5/dist/mindar-image-aframe.prod.js"><\/script>
<script>
(function(){
 const devices=navigator.mediaDevices;
 if(!devices || typeof devices.getUserMedia!=='function') return;
 const request=devices.getUserMedia.bind(devices);
 try{
  Object.defineProperty(devices,'getUserMedia',{configurable:true,value:(constraints)=>{
   const requestedVideo=constraints && constraints.video;
   if(!requestedVideo || typeof requestedVideo!=='object') return request(constraints);
   return request({...constraints,video:{...requestedVideo,width:requestedVideo.width ?? {ideal:1280},height:requestedVideo.height ?? {ideal:720}}});
  }});
 }catch(_){/* Keep the browser's default camera settings if the method cannot be wrapped. */}
})();
<\/script>
</head><body>
<a-scene mindar-image="imageTargetSrc: /ar/targets.mind; autoStart: true; uiLoading: no; uiScanning: no; uiError: no;"
 color-space="sRGB" renderer="colorManagement: true; physicallyCorrectLights: true; antialias: true; alpha: true" background="color: #000000; transparent: true"
 vr-mode-ui="enabled: false" device-orientation-permission-ui="enabled: false" embedded>

<a-camera position="0 0 0" look-controls="enabled: false"></a-camera>
${TARGET_SPECIES.map((_, index) => `<a-entity mindar-image-target="targetIndex: ${index}" id="target-${index}"></a-entity>`).join('')}
</a-scene>
<script>
(function(){
 const notify=(type,detail)=>parent.postMessage({source:'senal-nativa-mindar',type,detail},'*');
 ${TARGET_SPECIES.map((_, index) => `document.querySelector('#target-${index}').addEventListener('targetFound',()=>notify('found',{targetIndex:${index}}));document.querySelector('#target-${index}').addEventListener('targetLost',()=>notify('lost',{targetIndex:${index}}));`).join('\n ')}
 const scene=document.querySelector('a-scene');
 async function improveCameraFocus(){
  // Reuse MindAR's own video stream; never open a second camera.
  const video=document.querySelector('video');
  const track=video && video.srcObject && video.srcObject.getVideoTracks()[0];
  if(!track || !track.applyConstraints) return;
  const capabilities=track.getCapabilities ? track.getCapabilities() : {};
  if(!Array.isArray(capabilities.focusMode) || !capabilities.focusMode.includes('continuous')) return;
  try{
    await track.applyConstraints({advanced:[{focusMode:'continuous'}]});
  }catch(e){
    // Focus mode is optional; keep the camera stream running with its default focus.
  }
 }
 scene.addEventListener('arReady',()=>{
  const renderer=scene.renderer;
  if(renderer){renderer.setClearColor(0x000000,0);renderer.setClearAlpha(0);}
  improveCameraFocus().catch(()=>{});
  const video=document.querySelector('video');
  notify('ready',{width:video?.videoWidth || 0,height:video?.videoHeight || 0});
 });
 const cameraError=async(error)=>{
  let name=error && (error.name || (error.error && error.error.name));
  if(!name){
   try{
    const permission=await navigator.permissions?.query({name:'camera'});
    if(permission && permission.state==='denied') name='NotAllowedError';
   }catch(_){}
  }
  notify('error',name==='NotAllowedError' ? 'Permiso de cámara denegado. Habilitalo en tu navegador.' : name==='NotFoundError' ? 'No se encontró una cámara en este dispositivo.' : 'No se pudo iniciar MindAR o la cámara. Revisá los permisos y la conexión.');
 };
 scene.addEventListener('arError',(event)=>cameraError(event.detail));
 window.addEventListener('unhandledrejection',(event)=>cameraError(event.reason));
 window.addEventListener('error',(event)=>notify('error',event.message));
})();
<\/script></body></html>`, []);

  useEffect(() => {
    const frame = frameRef.current;
    const timeout = window.setTimeout(() => {
      if (!readyRef.current && !errorReceivedRef.current) { setTracking('error'); setMessage('No se pudo cargar MindAR o la imagen de referencia. Revisá tu conexión.'); }
    }, 15000);
    const receive = (event: MessageEvent) => {
      if (event.source !== frameRef.current?.contentWindow || event.data?.source !== 'senal-nativa-mindar') return;
      switch (event.data.type) {
        case 'ready': {
          readyRef.current = true;
          window.clearTimeout(timeout);
          setTracking('searching');
          const width = Number(event.data.detail?.width);
          const height = Number(event.data.detail?.height);
          setMessage(width > 0 && height > 0 && (width < 960 || height < 540)
            ? `Cámara en ${width} × ${height} px. Probá con más luz y mantené el teléfono firme.`
            : 'Apuntá a una de las cuatro aves');
          break;
        }
        case 'found':
          {
            const targetIndex = Number(event.data.detail?.targetIndex);
            if (Number.isInteger(targetIndex) && targetIndex >= 0 && targetIndex < TARGET_BIRDS.length) {
              if (recognizedRef.current !== targetIndex) {
                recognizedRef.current = targetIndex;
                setRecognizedTarget(targetIndex);
                setExpanded(false);
                setCorrect(false);
                setSelectedOption(null);
                setFeedback('');
                setChallengeStatus('');
                setAudioStatus('');
                const result = onRegisterRef.current(targetIndex);
                setSaved(result.saved);
                if (result.status === 'registered') {
                  setRevealTarget(targetIndex);
                  playBirdAudio(targetIndex);
                }
              }
              setTracking('found');
              setMessage(`¡Descubriste al ${TARGET_BIRDS[targetIndex].commonName}!`);
            }
            break;
          }
        case 'lost': setTracking('searching'); setMessage('Seguí apuntando a la tarjeta del ave'); break;
        case 'error': errorReceivedRef.current = true; setTracking('error'); setMessage(event.data.detail || 'Error de cámara o seguimiento'); break;
      }
    };
    window.addEventListener('message', receive);
    return () => {
      window.clearTimeout(timeout);
      window.removeEventListener('message', receive);
      try {
        frame?.contentDocument?.querySelectorAll('video').forEach(video => {
          (video.srcObject as MediaStream | null)?.getTracks().forEach(track => track.stop());
        });
      } catch { /* The iframe may already have navigated away. */ }
      try {
        if (frame) { frame.removeAttribute('srcdoc'); frame.src = 'about:blank'; }
      } catch { /* The iframe may already be detached. */ }
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, [attempt]);

  const status = tracking === 'error'
    ? { text: message, icon: AlertTriangle }
    : tracking === 'starting'
    ? { text: tx('Preparando cámara…', 'Preparing camera…'), icon: LoaderCircle }
    : progress === 'rewarded'
    ? { text: tx('Completado', 'Completed'), icon: CheckCircle2 }
    : progress === 'registered'
    ? { text: tx('Registrado · desafío pendiente', 'Registered · challenge pending'), icon: BookOpen }
    : recognizedTarget !== null || tracking === 'found'
    ? { text: tx('Reconocido', 'Recognized'), icon: CheckCircle2 }
    : { text: tx('Buscando tarjetas de aves', 'Searching for bird cards'), icon: ScanLine };
  const StatusIcon = status.icon;
  const steps = [
    { label: tx('Registrar', 'Register'), done: progress !== 'none' },
    { label: tx('Ficha', 'Field guide'), done: progress !== 'none' },
    { label: tx('Desafío', 'Challenge'), done: correct || progress === 'rewarded' },
  ];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-forest-950 sm:p-3">
      <div className="relative h-full w-full overflow-hidden bg-black sm:max-h-[94dvh] sm:max-w-md sm:rounded-3xl sm:border sm:border-forest-800">
        <iframe key={attempt} ref={frameRef} title="Visor MindAR de aves" srcDoc={scene} allow="camera; accelerometer; gyroscope"
          className="absolute inset-0 w-full h-full border-0" />
        {revealTarget !== null && <div className="absolute inset-0 z-40 flex items-center justify-center bg-forest-950/75 p-5 backdrop-blur-sm motion-safe:animate-fadeIn">
          <section role="dialog" aria-modal="true" aria-labelledby="discovery-reveal-title" className="ui-card w-full max-w-sm space-y-4 p-5 text-center shadow-2xl">
            <Sparkles aria-hidden="true" className="mx-auto h-8 w-8 text-amber-300" />
            <h2 id="discovery-reveal-title" className="text-2xl font-bold text-emerald-200">{tx('¡Nuevo descubrimiento!', 'New discovery!')}</h2>
            <img src={TARGET_BIRDS[revealTarget].image} alt="" className="mx-auto h-36 w-full rounded-2xl object-cover" />
            <div><h3 className="text-xl font-semibold">{TARGET_BIRDS[revealTarget].commonName}</h3><p className="text-sm italic text-ink-muted">{TARGET_BIRDS[revealTarget].scientificName}</p></div>
            {audioStatus && <p role="status" aria-live="polite" className="text-sm text-ink-muted">{audioStatus}</p>}
            <Button variant="secondary" fullWidth onClick={() => playBirdAudio(revealTarget)}><Volume2 aria-hidden="true" className="mr-2 inline h-4 w-4" />{tx('Escuchar canto', 'Listen to bird call')}</Button>
            <Button fullWidth onClick={() => { setRevealTarget(null); setExpanded(true); }}>{tx('Probar el desafío', 'Try the challenge')}</Button>
            <Button variant="ghost" fullWidth onClick={() => setRevealTarget(null)}>{tx('Seguir explorando', 'Keep exploring')}</Button>
          </section>
        </div>}
        <div className="pt-safe absolute inset-x-0 top-0 z-20 bg-gradient-to-b from-forest-950/95 via-forest-950/75 to-transparent px-4 pb-6">
          <header className="flex items-center gap-3">
            <IconButton label={tx('Salir del escáner', 'Exit scanner')} onClick={onClose}><ArrowLeft aria-hidden="true" className="h-5 w-5" /></IconButton>
            <div className="min-w-0 flex-1 text-ink"><h2 className="text-xs font-semibold text-emerald-200">{tx('Escáner de señales', 'Sign scanner')}</h2><p className="text-base font-semibold">{recognizedTarget === null ? tx('Descubrí aves del parque', 'Discover park birds') : `${tx('Descubriste:', 'You discovered:')} ${activeBird.commonName}`}</p></div>
            <IconButton label={tx('Ayuda', 'Help')} aria-expanded={showHelp} aria-controls="scanner-help" onClick={() => setShowHelp(!showHelp)}><HelpCircle aria-hidden="true" className="h-5 w-5" /></IconButton>
          </header>
          <div role="status" aria-live="polite" className={`mt-3 flex items-center justify-center gap-2 rounded-2xl border px-3 py-2 text-xs font-semibold ${tracking === 'error' ? 'border-rose-300 bg-rose-950 text-rose-100' : 'border-white/25 bg-forest-950 text-ink'}`}>
            <StatusIcon aria-hidden="true" className={`h-5 w-5 shrink-0 ${tracking === 'starting' ? 'animate-spin' : ''}`} /><span>{status.text}</span>
          </div>
          {tracking === 'searching' && <p className="mt-2 rounded-xl bg-forest-950 px-3 py-2 text-center text-xs text-ink-muted">{message}</p>}
          {showHelp && <aside id="scanner-help" className="ui-card mt-3 max-h-[45dvh] space-y-3 overflow-y-auto text-sm">
            <h3 className="font-semibold">{tx('Cómo escanear una señal', 'How to scan a sign')}</h3>
            <ul className="list-disc space-y-2 pl-5 text-xs leading-relaxed text-ink-muted">
              <li>{tx('Apuntá a una de las tarjetas del Chingolo, Tucán, Benteveo u Hornero.', 'Point at a Chingolo, Toucan, Great Kiskadee, or Hornero card.')}</li>
              <li>{tx('Buscá buena luz y mantené una distancia de 20–40 cm.', 'Find good light and keep a distance of 20–40 cm.')}</li>
              <li>{tx('Sostené el teléfono firme hasta reconocer la imagen.', 'Hold your phone steady until the image is recognized.')}</li>
              <li>{tx('Necesitás permitir el acceso a la cámara en tu navegador.', 'You need to allow camera access in your browser.')}</li>
            </ul>
            <Button variant="secondary" fullWidth onClick={retry}>{tx('Reintentar', 'Retry')}</Button>
          </aside>}
        </div>
        {(recognizedTarget !== null || progress !== 'none') && tracking !== 'error' && activeBird && (
          <section aria-label={`${tx('Descubrimiento de', 'Discovery of')} ${activeBird.commonName}`} className={`pb-safe absolute inset-x-0 bottom-0 z-10 flex flex-col overflow-hidden rounded-t-3xl border-t border-white/25 bg-surface-900 text-ink shadow-xl transition-[height] duration-200 ${expanded ? 'h-[70dvh]' : 'h-[35dvh]'}`}>
            <button type="button" className="flex min-h-11 shrink-0 items-center justify-center gap-2 text-[11px] font-semibold text-ink-muted" aria-expanded={expanded} aria-controls="scanner-details" onClick={() => setExpanded(!expanded)}>
              <span aria-hidden="true" className="h-1 w-8 rounded-full bg-ink-muted/60" />{expanded ? tx('Ocultar ficha', 'Hide details') : tx('Ver ficha completa', 'View full details')}{expanded ? <ChevronDown aria-hidden="true" className="h-4 w-4" /> : <ChevronUp aria-hidden="true" className="h-4 w-4" />}
            </button>
            <div id="scanner-details" className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 pb-3">
              <div className="flex items-center gap-3"><img src={activeBird.image} alt="" className="h-16 w-20 rounded-xl object-cover" /><div><h3 className="text-xl font-semibold">{activeBird.commonName}</h3><p className="text-xs italic text-ink-muted">{activeBird.scientificName}</p></div></div>
              <Button variant="secondary" fullWidth onClick={() => playBirdAudio(activeTarget)}><Volume2 aria-hidden="true" className="mr-2 inline h-4 w-4" />{tx('Escuchar canto', 'Listen to bird call')}</Button>
              {!expanded && <p className="text-xs leading-relaxed text-ink-muted">{activeBird.funFact.match(/[^.!?]+[.!?]?/)?.[0]}</p>}
              <ol aria-label={tx('Pasos del descubrimiento', 'Discovery steps')} className="grid grid-cols-3 gap-2">{steps.map((step, index) => <li key={step.label} className="flex items-center gap-1 text-[11px] font-semibold">{step.done ? <Check aria-hidden="true" className="h-4 w-4 shrink-0 text-action-emerald" /> : <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-ink-muted">{index + 1}</span>}{step.label}</li>)}</ol>
              {saved === false && <div role="alert" className="rounded-xl border border-amber-300 bg-amber-950 p-3 text-xs leading-relaxed text-amber-100">No se pudo guardar en este dispositivo. El progreso puede perderse al cerrar o recargar.
                <Button variant="ghost" className="mt-2 text-xs" onClick={() => setSaved(onRetrySave())}>{tx('Reintentar guardar', 'Retry saving')}</Button>
              </div>}
              {expanded && <div className="animate-fadeIn space-y-3">
                {progress === 'registered' && question && <div className="space-y-3 rounded-2xl border border-white/20 bg-surface-950 p-3 text-xs">
                  <h4 className="text-sm font-semibold">{question.question}</h4>
                  <p className="text-ink-muted">{tx('Podés probar todas las veces que necesites, sin penalización.', 'You can try as often as you need, without penalty.')}</p>
                  {!correct && question.options.map((option, index) => <button type="button" key={option} aria-pressed={selectedOption === index} onClickCapture={() => setSelectedOption(index)} className={`block min-h-11 w-full rounded-xl border p-3 text-left leading-relaxed ${selectedOption === index ? 'border-amber-300 bg-amber-950 text-amber-100' : 'border-white/25 bg-surface-800'}`} onClick={() => {
                    if (index === question.correctIndex) { setCorrect(true); setFeedback(question.explanation); }
                    else setFeedback(tx('Todavía no. Probá otra respuesta.', 'Not yet. Try another answer.'));
                  }}>{option}{selectedOption === index && <span className="mt-1 block font-semibold">{tx('Todavía no · probá otra respuesta', 'Not yet · try another answer')}</span>}</button>)}
                  <p role="status" aria-live="polite" className="leading-relaxed text-amber-200">{feedback || challengeStatus}</p>
                  {correct && <Button fullWidth onClick={() => { runAction(() => onComplete(activeTarget)); setChallengeStatus(tx('Desafío completado.', 'Challenge completed.')); }}>{tx('Recibir +40 XP', 'Receive +40 XP')}</Button>}
                </div>}
                {progress === 'rewarded' && <div className="space-y-3 rounded-2xl bg-surface-950 p-3 text-sm">
                  <p className="font-semibold text-emerald-200">{saved === null ? tx('Ya registrado · desafío completado', 'Already registered · challenge completed') : tx('+40 XP · desafío completado', '+40 XP · challenge completed')}</p>
                  <p className="text-xs leading-relaxed text-ink-muted">Total: {profile.xp} XP. {saved === true ? tx('Progreso guardado en este dispositivo.', 'Progress saved on this device.') : saved === false ? tx('Progreso solo en esta sesión.', 'Progress only in this session.') : tx('Sin XP extra por volver a escanear.', 'No extra XP for scanning again.')}</p>
                  <Button fullWidth onClick={onJournal}>{tx('Ver mi diario', 'View my journal')}</Button>
                  <Button variant="ghost" fullWidth onClick={onClose}>{tx('Seguir explorando', 'Keep exploring')}</Button>
                </div>}
                <p className="text-xs leading-relaxed text-ink-muted">{activeBird.description}</p>
                <p className="text-xs leading-relaxed text-ink-muted"><strong>{tx('Hábitat:', 'Habitat:')}</strong> {activeBird.habitat}</p>
                <p className="text-xs leading-relaxed text-ink-muted"><strong>{tx('Dato:', 'Fact:')}</strong> {activeBird.detail}</p>
                <p className="text-xs leading-relaxed text-emerald-200">{activeBird.funFact}</p>
                <p className="text-xs leading-relaxed text-ink-muted">Un descubrimiento por tarjeta y perfil. Volver a escanear permite revisar la ficha, sin registrarlo como avistamiento real.</p>
              </div>}
            </div>
            {(!expanded || progress === 'none') && <footer className="shrink-0 border-t border-white/15 px-4 pt-3">
              {progress === 'none' && <Button fullWidth onClick={() => runAction(() => onRegister(activeTarget))}>{tx('Registrar descubrimiento', 'Register discovery')}</Button>}
              {progress === 'registered' && <Button fullWidth onClick={() => setExpanded(true)}>{tx('Responder desafío', 'Answer challenge')}</Button>}
              {progress === 'rewarded' && <Button fullWidth onClick={onJournal}>{tx('Ver mi diario', 'View my journal')}</Button>}
            </footer>}
          </section>
        )}
        {tracking === 'error' && <section className="ui-card pb-safe absolute inset-x-4 bottom-4 z-10 space-y-3 text-sm">
          <h3 className="font-semibold">{tx('No pudimos abrir el escáner', 'We could not open the scanner')}</h3>
          <p className="text-xs leading-relaxed text-ink-muted">{tx('Revisá el permiso de cámara, la conexión y que el sitio use HTTPS.', 'Check camera permission, your connection and that the site uses HTTPS.')}</p>
          <Button fullWidth onClick={retry}>{tx('Reintentar', 'Retry')}</Button>
          <Button variant="ghost" fullWidth onClick={onClose}>{tx('Cerrar', 'Close')}</Button>
        </section>}
      </div>
    </div>
  );
};
