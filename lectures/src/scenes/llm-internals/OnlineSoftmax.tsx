import React from 'react';
import { useCurrentFrame } from 'remotion';
import type { SceneProps } from '..';
import { C, F, rgba } from '../../theme';
import { ease, lin, windowed } from '../../lib/anim';
import { Layer, ProblemChip, Tex } from '../../components/ui';
import { Bars, Panel } from '../../components/plot';
import { fmt } from '../../lib/math';
import { OS_B, OS_EXACT, OS_MAXERR, OS_P, OS_STEPS, OS_X } from './data';

const GRID = 24;
const CELL = 17;

export const OnlineSoftmaxScene: React.FC<SceneProps> = ({ cues, durationInFrames }) => {
  const frame = useCurrentFrame();

  const gridAt = cues.at('the matrix of scores');
  const slowAt = cues.at('slow memory');
  const neverAt = cues.sentence('FlashAttention never builds');
  const walkAt = cues.at('walks over the keys');
  const p2 = cues.sentence('The trick is the online');
  const blockAt = [cues.at('three running quantities'), cues.at('brings a bigger maximum'), cues.at('as if it had used')];
  const rescaleAt = cues.at('rescaled by the exponential');
  const divideAt = cues.at('Divide at the end');
  const trafficAt = cues.at('saves memory traffic');
  const chip = ease(frame, cues.sentence("You'll implement it"), 20);

  // phase A: a T x T grid; once FlashAttention starts, a key block sweeps across
  const sweep = lin(frame, walkAt, p2);
  const blockCol = Math.min(GRID / 4 - 1, Math.floor(sweep * (GRID / 4)));
  const flash = ease(frame, neverAt, 20);

  // phase B: which blocks have been processed
  const done = blockAt.filter((t) => frame >= t).length;
  const cur = done - 1;
  const step = cur >= 0 ? OS_STEPS[cur] : null;
  const final = ease(frame, divideAt, 20);

  return (
    <>
      <Layer opacity={windowed(frame, 0, p2 + 6)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 90, paddingBottom: 30 }}>
        <div style={{ position: 'relative', opacity: ease(frame, gridAt, 18) }}>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${GRID}, ${CELL}px)`, gap: 3 }}>
            {Array.from({ length: GRID * GRID }, (_, k) => {
              const i = Math.floor(k / GRID);
              const j = k % GRID;
              const inBlock = Math.floor(j / 4) === blockCol && i < 4;
              const a = flash > 0 ? (inBlock ? 0.85 : 0.07 * (1 - flash) + 0.04) : 0.3;
              return <div key={k} style={{ height: CELL, borderRadius: 3, background: rgba(inBlock && flash > 0 ? C.teal : C.violet, a) }} />;
            })}
          </div>
          <div style={{ marginTop: 16, textAlign: 'center', fontFamily: F.mono, fontSize: 24, color: C.muted }}>queries × keys: T² scores</div>
        </div>
        <div style={{ width: 640, display: 'flex', flexDirection: 'column', gap: 34 }}>
          <div style={{ fontFamily: F.body, fontSize: 32, color: C.rose, opacity: windowed(frame, slowAt, neverAt + 10) }}>
            standard attention writes all T² scores to slow GPU memory, then reads them back
          </div>
          <div style={{ fontFamily: F.body, fontSize: 32, color: C.teal, opacity: ease(frame, neverAt, 16) }}>
            FlashAttention keeps only one block of scores in fast memory at a time
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, opacity: ease(frame, walkAt + 20, 16) }}>
            {[
              ['m', 'running max'],
              ['l', 'running softmax sum'],
              ['acc', 'running unnormalized output'],
            ].map(([k, d]) => (
              <div key={k} style={{ display: 'flex', gap: 20, alignItems: 'baseline' }}>
                <Tex size={40} color={C.amber} style={{ width: 70 }}>{k}</Tex>
                <span style={{ fontFamily: F.body, fontSize: 28, color: C.muted }}>{d}</span>
              </div>
            ))}
          </div>
        </div>
      </Layer>

      <Layer opacity={windowed(frame, p2, durationInFrames + 30)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {/* scores in three blocks */}
        <div style={{ display: 'flex', gap: 34 }}>
          {[0, 1, 2].map((b) => (
            <div
              key={b}
              style={{
                display: 'flex',
                gap: 8,
                padding: 10,
                borderRadius: 16,
                border: `2px solid ${b === cur ? C.teal : b < done ? rgba(C.teal, 0.3) : C.line2}`,
                background: b === cur ? rgba(C.teal, 0.1) : 'transparent',
              }}
            >
              {OS_X.slice(b * OS_B, (b + 1) * OS_B).map((v, j) => {
                const isMax = step && Math.abs(v - step.m) < 1e-12 && b <= cur;
                return (
                  <div
                    key={j}
                    style={{
                      width: 100,
                      height: 62,
                      borderRadius: 10,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontFamily: F.mono,
                      fontSize: 26,
                      color: isMax ? C.bg : C.text,
                      background: isMax ? C.amber : rgba(C.text, 0.05),
                      opacity: b < done || done === 0 ? 1 : 0.4,
                    }}
                  >
                    {fmt(v, 2)}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        <div style={{ marginTop: 10, fontFamily: F.mono, fontSize: 22, color: C.muted }}>scores of one query, keys in blocks of {OS_B}</div>

        <div style={{ display: 'flex', gap: 40, marginTop: 30, alignItems: 'flex-start', opacity: final > 0.5 ? 0 : 1 }}>
          <Panel style={{ width: 760 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '170px repeat(3, 170px)', rowGap: 16, alignItems: 'center' }}>
              {['', 'block 1', 'block 2', 'block 3'].map((h, k) => (
                <div key={k} style={{ fontFamily: F.mono, fontSize: 22, color: k - 1 === cur ? C.teal : C.muted, textAlign: 'center' }}>{h}</div>
              ))}
              {[
                { k: 'm', f: (s: (typeof OS_STEPS)[number]) => fmt(s.m, 2) },
                { k: 'rescale', f: (s: (typeof OS_STEPS)[number]) => (s.block === 0 ? '–' : fmt(s.scale, 3)) },
                { k: 'l', f: (s: (typeof OS_STEPS)[number]) => fmt(s.l, 3) },
              ].map(({ k, f }) => (
                <React.Fragment key={k}>
                  <div style={{ fontFamily: F.mono, fontSize: 26, color: C.amber, textAlign: 'right', paddingRight: 20 }}>{k}</div>
                  {OS_STEPS.map((s, b) => (
                    <div key={b} style={{ fontFamily: F.mono, fontSize: 30, textAlign: 'center', color: k === 'rescale' && b === 1 ? C.rose : C.text, opacity: b < done ? ease(frame, blockAt[b] + 6, 14) : 0 }}>
                      {f(s)}
                    </div>
                  ))}
                </React.Fragment>
              ))}
            </div>
          </Panel>
          <div style={{ width: 760, display: 'flex', flexDirection: 'column', gap: 20, paddingTop: 20 }}>
            <Tex size={40}>{'m′ = max(m, max(block))'}</Tex>
            <Tex size={40} style={{ opacity: ease(frame, rescaleAt, 16) }}>{'l = l · e^{m − m′} + Σ e^{x − m′}'}</Tex>
            <div style={{ fontFamily: F.body, fontSize: 26, color: C.rose, opacity: ease(frame, rescaleAt, 16) }}>
              block 2 raises the max, so the old sum is multiplied by {fmt(OS_STEPS[1].scale, 3)}
            </div>
            <div style={{ fontFamily: F.body, fontSize: 26, color: C.muted, opacity: ease(frame, blockAt[2], 16) }}>block 3 has no new max: rescale is 1</div>
          </div>
        </div>

        <div style={{ position: 'absolute', top: 160, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 50, opacity: final }}>
          <Panel title="online: exp(x − m) / l" accent={C.teal} style={{ width: 760 }}>
            <Bars values={OS_P} width={690} height={250} max={0.4} valueSize={18} gap={8} digits={2} color={() => C.teal} />
          </Panel>
          <Panel title="exact softmax" style={{ width: 760 }}>
            <Bars values={OS_EXACT} width={690} height={250} max={0.4} valueSize={18} gap={8} digits={2} color={() => C.violet} />
          </Panel>
        </div>
        <div style={{ position: 'absolute', top: 545, left: 0, right: 0, textAlign: 'center', fontFamily: F.mono, fontSize: 28, color: C.teal, opacity: final }}>
          max |difference| {OS_MAXERR < 1e-12 ? '< 10⁻¹²' : `= ${OS_MAXERR.toExponential(1)}`}
          <span style={{ color: C.muted, opacity: ease(frame, trafficAt, 16) }}>  ·  same FLOPs, far less memory traffic</span>
        </div>
        <div style={{ position: 'absolute', top: 610, left: 0, right: 0, display: 'flex', justifyContent: 'center' }}>
          <ProblemChip title="Online Softmax" progress={chip} />
        </div>
      </Layer>
    </>
  );
};
