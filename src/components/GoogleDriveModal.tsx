import React, { useState, useEffect, useCallback } from 'react';
import {
  Cloud,
  X,
  Upload,
  Download,
  Trash2,
  RefreshCw,
  FileText,
  FileCode,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Search,
  LogOut,
  Sparkles
} from 'lucide-react';
import { User } from 'firebase/auth';
import {
  initAuth,
  googleSignIn,
  logout,
  getAccessToken,
  listDriveFiles,
  createDriveFile,
  updateDriveFileContent,
  getDriveFileContent,
  deleteDriveFile,
  DriveFileItem
} from '../utils/googleDrive';
import { PlayerProfile } from '../types/game';
import { soundManager } from '../utils/audio';

interface GoogleDriveModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeProfile: PlayerProfile;
  onRestoreProfileData: (restoredProfile: Partial<PlayerProfile>) => void;
}

type PendingConfirmation =
  | {
      type: 'delete';
      file: DriveFileItem;
    }
  | {
      type: 'overwrite';
      file: DriveFileItem;
      content: string;
      mimeType: string;
    }
  | null;

export const GoogleDriveModal: React.FC<GoogleDriveModalProps> = ({
  isOpen,
  onClose,
  activeProfile,
  onRestoreProfileData
}) => {
  const [needsAuth, setNeedsAuth] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const [files, setFiles] = useState<DriveFileItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error' | 'info';
    text: string;
  } | null>(null);

  // Mandatory explicit confirmation dialog state for destructive/mutating Drive operations
  const [pendingConfirmation, setPendingConfirmation] = useState<PendingConfirmation>(null);

  const fetchFiles = useCallback(async (query = '') => {
    const token = await getAccessToken();
    if (!token) {
      setNeedsAuth(true);
      return;
    }
    setIsLoadingFiles(true);
    setStatusMessage(null);
    try {
      const items = await listDriveFiles(query);
      setFiles(items);
      setNeedsAuth(false);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al cargar archivos';
      if (message === 'AUTH_REQUIRED') {
        setNeedsAuth(true);
      } else {
        setStatusMessage({ type: 'error', text: message });
      }
    } finally {
      setIsLoadingFiles(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = initAuth(
      (loggedInUser) => {
        setUser(loggedInUser);
        setNeedsAuth(false);
      },
      () => {
        setUser(null);
        setNeedsAuth(true);
      }
    );
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (isOpen && !needsAuth) {
      fetchFiles(searchQuery);
    }
  }, [isOpen, needsAuth, fetchFiles, searchQuery]);

  if (!isOpen) return null;

  const handleLogin = async () => {
    soundManager.playClick();
    setIsLoggingIn(true);
    setStatusMessage(null);
    try {
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
        setNeedsAuth(false);
        soundManager.playSuccess();
        await fetchFiles(searchQuery);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'No se pudo iniciar sesión con Google';
      setStatusMessage({ type: 'error', text: msg });
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleSignOut = async () => {
    soundManager.playClick();
    await logout();
    setUser(null);
    setNeedsAuth(true);
    setFiles([]);
    setStatusMessage({ type: 'info', text: 'Sesión de Google Drive cerrada.' });
  };

  const buildBackupJsonContent = () => {
    return JSON.stringify(
      {
        app: 'Señal Nativa: Aves en Acción',
        reserve: 'Parque Botánico Municipal Barón Carlos María Schuel (Jujuy)',
        exportedAt: new Date().toISOString(),
        profile: activeProfile
      },
      null,
      2
    );
  };

  const buildScientificReportText = () => {
    const entries = activeProfile.fieldJournal || [];
    const lines = [
      '===================================================================',
      'SEÑAL NATIVA: AVES EN ACCIÓN',
      'PARQUE BOTÁNICO MUNICIPAL "BARÓN CARLOS MARÍA SCHUEL"',
      'Reserva Natural Urbana · Selva Montana de las Yungas (1334-1463 msnm)',
      '===================================================================',
      `Explorador/a: ${activeProfile.name} (${activeProfile.avatarName})`,
      `Ave Compañera: ${activeProfile.favoriteBird}`,
      `Nivel: ${activeProfile.level} | Experiencia: ${activeProfile.xp} XP`,
      `Especies Iluminadas en Catálogo: ${(activeProfile.unlockedSilhouettes || []).length}/8`,
      `Puntos de Control Validados: ${(activeProfile.completedCheckpoints || []).length}/8`,
      `Fecha de Exportación: ${new Date().toLocaleString()}`,
      '',
      '-------------------------------------------------------------------',
      `DIARIO DE CAMPO CIENTÍFICO (MÉTODO DE 4 TOQUES) - Total: ${entries.length}`,
      '-------------------------------------------------------------------',
      ...entries.map((e, idx) => {
        const d = new Date(e.timestamp).toLocaleString();
        return [
          `#${idx + 1} - ${e.birdName} (${e.scientificName})`,
          `   Fecha/Hora: ${d}`,
          `   Punto del Sendero: ${e.trailName}`,
          `   1. Comportamiento: ${e.behavior || 'En reposo'}`,
          `   2. Cantidad: ${e.count || '1 individuo'}`,
          `   3. Estrato: ${e.stratum || 'Subdosel'}`,
          `   4. Clima: ${e.weather || 'Soleado'}`,
          `   Notas: ${e.notes}`,
          ''
        ].join('\n');
      })
    ];
    return lines.join('\n');
  };

  // Create a brand new file or ask confirmation if user wants to overwrite existing
  const handleExportToDrive = async (format: 'json' | 'txt') => {
    soundManager.playClick();
    const token = await getAccessToken();
    if (!token) {
      setNeedsAuth(true);
      return;
    }

    const safeName = activeProfile.name.replace(/[^a-zA-Z0-9_-]/g, '_');
    const fileName =
      format === 'json'
        ? `Senal_Nativa_Perfil_${safeName}.json`
        : `Diario_Cientifico_Schuel_${safeName}.txt`;
    const mimeType = format === 'json' ? 'application/json' : 'text/plain';
    const content = format === 'json' ? buildBackupJsonContent() : buildScientificReportText();

    const existingFile = files.find((f) => f.name === fileName);
    if (existingFile) {
      // Mandatory confirmation before overwriting existing file in Google Drive
      setPendingConfirmation({
        type: 'overwrite',
        file: existingFile,
        content,
        mimeType
      });
      return;
    }

    setIsProcessing(true);
    setStatusMessage(null);
    try {
      const created = await createDriveFile(fileName, content, mimeType);
      soundManager.playSuccess();
      setStatusMessage({
        type: 'success',
        text: `Archivo "${created.name}" guardado exitosamente en tu Google Drive.`
      });
      await fetchFiles(searchQuery);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al guardar en Google Drive';
      if (msg === 'AUTH_REQUIRED') setNeedsAuth(true);
      else setStatusMessage({ type: 'error', text: msg });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmPendingAction = async () => {
    if (!pendingConfirmation) return;
    soundManager.playClick();
    const action = pendingConfirmation;
    setPendingConfirmation(null);
    setIsProcessing(true);
    setStatusMessage(null);

    try {
      if (action.type === 'delete') {
        await deleteDriveFile(action.file.id);
        soundManager.playSuccess();
        setStatusMessage({
          type: 'success',
          text: `Archivo "${action.file.name}" eliminado de Google Drive.`
        });
        await fetchFiles(searchQuery);
      } else if (action.type === 'overwrite') {
        const updated = await updateDriveFileContent(
          action.file.id,
          action.content,
          action.mimeType
        );
        soundManager.playSuccess();
        setStatusMessage({
          type: 'success',
          text: `Archivo "${updated.name}" actualizado en Google Drive.`
        });
        await fetchFiles(searchQuery);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al ejecutar operación en Google Drive';
      if (msg === 'AUTH_REQUIRED') setNeedsAuth(true);
      else setStatusMessage({ type: 'error', text: msg });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImportFromDrive = async (file: DriveFileItem) => {
    soundManager.playClick();
    setIsProcessing(true);
    setStatusMessage(null);
    try {
      const raw = await getDriveFileContent(file.id);
      const parsed = JSON.parse(raw);
      const profileToRestore = parsed.profile || parsed;
      if (!profileToRestore || typeof profileToRestore.xp !== 'number') {
        throw new Error('El archivo seleccionado no es un respaldo válido de Señal Nativa.');
      }

      onRestoreProfileData({
        level: profileToRestore.level,
        xp: profileToRestore.xp,
        sightingsCompleted: profileToRestore.sightingsCompleted,
        questionsAnswered: profileToRestore.questionsAnswered,
        hasRisingObserverBadge: profileToRestore.hasRisingObserverBadge,
        hasRouteCompleteSeal: profileToRestore.hasRouteCompleteSeal,
        hasDetailObserverBadge: profileToRestore.hasDetailObserverBadge,
        completedCheckpoints: profileToRestore.completedCheckpoints,
        unlockedSilhouettes: profileToRestore.unlockedSilhouettes,
        unlockedAcoustics: profileToRestore.unlockedAcoustics,
        fieldJournal: profileToRestore.fieldJournal,
        birdPhotoStars: profileToRestore.birdPhotoStars
      });

      soundManager.playSuccess();
      setStatusMessage({
        type: 'success',
        text: `Progreso y Diario de Campo importados desde "${file.name}".`
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'No se pudo importar el archivo';
      if (msg === 'AUTH_REQUIRED') setNeedsAuth(true);
      else setStatusMessage({ type: 'error', text: msg });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-md animate-fadeIn select-none">
      <div className="relative w-full max-w-sm max-h-[92vh] flex flex-col rounded-3xl overflow-hidden bg-slate-900 border-2 border-teal-400 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-950 border-b border-teal-900/60 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-teal-500/20 border border-teal-400 flex items-center justify-center text-teal-300">
              <Cloud className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-black text-xs text-white uppercase tracking-wider">
                GOOGLE DRIVE · NUBE CIENTÍFICA
              </h3>
              <p className="text-[10px] text-teal-300">
                Sincronización de Diario de Campo y Archivos
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="w-7 h-7 rounded-full bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center border border-slate-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-3.5 space-y-3 flex-1 overflow-y-auto text-xs text-slate-200">
          {/* Status Alert */}
          {statusMessage && (
            <div
              className={`p-2.5 rounded-xl border text-[11px] flex items-start gap-2 ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-950/90 border-emerald-500 text-emerald-200'
                  : statusMessage.type === 'error'
                  ? 'bg-rose-950/90 border-rose-500 text-rose-200'
                  : 'bg-teal-950/90 border-teal-500 text-teal-200'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="flex-1 leading-snug">{statusMessage.text}</span>
            </div>
          )}

          {needsAuth ? (
            /* UNAUTHENTICATED VIEW WITH OFFICIAL GOOGLE SIGN-IN BUTTON */
            <div className="p-4 rounded-2xl bg-slate-950/90 border border-teal-800/60 text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-teal-900/50 border border-teal-400/50 mx-auto flex items-center justify-center text-teal-300">
                <Cloud className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-black text-white">
                  Conecta tu Google Drive
                </h4>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Guarda en la nube tu Diario de Campo Científico (4 Toques), exporta reportes de avistamientos del Parque Botánico Barón Schuel y administra tus archivos en Google Drive.
                </p>
              </div>

              <div className="pt-1 flex justify-center">
                <button
                  onClick={handleLogin}
                  disabled={isLoggingIn}
                  className="gsi-material-button"
                >
                  <div className="gsi-material-button-state"></div>
                  <div className="gsi-material-button-content-wrapper">
                    <div className="gsi-material-button-icon">
                      <svg
                        version="1.1"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 48 48"
                        xmlnsXlink="http://www.w3.org/1999/xlink"
                        style={{ display: 'block' }}
                      >
                        <path
                          fill="#EA4335"
                          d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                        ></path>
                        <path
                          fill="#4285F4"
                          d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                        ></path>
                        <path
                          fill="#FBBC05"
                          d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                        ></path>
                        <path
                          fill="#34A853"
                          d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                        ></path>
                        <path fill="none" d="M0 0h48v48H0z"></path>
                      </svg>
                    </div>
                    <span className="gsi-material-button-contents">
                      {isLoggingIn ? 'Conectando...' : 'Sign in with Google'}
                    </span>
                    <span style={{ display: 'none' }}>Sign in with Google</span>
                  </div>
                </button>
              </div>
            </div>
          ) : (
            /* AUTHENTICATED GOOGLE DRIVE DASHBOARD */
            <>
              {/* Connected User Strip */}
              <div className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-950 border border-teal-800/70">
                <div className="flex items-center gap-2 min-w-0">
                  {user?.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || 'Usuario'}
                      className="w-8 h-8 rounded-full border border-teal-400 shrink-0"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-teal-700 text-white font-bold flex items-center justify-center shrink-0">
                      {(user?.displayName || user?.email || 'G')[0].toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-white truncate">
                      {user?.displayName || 'Explorador Conectado'}
                    </div>
                    <div className="text-[10px] text-teal-300 truncate">
                      {user?.email}
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleSignOut}
                  className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold flex items-center gap-1 border border-slate-700 shrink-0"
                  title="Cerrar sesión de Google"
                >
                  <LogOut className="w-3 h-3 text-rose-400" />
                  <span>Salir</span>
                </button>
              </div>

              {/* Export / Backup Section */}
              <div className="p-3 rounded-2xl bg-gradient-to-br from-emerald-950 via-teal-950 to-slate-950 border border-teal-500/60 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black text-amber-300 uppercase flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    Exportar Expedición ({activeProfile.name})
                  </span>
                  <span className="text-[10px] text-teal-200 font-bold">
                    {(activeProfile.fieldJournal || []).length} registros
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleExportToDrive('txt')}
                    disabled={isProcessing}
                    className="p-2.5 rounded-xl game-btn-mint text-emerald-950 font-black text-[11px] flex flex-col items-center justify-center gap-1 shadow disabled:opacity-50"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Reporte Diario (.TXT)</span>
                  </button>

                  <button
                    onClick={() => handleExportToDrive('json')}
                    disabled={isProcessing}
                    className="p-2.5 rounded-xl game-btn-orange text-white font-black text-[11px] flex flex-col items-center justify-center gap-1 shadow disabled:opacity-50"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Respaldo Perfil (.JSON)</span>
                  </button>
                </div>
              </div>

              {/* Drive File Browser Section */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black text-teal-300 uppercase">
                    Tus Archivos en Google Drive
                  </span>
                  <button
                    onClick={() => fetchFiles(searchQuery)}
                    disabled={isLoadingFiles}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-teal-300 border border-slate-700"
                    title="Actualizar lista"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoadingFiles ? 'animate-spin' : ''}`} />
                  </button>
                </div>

                {/* Search Input */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar archivos en tu Drive..."
                    className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-950 border border-teal-900 text-xs text-white placeholder-slate-500 focus:border-teal-400 outline-none"
                  />
                </div>

                {/* Files List */}
                <div className="space-y-1.5 max-h-56 overflow-y-auto pr-0.5">
                  {isLoadingFiles ? (
                    <div className="p-6 text-center text-slate-400 text-xs">
                      Consultando archivos de Google Drive...
                    </div>
                  ) : files.length === 0 ? (
                    <div className="p-5 rounded-xl bg-slate-950/70 border border-slate-800 text-center text-slate-400 text-[11px]">
                      No se encontraron archivos que coincidan con la búsqueda.
                    </div>
                  ) : (
                    files.map((file) => {
                      const isJson =
                        file.mimeType.includes('json') || file.name.endsWith('.json');
                      return (
                        <div
                          key={file.id}
                          className="p-2.5 rounded-xl bg-slate-950/90 border border-slate-800 hover:border-teal-700/70 flex items-center justify-between gap-2"
                        >
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            {isJson ? (
                              <FileCode className="w-4 h-4 text-amber-400 shrink-0" />
                            ) : (
                              <FileText className="w-4 h-4 text-teal-400 shrink-0" />
                            )}
                            <div className="min-w-0 flex-1">
                              <div className="text-xs font-bold text-white truncate">
                                {file.name}
                              </div>
                              <div className="text-[9px] text-slate-400 truncate">
                                {file.modifiedTime
                                  ? new Date(file.modifiedTime).toLocaleString()
                                  : file.mimeType}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            {isJson && (
                              <button
                                onClick={() => handleImportFromDrive(file)}
                                disabled={isProcessing}
                                className="px-2 py-1 rounded-lg bg-teal-900/80 hover:bg-teal-800 text-teal-200 text-[10px] font-bold border border-teal-600/50 flex items-center gap-1"
                                title="Restaurar este respaldo en el perfil activo"
                              >
                                <Download className="w-3 h-3" />
                                <span>Importar</span>
                              </button>
                            )}

                            {file.webViewLink && (
                              <a
                                href={file.webViewLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-300 border border-slate-700"
                                title="Abrir en Google Drive"
                              >
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}

                            <button
                              onClick={() => {
                                soundManager.playClick();
                                setPendingConfirmation({ type: 'delete', file });
                              }}
                              disabled={isProcessing}
                              className="p-1.5 rounded-lg bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-800/60"
                              title="Eliminar de Google Drive"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* MANDATORY EXPLICIT CONFIRMATION DIALOG FOR MUTATING / DESTRUCTIVE OPERATIONS */}
        {pendingConfirmation && (
          <div className="absolute inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
            <div className="w-full max-w-xs rounded-2xl bg-slate-900 border-2 border-amber-400 p-4 space-y-3 text-center shadow-2xl">
              <div className="w-12 h-12 rounded-full bg-amber-500/20 border border-amber-400 mx-auto flex items-center justify-center text-amber-300">
                <AlertTriangle className="w-6 h-6" />
              </div>

              <h4 className="text-sm font-black text-white uppercase">
                {pendingConfirmation.type === 'delete'
                  ? '¿Eliminar archivo de Google Drive?'
                  : '¿Actualizar archivo existente?'}
              </h4>

              <p className="text-xs text-slate-300 leading-relaxed">
                {pendingConfirmation.type === 'delete' ? (
                  <>
                    Estás por eliminar permanentemente{' '}
                    <strong className="text-amber-300">"{pendingConfirmation.file.name}"</strong>{' '}
                    de tu Google Drive. Esta acción no se puede deshacer.
                  </>
                ) : (
                  <>
                    Ya existe el archivo{' '}
                    <strong className="text-amber-300">"{pendingConfirmation.file.name}"</strong>{' '}
                    en tu Google Drive. ¿Deseas sobrescribir su contenido con los datos actuales?
                  </>
                )}
              </p>

              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => {
                    soundManager.playClick();
                    setPendingConfirmation(null);
                  }}
                  className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmPendingAction}
                  className={`flex-1 py-2 rounded-xl font-black text-xs text-white ${
                    pendingConfirmation.type === 'delete'
                      ? 'bg-rose-600 hover:bg-rose-500 border border-rose-400'
                      : 'game-btn-orange'
                  }`}
                >
                  {pendingConfirmation.type === 'delete' ? 'Sí, Eliminar' : 'Sí, Actualizar'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
