import React from 'react';
import { useCurrentFrame } from 'remotion';
import type { SceneProps } from '..';
import { C, F, rgba } from '../../theme';
import { ease, lin, windowed } from '../../lib/anim';
import { Layer, ProblemChip, Tex } from '../../components/ui';
import { Axes, CLASS, Label, Panel, scales } from '../../components/classical';
import { BAG_QUERY, BAG_VOTES, GB, GB_LR, GB_X, GB_Y, NODES, ROOT_GINI, SCAN0, SPLIT1, SPLIT2, TREE_X, TREE_Y } from './data';

const SH = 270;
const sc = scales([0, 1], [0, 1], 560, SH);
const gs = scales([0, 1], [0, 0.5], 560, 110);
const bs = scales([0, 6], [-1.4, 2.4], 600, 380);

/** A tree node: class counts and its Gini. */
const Node: React.FC<{ x: number; y: number; c: number[]; g: number; o: number; label?: string }> = ({ x, y, c, g, o, label }) => (
  <div
    style={{
      position: 'absolute',
      left: x - 105,
      top: y,
      width: 210,
      padding: '10px 0',
      borderRadius: 14,
      border: `1px solid ${g === 0 ? rgba(C.teal, 0.7) : C.line2}`,
      background: rgba(C.panel2, 0.95),
      textAlign: 'center',
      opacity: o,
      transform: `scale(${0.9 + 0.1 * o})`,
    }}
  >
    {label && <Label size={22} color={C.dim}>{label}</Label>}
    <div style={{ fontFamily: F.mono, fontSize: 30 }}>
      <span style={{ color: CLASS[0] }}>{c[0]}</span>
      <span style={{ color: C.dim }}> · </span>
      <span style={{ color: CLASS[1] }}>{c[1]}</span>
    </div>
    <Label size={22} color={g === 0 ? C.teal : C.muted}>
      gini {g.toFixed(2)}
    </Label>
  </div>
);

