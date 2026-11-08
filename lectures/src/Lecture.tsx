import React, { useEffect, useState } from 'react';
import {
  AbsoluteFill,
  Audio,
  Sequence,
  continueRender,
  delayRender,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { C, F, H, STAGE, W, rgba } from './theme';
import { ease, makeCues, windowed } from './lib/anim';
import { Eyebrow } from './components/ui';
import { SCENES, type SceneComponent } from './scenes';
import type { LectureManifest } from './types';

const FONTS = [
  '400 20px "DM Sans"',
  '500 20px "DM Sans"',
  '600 20px "DM Sans"',
  '400 20px "Instrument Serif"',
  'italic 400 20px "Instrument Serif"',
  '400 20px "JetBrains Mono"',
  '500 20px "JetBrains Mono"',
];

function useFonts() {
  const [handle] = useState(() => delayRender('Loading fonts'));
  useEffect(() => {
    Promise.all(FONTS.map((f) => document.fonts.load(f)))
      .then(() => document.fonts.ready)
      .then(() => continueRender(handle))
      .catch(() => continueRender(handle));
  }, [handle]);
}

const Background: React.FC = () => {
  const frame = useCurrentFrame();
  const drift = Math.sin(frame / 240) * 4;
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <AbsoluteFill
        style={{
          background: [
            `radial-gradient(ellipse 70% 60% at ${12 + drift}% 0%, ${rgba('#6c5ce7', 0.13)} 0%, transparent 60%)`,
            `radial-gradient(ellipse 55% 50% at ${90 - drift}% 8%, ${rgba(C.teal, 0.05)} 0%, transparent 55%)`,
            `radial-gradient(ellipse 50% 45% at 50% 105%, ${rgba('#6c5ce7', 0.07)} 0%, transparent 60%)`,
          ].join(','),
        }}
      />
      <AbsoluteFill style={{ boxShadow: `inset 0 0 220px ${rgba(C.bgDeep, 0.9)}` }} />
    </AbsoluteFill>
  );
};

const Header: React.FC<{ m: LectureManifest }> = ({ m }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const idx = m.chapters.findIndex((c) => t >= c.start && t < c.end);
  const ch = idx >= 0 ? m.chapters[idx] : null;
  const local = ch ? (t - ch.start) * fps : 0;
  const shown = ch ? ease(local, 6, 20) : 0;
  const headerIn = ease(frame, 0, 24);
  return (
    <div
      style={{
        position: 'absolute',
        top: 52,
        left: 120,
        right: 120,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        opacity: headerIn,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 12, height: 12, borderRadius: 3, background: C.violet, boxShadow: `0 0 18px ${rgba(C.violet, 0.8)}` }} />
          <span style={{ fontFamily: F.mono, fontSize: 18, letterSpacing: '0.16em', color: C.violetLight }}>ML GRIND</span>
        </div>
        <div style={{ width: 1, height: 24, background: C.line2 }} />
        <span style={{ fontFamily: F.body, fontSize: 24, color: C.muted }}>{m.title}</span>
      </div>
      {ch && (
        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            gap: 16,
            opacity: shown,
            transform: `translateY(${(1 - shown) * -10}px)`,
          }}
        >
          <span style={{ fontFamily: F.mono, fontSize: 18, color: C.dim }}>
            {String(idx + 1).padStart(2, '0')} / {String(m.chapters.length).padStart(2, '0')}
          </span>
          <span style={{ fontFamily: F.body, fontSize: 24, fontWeight: 500, color: C.text }}>{ch.title}</span>
        </div>
      )}
    </div>
  );
};

const Progress: React.FC<{ m: LectureManifest }> = ({ m }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const segs = [...m.chapters.map((c) => ({ start: c.start, end: c.end })), { start: m.outroStart, end: m.durationSec }];
  const width = W - 240;
  const gap = 8;
  const total = m.durationSec;
  return (
    <div style={{ position: 'absolute', left: 120, bottom: 46, width, height: 4, display: 'flex', gap }}>
      {segs.map((s, i) => {
        const fill = Math.max(0, Math.min(1, (t - s.start) / (s.end - s.start)));
        const w = ((s.end - s.start) / total) * (width - gap * (segs.length - 1));
        return (
          <div key={i} style={{ width: w, height: 4, borderRadius: 2, background: rgba(C.text, 0.08), overflow: 'hidden' }}>
            <div style={{ width: `${fill * 100}%`, height: '100%', background: i < m.chapters.length ? C.violet : C.violetLight }} />
          </div>
        );
      })}
    </div>
  );
};

const Captions: React.FC<{ m: LectureManifest }> = ({ m }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const cue = m.captions.find((c) => t >= c.start && t < c.end + 0.25);
  if (!cue) return null;
  const local = (t - cue.start) * fps;
  const o = Math.min(ease(local, 0, 6), 1 - ease((t - cue.end) * fps, 0, 7));
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, bottom: 84, display: 'flex', justifyContent: 'center' }}>
      <div
        style={{
          maxWidth: 1480,
          padding: '12px 28px',
          borderRadius: 14,
          background: rgba(C.bgDeep, 0.72),
          border: `1px solid ${rgba(C.text, 0.06)}`,
          fontFamily: F.body,
          fontSize: 36,
          fontWeight: 500,
          lineHeight: 1.35,
          color: C.text,
          textAlign: 'center',
          opacity: o,
        }}
      >
        {cue.text}
      </div>
    </div>
  );
};

