// Mobile Hardware Camera Switcher Helper (Android Chrome & iOS Safari)

export async function requestMobileCameraStream(
  mode: 'user' | 'environment',
  currentStream: MediaStream | null,
  videoElement: HTMLVideoElement | null
): Promise<MediaStream> {
  // a) Stop all active tracks before switching lenses
  if (currentStream) {
    currentStream.getTracks().forEach((track) => {
      try {
        track.stop();
      } catch {
        // ignore
      }
    });
  }
  if (videoElement) {
    videoElement.srcObject = null;
  }

  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    throw new Error('getUserMedia no soportado en este navegador');
  }

  // Small hardware release delay for Android devices that lock camera0/camera1
  await new Promise((r) => setTimeout(r, 60));

  if (mode === 'environment') {
    // b) 1. Try exact environment first
    try {
      return await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { exact: 'environment' } },
        audio: false
      });
    } catch {
      // b) 2. Fallback: search enumerateDevices() for rear/back/trasera/environment videoinput or last videoinput
      try {
        if (navigator.mediaDevices.enumerateDevices) {
          const devices = await navigator.mediaDevices.enumerateDevices();
          const videoDevices = devices.filter((d) => d.kind === 'videoinput');
          const rearByLabel = videoDevices.find((d) =>
            /back|trasera|rear|environment|posterior/i.test(d.label || '')
          );
          const targetDevice =
            rearByLabel || (videoDevices.length > 1 ? videoDevices[videoDevices.length - 1] : videoDevices[0]);

          if (targetDevice && targetDevice.deviceId) {
            return await navigator.mediaDevices.getUserMedia({
              video: { deviceId: { exact: targetDevice.deviceId } },
              audio: false
            });
          }
        }
      } catch {
        // continue to ideal fallback
      }

      // b) 3. Fallback: ideal environment, then generic video
      try {
        return await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' } },
          audio: false
        });
      } catch {
        return await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false
        });
      }
    }
  } else {
    // c) Front camera (mode === 'user')
    try {
      return await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: false
      });
    } catch {
      try {
        if (navigator.mediaDevices.enumerateDevices) {
          const devices = await navigator.mediaDevices.enumerateDevices();
          const videoDevices = devices.filter((d) => d.kind === 'videoinput');
          const frontByLabel = videoDevices.find((d) =>
            /front|frontal|user|delantera|selfie/i.test(d.label || '')
          );
          const targetDevice = frontByLabel || videoDevices[0];
          if (targetDevice && targetDevice.deviceId) {
            return await navigator.mediaDevices.getUserMedia({
              video: { deviceId: { exact: targetDevice.deviceId } },
              audio: false
            });
          }
        }
      } catch {
        // fallback
      }
      return await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false
      });
    }
  }
}

export async function countVideoInputs(): Promise<number> {
  try {
    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) return 0;
    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices.filter((d) => d.kind === 'videoinput').length;
  } catch {
    return 0;
  }
}

// When flipping, some phones hand back the same lens: open a different one by deviceId.
export async function switchToOtherCamera(
  stream: MediaStream,
  avoidDeviceId: string,
  mode: 'user' | 'environment'
): Promise<MediaStream> {
  const gotDeviceId = stream.getVideoTracks()[0]?.getSettings?.().deviceId;
  if (!gotDeviceId || gotDeviceId !== avoidDeviceId) return stream;

  let target: MediaDeviceInfo | undefined;
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const others = devices.filter((d) => d.kind === 'videoinput' && d.deviceId && d.deviceId !== avoidDeviceId);
    const wanted =
      mode === 'environment' ? /back|trasera|rear|environment|posterior/i : /front|frontal|user|delantera|selfie/i;
    target = others.find((d) => wanted.test(d.label || '')) || others[0];
  } catch {
    // keep the stream we already have
  }
  if (!target) return stream;

  stream.getTracks().forEach((t) => t.stop());
  await new Promise((r) => setTimeout(r, 60));
  try {
    return await navigator.mediaDevices.getUserMedia({
      video: { deviceId: { exact: target.deviceId } },
      audio: false
    });
  } catch {
    return await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
  }
}
