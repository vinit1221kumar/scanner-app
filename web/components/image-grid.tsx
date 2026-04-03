import type { ScanImage } from '@/hooks/useScannerSocket';
import { downloadDataUrlAsImage } from '@/lib/download';

type ImageGridProps = {
  images: ScanImage[];
};

export function ImageGrid({ images }: ImageGridProps) {
  if (images.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-900/60 p-8 text-center text-sm text-slate-400">
        Waiting for scanned pages from the phone.
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {images.map((image, index) => (
        <figure
          key={image.id}
          className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/80 shadow-lg shadow-black/20"
        >
          <div className="flex items-start justify-between gap-3 border-b border-slate-800 px-4 py-3 text-xs text-slate-400">
            <div>
              <p className="font-medium text-slate-200">Page {images.length - index}</p>
              <p className="mt-1 break-all">{image.fileName || 'Received image'}</p>
            </div>

            <button
              className="rounded-full border border-slate-700 px-3 py-1 text-[11px] font-medium text-slate-200 transition hover:bg-slate-800"
              onClick={() =>
                downloadDataUrlAsImage(
                  image.dataUrl,
                  image.fileName || `scan-page-${images.length - index}.jpg`,
                )
              }
            >
              Download
            </button>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt={image.fileName || `Scanned page ${index + 1}`}
            className="h-72 w-full object-contain bg-black"
            src={image.dataUrl}
          />
          <figcaption className="px-4 py-3 text-xs text-slate-500">
            Captured at {new Date(image.capturedAt).toLocaleString()}
          </figcaption>
        </figure>
      ))}
    </div>
  );
}
