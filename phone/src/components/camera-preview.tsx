import type { RefObject } from 'react';

type CameraPreviewProps = {
  videoRef: RefObject<HTMLVideoElement | null>;
};

export function CameraPreview({ videoRef }: CameraPreviewProps) {
  return (
    <div className="camera-frame">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="camera-video"
      />
      <div className="camera-overlay">
        <div className="camera-guide" />
      </div>
    </div>
  );
}
