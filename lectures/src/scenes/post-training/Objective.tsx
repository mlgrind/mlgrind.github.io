import React from 'react';
import { useCurrentFrame } from 'remotion';
import type { SceneProps } from '..';
import { C, F, rgba } from '../../theme';
import { ease, windowed } from '../../lib/anim';
import { Layer, ProblemChip, Tex } from '../../components/ui';
import { Axes, linePath } from '../../components/plot';
import { fmt } from '../../lib/math';
import { ADV3, BETA, CLIP_EPS, G3, LOGP, MASK, MEAN_KL, OBJECTIVE, PER_TOKEN, RATIO, REF_LOGP, ROW_MEAN, SURR, T3, k3 } from './data';

const CW = 132;
const CH = 66;
const GAP = 8;

/** responses x tokens grid; masked (padding) cells are hollow. */
const TokenGrid: React.FC<{
  values: number[][] | null;
  digits?: number;
  color: (i: number, t: number) => string;
  reveal?: (i: number, t: number) => number;
  rowLabel: (i: number) => React.ReactNode;
}> = ({ values, digits = 2, color, reveal, rowLabel }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: GAP }}>
    <div style={{ display: 'flex', gap: GAP, paddingLeft: 250 }}>
      {Array.from({ length: T3 }, (_, t) => (
        <div key={t} style={{ width: CW, textAlign: 'center', fontFamily: F.mono, fontSize: 22, color: C.muted }}>
          token {t + 1}
        </div>
      ))}
    </div>
    {MASK.map((row, i) => (
      <div key={i} style={{ display: 'flex', gap: GAP, alignItems: 'center' }}>
        <div style={{ width: 242, textAlign: 'right' }}>{rowLabel(i)}</div>
        {row.map((m, t) => {
          const r = reveal ? reveal(i, t) : 1;
          return (
            <div
              key={t}
              style={{
                width: CW,
                height: CH,
                borderRadius: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: F.mono,
                fontSize: 26,
                color: C.text,
                background: m ? color(i, t) : 'transparent',
                border: m ? '2px solid transparent' : `2px dashed ${C.line2}`,
              }}
            >
              {m ? (values && r > 0.02 ? <span style={{ opacity: r }}>{fmt(values[i][t], digits)}</span> : null) : <span style={{ fontSize: 20, color: C.dim }}>pad</span>}
            </div>
          );
        })}
      </div>
    ))}
  </div>
);

const advColor = (i: number, a = 0.4) => rgba(ADV3[i] >= 0 ? C.teal : C.rose, a);

// d = ref_logp - logp for every real token
const DS = MASK.flatMap((row, i) => row.flatMap((m, t) => (m ? [REF_LOGP[i][t] - LOGP[i][t]] : [])));
const XS = Array.from({ length: 141 }, (_, i) => -2 + i / 40);

