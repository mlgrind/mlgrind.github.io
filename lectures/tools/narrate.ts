// npm run narrate <lecture>
//
// Renders a lecture script to narration audio with Deepgram Aura, one request
// per sentence (6 in flight), so every sentence and chapter has an exact start
// time. Writes:
//   public/<lecture>/narration.wav   audio used by the Remotion composition
//   public/<lecture>/manifest.json   durations, chapters, sentences, captions
//   out/<lecture>/<lecture>.vtt      WebVTT captions
// Audio is cached per text chunk by sha256(voice + text) in .cache/tts, so a
// re-run only bills text that changed.
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chunkText, parseScript, type ParsedScript } from './script.ts';
import type { LectureManifest, ManifestCaption, ManifestSentence } from '../src/types.ts';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SITE = path.resolve(ROOT, '..');

const VOICE = (process.env.DEEPGRAM_VOICE ?? process.env.DEEPGRAM_VOICE_A ?? 'aura-arcas-en').trim();
// In the sandbox the network proxy injects the real key for api.deepgram.com.
const API_KEY = (process.env.DEEPGRAM_API_KEY ?? 'proxy-injected').trim();
const SAMPLE_RATE = 24000;
const MAX_CHARS = 1600; // Deepgram /v1/speak rejects > 2000 chars
const WORKERS = Number(process.env.DEEPGRAM_CONCURRENCY ?? 6);
const FPS = 30;

// Silence (seconds) laid between pieces of narration.
const LEAD_IN = 1.0;
const GAP_SENTENCE = 0.3;
const GAP_PARAGRAPH = 0.7;
const GAP_CHAPTER = 1.1;
const TAIL = 4.0; // end card holds after the last word

const CACHE = path.join(ROOT, '.cache', 'tts');

let billed = 0;

