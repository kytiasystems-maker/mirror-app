import React, { useEffect, useRef, useState } from "react";

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

export default function BackgroundMusicBar() {
  const audioRef = useRef(null);
  const fadeRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(() => {
    try { return Number(localStorage.getItem('relax_audio_volume') || '0.35'); } catch { return 0.35; }
  });

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;

    a.loop = true;
    a.preload = "auto";
    a.volume = volume;

    return () => {
      if (fadeRef.current) cancelAnimationFrame(fadeRef.current);
      a.pause();
      a.currentTime = 0;
    };
  }, []);

  useEffect(() => {
    try { localStorage.setItem('relax_audio_volume', String(volume)); } catch {}
  }, [volume]);

  const fadeTo = (target, ms = 2000) => {
    const a = audioRef.current;
    if (!a) return;

    if (fadeRef.current) cancelAnimationFrame(fadeRef.current);

    const start = a.volume;
    const startTime = performance.now();

    const step = (now) => {
      const t = clamp((now - startTime) / ms, 0, 1);
      const v = start + (target - start) * t;
      a.volume = clamp(v, 0, 1);

      if (t < 1) fadeRef.current = requestAnimationFrame(step);
    };

    fadeRef.current = requestAnimationFrame(step);
  };

  const play = async () => {
    const a = audioRef.current;
    if (!a) return;

    a.volume = 0;
    try {
      await a.play();
      fadeTo(volume, 2000);
      setIsPlaying(true);
    } catch (e) {
      console.warn("Audio play blocked by browser policy:", e);
    }
  };

  const stop = () => {
    const a = audioRef.current;
    if (!a) return;

    fadeTo(0, 1500);
    setTimeout(() => {
      a.pause();
      a.currentTime = 0;
      a.volume = volume; // restore preferred volume for next play
      setIsPlaying(false);
    }, 1550);
  };

  const toggle = () => {
    if (isPlaying) stop();
    else play();
  };

  // listen to programmatic play/stop requests (so other UI can trigger playback)
  useEffect(() => {
    const onPlayReq = () => { play(); };
    const onStopReq = () => { stop(); };
    window.addEventListener('playBackgroundAudio', onPlayReq);
    window.addEventListener('stopBackgroundAudio', onStopReq);
    return () => {
      window.removeEventListener('playBackgroundAudio', onPlayReq);
      window.removeEventListener('stopBackgroundAudio', onStopReq);
    };
  }, [volume, isPlaying]);

  const onVolumeChange = (v) => {
    const vv = clamp(v, 0, 1);
    setVolume(vv);

    const a = audioRef.current;
    if (!a) return;

    // if currently playing, update live (no fade needed)
    if (isPlaying) a.volume = vv;
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, width: "100%" }}>
      <audio ref={audioRef} src="/audio/calm_loop.mp3" />

      <button
        onClick={toggle}
        style={{
          border: "none",
          borderRadius: 12,
          padding: "10px 12px",
          cursor: "pointer",
        }}
        aria-label={isPlaying ? "Pause background sound" : "Play background sound"}
      >
        {isPlaying ? "⏸ Pause" : "▶ Play"}
      </button>

      <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ opacity: 0.7, fontSize: 12 }}>Volume</span>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={(e) => onVolumeChange(Number(e.target.value))}
          style={{ width: "100%" }}
        />
      </div>
    </div>
  );
}
