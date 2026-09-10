import { useCallback, useRef, type MutableRefObject } from "react";

type SoundName = "add" | "remove" | "tick" | "reveal";

interface AudioHandle {
  context: AudioContext;
  master: GainNode;
}

function getAudioHandle(ref: MutableRefObject<AudioHandle | null>): AudioHandle | null {
  if (typeof window === "undefined") return null;
  if (ref.current) return ref.current;

  try {
    const AudioContextCtor =
      window.AudioContext ||
      (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextCtor) return null;
    const context = new AudioContextCtor();
    const master = context.createGain();
    master.gain.value = 0.08;
    master.connect(context.destination);
    ref.current = { context, master };
    return ref.current;
  } catch {
    return null;
  }
}

function tone(
  handle: AudioHandle,
  frequency: number,
  duration: number,
  delay = 0,
  type: OscillatorType = "sine",
) {
  const start = handle.context.currentTime + delay;
  const oscillator = handle.context.createOscillator();
  const gain = handle.context.createGain();
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, start);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(0.65, start + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  oscillator.connect(gain);
  gain.connect(handle.master);
  oscillator.start(start);
  oscillator.stop(start + duration + 0.02);
}

export function useSoundEffects(enabled: boolean) {
  const audioRef = useRef<AudioHandle | null>(null);

  const play = useCallback(
    (name: SoundName) => {
      if (!enabled) return;
      const handle = getAudioHandle(audioRef);
      if (!handle) return;

      void handle.context.resume().catch(() => undefined);

      if (name === "add") {
        tone(handle, 520, 0.12, 0, "triangle");
        tone(handle, 740, 0.16, 0.08, "triangle");
      } else if (name === "remove") {
        tone(handle, 420, 0.11, 0, "sine");
        tone(handle, 280, 0.14, 0.07, "sine");
      } else if (name === "tick") {
        tone(handle, 610, 0.06, 0, "square");
      } else {
        tone(handle, 392, 0.18, 0, "triangle");
        tone(handle, 523, 0.2, 0.12, "triangle");
        tone(handle, 659, 0.28, 0.25, "triangle");
        tone(handle, 784, 0.34, 0.42, "sine");
      }
    },
    [enabled],
  );

  return {
    playAdd: useCallback(() => play("add"), [play]),
    playRemove: useCallback(() => play("remove"), [play]),
    playTick: useCallback(() => play("tick"), [play]),
    playReveal: useCallback(() => play("reveal"), [play]),
  };
}
