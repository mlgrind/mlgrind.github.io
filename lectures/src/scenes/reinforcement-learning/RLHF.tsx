import React from 'react';
import { useCurrentFrame } from 'remotion';
import type { SceneProps } from '..';
import { C, F, rgba } from '../../theme';
import { ease, windowed } from '../../lib/anim';
import { Layer, ProblemChip, Tex } from '../../components/ui';
import { Axes, NumTable, linePath } from '../../components/plot';
import { fmt } from '../../lib/math';
import {
  DPO,
  DPO_BETA,
  KL,
  KL_ADV,
  KL_BETA,
  KL_POLICY,
  KL_REF,
  KL_REWARD,
  RM_CHOSEN,
  RM_LOSS,
  RM_LOSSES,
  RM_MARGIN,
  RM_REJECTED,
  sigmoid,
} from './data';

const XS = Array.from({ length: 161 }, (_, i) => -4 + i / 20);
const nls = (x: number) => -Math.log(sigmoid(x));

/** -log sigmoid(x) with labelled points on it. */
const LossCurve: React.FC<{ draw: number; points: number[]; pointsP: number; xLabel: string; color: string }> = ({ draw, points, pointsP, xLabel, color }) => (
  <Axes width={760} height={460} x={[-4, 4]} y={[0, 4.4]} xTicks={[-4, -2, 0, 2, 4]} yTicks={[0, 1, 2, 3, 4]} xLabel={xLabel} yLabel="loss">
    {(s) => (
      <>
        <path d={linePath(XS.filter((x) => x <= -4 + 8 * draw).map((x) => [x, nls(x)]), s)} stroke={C.violetLight} strokeWidth={5} fill="none" />
        {points.map((x, i) => {
          const p = ease(pointsP * 60, i * 8, 14);
          return (
            <g key={i} opacity={p}>
              <line x1={s.sx(x)} x2={s.sx(x)} y1={s.sy(0)} y2={s.sy(nls(x))} stroke={color} strokeWidth={2} strokeDasharray="5 5" />
              <circle cx={s.sx(x)} cy={s.sy(nls(x))} r={11} fill={color} />
            </g>
          );
        })}
      </>
    )}
  </Axes>
);

