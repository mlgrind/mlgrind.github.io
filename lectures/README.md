# ML Grind lecture videos

A small pipeline that turns an ML Grind lecture script into a narrated,
animated 1920×1080 MP4 lecture:

1. **Narration**: [Deepgram Aura](https://developers.deepgram.com/docs/tts-rest) text-to-speech, one request per sentence, so every sentence and chapter has an exact start time.
2. **Visuals**: [Remotion](https://www.remotion.dev) (React → video). Scenes are timed to the narration and styled after the site (dark background, violet accent, DM Sans, Instrument Serif, JetBrains Mono).

This folder is self-contained: it has its own `package.json` and
`node_modules`, and the site's lint, type-check, tests and build don't
touch it (`lectures/**` is in the ESLint ignores; the site's `tsconfig` and
Vitest only include `src/`).

## Setup

```bash
cd lectures
npm install
```

Needs Node ≥ 22.12. Remotion ships its own ffmpeg, so none needs to be installed.
Rendering needs a Chromium. `tools/render.ts` uses the first of these that
exists, which avoids Remotion's own headless-shell download:

- `$REMOTION_BROWSER_EXECUTABLE`
- `/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell`
- `/opt/pw-browsers/chromium-1243/chrome-linux64/chrome`

If none exists, Remotion downloads its headless shell.

## Usage

```bash
npm run narrate transformers   # scripts/transformers.md -> audio, manifest, captions
npm run render transformers    # -> out/transformers/transformers.mp4
npm run render transformers -- --stills          # also one PNG per chapter
npm run render transformers -- --out ~/videos    # copy MP4, VTT, manifest, stills there
npm run render transformers -- --frames 0-299    # render a range while iterating
npm run studio                 # Remotion Studio, live preview with scrubbing
```

`narrate` writes:

| File | What |
|------|------|
| `public/<lecture>/narration.wav` | 24 kHz mono narration used by the composition |
| `public/<lecture>/manifest.json` | duration, chapters with real start times, every sentence's start/end, caption cues, the end-card problem, characters billed (also copied to `out/<lecture>/`) |
| `out/<lecture>/<lecture>.vtt` | WebVTT captions (sentence-level, long sentences split at clause boundaries) |

`render` writes `out/<lecture>/<lecture>.mp4` (H.264 + AAC) and, with
`--stills`, `out/<lecture>/<lecture>-ch<N>.png`. All generated files are
gitignored.

### Deepgram

| Env var | Default | |
|---------|---------|---|
| `DEEPGRAM_API_KEY` | `proxy-injected` | Sent as `Authorization: Token …`. In the Claude sandbox the network proxy injects the real key, so leave it unset there. Never commit a key. |
| `DEEPGRAM_VOICE` (or `DEEPGRAM_VOICE_A`) | `aura-2-athena-en` | Deepgram Aura-2 voice used for every ML Grind lecture. |
| `DEEPGRAM_CONCURRENCY` | `6` | Requests in flight. |

The request is `POST https://api.deepgram.com/v1/speak?model=<voice>&encoding=linear16&sample_rate=24000&container=none`
with `{"text": …}`. Deepgram rejects text over 2000 characters, so anything
longer than 1600 is split at sentence, then clause, boundaries. Audio is cached
in `.cache/tts/` by `sha256(voice + text)`, so re-running `narrate` after an
edit only bills the sentences that changed (the run prints how many
characters were billed). `npm run narrate` sets `NODE_USE_ENV_PROXY=1` so
Node's `fetch` goes through `HTTPS_PROXY`.

Silence is added between pieces (1.0 s lead-in, 0.3 s between sentences,
0.7 s between paragraphs, 1.1 s between chapters, 4 s on the end card), and
each sentence's own leading/trailing silence is trimmed, so the pacing is set
here rather than by the TTS.

## Adding a lecture

1. Write `scripts/<id>.md`: YAML front matter, then plain spoken prose with
   paragraphs separated by blank lines.

   ```yaml
   ---
   section: transformers            # site section id; the end card links its first problem
   title: Attention and Transformers
   target_minutes: 4
   chapters:                        # t = estimated start in seconds (only used for mapping)
     - { t: 0, title: "Queries, keys and values" }
     - { t: 72, title: "Why we scale" }
   # optional:
   paragraph_chapters: [0, 0, 1, outro]   # explicit paragraph -> chapter mapping
   caption_replace: { "d k": "d_k" }      # captions only, whole words
   first_problem: { id: scaled-dot-product-attention, title: Scaled Dot-Product Attention }
   ---
   ```

   Without `paragraph_chapters`, each paragraph goes to the chapter whose
   estimated `t` is closest to the paragraph's estimated start, and a short
   final paragraph becomes the outro (end card). Real chapter times are always
   measured from the audio. Spell things the way they should be spoken ("d k",
   not "d_k"), and use `caption_replace` for the on-screen form.
2. Add the id to `LECTURES` in `src/Root.tsx`.
3. `npm run narrate <id>`. With no scenes registered the video already works:
   chapter titles, captions, progress bar and end card over an empty stage.
4. Add scenes in `src/scenes/<id>/` (one component per chapter) and register
   them in `src/scenes/index.ts`. Each scene gets a `cues` helper that maps a
   phrase in the narration to a frame:

   ```tsx
   const fillStart = cues.at('compare it');          // when "compare it" is spoken
   const end = cues.end('To answer your query');     // end of that sentence
   const p = ease(frame, fillStart, 18);             // animate from there
   ```

   `cues` throws if a phrase is missing, so editing a script in a way that
   breaks a scene fails at render time instead of silently drifting. Compute
   every on-screen number in code (see `src/scenes/transformers/data.ts` and
   `src/lib/math.ts`); don't type numbers in.
5. `npm run render <id> -- --stills` and look at the stills.

## Layout

```
lectures/
├── scripts/              lecture scripts (front matter + spoken prose)
├── tools/
│   ├── script.ts         parser: chapters, paragraphs, sentence split, chunking
│   ├── narrate.ts        Deepgram TTS, cache, WAV, manifest, WebVTT
│   └── render.ts         bundle + render MP4 / stills with a local Chromium
└── src/
    ├── Root.tsx          one <Composition> per lecture, sized from the manifest
    ├── Lecture.tsx       shell: background, header, chapter label, captions, progress, end card
    ├── theme.ts          site palette and fonts
    ├── fonts.css         self-hosted fonts (@fontsource), no network at render time
    ├── components/ui.tsx Matrix, Tex (inline math), chips, arrows
    ├── lib/              math (seeded RNG, softmax, layer norm, PE…) and animation helpers
    └── scenes/transformers/   one scene per chapter + data.ts with the computed examples
```

## Licence note

Remotion is not MIT-licensed. It is free for individuals and small teams, but
companies above a certain team size need a company licence. Check
[remotion.dev/license](https://www.remotion.dev/license) before using this
pipeline commercially.
