'use client';

import { useState } from 'react';
import type { ScanImage } from '@/hooks/useScannerSocket';
import { downloadDataUrlAsImage } from '@/lib/download';
import { generatePdfFromImages } from '@/lib/pdf';

type ExportActionsProps = {
  images: ScanImage[];
};

export function ExportActions({ images }: ExportActionsProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const handleDownloadPdf = async () => {
    if (!images.length) {
      return;
    }

    try {
      setIsExporting(true);
      setExportError(null);

      const pdfBytes = await generatePdfFromImages(images);
      const pdfCopy = new Uint8Array(pdfBytes.length);
      pdfCopy.set(pdfBytes);
      const blob = new Blob([pdfCopy], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `scanner-session-${Date.now()}.pdf`;
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (error) {
      setExportError(error instanceof Error ? error.message : 'Failed to export PDF.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownloadImages = () => {
    if (!images.length) {
      return;
    }

    try {
      setIsExporting(true);
      setExportError(null);

      images.forEach((image, index) => {
        downloadDataUrlAsImage(
          image.dataUrl,
          image.fileName || `scan-page-${images.length - index}.jpg`,
        );
      });
    } catch (error) {
      setExportError(error instanceof Error ? error.message : 'Failed to download images.');
    } finally {
      setIsExporting(false);
    }
  };

  const disabled = images.length === 0 || isExporting;

  return (
    <div className="mb-6">
      <div className="flex flex-wrap gap-3">
        <button
          className="inline-flex items-center rounded-full bg-sky-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-50"
          onClick={handleDownloadPdf}
          disabled={disabled}
        >
          {isExporting ? 'Exporting...' : 'Download PDF'}
        </button>
        <button
          className="inline-flex items-center rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          onClick={handleDownloadImages}
          disabled={disabled}
        >
          {isExporting ? 'Preparing...' : 'Download images'}
        </button>
      </div>

      {exportError ? (
        <p className="mt-3 text-sm text-rose-300">{exportError}</p>
      ) : null}
    </div>
  );
}
