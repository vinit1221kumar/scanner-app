type ScanActionsProps = {
  onCapture: () => void;
  onRetake: () => void;
  onSend: () => void;
  captureDisabled?: boolean;
  retakeDisabled?: boolean;
  sendDisabled?: boolean;
  sending?: boolean;
  hasCapture: boolean;
};

export function ScanActions({
  onCapture,
  onRetake,
  onSend,
  captureDisabled = false,
  retakeDisabled = false,
  sendDisabled = false,
  sending = false,
  hasCapture,
}: ScanActionsProps) {
  return (
    <div className="scan-actions">
      <button className="action-button action-button-capture" onClick={onCapture} disabled={captureDisabled || sending}>
        {sending ? 'Working…' : 'Capture'}
      </button>
      <button className="action-button action-button-secondary" onClick={onRetake} disabled={!hasCapture || retakeDisabled || sending}>
        Retake last
      </button>
      <button className="action-button action-button-accent" onClick={onSend} disabled={!hasCapture || sendDisabled || sending}>
        {sending ? 'Sending…' : 'Send pages'}
      </button>
    </div>
  );
}
