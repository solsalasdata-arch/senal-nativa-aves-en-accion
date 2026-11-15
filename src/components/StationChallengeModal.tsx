import React, { useEffect, useRef, useState } from 'react';
import { Award, Camera, CheckCircle, CircleHelp, QrCode, RefreshCw, ShieldAlert } from 'lucide-react';
import { ModalHeader, Button } from './ui';
import { useModalEscape } from './ui/useModalEscape';
import { CHECKPOINTS_DATA } from '../data/birdsData';
import type { CheckPoint, PlayerProfile } from '../types/game';
import { localizeCheckpoint, useLanguage } from '../utils/i18n';
import { parseStationQr, type StationQrResult } from '../utils/stationQr';
import { completeStation } from '../utils/stationProgress';
import { createQrDecoder, decodeQrFromFile, startQrScanLoop, stopMediaStream } from '../utils/qrScanner';
import { requestMobileCameraStream } from '../utils/camera';

export type StationCompletionStatus = ReturnType<typeof completeStation>['status'];
type Step = 'scan' | 'recognized' | 'invalid' | 'other' | 'question' | 'wrong' | 'completed' | 'already-completed' | 'practice-done';
const invalidMessages: Record<Extract<StationQrResult, { ok: false }>['reason'], string> = {
  malformed: 'Este contenido no es un QR de estación de Señal Nativa.',
  'unsupported-version': 'Esta versión del QR no es compatible con la app.',
  'other-circuit': 'El QR pertenece a otro circuito.',
  'unknown-station': 'Esta estación no existe en el circuito.',
  'invalid-code': 'El código de la estación no es válido. Probá con el QR del cartel.'
};

