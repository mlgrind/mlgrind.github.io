import React from 'react';
import { useCurrentFrame } from 'remotion';
import type { SceneProps } from '..';
import { C, F, rgba } from '../../theme';
import { ease, lin, windowed } from '../../lib/anim';
import { Arrow, Layer, Matrix, ProblemChip, Tex, signedColor, weightColor } from '../../components/ui';
import { A_RAW, K, KT, O_RAW, Q, S_RAW, TOKENS, V, X } from './data';

const SENTENCE = ['the', 'trophy', "didn't", 'fit', 'in', 'the', 'suitcase', 'because', 'it', 'was', 'too', 'big'];
const IT = 8;
// Illustrative emphasis for the opening sentence only (no numbers are shown).
const EMPHASIS: Record<number, number> = { 1: 1, 6: 0.45 };

const FS = 34;
const CHAR = FS * 0.6; // JetBrains Mono advance width
const PAD = 14;
const GAP = 14;

/** Word chips with attention arcs drawn from "it". */
const SentenceArcs: React.FC<{ frame: number; itAt: number; everyAt: number }> = ({ frame, itAt, everyAt }) => {
  const widths = SENTENCE.map((w) => w.length * CHAR + PAD * 2);
  const total = widths.reduce((a, b) => a + b, 0) + GAP * (SENTENCE.length - 1);
  const x0 = (1680 - total) / 2;
  const xs: number[] = [];
  let x = x0;
  widths.forEach((w) => {
    xs.push(x + w / 2);
    x += w + GAP;
  });
  const y = 430;
  const itP = ease(frame, itAt, 20);
  const everyP = ease(frame, everyAt, 30);
  const arc = (a: number, b: number) => {
    const h = 70 + Math.abs(b - a) * 22;
    return `M ${xs[a]} ${y - 34} C ${xs[a]} ${y - 34 - h}, ${xs[b]} ${y - 34 - h}, ${xs[b]} ${y - 34}`;
  };
  return (
    <>
      <svg width={1680} height={700} style={{ position: 'absolute', inset: 0 }}>
        {/* every token looks at every other token */}
        {SENTENCE.map((_, a) =>
          SENTENCE.map((__, b) =>
            a < b && everyP > 0 ? (
              <path key={`${a}-${b}`} d={arc(a, b)} fill="none" stroke={C.dim} strokeWidth={1.2} opacity={0.35 * everyP} />
            ) : null,
          ),
        )}
        {SENTENCE.map((_, b) => {
          if (b === IT) return null;
          const w = EMPHASIS[b] ?? 0.12;
          const p = lin(frame, itAt + 6 + Math.abs(b - IT) * 2, itAt + 30 + Math.abs(b - IT) * 2);
          return (
            <path
              key={b}
              d={arc(Math.min(b, IT), Math.max(b, IT))}
              fill="none"
              stroke={w > 0.4 ? C.violetLight : C.violet}
              strokeWidth={1.5 + 5 * w}
              strokeLinecap="round"
              opacity={(0.25 + 0.75 * w) * itP * (1 - 0.6 * everyP)}
              pathLength={1}
              strokeDasharray={1}
              strokeDashoffset={1 - p}
            />
          );
        })}
      </svg>
      {SENTENCE.map((w, i) => {
        const appear = ease(frame, i * 2, 16);
        const isIt = i === IT;
        const emph = (EMPHASIS[i] ?? 0) * itP * (1 - everyP);
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: xs[i] - widths[i] / 2,
              top: y - 32,
              width: widths[i],
              height: 64,
              borderRadius: 12,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: F.mono,
              fontSize: FS,
              color: isIt && itP > 0.5 ? '#fff' : C.text,
              background: isIt
                ? rgba(C.violet, 0.15 + 0.6 * itP)
                : rgba(C.violetLight, 0.04 + 0.22 * emph) ,
              border: `1px solid ${isIt ? rgba(C.violetLight, 0.3 + 0.5 * itP) : rgba(C.text, 0.08 + 0.3 * emph)}`,
              opacity: appear,
              transform: `translateY(${(1 - appear) * 14}px)`,
            }}
          >
            {w}
          </div>
        );
      })}
    </>
  );
};

const NOTE: React.CSSProperties = { fontFamily: F.body, fontSize: 24, color: C.muted, textAlign: 'center', width: 320 };