export const TreesScene: React.FC<SceneProps> = ({ cues }) => {
  const frame = useCurrentFrame();
  const inAt = cues.sentence('Decision trees take');
  const scanAt = cues.at('we try every feature');
  const giniAt = cues.at('measured by Gini');
  const pureAt = cues.at('A pure node');
  const bagAt = cues.at('Bagging trains');
  const boostAt = cues.at('Boosting adds');
  const chipsAt = cues.at("You'll find these");

  const scanP = lin(frame, scanAt, scanAt + 150);
  const nShown = Math.floor(scanP * SCAN0.length);
  const split1P = ease(frame, scanAt + 155, 16);
  const split2P = ease(frame, pureAt + 30, 16);
  const treeO = windowed(frame, inAt, bagAt + 4, 12);
  const bagO = windowed(frame, bagAt, chipsAt, 12);
  const leftO = windowed(frame, inAt, boostAt + 4, 12);
  const boostO = ease(frame, boostAt, 14);
  const sweepT = nShown > 0 ? SCAN0[Math.min(nShown, SCAN0.length) - 1].t : 0;
  const best = SCAN0.reduce((a, b) => (b.imp < a.imp ? b : a));

  // boosting rounds shown: 0 -> 30, faster later
  const bp = lin(frame, boostAt + 20, chipsAt + 20);
  const round = Math.min(GB.snaps.length - 1, Math.floor((GB.snaps.length - 1) * bp * bp));
  const snap = GB.snaps[round];
  const ones = BAG_VOTES.filter((v) => v === 1).length;
  const bagPred = ones > BAG_VOTES.length - ones ? 1 : 0;

  return (
    <>
      {/* left: data, the split search and the Gini curve */}
      <Layer opacity={leftO}>
        <Panel style={{ left: 0, top: 0, width: 800, height: 600 }}>
          <svg width={740} height={540} style={{ overflow: 'visible' }}>
            <g transform="translate(110, 30)">
              {/* regions after the splits */}
              <rect x={0} y={0} width={sc.x(SPLIT1.t)} height={SH} fill={rgba(CLASS[0], 0.1 * split1P)} />
              <rect x={sc.x(SPLIT1.t)} y={sc.y(SPLIT2.t)} width={560 - sc.x(SPLIT1.t)} height={SH - sc.y(SPLIT2.t)} fill={rgba(CLASS[0], 0.1 * split2P)} />
              <rect x={sc.x(SPLIT1.t)} y={0} width={560 - sc.x(SPLIT1.t)} height={sc.y(SPLIT2.t)} fill={rgba(CLASS[1], 0.12 * split2P)} />
              <Axes w={560} h={SH} sx={sc.x} sy={sc.y} xTicks={[0, 0.5, 1].map((v) => ({ v, label: String(v) }))} yTicks={[0, 0.5, 1].map((v) => ({ v, label: String(v) }))} yLabel="x₂" grid={false} />
              {scanP > 0 && scanP < 1 && <line x1={sc.x(sweepT)} x2={sc.x(sweepT)} y1={0} y2={SH} stroke={C.amber} strokeWidth={3} />}
              <line x1={sc.x(SPLIT1.t)} x2={sc.x(SPLIT1.t)} y1={0} y2={SH} stroke={C.text} strokeWidth={4} opacity={split1P} />
              <line x1={sc.x(SPLIT1.t)} x2={560} y1={sc.y(SPLIT2.t)} y2={sc.y(SPLIT2.t)} stroke={C.text} strokeWidth={4} opacity={split2P} />
              {TREE_X.map((x, i) => (
                <circle key={i} cx={sc.x(x[0])} cy={sc.y(x[1])} r={11} fill={CLASS[TREE_Y[i]]} stroke={C.bg} strokeWidth={2.5} opacity={ease(frame, inAt + 4 + i * 0.6, 10)} />
              ))}
              <g opacity={bagO}>
                <path d={`M ${sc.x(BAG_QUERY[0])} ${sc.y(BAG_QUERY[1]) - 18} l 6 12 13 2 -9 9 2 13 -12 -6 -12 6 2 -13 -9 -9 13 -2 z`} fill={C.amber} stroke={C.bg} strokeWidth={2} />
              </g>
              {/* Gini of every candidate threshold on x1 */}
              <g transform="translate(0, 360)" opacity={ease(frame, scanAt, 14)}>
                <Axes w={560} h={110} sx={gs.x} sy={gs.y} xTicks={[0, 0.5, 1].map((v) => ({ v, label: String(v) }))} yTicks={[0, 0.5].map((v) => ({ v, label: String(v) }))} xLabel="x₁ threshold" grid={false} />
                <polyline points={SCAN0.slice(0, nShown).map((s) => `${gs.x(s.t)},${gs.y(s.imp)}`).join(' ')} fill="none" stroke={C.amber} strokeWidth={3.5} />
                {SCAN0.slice(0, nShown).map((s, i) => (
                  <circle key={i} cx={gs.x(s.t)} cy={gs.y(s.imp)} r={4.5} fill={C.amber} />
                ))}
                <circle cx={gs.x(best.t)} cy={gs.y(best.imp)} r={10} fill="none" stroke={C.teal} strokeWidth={3} opacity={split1P} />
                <text x={gs.x(best.t) + 16} y={gs.y(best.imp) + 8} fill={C.teal} fontFamily={F.mono} fontSize={22} opacity={split1P}>
                  {best.imp.toFixed(3)}
                </text>
                <text x={0} y={-16} fill={C.muted} fontFamily={F.mono} fontSize={22}>
                  weighted gini
                </text>
              </g>
            </g>
          </svg>
        </Panel>
      </Layer>

      {/* left, later: gradient boosting on a 1-D regression */}
      <Layer opacity={boostO}>
        <Panel style={{ left: 0, top: 0, width: 800, height: 600 }}>
          <svg width={740} height={540} style={{ overflow: 'visible' }}>
            <g transform="translate(90, 60)">
              <Axes w={600} h={380} sx={bs.x} sy={bs.y} xTicks={[0, 2, 4, 6].map((v) => ({ v, label: String(v) }))} yTicks={[-1, 0, 1, 2].map((v) => ({ v, label: v < 0 ? `−${-v}` : String(v) }))} xLabel="x" yLabel="y" grid={false} />
              {GB_X.map((x, i) => (
                <circle key={i} cx={bs.x(x)} cy={bs.y(GB_Y[i])} r={7} fill={C.teal} opacity={0.9} />
              ))}
              <polyline
                points={GB_X.flatMap((x, i) => {
                  const half = 3 / GB_X.length;
                  return [`${bs.x(x - half)},${bs.y(snap.F[i])}`, `${bs.x(x + half)},${bs.y(snap.F[i])}`];
                }).join(' ')}
                fill="none"
                stroke={C.violetLight}
                strokeWidth={4.5}
              />
            </g>
          </svg>
          <div style={{ position: 'absolute', right: 30, top: 22, textAlign: 'right' }}>
            <Label size={24}>round {snap.round} · lr {GB_LR}</Label>
            <Label size={32} color={C.text}>
              MSE {snap.loss.toFixed(3)}
            </Label>
          </div>
          <div style={{ position: 'absolute', left: 30, top: 22 }}>
            <Label size={28} color={C.text}>F ← F + η · stump(x)</Label>
          </div>
        </Panel>
      </Layer>

      {/* right: the tree */}
      <Layer opacity={treeO}>
        <Panel style={{ left: 840, top: 0, width: 840, height: 600 }}>
          <svg width={780} height={540} style={{ position: 'absolute', left: 30, top: 30 }}>
            <g stroke={C.line2} strokeWidth={3} fill="none">
              <path d="M 390 110 L 200 210" opacity={split1P} />
              <path d="M 390 110 L 580 210" opacity={split1P} />
              <path d="M 580 315 L 470 410" opacity={split2P} />
              <path d="M 580 315 L 690 410" opacity={split2P} />
            </g>
          </svg>
          <Node x={420} y={30} c={NODES.root} g={ROOT_GINI} o={ease(frame, inAt + 10, 14)} />
          <Label size={22} style={{ position: 'absolute', left: 250, top: 175, opacity: split1P }}>
            x₁ ≤ {SPLIT1.t.toFixed(2)}
          </Label>
          <Label size={22} style={{ position: 'absolute', left: 500, top: 175, opacity: split1P }}>
            x₁ &gt; {SPLIT1.t.toFixed(2)}
          </Label>
          <Node x={230} y={235} c={NODES.left.c} g={NODES.left.g} o={split1P} />
          <Node x={610} y={235} c={NODES.right.c} g={NODES.right.g} o={split1P} />
          <Label size={22} style={{ position: 'absolute', left: 380, top: 380, opacity: split2P }}>
            x₂ ≤ {SPLIT2.t.toFixed(2)}
          </Label>
          <Node x={500} y={435} c={NODES.rl.c} g={NODES.rl.g} o={split2P} />
          <Node x={720} y={435} c={NODES.rr.c} g={NODES.rr.g} o={split2P} />
          <div style={{ position: 'absolute', left: 30, bottom: 36, opacity: ease(frame, giniAt, 14) }}>
            <Tex size={44}>G = 1 − Σ_k p_k²</Tex>
          </div>
        </Panel>
      </Layer>

      {/* right, later: bagging votes */}
      <Layer opacity={bagO}>
        <Panel style={{ left: 840, top: 0, width: 840, height: 600 }}>
          <Label size={24}>7 trees on bootstrap samples vote on ★</Label>
          <div style={{ display: 'flex', gap: 16, marginTop: 50, justifyContent: 'center' }}>
            {BAG_VOTES.map((v, i) => {
              const p = ease(frame, bagAt + 20 + i * 6, 12);
              return (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, opacity: p }}>
                  <svg width={70} height={60}>
                    <path d="M 35 8 L 12 50 M 35 8 L 58 50" stroke={C.muted} strokeWidth={3} />
                    <circle cx={35} cy={8} r={7} fill={C.muted} />
                    <circle cx={12} cy={50} r={7} fill={CLASS[0]} />
                    <circle cx={58} cy={50} r={7} fill={CLASS[1]} />
                  </svg>
                  <div style={{ width: 70, height: 70, borderRadius: 14, background: rgba(CLASS[v], 0.3), border: `2px solid ${CLASS[v]}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F.mono, fontSize: 34, color: C.text }}>
                    {v}
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ marginTop: 60, textAlign: 'center', opacity: ease(frame, bagAt + 70, 14) }}>
            <Label size={30} color={C.text}>
              votes {BAG_VOTES.length - ones} : {ones} → class <span style={{ color: CLASS[bagPred] }}>{bagPred}</span>
            </Label>
          </div>
        </Panel>
      </Layer>

      <Layer opacity={ease(frame, chipsAt, 14)}>
        <Panel style={{ left: 840, top: 0, width: 840, height: 600, background: 'transparent', border: 'none' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 34, marginTop: 110 }}>
            {['Gini Impurity', 'Decision Tree Classifier with Bagging', 'Gradient Boosting with Stumps'].map((t, i) => (
              <ProblemChip key={t} title={t} progress={ease(frame, chipsAt + 6 + i * 30, 14)} />
            ))}
          </div>
        </Panel>
      </Layer>
    </>
  );
};
