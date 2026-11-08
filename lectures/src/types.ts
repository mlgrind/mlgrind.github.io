// The manifest written by `npm run narrate` and read by the Remotion
// compositions. All times are in seconds from the start of the video.

export interface ManifestSentence {
  text: string;
  /** caption text (after caption_replace) */
  caption: string;
  start: number;
  end: number;
  chapter: number; // -1 = outro
  paragraph: number;
}

export interface ManifestCaption {
  start: number;
  end: number;
  text: string;
}

export interface ManifestChapter {
  index: number;
  title: string;
  /** real start, measured from the narration audio */
  start: number;
  end: number;
  /** the script's original estimate, for reference */
  estimatedStart: number;
}

export interface LectureManifest {
  lecture: string;
  section: string;
  title: string;
  voice: string;
  sampleRate: number;
  fps: number;
  width: number;
  height: number;
  durationSec: number;
  durationInFrames: number;
  /** start of the outro (end card) */
  outroStart: number;
  chapters: ManifestChapter[];
  sentences: ManifestSentence[];
  captions: ManifestCaption[];
  problem: { id: string; title: string; url: string };
  characters: number;
  charactersBilled: number;
  files: { audio: string; vtt: string; manifest: string; video: string };
  generatedAt: string;
}
