'use client';

import { useEffect, useMemo, useState } from 'react';
import { io, type Socket } from 'socket.io-client';
import { SERVER_URL } from '@/lib/config';

export type ScanImage = {
  id: string;
  dataUrl: string;
  fileName: string | null;
  capturedAt: string;
};

type SocketStatus = 'idle' | 'connecting' | 'connected' | 'disconnected' | 'error';

type ScanImagePayload = {
  sessionId: string;
  image: string;
  fileName?: string | null;
  capturedAt?: string;
};

export function useScannerSocket(sessionId: string) {
  const [status, setStatus] = useState<SocketStatus>('idle');
  const [paired, setPaired] = useState(false);
  const [images, setImages] = useState<ScanImage[]>([]);
  const [error, setError] = useState<string | null>(null);

  const socket = useMemo<Socket | null>(() => {
    if (!sessionId) {
      return null;
    }

    return io(SERVER_URL, {
      autoConnect: false,
      transports: ['websocket'],
    });
  }, [sessionId]);

  useEffect(() => {
    if (!socket) {
      return;
    }

    const handleConnect = () => {
      setStatus('connected');
      setError(null);
      socket.emit('join-laptop', { sessionId });
    };

    const handleDisconnect = () => {
      setStatus('disconnected');
      setPaired(false);
      setError('Socket disconnected. Keep server running and refresh if needed.');
    };

    const handleConnectError = (connectError: Error) => {
      setStatus('error');
      setError(`Unable to connect to server. ${connectError.message}`);
    };

    const handleJoined = (payload: { role: string; sessionId: string; paired: boolean }) => {
      if (payload.role === 'laptop' && payload.sessionId === sessionId) {
        setPaired(payload.paired);
      }
    };

    const handleSessionUpdate = (payload: { sessionId: string; paired: boolean }) => {
      if (payload.sessionId === sessionId) {
        setPaired(payload.paired);
      }
    };

    const handleScanImage = (payload: ScanImagePayload) => {
      if (payload.sessionId !== sessionId) {
        return;
      }

      setImages((current) => [
        {
          id: globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${current.length}`,
          dataUrl: payload.image,
          fileName: payload.fileName ?? null,
          capturedAt: payload.capturedAt ?? new Date().toISOString(),
        },
        ...current,
      ]);
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('connect_error', handleConnectError);
    socket.on('joined', handleJoined);
    socket.on('session-update', handleSessionUpdate);
    socket.on('scan-image', handleScanImage);

    setStatus('connecting');
    socket.connect();

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('connect_error', handleConnectError);
      socket.off('joined', handleJoined);
      socket.off('session-update', handleSessionUpdate);
      socket.off('scan-image', handleScanImage);
      socket.disconnect();
    };
  }, [sessionId, socket]);

  const disconnectSocket = () => {
    if (!socket) {
      return;
    }

    socket.disconnect();
    setStatus('disconnected');
    setPaired(false);
    setError('Disconnected manually. Click Reconnect when ready.');
  };

  const reconnectSocket = () => {
    if (!socket) {
      return;
    }

    setStatus('connecting');
    setError(null);
    socket.connect();
  };

  return {
    disconnectSocket,
    error,
    images,
    paired,
    reconnectSocket,
    socket,
    status,
  };
}
