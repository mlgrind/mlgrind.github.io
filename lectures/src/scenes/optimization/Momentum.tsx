import React from 'react';
import { useCurrentFrame } from 'remotion';
import type { SceneProps } from '..';
import { C, F, rgba } from '../../theme';
import { ease, lin, windowed } from '../../lib/anim';
import { Layer, Tex } from '../../components/ui';
import { Legend } from '../../components/charts';
import { ValleyPlot } from './Valley';
import { LR_MOM, LR_SGD, MU, PATH_MOM, PATH_SGD, STEPS, VA, VB, lossAt } from './data';

const STAGES = ['forward', 'loss', 'backward', 'gradient g', 'optimizer', 'update θ'];

const Pipeline: React.FC<{ frame: number; start: number; optAt: number; chipsAt: number[] }> = ({ frame, start, optAt, chipsAt }) => {
  const labels = ['which direction', 'how big', 'stay stable'];
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 80, paddingBottom: 40 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
        {STAGES.map((s, i) => {
          const p = ease(frame, start + i * 9, 16);
          const isOpt = i >= 3;
          const hl = isOpt ? ease(frame, optAt + (i - 3) * 8, 16) : 0;
          return (
            <React.Fragment key={s}>
              {i > 0 && <div style={{ fontFamily: F.mono, fontSize: 34, color: C.dim, opacity: p }}>→</div>}
              <div
                style={{
                  padding: '22px 28px',
                  borderRadius: 16,
                  fontFamily: F.mono,
                  fontSize: 30,
                  color: hl > 0.5 ? '#fff' : C.text,
                  background: rgba(C.violet, 0.08 + 0.45 * hl),
                  border: `1px solid ${hl > 0.5 ? C.violetLight : C.line2}`,
                  opacity: p * (isOpt ? 1 : 1 - 0.45 * ease(frame, optAt, 16)),
                  transform: `translateY(${(1 - p) * 16}px) scale(${1 + 0.06 * hl})`,
                }}
              >
                {s}
              </div>
            </React.Fragment>
          );
        })}
      </div>
      <div style={{ display: 'flex', gap: 34 }}>
        {labels.map((l, i) => {
          const p = ease(frame, chipsAt[i], 16);
          return (
            <div key={l} style={{ padding: '14px 30px', borderRadius: 999, border: `1px solid ${rgba(C.tealLight, 0.4)}`, background: rgba(C.teal, 0.1), fontFamily: F.body, fontSize: 30, color: C.text, opacity: p, transform: `translateY(${(1 - p) * 14}px)` }}>
              {l}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const Readout: React.FC<{ color: string; name: string; loss: number; step: number; opacity: number }> = ({ color, name, loss, step, opacity }) => (
  <div style={{ opacity, display: 'flex', flexDirection: 'column', gap: 8, padding: '20px 26px', borderRadius: 16, border: `1px solid ${C.line2}`, background: rgba(C.panel, 0.8), width: 360 }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{ width: 16, height: 16, borderRadius: 8, background: color }} />
      <span style={{ fontFamily: F.body, fontSize: 28, color: C.text, fontWeight: 500 }}>{name}</span>
    </div>
    <div style={{ fontFamily: F.mono, fontSize: 24, color: C.muted }}>step {String(step).padStart(2, ' ')}</div>
    <div style={{ fontFamily: F.mono, fontSize: 34, color }}>loss {loss.toFixed(3)}</div>
  </div>
);

export const MomentumScene: React.FC<SceneProps> = ({ cues, durationInFrames }) => {
  const frame = useCurrentFrame();
  const a = [cues.sentence('A model is only'), cues.sentence('The simplest optimizer')];
  const b = [a[1], durationInFrames];

  const sgdEqAt = cues.at('subtract the learning');
  const valleyAt = cues.at('long, narrow valley');
  const sgdRun = [cues.at('so plain gradient descent'), cues.end('so plain gradient descent')];
  const momEqAt = cues.at('Momentum fixes');
  const momRun = [cues.at('Like a heavy ball'), cues.at('wobbles cancel')];

  const sgdP = lin(frame, sgdRun[0], sgdRun[1]);
  const momP = lin(frame, momRun[0], momRun[1]);
  const sgdStep = Math.round(sgdP * STEPS);
  const momStep = Math.round(momP * STEPS);
  const valley = ease(frame, sgdEqAt + 10, 20);

  return (
    <>
      <Layer opacity={windowed(frame, a[0], a[1])}>
        <Pipeline
          frame={frame}
          start={a[0]}
          optAt={cues.at('an optimizer turns')}
          chipsAt={[cues.at('which direction'), cues.at('how big'), cues.at('the tricks')]}
        />
      </Layer>

      <Layer opacity={windowed(frame, b[0], b[1] + 30)}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, display: 'flex', gap: 90, justifyContent: 'center', alignItems: 'baseline' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 22, opacity: ease(frame, sgdEqAt, 16) }}>
            <span style={{ fontFamily: F.mono, fontSize: 22, color: C.rose, letterSpacing: '0.1em' }}>SGD</span>
            <Tex size={46}>θ ← θ − η g</Tex>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 22, opacity: ease(frame, momEqAt, 16) }}>
            <span style={{ fontFamily: F.mono, fontSize: 22, color: C.teal, letterSpacing: '0.1em' }}>MOMENTUM</span>
            <Tex size={46}>v ← μv + g,   θ ← θ − η v</Tex>
          </div>
        </div>
        <div style={{ position: 'absolute', top: 110, left: 0, opacity: valley }}>
          <ValleyPlot
            w={1160}
            paths={[
              { pts: PATH_SGD, color: C.rose, progress: sgdP, opacity: 1 - 0.45 * ease(frame, momRun[0], 16) },
              { pts: PATH_MOM, color: C.teal, progress: momP },
            ]}
          />
          <Legend
            style={{ marginTop: 18 }}
            items={[
              { color: C.rose, label: `SGD  η = ${LR_SGD}` },
              { color: C.teal, label: `momentum  η = ${LR_MOM}, μ = ${MU}`, opacity: ease(frame, momEqAt, 16) },
            ]}
          />
        </div>
        <div style={{ position: 'absolute', top: 120, left: 1250, display: 'flex', flexDirection: 'column', gap: 28 }}>
          <Readout color={C.rose} name="SGD" loss={lossAt(PATH_SGD, sgdStep)} step={sgdStep} opacity={ease(frame, sgdRun[0], 14)} />
          <Readout color={C.teal} name="Momentum" loss={lossAt(PATH_MOM, momStep)} step={momStep} opacity={ease(frame, momRun[0], 14)} />
          <div style={{ fontFamily: F.body, fontSize: 24, color: C.muted, width: 380, opacity: ease(frame, valleyAt, 16) }}>
            <Tex size={30} color={C.muted}>{`f = ½(${VA}x² + ${VB}y²)`}</Tex>
          </div>
        </div>
      </Layer>
    </>
  );
};