export function StationChallengeModal({ station, profile, initialToken, practice: initialPractice, onClose, onSelectStation, onCompleteStation }: {
  station: CheckPoint; profile: PlayerProfile; initialToken?: string | null; practice: boolean;
  onClose: () => void; onSelectStation: (station: CheckPoint) => void;
  onCompleteStation: (stationId: number, scannedToken: string, answerIndex: number) => StationCompletionStatus;
}) {
  const { lang } = useLanguage();
  const cp = localizeCheckpoint(station, lang);
  const parsedInitial = parseStationQr(initialToken || '');
  const initialVerified = parsedInitial.ok && parsedInitial.stationId === station.id ? parsedInitial.token : null;
  const [practice, setPractice] = useState(initialPractice);
  const [verifiedToken, setVerifiedToken] = useState<string | null>(initialVerified);
  const [step, setStep] = useState<Step>(initialPractice ? 'question' : profile.completedCheckpoints.includes(station.id)
    ? 'already-completed' : initialVerified ? 'recognized' : 'scan');
  const [answer, setAnswer] = useState<number | null>(null);
  const [invalidMessage, setInvalidMessage] = useState('');
  const [other, setOther] = useState<{ station: CheckPoint; token: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [engine, setEngine] = useState('');
  const [facing, setFacing] = useState<'environment' | 'user'>('environment');
  const [retry, setRetry] = useState(0);
  const video = useRef<HTMLVideoElement>(null);
  const stream = useRef<MediaStream | null>(null);
  const loop = useRef<{ stop(): void } | null>(null);
  const generation = useRef(0);
  const fileInput = useRef<HTMLInputElement>(null);
  const submission = useRef(false);
  const release = () => {
    generation.current++;
    loop.current?.stop();
    loop.current = null;
    stopMediaStream(stream.current);
    stream.current = null;
    if (video.current) video.current.srcObject = null;
  };
  const close = () => { release(); onClose(); };
  useModalEscape(true, close);

  const acceptText = (text: string) => {
    const result = parseStationQr(text);
    release();
    setError(null);
    if (!result.ok) {
      setInvalidMessage(invalidMessages[result.reason]);
      setStep('invalid');
    } else if (result.stationId !== station.id) {
      setOther({ station: CHECKPOINTS_DATA.find(item => item.id === result.stationId)!, token: result.token });
      setStep('other');
    } else {
      setVerifiedToken(result.token);
      setStep(profile.completedCheckpoints.includes(station.id) ? 'already-completed' : 'recognized');
    }
    return true;
  };
  useEffect(() => {
    if (step !== 'scan' || practice) return;
    let cancelled = false;
    const run = ++generation.current;
    setError(null);
    const start = async () => {
      try {
        if (!window.isSecureContext) throw new Error('insecure');
        if (!navigator.mediaDevices?.getUserMedia) throw new Error('unsupported');
        const camera = await requestMobileCameraStream(facing, null, video.current);
        if (cancelled || generation.current !== run) { stopMediaStream(camera); return; }
        stream.current = camera;
        if (!video.current) { release(); return; }
        video.current.srcObject = camera;
        await video.current.play();
        const decoder = await createQrDecoder();
        if (cancelled || generation.current !== run) return;
        setEngine(decoder.engine);
        loop.current = startQrScanLoop(video.current!, decoder, text => {
          setEngine(decoder.engine);
          return acceptText(text);
        }, { onError: () => { release(); setError('No se pudo leer la cámara. Reintentá o elegí una foto.'); } });
      } catch (cause) {
        if (cancelled || generation.current !== run) return;
        release();
        const name = cause instanceof Error ? cause.name : '';
        const message = cause instanceof Error ? cause.message : '';
        setError(message === 'insecure' ? 'La cámara necesita una conexión segura HTTPS.'
          : message === 'unsupported' ? 'Este navegador no admite cámara en vivo. Elegí una foto con un QR.'
          : name === 'NotAllowedError' || name === 'SecurityError' ? 'Permiso de cámara denegado. Habilitalo en el navegador o elegí una foto.'
          : name === 'NotFoundError' || name === 'DevicesNotFoundError' ? 'No se encontró una cámara. Elegí una foto con un QR.'
          : 'No se pudo iniciar la cámara. Cerrá otras apps y reintentá o elegí una foto.');
      }
    };
    void start();
    return () => { cancelled = true; release(); };
  }, [step, practice, facing, retry, station.id]);
  useEffect(() => () => release(), []);

  const scanAgain = () => { release(); setVerifiedToken(null); setAnswer(null); setError(null); setStep('scan'); setRetry(value => value + 1); };
  const startPractice = () => { release(); setPractice(true); setVerifiedToken(null); setAnswer(null); setStep('question'); };
  const verified = !!verifiedToken && (() => { const result = parseStationQr(verifiedToken); return result.ok && result.stationId === station.id; })();
  const submit = () => {
    if (answer === null || step !== 'question' || submission.current || (!practice && !verified)) return;
    if (answer !== station.challenge.correctIndex) { setStep('wrong'); return; }
    submission.current = true;
    if (practice) setStep('practice-done');
    else {
      const status = onCompleteStation(station.id, verifiedToken!, answer);
      setStep(status === 'not-scanned' ? 'invalid' : status === 'wrong-answer' ? 'wrong' : status);
      if (status === 'not-scanned') setInvalidMessage('Escaneá el QR de esta estación antes de responder.');
    }
    submission.current = false;
  };
  const statuses: Record<Step, { label: string; icon: React.ReactNode }> = {
    scan: { label: 'Buscando QR…', icon: <Camera /> }, recognized: { label: 'QR reconocido', icon: <CheckCircle /> },
    invalid: { label: 'QR inválido', icon: <ShieldAlert /> }, other: { label: 'Otra estación detectada', icon: <QrCode /> },
    question: { label: 'Desafío pendiente', icon: <CircleHelp /> }, wrong: { label: 'Respuesta incorrecta', icon: <ShieldAlert /> },
    completed: { label: 'Estación completada', icon: <Award /> }, 'already-completed': { label: 'Estación completada anteriormente', icon: <CheckCircle /> },
    'practice-done': { label: 'Práctica completada — sin recompensa', icon: <CheckCircle /> }
  };
  return <div role="dialog" aria-modal="true" aria-label="Escáner QR y desafío de estación" className="fixed inset-0 z-60 flex items-center justify-center p-3 bg-black/90 animate-fadeIn">
    <div className="pb-safe min-h-0 w-full max-w-sm max-h-[92dvh] overflow-y-auto rounded-3xl bg-surface-900 border border-teal-400 p-4 shadow-2xl space-y-3">
      <ModalHeader title="Escáner QR y desafío de estación" onClose={close} icon={<QrCode />} />
      {practice && <p className="p-3 rounded-xl border border-amber-400 text-amber-200 text-xs font-bold">Modo práctica — no otorga XP ni valida la estación</p>}
      <h4 aria-live="polite" className="flex items-center gap-2 text-amber-300 font-bold text-sm">{statuses[step].icon}{statuses[step].label}</h4>
      <p className="text-xs text-teal-200">Estación {station.id}: {cp.name}</p>
      {step === 'scan' && <div className="space-y-2">
        <div className="relative h-56 rounded-2xl overflow-hidden bg-black border border-teal-400">
          <video ref={video} autoPlay playsInline muted className="w-full h-full object-cover" style={{ transform: facing === 'user' ? 'scaleX(-1)' : undefined }} />
          <div className="absolute inset-7 border-2 border-dashed border-amber-400 rounded-xl pointer-events-none flex items-end justify-center"><span className="bg-black/80 p-1 text-xs text-amber-200">Apuntá al QR de la estación</span></div>
        </div>
        {engine && <p className="text-[11px] text-teal-300">Lector: {engine === 'jsqr' ? 'jsQR' : 'BarcodeDetector'}</p>}
        {error && <p role="alert" className="text-xs text-amber-200">{error}</p>}
        <div className="flex gap-2"><Button variant="secondary" onClick={() => { release(); setFacing(value => value === 'environment' ? 'user' : 'environment'); }}> <RefreshCw className="w-4 h-4" /> Girar cámara</Button>
          <Button onClick={scanAgain}>Reintentar cámara</Button></div>
        <Button variant="ghost" onClick={() => fileInput.current?.click()}>Elegir foto con un QR</Button>
        <input ref={fileInput} type="file" accept="image/*" className="hidden" onChange={async event => {
          const file = event.target.files?.[0]; event.target.value = '';
          if (!file) return;
          release();
          const run = generation.current;
          setError('Leyendo foto…');
          try {
            const text = await decodeQrFromFile(file);
            if (generation.current !== run) return;
            if (text) acceptText(text);
            else setError('No se encontró un QR en la foto. Elegí otra foto o reintentá la cámara.');
          } catch { if (generation.current === run) setError('No se pudo leer la foto. Elegí otra imagen.'); }
        }} />
      </div>}
      {step === 'recognized' && <Button disabled={!verified} onClick={() => setStep('question')}>Responder desafío</Button>}
      {step === 'invalid' && <><p role="alert" className="text-xs text-amber-200">{invalidMessage}</p><Button onClick={scanAgain}>Volver a escanear</Button></>}
      {step === 'other' && other && <><p className="text-sm text-teal-100">Detectaste la Estación {other.station.id}: {other.station.name}</p>
        <Button onClick={() => { onSelectStation(other.station); setVerifiedToken(other.token); setAnswer(null); setStep(profile.completedCheckpoints.includes(other.station.id) ? 'already-completed' : 'recognized'); }}>Ir a la Estación {other.station.id}</Button>
        <Button variant="ghost" onClick={scanAgain}>Volver a escanear</Button></>}
      {(step === 'question' || step === 'wrong') && (practice || verified) && <div className="space-y-2">
        <p className="text-xs font-bold text-white">{cp.challenge.question}</p>
        {cp.challenge.options.map((option, index) => <button key={index} disabled={step !== 'question'} onClick={() => setAnswer(index)} aria-pressed={answer === index}
          className={`min-h-11 w-full p-2 rounded-xl border text-left text-xs ${answer === index ? 'bg-amber-500/20 border-amber-400 text-amber-200' : 'bg-slate-950 border-slate-700 text-slate-200'}`}>{String.fromCharCode(65 + index)}. {option}</button>)}
        {step === 'question' && <Button disabled={answer === null || (!practice && !verified)} onClick={submit}>Confirmar respuesta</Button>}
      </div>}
      {['wrong', 'completed', 'practice-done'].includes(step) && <p className="p-3 rounded-xl bg-emerald-950/70 border border-teal-600 text-xs text-teal-100">{cp.challenge.explanation}</p>}
      {step === 'wrong' && <Button onClick={() => { setAnswer(null); setStep('question'); }}>Reintentar</Button>}
      {step === 'completed' && <p className="station-reward-badge rounded-xl bg-amber-400 p-3 text-center font-bold text-forest-950">+25 XP</p>}
      {step === 'already-completed' && <><p className="text-xs text-teal-100">Sin XP adicional. Podés repasar el desafío.</p><Button onClick={startPractice}>Repasar en modo práctica</Button></>}
      {['completed', 'practice-done'].includes(step) && <Button onClick={close}>Listo · Continuar recorrido</Button>}
      {!practice && step !== 'completed' && step !== 'already-completed' && <Button variant="ghost" onClick={startPractice}>Practicar sin QR (sin recompensa)</Button>}
    </div>
  </div>;
}
