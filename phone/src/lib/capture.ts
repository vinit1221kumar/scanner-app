export function captureFrame(video: HTMLVideoElement) {
  const width = video.videoWidth;
  const height = video.videoHeight;

  if (!width || !height) {
    throw new Error('Camera is not ready yet.');
  }

  const MAX_DIMENSION = 1600;
  const scale = Math.min(1, MAX_DIMENSION / Math.max(width, height));
  const targetWidth = Math.max(1, Math.round(width * scale));
  const targetHeight = Math.max(1, Math.round(height * scale));

  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;

  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('Canvas is not supported in this browser.');
  }

  context.drawImage(video, 0, 0, targetWidth, targetHeight);
  return canvas.toDataURL('image/jpeg', 0.82);
}
