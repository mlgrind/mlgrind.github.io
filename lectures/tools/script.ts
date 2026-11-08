// Parses a lecture script: YAML front matter + plain spoken prose.
//
// ---
// section: transformers          # site section id (used for the end-card link)
// title: Attention and Transformers
// target_minutes: 4
// chapters:
//   - { t: 0, title: "Queries, keys and values" }   # t = estimated start (s)
// paragraph_chapters: [0, 0, 1, 2, 3, 4, outro]   # optional explicit mapping
// caption_replace: { "d k": "d_k" }                # optional, captions only
// first_problem: { id: ..., title: ... }           # optional end-card override
// ---
// Paragraphs are separated by blank lines.
import fs from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';

export interface ScriptChapter {
  t: number;
  title: string;
}

export interface ParsedParagraph {
  index: number;
  /** chapter index, or -1 for the outro (end card) */
  chapter: number;
  sentences: string[];
}

export interface ParsedScript {
  id: string;
  section: string;
  title: string;
  targetMinutes: number;
  chapters: ScriptChapter[];
  paragraphs: ParsedParagraph[];
  captionReplace: Record<string, string>;
  firstProblem?: { id: string; title: string };
}

const SENTENCE_SPLIT = /(?<=[.!?]["”’']?)\s+(?=["“A-Z0-9])/;

export function splitSentences(paragraph: string): string[] {
  return paragraph
    .replace(/\s+/g, ' ')
    .trim()
    .split(SENTENCE_SPLIT)
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * Assign paragraphs to chapters. With an explicit `paragraph_chapters` list we
 * use it. Otherwise: a short final paragraph (when there are more paragraphs
 * than chapters) is the outro, and every other paragraph goes to the chapter
 * whose estimated start `t` is closest to the paragraph's estimated start
 * (its character offset scaled to the target length), kept monotonic.
 */
function mapParagraphs(
  paras: string[],
  chapters: ScriptChapter[],
  targetSec: number,
  explicit?: (number | string)[],
): number[] {
  if (explicit) {
    if (explicit.length !== paras.length) {
      throw new Error(`paragraph_chapters has ${explicit.length} entries, script has ${paras.length} paragraphs`);
    }
    return explicit.map((v) => (v === 'outro' ? -1 : Number(v)));
  }
  const body = [...paras];
  let outro = false;
  const avg = paras.reduce((a, p) => a + p.length, 0) / paras.length;
  if (paras.length > chapters.length && paras[paras.length - 1].length < avg * 0.4) {
    body.pop();
    outro = true;
  }
  const total = body.reduce((a, p) => a + p.length, 0);
  const out: number[] = [];
  let offset = 0;
  let prev = 0;
  body.forEach((p, i) => {
    const est = (offset / total) * targetSec;
    let best = 0;
    chapters.forEach((c, ci) => {
      if (Math.abs(c.t - est) < Math.abs(chapters[best].t - est)) best = ci;
    });
    // monotonic, never skip a chapter, and the first paragraph opens chapter 0
    best = i === 0 ? 0 : Math.min(Math.max(best, prev), prev + 1);
    out.push(best);
    prev = best;
    offset += p.length;
  });
  if (outro) out.push(-1);
  const used = new Set(out.filter((c) => c >= 0));
  if (used.size !== chapters.length) {
    throw new Error(
      `Could not map paragraphs to all ${chapters.length} chapters (got ${[...used].join(',')}); ` +
        'add an explicit paragraph_chapters list to the front matter.',
    );
  }
  return out;
}

export function parseScript(file: string): ParsedScript {
  const raw = fs.readFileSync(file, 'utf8');
  const m = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!m) throw new Error(`${file}: missing YAML front matter`);
  const fm = YAML.parse(m[1]) as Record<string, any>;
  const chapters: ScriptChapter[] = (fm.chapters ?? []).map((c: any) => ({ t: Number(c.t), title: String(c.title) }));
  if (!chapters.length) throw new Error(`${file}: front matter needs at least one chapter`);
  const paras = m[2]
    .trim()
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
  const targetSec = Number(fm.target_minutes ?? 4) * 60;
  const mapping = mapParagraphs(paras, chapters, targetSec, fm.paragraph_chapters);
  return {
    id: path.basename(file, '.md'),
    section: String(fm.section ?? path.basename(file, '.md')),
    title: String(fm.title),
    targetMinutes: Number(fm.target_minutes ?? 4),
    chapters,
    paragraphs: paras.map((p, i) => ({ index: i, chapter: mapping[i], sentences: splitSentences(p) })),
    captionReplace: fm.caption_replace ?? {},
    firstProblem: fm.first_problem,
  };
}

/** Split text into pieces of at most `cap` chars, on sentence then clause boundaries. */
export function chunkText(text: string, cap = 1600): string[] {
  if (text.length <= cap) return [text];
  const out: string[] = [];
  let cur = '';
  const pieces = text.split(/(?<=[.!?;,])\s+/);
  for (let piece of pieces) {
    while (piece.length > cap) {
      out.push(piece.slice(0, cap));
      piece = piece.slice(cap);
    }
    if (cur && cur.length + piece.length + 1 > cap) {
      out.push(cur);
      cur = piece;
    } else {
      cur = cur ? `${cur} ${piece}` : piece;
    }
  }
  if (cur) out.push(cur);
  return out;
}