export const QKVScene: React.FC<SceneProps> = ({ cues, durationInFrames }) => {
  const frame = useCurrentFrame();

  const p1 = [cues.sentence('Take the sentence'), cues.sentence('Here is how it works')];
  const p2 = [cues.sentence('Each token is turned'), cues.sentence('To answer your query')];
  const p3 = [p2[1], cues.sentence('A softmax turns')];
  const p4 = [p3[1], cues.sentence('The output is then')];
  const p5 = [p4[1], durationInFrames];

  // phase 2: X -> Q, K, V, then the library analogy under each
  const qAt = cues.at('a query');
  const kAt = cues.at('a key and');
  const vAt = cues.at('a value');
  const noteQ = cues.at('the question');
  const noteK = cues.at('the label');
  const noteV = cues.at("what's inside");

  // phase 3: scores fill cell by cell while "compare it against every key" is spoken
  const fillStart = cues.at('compare it');
  const fillEnd = cues.end('To answer your query', -0.4);
  const cellAt = (i: number, j: number) => fillStart + ((i * 4 + j) / 16) * (fillEnd - fillStart);
  const cur = Math.min(15, Math.max(0, Math.floor(((frame - fillStart) / (fillEnd - fillStart)) * 16)));
  const filling = frame >= fillStart && frame < fillEnd;
  const ci = Math.floor(cur / 4);
  const cj = cur % 4;

  // phase 4: softmax row by row
  const smStart = cues.at('turns those scores', 0.3);
  const rowAt = (i: number) => smStart + i * 10;

  // phase 5: output
  const outStart = cues.at('weighted average', 0);
  const chip = ease(frame, cues.sentence('You will build this'), 20);

  const small = { cellW: 72, cellH: 50, fontSize: 19, labelSize: 40 };
  const scoreColor = signedColor(6);

  return (
    <>
      <Layer opacity={windowed(frame, p1[0], p1[1])}>
        <SentenceArcs frame={frame - p1[0]} itAt={cues.at('what "it" means') - p1[0]} everyAt={cues.at('Every token gets') - p1[0]} />
      </Layer>

      <Layer opacity={windowed(frame, p2[0], p2[1])} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 46, paddingBottom: 40 }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
          <Matrix data={X} {...small} label="X" rowLabels={TOKENS} color={signedColor(3, 0.35)} />
          <div style={{ ...NOTE, width: 300, marginLeft: 70 }}>token embeddings</div>
        </div>
        <Arrow width={70} progress={ease(frame, qAt - 6, 14)} />
        {[
          { m: Q, l: 'Q = XW_Q', at: qAt, note: 'the question you ask', noteAt: noteQ },
          { m: K, l: 'K = XW_K', at: kAt, note: 'the label on each spine', noteAt: noteK },
          { m: V, l: 'V = XW_V', at: vAt, note: "what's inside the book", noteAt: noteV },
        ].map(({ m, l, at, note, noteAt }) => {
          const p = ease(frame, at, 18);
          const n = ease(frame, noteAt, 16);
          return (
            <div key={l} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, opacity: p, transform: `translateY(${(1 - p) * 20}px)` }}>
              <Matrix data={m} {...small} label={l} color={signedColor(2.5, 0.45)} />
              <div style={{ ...NOTE, opacity: n, color: C.violetLight }}>{note}</div>
            </div>
          );
        })}
      </Layer>

      <Layer opacity={windowed(frame, p3[0], p3[1])} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 40, paddingBottom: 30 }}>
        <Matrix data={Q} label="Q" rowLabels={TOKENS} color={signedColor(2.5, 0.4)} rowFocus={(i) => (filling ? (i === ci ? 1 : 0) : 1)} />
        <Tex size={56} color={C.muted}>·</Tex>
        <Matrix
          data={KT}
          label="K^T"
          colLabels={TOKENS}
          color={signedColor(2.5, 0.4)}
          reveal={(_, j) => (filling ? (j === cj ? 1 : 0.35) : 1)}
        />
        <Tex size={56} color={C.muted}>=</Tex>
        <Matrix
          data={S_RAW}
          label="QK^T"
          colLabels={TOKENS}
          color={scoreColor}
          reveal={(i, j) => ease(frame, cellAt(i, j), 8)}
        />
      </Layer>

      <Layer opacity={windowed(frame, p4[0], p4[1])} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 44, paddingBottom: 30 }}>
        <Matrix data={S_RAW} label="QK^T" rowLabels={TOKENS} colLabels={TOKENS} color={scoreColor} />
        <Arrow width={150} label="softmax" progress={ease(frame, smStart - 8, 14)} />
        <Matrix
          data={A_RAW}
          label="softmax(QK^T)"
          colLabels={TOKENS}
          color={weightColor()}
          reveal={(i) => ease(frame, rowAt(i), 12)}
        />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 92 }}>
          {A_RAW.map((row, i) => (
            <div key={i} style={{ height: 58, display: 'flex', alignItems: 'center', fontFamily: F.mono, fontSize: 20, color: C.teal, opacity: ease(frame, rowAt(i) + 8, 12) }}>
              Σ = {row.reduce((a, b) => a + b, 0).toFixed(2)}
            </div>
          ))}
        </div>
      </Layer>

      <Layer opacity={windowed(frame, p5[0], p5[1] + 30)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 50 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 40 }}>
          <Matrix data={A_RAW} label="weights" rowLabels={TOKENS} color={weightColor()} shape={false} />
          <Tex size={56} color={C.muted}>·</Tex>
          <Matrix data={V} label="V" color={signedColor(2.5, 0.45)} />
          <Tex size={56} color={C.muted}>=</Tex>
          <Matrix data={O_RAW} label="output" color={signedColor(2.5, 0.45)} reveal={(i) => ease(frame, outStart + 6 + i * 6, 12)} shape={false} />
        </div>
        <div style={{ height: 70 }}>
          <ProblemChip title="Scaled Dot-Product Attention" progress={chip} />
        </div>
      </Layer>
    </>
  );
};
