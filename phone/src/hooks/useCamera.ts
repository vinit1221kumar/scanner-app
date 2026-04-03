'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export type CameraStatus = 'idle' | 'starting' | 'ready' | 'error';

export function useCamera() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [status, setStatus] = useState<CameraStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  const startCamera = useCallback(async () => {
    try {
      setError(null);
      setPermissionDenied(false);
      setStatus('starting');

      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Camera access is not available in this browser.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          facingMode: { ideal: 'environment' },
        },
      });

      streamRef.current = stream;

      const video = videoRef.current;
      if (!video) {
        throw new Error('Camera preview is not ready.');
      }

      video.srcObject = stream;
      await video.play();
      setStatus('ready');
    } catch (cameraError) {
      const isPermissionDenied =
        cameraError instanceof DOMException &&
        (cameraError.name === 'NotAllowedError' || cameraError.name === 'PermissionDeniedError');
      const message = isPermissionDenied
        ? 'Camera permission denied. Allow camera access in browser settings and try again.'
        : cameraError instanceof Error
          ? cameraError.message
          : 'Unable to start camera.';

      setError(message);
      setPermissionDenied(isPermissionDenied);
      setStatus('error');
      stopCamera();
    }
  }, [stopCamera]);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return {
    error,
    permissionDenied,
    startCamera,
    status,
    stopCamera,
    videoRef,
  };
}
