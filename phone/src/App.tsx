'use client';

import { useEffect, useState } from 'react';
import { CameraPreview } from '@/components/camera-preview';
import { PageList } from '@/components/page-list';
import { ScanActions } from '@/components/scan-actions';
import { StatusPill } from '@/components/status-pill';
import { useCamera } from '@/hooks/useCamera';
import { usePhoneSocket } from '@/hooks/usePhoneSocket';
import { captureFrame } from '@/lib/capture';
import { getSessionIdFromUrl } from '@/lib/config';
import { useAppStore } from '@/store/useAppStore';

const socketStatusLabels = {
  idle: { label: 'Idle', tone: 'neutral' as const },
  connecting: { label: 'Connecting', tone: 'warning' as const },
  connected: { label: 'Connected', tone: 'success' as const },
  disconnected: { label: 'Disconnected', tone: 'danger' as const },
  error: { label: 'Socket error', tone: 'danger' as const },
};

const cameraStatusLabels = {
  idle: { label: 'Idle', tone: 'neutral' as const },
  starting: { label: 'Starting camera', tone: 'warning' as const },
  ready: { label: 'Camera ready', tone: 'success' as const },
  error: { label: 'Camera error', tone: 'danger' as const },
};

export default function App() {
  const [hydrated, setHydrated] = useState(false);
  const [sending, setSending] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const { sessionId, pages, setSessionId, addPage, removePage, clearPages } = useAppStore();
  const { error: cameraError, permissionDenied, startCamera, status: cameraStatus, videoRef } = useCamera();
  const {
    disconnectSocket,
    error: socketError,
    lastSentAt,
    paired,
    reconnectSocket,
    sendImage,
    status: socketStatus,
  } = usePhoneSocket(sessionId || '');

  useEffect(() => {
    const currentSessionId = getSessionIdFromUrl();
    setSessionId(currentSessionId || null);
    setHydrated(true);
  }, [setSessionId]);

  useEffect(() => {
    if (sessionId) {
      startCamera();
    }
  }, [sessionId, startCamera]);

  const socketState = socketStatusLabels[socketStatus];
  const cameraState = cameraStatusLabels[cameraStatus];
  const isCameraLoading = cameraStatus === 'starting';
  const isSocketDisconnected = socketStatus === 'disconnected' || socketStatus === 'error';
  const canReconnect = socketStatus === 'disconnected' || socketStatus === 'error';

  const handleCapture = async () => {
    try {
      setStatusMessage(null);
      const image = captureFrame(videoRef.current as HTMLVideoElement);
      addPage({
        dataUrl: image,
        fileName: `scan-${Date.now()}.jpg`,
        capturedAt: new Date().toISOString(),
      });
      setStatusMessage('Page captured. Add more pages or send the batch to the laptop.');
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : 'Failed to capture page.');
    }
  };

  const handleDeleteLast = () => {
    const lastPage = pages[0];
    if (!lastPage) {
      setStatusMessage('No captured pages to delete.');
      return;
    }

    removePage(lastPage.id);
    setStatusMessage('Last page deleted. Capture again when ready.');
  };

  const handleSend = async () => {
    if (!pages.length || !sessionId) {
      return;
    }

    try {
      setSending(true);
      setStatusMessage(null);
      for (const page of [...pages].reverse()) {
        await sendImage({
          image: page.dataUrl,
          fileName: page.fileName,
          capturedAt: page.capturedAt,
        });
      }

      clearPages();
      setStatusMessage('All pages sent to the laptop.');
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : 'Failed to send scan.');
    } finally {
      setSending(false);
    }
  };

  if (!hydrated) {
    return (
      <main className="phone-shell">
        <section className="phone-card phone-card-loading">
          <p className="eyebrow">Scanner App</p>
          <h1>Preparing camera session…</h1>
        </section>
      </main>
    );
  }

  if (!sessionId) {
    return (
      <main className="phone-shell">
        <section className="phone-card phone-card-error">
          <p className="eyebrow">Scanner App</p>
          <h1>No session found</h1>
          <p>
            Open this app by scanning the QR code shown on the laptop. The URL
            must include a sessionId query parameter.
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="phone-shell">
      <div className="phone-page">
        <header className="phone-header">
          <div>
            <p className="eyebrow">Scanner App</p>
            <h1>Phone scanner</h1>
            <p className="phone-description">
              Scan documents with the camera, then send each image to the
              paired laptop in real time.
            </p>
          </div>

          <div className="pill-row">
            <StatusPill label={socketState.label} tone={socketState.tone} />
            <StatusPill label={cameraState.label} tone={cameraState.tone} />
            <StatusPill label={paired ? 'Paired' : 'Waiting for laptop'} tone={paired ? 'success' : 'warning'} />
            {canReconnect ? (
              <button className="connection-button" onClick={reconnectSocket}>
                Reconnect
              </button>
            ) : (
              <button className="connection-button connection-button-danger" onClick={disconnectSocket}>
                Disconnect
              </button>
            )}
          </div>
        </header>

        <section className="phone-grid">
          <article className="phone-panel phone-panel-camera">
            <div className="panel-heading">
              <div>
                <p className="panel-kicker">Live camera</p>
                <h2>Align the document inside the frame</h2>
              </div>
              <span className="session-chip">{sessionId}</span>
            </div>

            <CameraPreview videoRef={videoRef} />

            {isCameraLoading ? (
              <div className="inline-status inline-status-info">Starting camera…</div>
            ) : null}

            {permissionDenied ? (
              <div className="inline-status inline-status-error">
                Camera permission denied. Enable camera access and reload this page.
              </div>
            ) : null}

            {isSocketDisconnected ? (
              <div className="inline-status inline-status-error">
                Socket disconnected. Keep the server running and stay on this screen.
              </div>
            ) : null}

            <ScanActions
              onCapture={handleCapture}
              onDeleteLast={handleDeleteLast}
              onSend={handleSend}
              captureDisabled={cameraStatus !== 'ready' || permissionDenied}
              retakeDisabled={pages.length === 0}
              sendDisabled={socketStatus !== 'connected' || !paired}
              sending={sending}
              hasCapture={pages.length > 0}
            />

            <div className="status-stack">
              {statusMessage ? <p className="status-text">{statusMessage}</p> : null}
              {socketError ? <p className="status-text status-text-error">{socketError}</p> : null}
              {cameraError ? <p className="status-text status-text-error">{cameraError}</p> : null}
              {lastSentAt ? <p className="status-text">Last sent at {new Date(lastSentAt).toLocaleTimeString()}</p> : null}
            </div>
          </article>

          <article className="phone-panel phone-panel-preview">
            <div className="panel-heading">
              <div>
                <p className="panel-kicker">Preview</p>
                <h2>Captured pages</h2>
              </div>
            </div>

            <PageList pages={pages} onRemove={removePage} onClear={clearPages} />
          </article>
        </section>
      </div>
    </main>
  );
}
