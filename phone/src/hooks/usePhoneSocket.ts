'use client';

import { useEffect, useMemo, useState } from 'react';
import { io, type Socket } from 'socket.io-client';
import { SERVER_URL } from '@/lib/config';

export type PhoneConnectionStatus = 'idle' | 'connecting' | 'connected' | 'disconnected' | 'error';

type JoinedPayload = {
  role: 'phone';
  sessionId: string;
  paired: boolean;
};

type SessionUpdatePayload = {
  sessionId: string;
  paired: boolean;
};

type ScanAck = {
  ok: boolean;
  message?: string;
};

type ScanImagePayload = {
  sessionId: string;
  image: string;
  fileName: string;
  capturedAt: string;
};

const CONNECT_TIMEOUT_MS = 10000;
const ACK_TIMEOUT_MS = 15000;

export function usePhoneSocket(sessionId: string) {
  const [status, setStatus] = useState<PhoneConnectionStatus>('idle');
  const [paired, setPaired] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSentAt, setLastSentAt] = useState<string | null>(null);

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
      socket.emit('join-phone', { sessionId });
    };

    const handleDisconnect = () => {
      setStatus('disconnected');
      setPaired(false);
      setError('Socket disconnected. Check server connection and keep this page open.');
    };

    const handleConnectError = (connectError: Error) => {
      setStatus('error');
      setError(`Unable to connect to server. ${connectError.message}`);
    };

    const handleJoined = (payload: JoinedPayload) => {
      if (payload.sessionId === sessionId) {
        setPaired(payload.paired);
      }
    };

    const handleSessionUpdate = (payload: SessionUpdatePayload) => {
      if (payload.sessionId === sessionId) {
        setPaired(payload.paired);
      }
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('connect_error', handleConnectError);
    socket.on('joined', handleJoined);
    socket.on('session-update', handleSessionUpdate);

    setStatus('connecting');
    socket.connect();

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('connect_error', handleConnectError);
      socket.off('joined', handleJoined);
      socket.off('session-update', handleSessionUpdate);
      socket.disconnect();
    };
  }, [sessionId, socket]);

  const waitForConnection = () => {
    return new Promise<void>((resolve, reject) => {
      if (!socket) {
        reject(new Error('Socket is unavailable.'));
        return;
      }

      if (socket.connected) {
        resolve();
        return;
      }

      const timeoutId = window.setTimeout(() => {
        socket.off('connect', handleConnectOnce);
        socket.off('connect_error', handleConnectErrorOnce);
        reject(new Error('Reconnect timed out. Please try again.'));
      }, CONNECT_TIMEOUT_MS);

      const handleConnectOnce = () => {
        window.clearTimeout(timeoutId);
        socket.off('connect_error', handleConnectErrorOnce);
        resolve();
      };

      const handleConnectErrorOnce = (connectError: Error) => {
        window.clearTimeout(timeoutId);
        socket.off('connect', handleConnectOnce);
        reject(new Error(`Reconnect failed: ${connectError.message}`));
      };

      socket.once('connect', handleConnectOnce);
      socket.once('connect_error', handleConnectErrorOnce);
      socket.connect();
    });
  };

  const sendImage = (payload: Omit<ScanImagePayload, 'sessionId'>) => {
    return new Promise<ScanAck>(async (resolve, reject) => {
      try {
        if (!socket) {
          throw new Error('Socket is unavailable.');
        }

        if (socket.disconnected) {
          setStatus('connecting');
          await waitForConnection();
        }

        let didAck = false;
        const ackTimeoutId = window.setTimeout(() => {
          if (!didAck) {
            reject(new Error('Send timed out. Please try again.'));
          }
        }, ACK_TIMEOUT_MS);

        socket.emit(
          'scan-image',
          { ...payload, sessionId },
          (ack: ScanAck) => {
            if (didAck) {
              return;
            }

            didAck = true;
            window.clearTimeout(ackTimeoutId);

            if (ack?.ok) {
              setLastSentAt(payload.capturedAt);
              resolve(ack);
              return;
            }

            reject(new Error(ack?.message || 'Failed to send scan.'));
          },
        );
      } catch (sendError) {
        reject(sendError instanceof Error ? sendError : new Error('Failed to send scan.'));
      }
    });
  };

  const disconnectSocket = () => {
    if (!socket) {
      return;
    }

    socket.disconnect();
    setStatus('disconnected');
    setPaired(false);
    setError('Disconnected manually. Tap Reconnect when ready.');
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
    lastSentAt,
    paired,
    reconnectSocket,
    sendImage,
    socket,
    status,
  };
}