export const ObjectiveScene: React.FC<SceneProps> = ({ cues, durationInFrames }) => {
  const frame = useCurrentFrame();
  const pA = [0, cues.sentence('Then it subtracts')];
  const pB = [pA[1], cues.sentence('Finally, average')];
  const pC = [pB[1], durationInFrames];

  const ratioAt = cues.at('the familiar ratio');
  const surrAt = cues.at("PPO's clipped surrogate");
  const showSurr = frame >= surrAt;
  const cellIn = (at: number) => (i: number, t: number) => ease(frame, at + (i * T3 + t) * 0.8, 10);

  const k3At = cues.at('the k three estimator');
  const dAt = cues.sentence('Take the log ratio');
  const curveAt = cues.sentence('The estimate is e');
  const negAt = cues.sentence('Unlike a plain');

  const avgAt = cues.at('average over each');
  const allAt = cues.at('then average over all');
  const objAt = cues.sentence('That is the objective');

  return (
    <>
      <Layer opacity={windowed(frame, pA[0] + 50, pA[1])}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 70 }}>
          <div style={{ opacity: ease(frame, ratioAt, 16) }}>
            <Tex size={46}>{'ratio = exp(log π_θ − log π_{old})'}</Tex>
          </div>
          <div style={{ opacity: ease(frame, surrAt, 16) }}>
            <Tex size={46} color={C.violetLight}>{'min(ratio·A, clip(ratio, 0.8, 1.2)·A)'}</Tex>
          </div>
        </div>
        <div style={{ position: 'absolute', top: 120, left: 120 }}>
          <TokenGrid
            values={showSurr ? SURR : RATIO}
            digits={showSurr ? 2 : 3}
            color={(i) => advColor(i, 0.18 + 0.2 * ease(frame, 10, 20))}
            reveal={showSurr ? cellIn(surrAt) : cellIn(ratioAt)}
            rowLabel={(i) => (
              <span style={{ fontFamily: F.mono, fontSize: 26, color: ADV3[i] >= 0 ? C.teal : C.rose }}>
                r={i === 0 || i === 3 ? 1 : 0}  A={fmt(ADV3[i], 2)}
              </span>
            )}
          />
        </div>
        <div style={{ position: 'absolute', top: 470, left: 0, right: 0, textAlign: 'center', fontFamily: F.body, fontSize: 28, color: C.muted, opacity: ease(frame, 60, 16) }}>
          each response's advantage is copied to all of its tokens · ε = {CLIP_EPS}
        </div>
      </Layer>

      <Layer opacity={windowed(frame, pB[0], pB[1])}>
        <div style={{ position: 'absolute', top: 10, left: 0, width: 760, display: 'flex', flexDirection: 'column', gap: 34 }}>
          <div style={{ opacity: ease(frame, pB[0] + 6, 16) }}>
            <Tex size={46}>{'per-token = surrogate − β · KL'}</Tex>
            <div style={{ fontFamily: F.mono, fontSize: 26, color: C.muted, marginTop: 8 }}>β = {BETA}</div>
          </div>
          <div style={{ opacity: ease(frame, dAt, 16) }}>
            <Tex size={46} color={C.text}>{'d = log π_{ref} − log π_θ'}</Tex>
          </div>
          <div style={{ opacity: ease(frame, curveAt, 16) }}>
            <Tex size={50} color={C.violetLight}>{'k3 = e^d − d − 1'}</Tex>
          </div>
          <div style={{ opacity: ease(frame, negAt, 16), fontFamily: F.body, fontSize: 28, color: C.rose }}>
            plain difference <Tex size={36} color={C.rose}>{'log π_θ − log π_{ref} = −d'}</Tex> can go negative
          </div>
          <div style={{ opacity: ease(frame, negAt + 20, 16), fontFamily: F.mono, fontSize: 26, color: C.amber }}>
            dots: the {DS.length} real tokens of this batch
          </div>
        </div>
        <div style={{ position: 'absolute', top: 30, left: 820, opacity: ease(frame, k3At, 16) }}>
          <Axes width={840} height={560} x={[-2, 1.5]} y={[-1.5, 2.5]} xTicks={[-2, -1, 0, 1]} yTicks={[-1, 0, 1, 2]} xLabel="d">
            {(s) => {
              const draw = ease(frame, curveAt, 40);
              return (
                <>
                  <path
                    d={linePath(XS.map((x) => [x, -x]), s)}
                    stroke={C.rose}
                    strokeWidth={3}
                    strokeDasharray="10 8"
                    fill="none"
                    opacity={ease(frame, negAt, 16)}
                  />
                  <path d={linePath(XS.filter((x) => x <= -2 + 3.5 * draw).map((x) => [x, k3(x)]), s)} stroke={C.violetLight} strokeWidth={5} fill="none" />
                  {DS.map((d, i) => (
                    <circle key={i} cx={s.sx(d)} cy={s.sy(k3(d))} r={8} fill={C.amber} opacity={ease(frame, negAt + 20 + i, 10)} />
                  ))}
                </>
              );
            }}
          </Axes>
        </div>
      </Layer>

      <Layer opacity={windowed(frame, pC[0], pC[1] + 30)}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, display: 'flex', justifyContent: 'center' }}>
          <Tex size={44}>{'J = mean over responses of ( Σ_t mask · per-token ) / |o_i|'}</Tex>
        </div>
        <div style={{ position: 'absolute', top: 100, left: 0 }}>
          <TokenGrid
            values={PER_TOKEN}
            color={(i, t) => rgba(PER_TOKEN[i][t] >= 0 ? C.teal : C.rose, 0.3)}
            reveal={cellIn(pC[0] + 6)}
            rowLabel={(i) => <span style={{ fontFamily: F.mono, fontSize: 26, color: C.muted }}>resp {i + 1} · len {MASK[i].reduce((a, b) => a + b, 0)}</span>}
          />
        </div>
        <div style={{ position: 'absolute', top: 100 + 30 + GAP, left: 250 + T3 * (CW + GAP) + 30, display: 'flex', flexDirection: 'column', gap: GAP }}>
          {ROW_MEAN.map((m, i) => (
            <div key={i} style={{ height: CH, display: 'flex', alignItems: 'center', gap: 12, fontFamily: F.mono, fontSize: 28, color: C.violetLight, opacity: ease(frame, avgAt + 10 + i * 6, 14) }}>
              → {fmt(m, 3)}
            </div>
          ))}
        </div>
        <div style={{ position: 'absolute', top: 100 + 30 + GAP + G3 * (CH + GAP) + 20, left: 250, display: 'flex', gap: 50, alignItems: 'baseline', fontFamily: F.mono, fontSize: 32 }}>
          <span style={{ color: C.amber, opacity: ease(frame, allAt, 16) }}>J = {fmt(OBJECTIVE, 4)}</span>
          <span style={{ color: C.text, opacity: ease(frame, objAt + 20, 16) }}>loss = −J = {fmt(-OBJECTIVE, 4)}</span>
          <span style={{ color: C.muted, fontSize: 26, opacity: ease(frame, objAt + 30, 16) }}>mean KL = {fmt(MEAN_KL, 4)}</span>
        </div>
        <div style={{ position: 'absolute', top: 620, left: 0, right: 0, display: 'flex', justifyContent: 'center' }}>
          <ProblemChip title="GRPO: Group-Relative Advantages & Objective" progress={ease(frame, cues.sentence("You'll build it"), 16)} />
        </div>
      </Layer>
    </>
  );
};
