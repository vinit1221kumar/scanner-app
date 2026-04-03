'use client';

import { useEffect, useMemo, useState } from 'react';
import QRCode from 'qrcode';
import { createPhoneScanUrl, createSessionId } from '@/lib/config';
import { ImageGrid } from '@/components/image-grid';
import { ExportActions } from '@/components/export-actions';
import { StatusBadge } from '@/components/status-badge';
import { useScannerSocket } from '@/hooks/useScannerSocket';

const statusConfig: Record<
  'idle' | 'connecting' | 'connected' | 'disconnected' | 'error',
  { label: string; tone: 'neutral' | 'success' | 'warning' | 'danger' }
> = {
  idle: { label: 'Idle', tone: 'neutral' },
  connecting: { label: 'Connecting', tone: 'warning' },
  connected: { label: 'Connected', tone: 'success' },
  disconnected: { label: 'Disconnected', tone: 'danger' },
  error: { label: 'Connection error', tone: 'danger' },
};

export function ScannerApp() {
  const [sessionId] = useState(() => createSessionId());
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');

  const phoneUrl = useMemo(() => createPhoneScanUrl(sessionId), [sessionId]);
  const { error, images, paired, status } = useScannerSocket(sessionId);
  const showConnectionWarning = status === 'disconnected' || status === 'error';
  const showConnecting = status === 'connecting';

  useEffect(() => {
    let active = true;

    QRCode.toDataURL(phoneUrl, {
      errorCorrectionLevel: 'M',
      margin: 1,
      width: 280,
    })
      .then((url: string) => {
        if (active) {
          setQrCodeUrl(url);
        }
      })
      .catch(() => {
        if (active) {
          setQrCodeUrl('');
        }
      });

    return () => {
      active = false;
    };
  }, [phoneUrl]);

  const state = statusConfig[status];

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8">
        <header className="rounded-[2rem] border border-slate-800 bg-slate-900/70 p-6 shadow-2xl shadow-black/20 backdrop-blur sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.35em] text-sky-400">
                Scanner App
              </p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-5xl">
                Phone-as-Scanner dashboard
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
                Pair a phone with this session by scanning the QR code. Incoming
                pages appear below in real time.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <StatusBadge label={state.label} tone={state.tone} />
              <StatusBadge label={paired ? 'Paired' : 'Waiting for phone'} tone={paired ? 'success' : 'warning'} />
            </div>
          </div>
        </header>

        <section className="grid gap-6 xl:grid-cols-[340px_minmax(0,1fr)]">
          <aside className="rounded-[2rem] border border-slate-800 bg-slate-900/70 p-6 backdrop-blur">
            <div className="space-y-5">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.3em] text-slate-400">
                  Session ID
                </p>
                <p className="mt-2 break-all rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 font-mono text-sm text-slate-100">
                  {sessionId}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-[0.3em] text-slate-400">
                  Phone link
                </p>
                <p className="mt-2 break-all rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-xs text-slate-300">
                  {phoneUrl}
                </p>
              </div>

              <div className="rounded-3xl border border-slate-800 bg-slate-950 p-4">
                {qrCodeUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    alt="QR code for the phone scanner session"
                    className="mx-auto aspect-square w-full max-w-[280px] rounded-2xl bg-white p-3"
                    src={qrCodeUrl}
                  />
                ) : (
                  <div className="grid aspect-square w-full max-w-[280px] place-items-center rounded-2xl border border-dashed border-slate-700 bg-slate-900 text-sm text-slate-400">
                    Generating QR code...
                  </div>
                )}
              </div>

              <div className="rounded-3xl border border-slate-800 bg-slate-950 p-4 text-sm text-slate-300">
                <p className="font-medium text-white">Connection status</p>
                <p className="mt-2">
                  {status === 'connected'
                    ? 'Laptop is online and ready to receive scans.'
                    : status === 'connecting'
                      ? 'Waiting for the Socket.IO server...'
                      : status === 'error'
                        ? error || 'Failed to connect to the server.'
                        : 'Start the server, then open the phone app with this session.'}
                </p>
              </div>
            </div>
          </aside>

          <section className="rounded-[2rem] border border-slate-800 bg-slate-900/70 p-6 backdrop-blur sm:p-8">
            {showConnecting ? (
              <div className="mb-4 rounded-2xl border border-sky-500/30 bg-sky-500/10 px-4 py-3 text-sm text-sky-200">
                Connecting to scanner server...
              </div>
            ) : null}

            {showConnectionWarning ? (
              <div className="mb-4 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                {error || 'Connection to scanner server was interrupted.'}
              </div>
            ) : null}

            <div className="mb-6 flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.3em] text-slate-400">
                  Scanned pages
                </p>
                <h2 className="mt-2 text-2xl font-semibold">Incoming images</h2>
              </div>
              <p className="text-sm text-slate-400">{images.length} page{images.length === 1 ? '' : 's'}</p>
            </div>

            <ExportActions images={images} />

            <ImageGrid images={images} />
          </section>
        </section>
      </div>
    </main>
  );
}
