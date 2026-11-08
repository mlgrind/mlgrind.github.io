import { Easing, interpolate, spring } from 'remotion';
import type { ManifestSentence } from '../types';

const EASE = Easing.bezier(0.22, 1, 0.36, 1);

/** 0 -> 1 over `dur` frames starting at `start`, eased out. */
export function ease(frame: number, start: number, dur = 18): number {
  return interpolate(frame, [start, start + dur], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: EASE,
  });
}

/** Linear 0 -> 1, clamped. */
export function lin(frame: number, start: number, end: number): number {
  if (end <= start) return frame >= start ? 1 : 0;
  return interpolate(frame, [start, end], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
}

export function pop(frame: number, fps: number, start: number, damping = 18): number {
  return spring({ frame: frame - start, fps, config: { damping, mass: 0.6, stiffness: 140 } });
}

/** Visible between `start` and `end` (frames) with eased fades on both sides. */
export function windowed(frame: number, start: number, end: number, fade = 14): number {
  return Math.min(ease(frame, start, fade), 1 - ease(frame, end - fade, fade));
}

export const mix = (a: number, b: number, t: number) => a + (b - a) * t;

/**
 * Cue lookup: the frame (relative to the scene) at which a phrase is spoken.
 * Sentences carry exact start/end times from the narration; within a sentence
 * the position is estimated from the character offset, which is accurate to a
 * fraction of a second for this voice. Throws when the phrase is missing, so a
 * script edit that breaks a scene fails loudly at render time.
 */
export function makeCues(sentences: ManifestSentence[], sceneStartSec: number, fps: number) {
  const find = (phrase: string) => {
    const p = phrase.toLowerCase();
    for (const s of sentences) {
      const i = s.text.toLowerCase().indexOf(p);
      if (i >= 0) return { s, i };
    }
    throw new Error(`cue not found in narration: "${phrase}"`);
  };
  return {
    /** frame where `phrase` starts being spoken */
    at(phrase: string, offsetSec = 0): number {
      const { s, i } = find(phrase);
      const t = s.start + ((s.end - s.start) * i) / s.text.length;
      return Math.round((t - sceneStartSec + offsetSec) * fps);
    },
    /** frame where the sentence containing `phrase` ends */
    end(phrase: string, offsetSec = 0): number {
      const { s } = find(phrase);
      return Math.round((s.end - sceneStartSec + offsetSec) * fps);
    },
    /** frame where the sentence containing `phrase` starts */
    sentence(phrase: string, offsetSec = 0): number {
      const { s } = find(phrase);
      return Math.round((s.start - sceneStartSec + offsetSec) * fps);
    },
  };
}
export type Cues = ReturnType<typeof makeCues>;
