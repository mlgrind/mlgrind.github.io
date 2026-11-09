import React from 'react';
import { useCurrentFrame } from 'remotion';
import type { SceneProps } from '..';
import { C, F, rgba } from '../../theme';
import { ease } from '../../lib/anim';
import { ProblemChip, Tex } from '../../components/ui';
import { Axes, CLASS, Label, Panel, scales } from '../../components/classical';
import { KNN_DIST, KNN_K, KNN_NEAR, KNN_PRED, KNN_QUERY, KNN_VOTES, KNN_X, KNN_Y, NB, NB_X, NB_Y, UNDERFLOW, nbPosterior1 } from './data';

const ks = scales([-3.4, 3.4], [-3.9, 3.3], 600, 400);
const ns = scales([-0.5, 5.5], [0, 1], 600, 250);
const pdf = (x: number, mu: number, v: number) => Math.exp((-0.5 * (x - mu) ** 2) / v) / Math.sqrt(2 * Math.PI * v);
const NB_COL = [C.violetLight, C.amber];

export const KnnNBScene: React.FC<SceneProps> = ({ cues }) => {
  const frame = useCurrentFrame();
  const inAt = cues.sentence('Two more ideas');
  const knnAt = cues.at('find the k closest');
  const voteAt = cues.at('take a majority vote');
  const nbAt = cues.at('Gaussian Naive Bayes models');
  const bayesAt = cues.at("applies Bayes' rule");
  const underAt = cues.at('Multiplying hundreds');
  const logAt = cues.at('add log densities');
  const chipAt = cues.at('Both are waiting');

  const nearP = ease(frame, knnAt, 18);
  const voteP = ease(frame, voteAt, 16);
  const rK = KNN_DIST[KNN_NEAR[KNN_K - 1]];
  const pxPerUnit = ks.x(1) - ks.x(0);
  const q = KNN_QUERY;
  const nbCurve = ease(frame, nbAt + 20, 30);
  const postP = ease(frame, bayesAt, 24);
  const maxDens = Math.max(...NB.map((c) => c.prior * pdf(c.mu, c.mu, c.v)));
  const dy = (v: number) => ns.y((0.95 * v) / maxDens);

  return (
    <>
      {/* left: k-nearest neighbours */}
      <Panel style={{ left: 0, top: 0, width: 800, height: 560, opacity: ease(frame, inAt, 16) }}>
        <svg width={740} height={500} style={{ overflow: 'visible' }}>
          <g transform="translate(90, 40)">
            <Axes w={600} h={400} sx={ks.x} sy={ks.y} xTicks={[]} yTicks={[]} xLabel="x₁" yLabel="x₂" grid={false} />
            <circle cx={ks.x(q[0])} cy={ks.y(q[1])} r={rK * pxPerUnit * nearP} fill={rgba(C.amber, 0.06)} stroke={C.amber} strokeWidth={2.5} strokeDasharray="9 7" opacity={nearP} />
            {KNN_NEAR.map((i, n) => (
              <line key={i} x1={ks.x(q[0])} y1={ks.y(q[1])} x2={ks.x(KNN_X[i][0])} y2={ks.y(KNN_X[i][1])} stroke={CLASS[KNN_Y[i]]} strokeWidth={3} opacity={ease(frame, knnAt + 6 + n * 5, 10)} />
            ))}
            {KNN_X.map((x, i) => {
              const near = KNN_NEAR.includes(i);
              return (
                <circle
                  key={i}
                  cx={ks.x(x[0])}
                  cy={ks.y(x[1])}
                  r={near ? 13 : 10}
                  fill={CLASS[KNN_Y[i]]}
                  stroke={near && nearP > 0.5 ? C.text : C.bg}
                  strokeWidth={near && nearP > 0.5 ? 3 : 2.5}
                  opacity={ease(frame, inAt + 4 + i * 0.5, 10) * (near ? 1 : 1 - 0.5 * nearP)}
                />
              );
            })}
            <path
              d={`M ${ks.x(q[0])} ${ks.y(q[1]) - 22} l 7 14 16 2 -11 11 3 16 -15 -8 -15 8 3 -16 -11 -11 16 -2 z`}
              fill={voteP > 0.5 ? CLASS[KNN_PRED] : C.text}
              stroke={C.bg}
              strokeWidth={2.5}
              opacity={ease(frame, inAt + 30, 12)}
            />
          </g>
        </svg>
        <div style={{ position: 'absolute', right: 30, top: 22, textAlign: 'right', opacity: voteP }}>
          <Label size={24}>k = {KNN_K} votes</Label>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'flex-end', marginTop: 4 }}>
            {KNN_VOTES.map((v, c) => (
              <span key={c} style={{ fontFamily: F.mono, fontSize: 34, color: CLASS[c] }}>
                {v}
              </span>
            ))}
          </div>
          <Label size={26} color={CLASS[KNN_PRED]} style={{ marginTop: 4 }}>
            → class {KNN_PRED}
          </Label>
        </div>
      </Panel>

      {/* right: Gaussian Naive Bayes on one feature */}
      <Panel style={{ left: 840, top: 0, width: 840, height: 560, opacity: ease(frame, nbAt, 16) }}>
        <svg width={780} height={500} style={{ overflow: 'visible' }}>
          <g transform="translate(110, 130)">
            <Axes w={600} h={250} sx={ns.x} sy={ns.y} xTicks={[0, 1, 2, 3, 4, 5].map((v) => ({ v, label: String(v) }))} yTicks={[0, 0.5, 1].map((v) => ({ v, label: String(v) }))} xLabel="feature x" grid={false} />
            {NB.map((c, k) => (
              <polyline
                key={k}
                points={Array.from({ length: 121 }, (_, i) => {
                  const x = -0.5 + i * 0.05;
                  return `${ns.x(x)},${dy(c.prior * pdf(x, c.mu, c.v))}`;
                }).join(' ')}
                fill={rgba(NB_COL[k], 0.12)}
                stroke={NB_COL[k]}
                strokeWidth={4}
                opacity={nbCurve}
              />
            ))}
            <polyline
              points={Array.from({ length: 121 }, (_, i) => {
                const x = -0.5 + i * 0.05;
                return `${ns.x(x)},${ns.y(nbPosterior1(x))}`;
              }).join(' ')}
              fill="none"
              stroke={C.text}
              strokeWidth={4}
              strokeDasharray="12 8"
              pathLength={1}
              opacity={postP}
            />
            {NB_X.map((x, i) => (
              <line key={i} x1={ns.x(x)} x2={ns.x(x)} y1={226} y2={248} stroke={NB_COL[NB_Y[i]]} strokeWidth={4} opacity={ease(frame, nbAt + i, 8)} />
            ))}
          </g>
        </svg>
        <div style={{ position: 'absolute', left: 30, top: 18, opacity: nbCurve }}>
          <Label size={22} color={C.muted}>
            prior × N(x; μ, σ²), per class
          </Label>
          {NB.map((c, k) => (
            <Label key={k} size={22} color={NB_COL[k]}>
              class {k}: prior {c.prior.toFixed(1)}, μ {c.mu.toFixed(2)}, σ² {c.v.toFixed(2)}
            </Label>
          ))}
        </div>
        <div style={{ position: 'absolute', right: 30, top: 18, opacity: postP }}>
          <Label size={22} color={C.text}>
            - - P(class 1 | x)
          </Label>
        </div>
      </Panel>

      {/* why log space */}
      <div style={{ position: 'absolute', left: 840, width: 840, top: 590, display: 'flex', justifyContent: 'center', gap: 36, alignItems: 'baseline', opacity: ease(frame, underAt, 14) * (1 - ease(frame, chipAt, 12)) }}>
        <Label size={28} color={C.rose}>
          ∏ {UNDERFLOW.n} densities = {UNDERFLOW.product.toFixed(1)}
        </Label>
        <Label size={28} color={C.teal} style={{ opacity: ease(frame, logAt, 14) }}>
          Σ log = {UNDERFLOW.logSum.toFixed(2)}
        </Label>
      </div>
      <div style={{ position: 'absolute', left: 0, width: 800, top: 590, display: 'flex', justifyContent: 'center', opacity: ease(frame, logAt + 20, 14) * (1 - ease(frame, chipAt, 12)) }}>
        <Tex size={36}>log P(c|x) = jll_c − logsumexp(jll)</Tex>
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 600, display: 'flex', justifyContent: 'center', gap: 30 }}>
        <ProblemChip title="k-Nearest Neighbours Classifier" progress={ease(frame, chipAt, 14)} />
        <ProblemChip title="Gaussian Naive Bayes" progress={ease(frame, chipAt + 30, 14)} />
      </div>
    </>
  );
};