export const RLHFScene: React.FC<SceneProps> = ({ cues, durationInFrames }) => {
  const frame = useCurrentFrame();
  const pA = [cues.sentence('The same tools'), cues.sentence('Then PPO optimizes')];
  const pB = [pA[1], cues.sentence('Direct Preference')];
  const pC = [pB[1], durationInFrames];

  const pairsAt = cues.at('pairs of responses');
  const btAt = cues.at('Bradley-Terry');
  const lossAt = cues.at('the loss is');
  const draw = ease(frame, btAt, 40);
  const ptsP = Math.max(0, (frame - lossAt) / 60);

  const klAt = cues.at('pays a penalty');
  const refAt = cues.at('frozen reference');
  const advAt = cues.at('the advantage is the reward');

  const scoreAt = cues.at('It scores each response');
  const refDoesAt = cues.at('than the reference does');
  const sameAt = cues.at('applies the same');
  const lossesAt = cues.at('beta times the chosen');

  return (
    <>
      <Layer opacity={windowed(frame, pA[0], pA[1])}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 80, opacity: ease(frame, btAt, 16) }}>
          <Tex size={48}>P(chosen wins) = σ(r_w − r_l)</Tex>
          <Tex size={48} color={C.violetLight}>L = −log σ(r_w − r_l)</Tex>
        </div>
        <div style={{ position: 'absolute', top: 120, left: 0 }}>
          <NumTable
            cols={['pair 1', 'pair 2', 'pair 3', 'pair 4']}
            cellW={130}
            cellH={60}
            labelW={150}
            fontSize={26}
            rows={[
              { label: 'r_w', values: RM_CHOSEN, digits: 1, reveal: () => ease(frame, pairsAt, 16), color: () => rgba(C.teal, 0.2) },
              { label: 'r_l', values: RM_REJECTED, digits: 1, reveal: () => ease(frame, pairsAt, 16), color: () => rgba(C.rose, 0.2) },
              { label: 'r_w − r_l', values: RM_MARGIN, digits: 1, reveal: () => ease(frame, btAt + 10, 16) },
              { label: 'loss', values: RM_LOSSES, digits: 3, labelColor: C.amber, reveal: (j) => ease(frame, lossAt + j * 8, 14) },
            ]}
          />
          <div style={{ marginTop: 26, paddingLeft: 168, fontFamily: F.mono, fontSize: 32, color: C.amber, opacity: ease(frame, lossAt + 40, 16) }}>
            mean loss = {fmt(RM_LOSS, 3)}
          </div>
          <div style={{ marginTop: 30, paddingLeft: 168 }}>
            <ProblemChip title="RLHF Reward Model Loss" progress={ease(frame, lossAt + 50, 16)} />
          </div>
        </div>
        <div style={{ position: 'absolute', top: 120, left: 900, opacity: ease(frame, btAt, 16) }}>
          <LossCurve draw={draw} points={RM_MARGIN} pointsP={ptsP} xLabel="r_w − r_l" color={C.amber} />
        </div>
      </Layer>

      <Layer opacity={windowed(frame, pB[0], pB[1])}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 90 }}>
          <div style={{ opacity: ease(frame, klAt, 16) }}>
            <Tex size={48}>{'KL = log π_θ(y) − log π_{ref}(y)'}</Tex>
          </div>
          <div style={{ opacity: ease(frame, advAt, 16) }}>
            <Tex size={48} color={C.violetLight}>A = R − β · KL</Tex>
          </div>
        </div>
        <div style={{ position: 'absolute', top: 90, left: 0, right: 0, textAlign: 'center', fontFamily: F.mono, fontSize: 26, color: C.muted, opacity: ease(frame, klAt, 16) }}>
          β = {KL_BETA} · log-probabilities of 4 sampled responses
        </div>
        <div style={{ position: 'absolute', top: 160, left: 0, right: 0, display: 'flex', justifyContent: 'center' }}>
          <NumTable
            cols={['resp 1', 'resp 2', 'resp 3', 'resp 4']}
            cellW={170}
            cellH={62}
            labelW={260}
            fontSize={28}
            rows={[
              { label: 'log π_θ', values: KL_POLICY, digits: 1, reveal: () => ease(frame, klAt, 16) },
              { label: 'log π_{ref}', values: KL_REF, digits: 1, reveal: () => ease(frame, refAt, 16) },
              { label: 'KL', values: KL, digits: 1, labelColor: C.amber, color: (v) => rgba(C.amber, Math.min(0.5, Math.abs(v) / 5)), reveal: (j) => ease(frame, refAt + 20 + j * 6, 14) },
              { label: 'reward R', values: KL_REWARD, digits: 1, reveal: () => ease(frame, advAt, 16) },
              { label: 'A = R − βKL', values: KL_ADV, labelColor: C.violetLight, color: (v) => rgba(v >= 0 ? C.violet : C.rose, 0.4), reveal: (j) => ease(frame, advAt + 20 + j * 6, 14) },
            ]}
          />
        </div>
        <div style={{ position: 'absolute', top: 600, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 20 }}>
          <ProblemChip title="KL Divergence Penalty (RLHF)" progress={ease(frame, refAt + 30, 16)} />
          <ProblemChip title="PPO-RLHF Objective" progress={ease(frame, advAt + 10, 16)} />
        </div>
      </Layer>

      <Layer opacity={windowed(frame, pC[0], pC[1] + 30)}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 60 }}>
          <div style={{ opacity: ease(frame, scoreAt, 16) }}>
            <Tex size={46}>{'Δ = log π_θ(y) − log π_{ref}(y)'}</Tex>
          </div>
          <div style={{ opacity: ease(frame, refDoesAt, 16) }}>
            <Tex size={46} color={C.violetLight}>L = −log σ(β(Δ_w − Δ_l))</Tex>
          </div>
        </div>
        <div style={{ position: 'absolute', top: 120, left: 0 }}>
          <NumTable
            cols={['pair 1', 'pair 2', 'pair 3']}
            cellW={140}
            cellH={60}
            labelW={200}
            fontSize={26}
            rows={[
              { label: 'Δ_w', values: DPO.dW, digits: 1, color: () => rgba(C.teal, 0.2), reveal: () => ease(frame, scoreAt + 20, 16) },
              { label: 'Δ_l', values: DPO.dL, digits: 1, color: () => rgba(C.rose, 0.2), reveal: () => ease(frame, scoreAt + 30, 16) },
              { label: 'β(Δ_w − Δ_l)', values: DPO.logits, digits: 2, reveal: () => ease(frame, sameAt, 16) },
              { label: 'loss', values: DPO.losses, digits: 3, labelColor: C.amber, reveal: (j) => ease(frame, lossesAt + j * 8, 14) },
            ]}
          />
          <div style={{ marginTop: 26, paddingLeft: 218, fontFamily: F.mono, fontSize: 30, color: C.amber, opacity: ease(frame, lossesAt + 30, 16) }}>
            β = {DPO_BETA} · mean loss = {fmt(DPO.loss, 3)}
          </div>
          <div style={{ marginTop: 30, paddingLeft: 218 }}>
            <ProblemChip title="Direct Preference Optimization (DPO)" progress={ease(frame, cues.sentence('Direct Preference'), 16)} />
          </div>
        </div>
        <div style={{ position: 'absolute', top: 120, left: 900, opacity: ease(frame, refDoesAt, 16) }}>
          <LossCurve draw={1} points={DPO.logits} pointsP={Math.max(0, (frame - lossesAt) / 60)} xLabel="β(Δ_w − Δ_l)" color={C.amber} />
        </div>
      </Layer>
    </>
  );
};