async function tts(text: string): Promise<Buffer> {
  const key = crypto.createHash('sha256').update(`${VOICE}\n${text}`).digest('hex');
  const file = path.join(CACHE, `${key}.pcm`);
  if (fs.existsSync(file)) return fs.readFileSync(file);
  const url =
    `https://api.deepgram.com/v1/speak?model=${encodeURIComponent(VOICE)}` +
    `&encoding=linear16&sample_rate=${SAMPLE_RATE}&container=none`;
  let lastErr: unknown;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { Authorization: `Token ${API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      if (res.status !== 200) {
        throw new Error(`deepgram ${res.status}: ${(await res.text()).slice(0, 200)}`);
      }
      let pcm = Buffer.from(await res.arrayBuffer());
      pcm = pcm.subarray(0, pcm.length - (pcm.length % 2)); // whole samples only
      billed += text.length;
      fs.mkdirSync(CACHE, { recursive: true });
      fs.writeFileSync(file, pcm);
      return pcm;
    } catch (e) {
      lastErr = e;
      await new Promise((r) => setTimeout(r, 1000 + 2000 * attempt));
    }
  }
  throw new Error(`TTS failed after 3 attempts: ${String(lastErr)}`);
}

async function pool<T, R>(items: T[], n: number, fn: (t: T) => Promise<R>): Promise<R[]> {
  const out = new Array<R>(items.length);
  let next = 0;
  await Promise.all(
    Array.from({ length: Math.min(n, items.length) }, async () => {
      while (next < items.length) {
        const i = next++;
        out[i] = await fn(items[i]);
      }
    }),
  );
  return out;
}

/** Trim leading/trailing near-silence so our own gaps set the rhythm. */
function trimSilence(pcm: Buffer, threshold = 300, pad = 0.04): Buffer {
  const n = pcm.length / 2;
  let a = 0;
  let b = n - 1;
  while (a < n && Math.abs(pcm.readInt16LE(a * 2)) < threshold) a++;
  while (b > a && Math.abs(pcm.readInt16LE(b * 2)) < threshold) b--;
  const padS = Math.round(pad * SAMPLE_RATE);
  a = Math.max(0, a - padS);
  b = Math.min(n - 1, b + padS);
  return pcm.subarray(a * 2, (b + 1) * 2);
}

const silence = (sec: number) => Buffer.alloc(Math.round(sec * SAMPLE_RATE) * 2);

function wav(pcm: Buffer): Buffer {
  const h = Buffer.alloc(44);
  h.write('RIFF', 0);
  h.writeUInt32LE(36 + pcm.length, 4);
  h.write('WAVE', 8);
  h.write('fmt ', 12);
  h.writeUInt32LE(16, 16);
  h.writeUInt16LE(1, 20); // PCM
  h.writeUInt16LE(1, 22); // mono
  h.writeUInt32LE(SAMPLE_RATE, 24);
  h.writeUInt32LE(SAMPLE_RATE * 2, 28);
  h.writeUInt16LE(2, 32);
  h.writeUInt16LE(16, 34);
  h.write('data', 36);
  h.writeUInt32LE(pcm.length, 40);
  return Buffer.concat([h, pcm]);
}

/** Break a sentence into caption cues of at most ~`max` chars, timed by length. */
function captionCues(s: ManifestSentence, max = 84): ManifestCaption[] {
  const parts: string[] = [];
  const split = (t: string) => {
    if (t.length <= max) return parts.push(t);
    // break at the clause boundary closest to the middle, else at a space
    const mid = t.length / 2;
    let best = -1;
    for (const m of t.matchAll(/[,;:—](?=\s)/g)) {
      const i = m.index! + 1;
      if (best < 0 || Math.abs(i - mid) < Math.abs(best - mid)) best = i;
    }
    if (best < 0 || Math.abs(best - mid) > t.length * 0.3) {
      best = t.lastIndexOf(' ', Math.round(mid));
      if (best <= 0) best = t.indexOf(' ', Math.round(mid));
    }
    split(t.slice(0, best).trim());
    split(t.slice(best).trim());
  };
  split(s.caption);
  const total = parts.reduce((a, p) => a + p.length, 0);
  let t = s.start;
  return parts.map((text) => {
    const d = ((s.end - s.start) * text.length) / total;
    const cue = { start: t, end: t + d, text };
    t += d;
    return cue;
  });
}

function vttTime(t: number): string {
  const ms = Math.round(t * 1000);
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  const pad = (n: number, w = 2) => String(n).padStart(w, '0');
  return `${pad(h)}:${pad(m)}:${pad(s)}.${pad(ms % 1000, 3)}`;
}

function firstProblem(script: ParsedScript): { id: string; title: string; url: string } {
  let fp = script.firstProblem;
  if (!fp) {
    // Read the site's own data so the end card always names the real first problem.
    const sections = fs.readFileSync(path.join(SITE, 'src/data/sections.ts'), 'utf8');
    const at = sections.indexOf(`id: '${script.section}'`);
    const id = at >= 0 ? sections.slice(at).match(/problems:\s*\[\s*'([^']+)'/)?.[1] : undefined;
    if (id) {
      const dir = path.join(SITE, 'src/data/problems');
      for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.ts'))) {
        const src = fs.readFileSync(path.join(dir, f), 'utf8');
        const t = src.match(new RegExp(`id:\\s*'${id}',\\s*title:\\s*['"\`]([^'"\`]+)`));
        if (t) {
          fp = { id, title: t[1] };
          break;
        }
      }
    }
  }
  if (!fp) throw new Error(`No first problem found for section ${script.section}; set first_problem in the front matter`);
  return { ...fp, url: `mlgrind.github.io/problem/${script.section}/${fp.id}` };
}