/** Big chapter title shown in the stage for the first moments of a chapter. */
const ChapterIntro: React.FC<{ index: number; title: string; m: LectureManifest; until: number }> = ({ index, title, m, until }) => {
  const frame = useCurrentFrame();
  const o = windowed(frame, 0, until, 14);
  if (o <= 0) return null;
  const isFirst = index === 0;
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', opacity: o, paddingBottom: 120 }}>
      <Eyebrow style={{ marginBottom: 26, opacity: ease(frame, 2, 20) }}>
        {isFirst ? 'Lecture' : `Chapter ${String(index + 1).padStart(2, '0')}`}
      </Eyebrow>
      <div
        style={{
          fontFamily: F.display,
          fontSize: isFirst ? 132 : 104,
          color: C.text,
          letterSpacing: '-0.01em',
          transform: `translateY(${(1 - ease(frame, 0, 26)) * 24}px)`,
        }}
      >
        {isFirst ? m.title : title}
      </div>
      {isFirst && (
        <div style={{ marginTop: 26, fontFamily: F.body, fontSize: 28, color: C.muted, opacity: ease(frame, 14, 24) }}>
          {m.chapters.length} chapters · {Math.round(m.durationSec / 60)} minutes
        </div>
      )}
    </AbsoluteFill>
  );
};

const EndCard: React.FC<{ m: LectureManifest }> = ({ m }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const cues = makeCues(m.sentences.filter((s) => s.chapter === -1), m.outroStart, fps);
  const second = m.sentences.filter((s) => s.chapter === -1)[1];
  const cardAt = second ? cues.sentence(second.text.slice(0, 12)) - 6 : 50;
  const chipsOut = 1 - ease(frame, cardAt - 10, 16);
  const card = ease(frame, cardAt, 26);
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', paddingBottom: 110 }}>
      <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column-reverse', gap: 14, opacity: chipsOut, alignItems: 'center' }}>
        {m.chapters.map((c, i) => {
          const p = ease(frame, 8 + i * 6, 18);
          return (
            <div
              key={i}
              style={{
                padding: '16px 26px',
                width: 620,
                borderRadius: 14,
                border: `1px solid ${C.line2}`,
                background: rgba(C.panel2, 0.8),
                display: 'flex',
                gap: 14,
                alignItems: 'baseline',
                opacity: p,
                transform: `translateY(${(1 - p) * 18}px)`,
              }}
            >
              <span style={{ fontFamily: F.mono, fontSize: 16, color: C.violetLight }}>{String(i + 1).padStart(2, '0')}</span>
              <span style={{ fontFamily: F.body, fontSize: 28, color: C.text }}>{c.title}</span>
            </div>
          );
        })}
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          opacity: card,
          transform: `translateY(${(1 - card) * 26}px)`,
        }}
      >
        <Eyebrow>Up next on ML Grind</Eyebrow>
        <div style={{ fontFamily: F.display, fontSize: 116, color: C.text, marginTop: 28, letterSpacing: '-0.01em' }}>
          {m.problem.title}
        </div>
        <div
          style={{
            marginTop: 40,
            display: 'flex',
            alignItems: 'center',
            gap: 18,
            padding: '18px 30px',
            borderRadius: 14,
            background: rgba(C.violet, 0.14),
            border: `1px solid ${rgba(C.violetLight, 0.35)}`,
          }}
        >
          <span style={{ fontFamily: F.mono, fontSize: 24, color: C.violetLight }}>{m.problem.url}</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const Lecture: React.FC<{ manifest: LectureManifest | null }> = ({ manifest }) => {
  useFonts();
  const { fps } = useVideoConfig();
  if (!manifest) return <AbsoluteFill style={{ background: C.bg }} />;
  const m = manifest;
  const scenes: SceneComponent[] = SCENES[m.lecture] ?? [];
  const outroFrom = Math.round(m.outroStart * fps);
  return (
    <AbsoluteFill style={{ width: W, height: H, overflow: 'hidden', fontFamily: F.body }}>
      <Background />
      <Audio src={staticFile(`${m.lecture}/narration.wav`)} />
      {m.chapters.map((ch, i) => {
        const from = Math.round(ch.start * fps);
        const dur = Math.round(ch.end * fps) - from;
        const sentences = m.sentences.filter((s) => s.chapter === i);
        const cues = makeCues(sentences, ch.start, fps);
        const Scene = scenes[i];
        // the intro title holds until the chapter's visuals start
        const until = i === 0 ? cues.sentence(sentences[1].text.slice(0, 12)) : Math.round(1.8 * fps);
        return (
          <Sequence key={i} from={from} durationInFrames={dur} name={ch.title}>
            <SceneFrame dur={dur}>
              <div style={{ position: 'absolute', left: STAGE.left, top: STAGE.top, width: STAGE.right - STAGE.left, height: STAGE.bottom - STAGE.top }}>
                {Scene ? <Scene chapter={ch} sentences={sentences} cues={cues} durationInFrames={dur} manifest={m} /> : null}
              </div>
              <ChapterIntro index={i} title={ch.title} m={m} until={until} />
            </SceneFrame>
          </Sequence>
        );
      })}
      <Sequence from={outroFrom} name="End card">
        <EndCard m={m} />
      </Sequence>
      <Header m={m} />
      <Captions m={m} />
      <Progress m={m} />
    </AbsoluteFill>
  );
};

/** Fades a whole chapter in and out at its edges. */
const SceneFrame: React.FC<{ dur: number; children: React.ReactNode }> = ({ dur, children }) => {
  const frame = useCurrentFrame();
  const o = 1 - ease(frame, dur - 14, 14);
  return <AbsoluteFill style={{ opacity: o }}>{children}</AbsoluteFill>;
};
