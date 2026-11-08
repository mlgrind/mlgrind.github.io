// npm run render <lecture> [-- --out <dir>] [--stills] [--frames 0-299] [--concurrency N]
//
// Bundles the Remotion project and renders out/<lecture>/<lecture>.mp4
// (H.264 + AAC, 1920x1080 @ 30fps) from public/<lecture>/manifest.json and
// narration.wav. --stills also writes one PNG per chapter. --out copies the
// MP4, VTT, manifest and stills to another directory.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { bundle } from '@remotion/bundler';
import { renderMedia, renderStill, selectComposition } from '@remotion/renderer';
import type { LectureManifest } from '../src/types.ts';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/** Remotion's own headless-shell download may be blocked; prefer a local Chromium. */
function findBrowser(): string | undefined {
  const candidates = [
    process.env.REMOTION_BROWSER_EXECUTABLE,
    '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell',
    '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome',
  ];
  return candidates.find((c): c is string => !!c && fs.existsSync(c));
}

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

async function main() {
  const lecture = process.argv[2];
  if (!lecture || lecture.startsWith('--')) {
    console.error('usage: npm run render <lecture> [-- --out <dir>] [--stills] [--frames a-b]');
    process.exit(1);
  }
  const manifestPath = path.join(ROOT, 'public', lecture, 'manifest.json');
  if (!fs.existsSync(manifestPath)) {
    console.error(`No manifest at ${path.relative(ROOT, manifestPath)}. Run: npm run narrate ${lecture}`);
    process.exit(1);
  }
  const manifest: LectureManifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const browserExecutable = findBrowser();
  const concurrency = Number(arg('concurrency') ?? Math.max(1, os.cpus().length));
  const outDir = path.join(ROOT, 'out', lecture);
  fs.mkdirSync(outDir, { recursive: true });

  const t0 = Date.now();
  console.log('bundling…');
  const serveUrl = await bundle({ entryPoint: path.join(ROOT, 'src/index.ts'), publicDir: path.join(ROOT, 'public') });
  const inputProps = { manifest };
  const composition = await selectComposition({ serveUrl, id: lecture, inputProps, browserExecutable });

  const stillsOnly = process.argv.includes('--stills-only');
  const files: string[] = [];
  if (process.argv.includes('--stills') || stillsOnly) {
    // one still per chapter, at the moment its main visual is fully built
    const at = (process.env.STILL_AT ?? '0.95').split(',').map(Number);
    for (const ch of manifest.chapters) {
      for (const f of at) {
        const frame = Math.round((ch.start + (ch.end - ch.start) * f) * manifest.fps);
        const suffix = at.length > 1 ? `-${Math.round(f * 100)}` : '';
        const out = path.join(outDir, `${lecture}-ch${ch.index + 1}${suffix}.png`);
        await renderStill({ serveUrl, composition, inputProps, frame, output: out, browserExecutable, imageFormat: 'png' });
        files.push(out);
        console.log(`still ${path.basename(out)} @ ${(frame / manifest.fps).toFixed(1)}s`);
      }
    }
    const extra = arg('still-frames');
    for (const s of extra ? extra.split(',') : []) {
      const out = path.join(outDir, `${lecture}-f${s}.png`);
      await renderStill({ serveUrl, composition, inputProps, frame: Number(s), output: out, browserExecutable, imageFormat: 'png' });
      files.push(out);
    }
  }

  let videoPath: string | undefined;
  if (!stillsOnly) {
    const frames = arg('frames')?.split('-').map(Number) as [number, number] | undefined;
    videoPath = path.join(outDir, `${lecture}.mp4`);
    let lastPct = -1;
    await renderMedia({
      serveUrl,
      composition,
      inputProps,
      codec: 'h264',
      audioCodec: 'aac',
      crf: 18,
      pixelFormat: 'yuv420p',
      outputLocation: videoPath,
      browserExecutable,
      concurrency,
      frameRange: frames ?? null,
      onProgress: ({ progress }) => {
        const pct = Math.floor(progress * 100);
        if (pct % 5 === 0 && pct !== lastPct) {
          lastPct = pct;
          console.log(`render ${pct}%  (${((Date.now() - t0) / 1000).toFixed(0)}s)`);
        }
      },
    });
    files.push(videoPath);
  }
  const elapsed = (Date.now() - t0) / 1000;
  console.log(`done in ${elapsed.toFixed(0)}s`);

  const copyTo = arg('out');
  if (copyTo) {
    fs.mkdirSync(copyTo, { recursive: true });
    const vtt = path.join(outDir, `${lecture}.vtt`);
    for (const f of [...files, vtt, path.join(outDir, 'manifest.json')]) {
      if (fs.existsSync(f)) fs.copyFileSync(f, path.join(copyTo, path.basename(f)));
    }
    console.log(`copied outputs to ${copyTo}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