async function main() {
  const lecture = process.argv[2];
  if (!lecture) {
    console.error('usage: npm run narrate <lecture>   (a file in scripts/, without .md)');
    process.exit(1);
  }
  const script = parseScript(path.join(ROOT, 'scripts', `${lecture}.md`));
  const t0 = Date.now();

  // Flatten sentences -> chunks (a sentence over 1600 chars is split further).
  const flat = script.paragraphs.flatMap((p) => p.sentences.map((text) => ({ p, text })));
  const jobs = flat.flatMap((s, si) => chunkText(s.text, MAX_CHARS).map((text) => ({ si, text })));
  console.log(`${lecture}: ${flat.length} sentences, ${jobs.length} requests, voice ${VOICE}`);
  const pcms = await pool(jobs, WORKERS, (j) => tts(j.text));

  const perSentence: Buffer[] = flat.map(() => Buffer.alloc(0));
  jobs.forEach((j, i) => (perSentence[j.si] = Buffer.concat([perSentence[j.si], pcms[i]])));

  const pieces: Buffer[] = [silence(LEAD_IN)];
  let cursor = LEAD_IN;
  const sentences: ManifestSentence[] = [];
  flat.forEach((s, i) => {
    if (i > 0) {
      const prev = flat[i - 1].p;
      const gap = prev.chapter !== s.p.chapter ? GAP_CHAPTER : prev.index !== s.p.index ? GAP_PARAGRAPH : GAP_SENTENCE;
      pieces.push(silence(gap));
      cursor += gap;
    }
    const audio = trimSilence(perSentence[i]);
    const dur = audio.length / 2 / SAMPLE_RATE;
    let caption = s.text;
    for (const [from, to] of Object.entries(script.captionReplace)) {
      // whole words only: "d k" must not match "and keys"
      const esc = from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      caption = caption.replace(new RegExp(`\\b${esc}\\b`, 'g'), to);
    }
    sentences.push({ text: s.text, caption, start: cursor, end: cursor + dur, chapter: s.p.chapter, paragraph: s.p.index });
    pieces.push(audio);
    cursor += dur;
  });
  pieces.push(silence(TAIL));
  cursor += TAIL;

  const durationInFrames = Math.ceil(cursor * FPS);
  const durationSec = durationInFrames / FPS;
  const outroSentence = sentences.find((s) => s.chapter === -1);
  const outroStart = outroSentence ? outroSentence.start - 0.4 : sentences[sentences.length - 1].end + 0.3;
  const chapters = script.chapters.map((c, index) => {
    const own = sentences.filter((s) => s.chapter === index);
    // a chapter starts in the gap just before its first word
    const start = index === 0 ? 0 : own[0].start - 0.5;
    return { index, title: c.title, start, end: 0, estimatedStart: c.t };
  });
  chapters.forEach((c, i) => (c.end = i + 1 < chapters.length ? chapters[i + 1].start : outroStart));

  const captions = sentences.flatMap((s) => captionCues(s));
  const outDir = path.join(ROOT, 'out', lecture);
  const pubDir = path.join(ROOT, 'public', lecture);
  fs.mkdirSync(outDir, { recursive: true });
  fs.mkdirSync(pubDir, { recursive: true });

  const pcm = Buffer.concat(pieces);
  fs.writeFileSync(path.join(pubDir, 'narration.wav'), wav(pcm));

  const vtt = ['WEBVTT', ''];
  captions.forEach((c, i) => vtt.push(String(i + 1), `${vttTime(c.start)} --> ${vttTime(c.end)}`, c.text, ''));
  fs.writeFileSync(path.join(outDir, `${lecture}.vtt`), vtt.join('\n'));

  const characters = flat.reduce((a, s) => a + s.text.length, 0);
  const manifest: LectureManifest = {
    lecture,
    section: script.section,
    title: script.title,
    voice: VOICE,
    sampleRate: SAMPLE_RATE,
    fps: FPS,
    width: 1920,
    height: 1080,
    durationSec,
    durationInFrames,
    outroStart,
    chapters,
    sentences,
    captions,
    problem: firstProblem(script),
    characters,
    charactersBilled: billed,
    files: {
      audio: `public/${lecture}/narration.wav`,
      vtt: `out/${lecture}/${lecture}.vtt`,
      manifest: `public/${lecture}/manifest.json`,
      video: `out/${lecture}/${lecture}.mp4`,
    },
    generatedAt: new Date().toISOString(),
  };
  const json = JSON.stringify(manifest, null, 2);
  fs.writeFileSync(path.join(pubDir, 'manifest.json'), json);
  fs.writeFileSync(path.join(outDir, 'manifest.json'), json);

  console.log(`duration ${durationSec.toFixed(2)}s (${durationInFrames} frames @ ${FPS}fps)`);
  for (const c of chapters) {
    console.log(`  ${c.start.toFixed(1).padStart(6)}s  ${c.title}   (estimate ${c.estimatedStart}s)`);
  }
  console.log(`  ${outroStart.toFixed(1).padStart(6)}s  [end card]`);
  console.log(`characters: ${characters} in script, ${billed} billed this run (rest from cache)`);
  console.log(`wrote ${path.relative(ROOT, pubDir)}/{narration.wav,manifest.json} and out/${lecture}/${lecture}.vtt in ${((Date.now() - t0) / 1000).toFixed(1)}s`);
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
