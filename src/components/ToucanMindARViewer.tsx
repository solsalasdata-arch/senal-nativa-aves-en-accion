import React, { useEffect, useMemo, useRef, useState } from 'react';
import { BIRDS_DATA } from '../data/birdsData';

interface Props { onClose: () => void; }
type TrackingState = 'starting' | 'searching' | 'found' | 'error';

const tucan = BIRDS_DATA.find((bird) => bird.id === 'tucan-grande');

// MindAR owns the camera in this isolated iframe. The legacy Gemini viewer must NOT
// start its own getUserMedia stream while this component is mounted.
export const ToucanMindARViewer: React.FC<Props> = ({ onClose }) => {
  const frameRef = useRef<HTMLIFrameElement>(null);
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
 scene.addEventListener('arError',()=>notify('error','No se pudo iniciar MindAR o la cámara.'));
 window.addEventListener('error',(event)=>notify('error',event.message));
})();
<\/script></body></html>`, []);

  useEffect(() => {
    const receive = (event: MessageEvent) => {
      if (event.source !== frameRef.current?.contentWindow || event.data?.source !== 'senal-nativa-mindar') return;
      switch (event.data.type) {
        case 'ready': setTracking('searching'); setMessage('Apuntá a la imagen del tucán'); break;
        case 'found': setTracking('found'); setMessage('¡Tucán reconocido!'); break;
        case 'lost': setTracking('searching'); setMessage('Volvé a enfocar la imagen del tucán'); break;
        case 'error': setTracking('error'); setMessage(event.data.detail || 'Error de cámara o seguimiento'); break;
      }
    };
    window.addEventListener('message', receive);
    return () => window.removeEventListener('message', receive);
  }, []);

  return (
    <div className="fixed inset-0 z-[60] bg-slate-950 flex items-center justify-center p-2 sm:p-3">
      <div className="relative w-full max-w-sm h-[94vh] max-h-[860px] rounded-3xl overflow-hidden border-2 border-teal-500 bg-black shadow-2xl">
        <iframe ref={frameRef} title="Visor XR del tucán" srcDoc={scene} allow="camera; accelerometer; gyroscope"
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
        {tracking === 'found' && tucan && (
          <section className="absolute bottom-5 inset-x-3 z-10 bg-slate-950/90 backdrop-blur-xl border border-teal-400/70 rounded-2xl p-4 text-white shadow-2xl">
            <p className="text-[10px] font-black tracking-widest text-teal-300">IMAGEN RECONOCIDA · AVE INSIGNIA</p>
            <h3 className="font-black text-xl">{tucan.commonName}</h3>
            <p className="italic text-teal-200 text-sm">{tucan.scientificName}</p>
            <p className="text-xs text-slate-200 mt-2 leading-relaxed">{tucan.description}</p>
            <p className="text-xs text-slate-200 mt-2"><strong>Hábitat:</strong> {tucan.habitat} · <strong>Alimentación:</strong> {tucan.diet}</p>
            <p className="text-xs text-teal-200 mt-2">{tucan.funFact}</p>
          </section>
        )}
        {tracking === 'error' && <div className="absolute bottom-6 inset-x-4 z-10 text-center text-xs text-white bg-slate-900/90 rounded-xl p-3">
          Revisá el permiso de cámara y que el sitio use HTTPS. Cerrá el visor para volver al modo anterior.
        </div>}
      </div>
    </div>
  );
};
