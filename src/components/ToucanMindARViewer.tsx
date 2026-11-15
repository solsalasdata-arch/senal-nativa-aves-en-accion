import React, { useEffect, useMemo, useRef, useState } from 'react';
import { BIRDS_DATA, TRIVIA_QUESTIONS } from '../data/birdsData';
import type { PlayerProfile } from '../types/game';
import { getMindARStatus, MindARActionResult } from '../utils/mindarProgress';

interface Props {
  onClose: () => void;
  profile: PlayerProfile;
  onRegister: () => MindARActionResult;
  onComplete: () => MindARActionResult;
  onRetrySave: () => boolean;
  onJournal: () => void;
}
type TrackingState = 'starting' | 'searching' | 'found' | 'error';

const tucan = BIRDS_DATA.find((bird) => bird.id === 'tucan-grande');

// MindAR owns the camera in this isolated iframe. The legacy Gemini viewer must NOT
// start its own getUserMedia stream while this component is mounted.
export const ToucanMindARViewer: React.FC<Props> = ({ onClose, profile, onRegister, onComplete, onRetrySave, onJournal }) => {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const recognizedRef = useRef(false);
  const readyRef = useRef(false);
  const errorReceivedRef = useRef(false);
  const [recognized, setRecognized] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [correct, setCorrect] = useState(false);
  const [saved, setSaved] = useState<boolean | null>(null);
  const progress = getMindARStatus(profile);
  const question = TRIVIA_QUESTIONS.find(q => q.id === 1);
  const runAction = (action: () => MindARActionResult) => {
    const result = action();
    setSaved(result.saved);
  };
  const [tracking, setTracking] = useState<TrackingState>('starting');
  const [message, setMessage] = useState('Preparando reconocimiento de imagen…');

  const scene = useMemo(() => `<!doctype html>
<html lang="es"><head><meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no"/>
<style>html,body{margin:0;width:100%;height:100%;overflow:hidden;background:#020617}
body{position:relative}
video{position:absolute!important;inset:0!important;width:100%!important;height:100%!important;object-fit:cover!important;z-index:0!important;display:block!important;visibility:visible!important}
a-scene{position:absolute!important;inset:0!important;width:100%!important;height:100%!important;z-index:1!important;background:transparent!important}
a-scene canvas,.a-canvas{background:transparent!important} .a-enter-vr,.a-enter-ar{display:none!important}</style>
<script src="https://aframe.io/releases/1.4.2/aframe.min.js"><\/script>
<script src="https://cdn.jsdelivr.net/npm/mind-ar@1.2.5/dist/mindar-image-aframe.prod.js"><\/script>
</head><body>
<a-scene mindar-image="imageTargetSrc: /ar/targets.mind; autoStart: true; uiLoading: no; uiScanning: no; uiError: no;"
 color-space="sRGB" renderer="colorManagement: true; physicallyCorrectLights: true; antialias: true; alpha: true" background="color: #000000; transparent: true"
 vr-mode-ui="enabled: false" device-orientation-permission-ui="enabled: false" embedded>

<a-camera position="0 0 0" look-controls="enabled: false"></a-camera>
<a-entity mindar-image-target="targetIndex: 0" id="target"></a-entity>
</a-scene>
<script>
(function(){
 const notify=(type,detail)=>parent.postMessage({source:'senal-nativa-mindar',type,detail},'*');
 const target=document.querySelector('#target');
 target.addEventListener('targetFound',()=>notify('found'));
 target.addEventListener('targetLost',()=>notify('lost'));
 const scene=document.querySelector('a-scene');
 async function improveCameraFocus(){
  // Reuse MindAR's own video stream; never open a second camera.
  const video=document.querySelector('video');
  const track=video && video.srcObject && video.srcObject.getVideoTracks()[0];
  if(!track || !track.applyConstraints) return;
  const capabilities=track.getCapabilities ? track.getCapabilities() : {};
  const advanced={};
  if(Array.isArray(capabilities.focusMode) && capabilities.focusMode.includes('continuous')){
    advanced.focusMode='continuous';
  }
  // Only request a higher resolution when supported. Never require it.
  const constraints={};
  if(capabilities.width && capabilities.width.max>=1280) constraints.width={ideal:Math.min(1920,capabilities.width.max)};
  if(capabilities.height && capabilities.height.max>=720) constraints.height={ideal:Math.min(1080,capabilities.height.max)};
  if(Object.keys(advanced).length) constraints.advanced=[advanced];
  if(!Object.keys(constraints).length) return;
  try{
    await track.applyConstraints(constraints);
  }catch(e){
    // Some Samsung/Chrome cameras reject combined constraints; retry focus alone.
    if(Object.keys(advanced).length){
      try{await track.applyConstraints({advanced:[advanced]});}catch(_){}
    }
  }
 }
 scene.addEventListener('arReady',()=>{
  const renderer=scene.renderer;
  if(renderer){renderer.setClearColor(0x000000,0);renderer.setClearAlpha(0);}
  improveCameraFocus().catch(()=>{});
  notify('ready');
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
        case 'ready': readyRef.current = true; window.clearTimeout(timeout); setTracking('searching'); setMessage('Apuntá a la imagen del tucán'); break;
        case 'found':
          if (!recognizedRef.current) { recognizedRef.current = true; setRecognized(true); }
          setTracking('found'); setMessage('¡Imagen reconocida!'); break;
        case 'lost': setTracking('searching'); setMessage(recognizedRef.current ? 'Seguimiento perdido · podés seguir' : 'Volvé a enfocar la imagen del tucán'); break;
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
    };
  }, [attempt]);

  return (
    <div className="fixed inset-0 z-[60] bg-slate-950 flex items-center justify-center p-2 sm:p-3">
      <div className="relative w-full max-w-sm h-[94vh] max-h-[860px] rounded-3xl overflow-hidden border-2 border-teal-500 bg-black shadow-2xl">
        <iframe key={attempt} ref={frameRef} title="Visor XR del tucán" srcDoc={scene} allow="camera; accelerometer; gyroscope"
          className="absolute inset-0 w-full h-full border-0" />
        <header className="absolute top-0 inset-x-0 z-10 bg-gradient-to-b from-slate-950/95 to-transparent p-4 pt-5 flex justify-between items-start">
          <div><p className="text-[10px] tracking-[.2em] font-black text-teal-300">SEÑAL NATIVA · VISOR XR</p>
            <h2 className="text-white text-lg font-black">Descubrí al tucán</h2></div>
          <button type="button" onClick={onClose} aria-label="Cerrar visor XR"
            className="rounded-full bg-slate-900/90 text-white w-10 h-10 text-xl border border-white/30">×</button>
        </header>
        <div className="absolute top-24 inset-x-4 z-10 pointer-events-none text-center">
          <span className={`inline-block rounded-full px-4 py-2 text-xs font-bold border backdrop-blur-md ${tracking === 'found' ? 'bg-teal-800/85 text-white border-teal-300' : tracking === 'error' ? 'bg-red-900/90 text-white border-red-400' : 'bg-slate-950/80 text-teal-100 border-teal-600'}`}>
            {message}
          </span>
        </div>
        {(recognized || progress !== 'none') && tracking !== 'error' && tucan && (
          <section className="absolute bottom-5 inset-x-3 z-10 max-h-[55%] overflow-y-auto bg-slate-950/90 backdrop-blur-xl border border-teal-400/70 rounded-2xl p-4 text-white shadow-2xl">
            <p className="text-[10px] font-black tracking-widest text-teal-300">{recognized ? 'IMAGEN RECONOCIDA' : 'SEÑAL REGISTRADA'} · AVE INSIGNIA</p>
            <h3 className="font-black text-xl">{tucan.commonName}</h3>
            <p className="italic text-teal-200 text-sm">{tucan.scientificName}</p>
            <button type="button" className="min-h-11 text-teal-300 text-sm underline" onClick={() => setExpanded(!expanded)} aria-expanded={expanded}>{expanded ? 'Ocultar ficha' : 'Ver ficha completa'}</button>
            {expanded && <>
            <p className="text-xs text-slate-200 mt-2 leading-relaxed">{tucan.description}</p>
            <p className="text-xs text-slate-200 mt-2"><strong>Hábitat:</strong> {tucan.habitat} · <strong>Alimentación:</strong> {tucan.diet}</p>
            <p className="text-xs text-teal-200 mt-2">{tucan.funFact}</p>
            </>}
            <p className="text-[10px] text-slate-300 my-2">Un descubrimiento y una recompensa por señal y por perfil. Volver a escanear permite revisar la ficha, sin XP extra. No es un avistamiento de ave real.</p>
            {progress === 'none' && <button type="button" className="w-full min-h-12 rounded-xl bg-teal-500 text-slate-950 font-bold" onClick={() => runAction(onRegister)}>Registrar descubrimiento</button>}
            {progress === 'registered' && question && <div className="space-y-2 text-xs">
              <p className="font-bold">{question.question}</p>
              <p>Podés probar todas las veces que necesites, sin penalización.</p>
              {!correct && question.options.map((option, index) => <button type="button" key={option} className="block w-full min-h-11 text-left p-2 rounded-xl border border-teal-700 bg-slate-900" onClick={() => {
                if (index === question.correctIndex) { setCorrect(true); setFeedback(question.explanation); }
                else setFeedback('Todavía no. Probá de nuevo: pensá cómo el pico ayuda a regular el calor.');
              }}>{option}</button>)}
              <p role="status">{feedback}</p>
              {correct && <button type="button" className="w-full min-h-12 rounded-xl bg-teal-500 text-slate-950 font-bold" onClick={() => runAction(onComplete)}>Recibir +40 XP</button>}
            </div>}
            {progress === 'rewarded' && <div className="text-sm space-y-2">
              <p className="font-bold text-teal-300">{saved === null ? 'Ya registrado · desafío completado' : '+40 XP · desafío completado'}</p>
              <p>Total: {profile.xp} XP. {saved === true ? 'Progreso guardado en este dispositivo.' : saved === false ? 'Progreso solo en esta sesión.' : 'Sin XP extra por volver a escanear.'}</p>
              <button type="button" className="w-full min-h-11 bg-teal-500 text-slate-950 rounded-xl font-bold" onClick={onJournal}>Ver mi diario</button>
              <button type="button" className="w-full min-h-11 border border-teal-700 rounded-xl" onClick={onClose}>Seguir explorando</button>
            </div>}
            {saved === false && <div role="alert" className="text-xs text-amber-200 mt-2">No se pudo guardar en este dispositivo. El progreso puede perderse al cerrar o recargar.
              <button type="button" className="block min-h-11 underline" onClick={() => setSaved(onRetrySave())}>Reintentar guardar</button>
            </div>}
          </section>
        )}
        {tracking === 'error' && <div className="absolute bottom-6 inset-x-4 z-10 text-center text-xs text-white bg-slate-900/90 rounded-xl p-3">
          Revisá el permiso de cámara, la conexión y que el sitio use HTTPS.
          <button type="button" className="block w-full min-h-11 text-teal-300" onClick={() => {
            readyRef.current = false; errorReceivedRef.current = false; setTracking('starting'); setMessage('Preparando reconocimiento de imagen…'); setAttempt(value => value + 1);
          }}>Reintentar</button>
          <button type="button" className="min-h-11" onClick={onClose}>Cerrar</button>
        </div>}
      </div>
    </div>
  );
};
