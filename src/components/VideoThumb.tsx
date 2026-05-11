import { useEffect, useRef, useState } from "react";
import { Film } from "lucide-react";

export function VideoThumb({ src, className }: { src: string; className?: string }) {
  const [poster, setPoster] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = document.createElement("video");
    v.crossOrigin = "anonymous";
    v.preload = "metadata";
    v.muted = true;
    v.playsInline = true;
    v.src = src;
    let cancelled = false;

    const capture = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = v.videoWidth || 640;
        canvas.height = v.videoHeight || 360;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.drawImage(v, 0, 0, canvas.width, canvas.height);
        const data = canvas.toDataURL("image/jpeg", 0.7);
        if (!cancelled) setPoster(data);
      } catch {
        if (!cancelled) setFailed(true);
      }
    };

    const onLoaded = () => {
      try { v.currentTime = Math.min(0.5, (v.duration || 1) / 2); } catch { capture(); }
    };
    v.addEventListener("loadeddata", onLoaded);
    v.addEventListener("seeked", capture);
    v.addEventListener("error", () => !cancelled && setFailed(true));

    return () => { cancelled = true; v.src = ""; };
  }, [src]);

  if (poster) return <img src={poster} alt="" className={className} />;
  if (failed) {
    return (
      <div className={`${className} bg-gradient-subtle flex items-center justify-center`}>
        <Film className="h-12 w-12 text-primary/40" />
      </div>
    );
  }
  return (
    <video
      ref={videoRef}
      src={src}
      className={className}
      muted
      playsInline
      preload="metadata"
    />
  );
}
