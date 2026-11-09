import React from 'react';
import { useCurrentFrame } from 'remotion';
import type { SceneProps } from '..';
import { C, F, rgba } from '../../theme';
import { ease, windowed } from '../../lib/anim';
import { Layer, ProblemChip, Tex } from '../../components/ui';
import { Bars, Panel } from '../../components/plot';
import { MC_HIST, MC_TRIALS, REJ, RESIDUAL, SPEC, SPEC_K, SPEC_VOCAB } from './data';

const CELL: React.CSSProperties = {
  width: 230,
  height: 68,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontFamily: F.mono,
  fontSize: 28,
  color: C.text,
};

export const SpeculativeScene: React.FC<SceneProps> = ({ cues, durationInFrames }) => {
  const frame = useCurrentFrame();

  const draftAt = cues.at('proposes several');
  const targetAt = cues.at('one parallel forward');
  const acceptAt = cues.at('Each draft token is accepted');
  const acceptEnd = cues.end('Each draft token is accepted');
  const rejectAt = cues.at('At the first rejection');
  const leftAt = cues.at('leftover distribution');
  const markAt = cues.sentence('Remarkably');
  const chip = ease(frame, cues.sentence("That's Speculative"), 20);

  const fr = SPEC.firstReject;
  const verdictAt = (i: number) => acceptAt + 40 + ((acceptEnd - acceptAt - 40) * i) / (fr + 1);
  const rej = ease(frame, rejectAt, 16);

  const rows: { label: string; at: number; cell: (i: number) => React.ReactNode; color?: string }[] = [
    { label: 'p target', at: targetAt, cell: (i) => SPEC.steps[i].target[SPEC.steps[i].token].toFixed(2), color: C.teal },
    { label: 'q draft', at: draftAt + 20, cell: (i) => SPEC.steps[i].draft[SPEC.steps[i].token].toFixed(2), color: C.amber },
    { label: 'min(1, p/q)', at: acceptAt + 10, cell: (i) => SPEC.steps[i].accept.toFixed(2) },
    { label: 'u ~ U(0,1)', at: acceptAt + 30, cell: (i) => (i <= fr ? SPEC.steps[i].u.toFixed(2) : '–') },
  ];

  return (
    <>
      <Layer opacity={windowed(frame, 0, leftAt + 10)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingBottom: 30 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 250, fontFamily: F.body, fontSize: 26, color: C.amber, textAlign: 'right', paddingRight: 20, opacity: ease(frame, draftAt, 16) }}>
            draft proposes
          </div>
          {Array.from({ length: SPEC_K }, (_, i) => {
            const p = ease(frame, draftAt + i * 6, 14);
            const after = i > fr;
            const isRej = i === fr;
            const ok = i < fr && frame > verdictAt(i);
            return (
              <div
                key={i}
                style={{
                  ...CELL,
                  borderRadius: 14,
                  fontSize: 34,
                  border: `2px solid ${isRej && rej > 0.5 ? C.rose : ok ? C.teal : rgba(C.amber, 0.6)}`,
                  background: rgba(isRej && rej > 0.5 ? C.rose : ok ? C.teal : C.amber, 0.14),
                  opacity: p * (after ? 1 - 0.7 * rej : 1),
                  textDecoration: (isRej || after) && rej > 0.5 ? 'line-through' : 'none',
                }}
              >
                {SPEC_VOCAB[SPEC.steps[i].token]}
              </div>
            );
          })}
        </div>
        <div style={{ marginTop: 18, marginLeft: 266, width: 4 * 230 + 3 * 16, height: 34, borderBottom: `3px solid ${C.teal}`, borderLeft: `3px solid ${C.teal}`, borderRight: `3px solid ${C.teal}`, borderRadius: '0 0 12px 12px', opacity: ease(frame, targetAt, 16) }} />
        <div style={{ marginTop: 10, marginLeft: 266, fontFamily: F.body, fontSize: 26, color: C.teal, opacity: ease(frame, targetAt, 16) }}>target scores all {SPEC_K} in one pass</div>

        <div style={{ marginTop: 30, display: 'flex', flexDirection: 'column', gap: 6 }}>
          {rows.map((r) => (
            <div key={r.label} style={{ display: 'flex', alignItems: 'center', gap: 16, opacity: ease(frame, r.at, 16) }}>
              <div style={{ width: 250, fontFamily: F.mono, fontSize: 26, color: r.color ?? C.muted, textAlign: 'right', paddingRight: 20 }}>{r.label}</div>
              {Array.from({ length: SPEC_K }, (_, i) => (
                <div key={i} style={{ ...CELL, color: r.color ?? C.text, opacity: i > fr ? 1 - 0.7 * rej : 1 }}>
                  {r.cell(i)}
                </div>
              ))}
            </div>
          ))}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 250, fontFamily: F.mono, fontSize: 26, color: C.muted, textAlign: 'right', paddingRight: 20, opacity: ease(frame, acceptAt + 40, 16) }}>u &lt; accept?</div>
            {Array.from({ length: SPEC_K }, (_, i) => (
              <div key={i} style={{ ...CELL, fontSize: 30, color: i < fr ? C.teal : C.rose, opacity: i <= fr ? ease(frame, verdictAt(i), 12) : 0 }}>
                {i < fr ? 'accept' : 'reject'}
              </div>
            ))}
          </div>
        </div>
      </Layer>

      <Layer opacity={windowed(frame, leftAt, markAt + 6)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ height: 90, display: 'flex', alignItems: 'center' }}>
          <Tex size={52}>{`resample from  max(0, p − q) / Σ`}</Tex>
        </div>
        <div style={{ display: 'flex', gap: 40, marginTop: 20 }}>
          {[
            { t: 'target p', v: REJ.target, c: C.teal, at: leftAt },
            { t: 'draft q', v: REJ.draft, c: C.amber, at: leftAt + 10 },
            { t: 'leftover', v: RESIDUAL, c: C.violetLight, at: cues.at('clipped at zero') },
          ].map(({ t, v, c, at }) => (
            <Panel key={t} title={t} accent={c} style={{ width: 533, opacity: ease(frame, at, 16) }}>
              <Bars values={v} labels={SPEC_VOCAB} width={465} height={300} max={0.8} labelSize={22} valueSize={20} gap={10} color={() => c} />
            </Panel>
          ))}
        </div>
      </Layer>

      <Layer opacity={windowed(frame, markAt, durationInFrames + 30)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 60, marginTop: 10 }}>
          <Panel title="target p" accent={C.teal} style={{ width: 760 }}>
            <Bars values={REJ.target} labels={SPEC_VOCAB} width={690} height={320} max={0.6} labelSize={24} color={() => C.teal} />
          </Panel>
          <Panel title={`speculative output, ${MC_TRIALS.toLocaleString('en-US')} draws`} accent={C.violetLight} style={{ width: 760, opacity: ease(frame, markAt + 30, 18) }}>
            <Bars values={MC_HIST} labels={SPEC_VOCAB} width={690} height={320} max={0.6} labelSize={24} color={() => C.violetLight} reveal={() => ease(frame, markAt + 30, 30)} />
          </Panel>
        </div>
        <div style={{ marginTop: 30, height: 70 }}>
          <ProblemChip title="Speculative Decoding" progress={chip} />
        </div>
      </Layer>
    </>
  );
};
