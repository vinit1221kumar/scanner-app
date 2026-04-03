type CapturedPage = {
  id: string;
  dataUrl: string;
  fileName: string;
  capturedAt: string;
};

type PageListProps = {
  pages: CapturedPage[];
  onRemove: (pageId: string) => void;
  onClear: () => void;
};

export function PageList({ pages, onRemove, onClear }: PageListProps) {
  if (pages.length === 0) {
    return (
      <div className="page-list-empty">
        Capture one or more pages. They will appear here before you send the
        batch to the laptop.
      </div>
    );
  }

  return (
    <div className="page-list-shell">
      <div className="page-list-header">
        <p className="page-list-title">Captured pages</p>
        <button className="text-button" onClick={onClear}>
          Clear all
        </button>
      </div>

      <div className="page-list">
        {pages.map((page, index) => (
          <article key={page.id} className="page-card">
            <div className="page-card-meta">
              <div>
                <p className="page-card-label">Page {index + 1}</p>
                <p className="page-card-filename">{page.fileName}</p>
              </div>
              <button className="text-button text-button-danger" onClick={() => onRemove(page.id)}>
                Retake
              </button>
            </div>

            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img alt={page.fileName} className="page-card-image" src={page.dataUrl} />

            <p className="page-card-time">
              Captured at {new Date(page.capturedAt).toLocaleTimeString()}
            </p>
          </article>
        ))}
      </div>
    </div>
  );
}
