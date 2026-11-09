import React from 'react';
import { useCurrentFrame } from 'remotion';
import type { SceneProps } from '..';
import { C, F, HEAD, rgba } from '../../theme';
import { ease, windowed } from '../../lib/anim';
import { Layer, ProblemChip, Tex } from '../../components/ui';
import { GH_PREV, GRU, PARAM_HD, cellParams } from './data';
import { VecRow } from './common';
import { linear } from '../../components/charts';

/** For each dimension: a line from n (z = 0) to h_{t-1} (z = 1) with h_t at position z. */
const Blend: React.FC<{ p: number; copyHl: number }> = ({ p, copyHl }) => {
  const sx = linear(-1.2, 1.2, 10, 690);
  return (
    <svg width={860} height={330}>
      {[-1, 0, 1].map((v) => (
        <g key={v}>
          <line x1={sx(v)} x2={sx(v)} y1={4} y2={270} stroke={v === 0 ? C.line2 : rgba(C.line2, 0.5)} strokeWidth={2} strokeDasharray={v === 0 ? undefined : '4 6'} />
          <text x={sx(v)} y={296} fill={C.dim} fontFamily={F.mono} fontSize={22} textAnchor="middle">
            {String(v).replace('-', '−')}
          </text>
        </g>
      ))}
      {GRU.h.map((h, k) => {
        const y = 30 + k * 66;
        const n = GRU.n[k];
        const hp = GH_PREV[k];
        const at = n + (h - n) * p;
        return (
          <g key={k}>
            <line x1={sx(n)} x2={sx(hp)} y1={y} y2={y} stroke={C.dim} strokeWidth={3} />
            <circle cx={sx(n)} cy={y} r={10} fill={HEAD[2]} />
            <circle cx={sx(hp)} cy={y} r={10} fill={C.muted} />
            <circle cx={sx(at)} cy={y} r={13} fill={C.violetLight} stroke={C.bg} strokeWidth={3} opacity={p} />
            <text x={720} y={y + 8} fill={GRU.z[k] > 0.6 ? C.tealLight : C.muted} fontFamily={F.mono} fontSize={24} opacity={p}>
              z = {GRU.z[k].toFixed(2)}
            </text>
          </g>
        );
      })}
      <text x={sx(-1.2)} y={326} fill={C.tealLight} fontFamily={F.body} fontSize={24} opacity={copyHl}>
        z = 1 copies the old state forward
      </text>
    </svg>
  );
};

export const GruScene: React.FC<SceneProps> = ({ cues, durationInFrames }) => {
  const frame = useCurrentFrame();
  const a = [54, cues.sentence('PyTorch applies')];
  const b = [a[1], durationInFrames];
  const twoAt = cues.at('uses two gates');
  const rAt = cues.at('The reset gate');
  const zAt = cues.at('the update gate blends');
  const formAt = cues.at('the new state is');
  const copyAt = cues.at('simply copies');
  const resetAfterAt = cues.at('after the matrix product');
  const orderAt = cues.at('stacks the blocks');
  const paramAt = cues.at('three quarters');
  const lstmP = cellParams(4);
  const gruP = cellParams(3);

  return (
    <>
      <Layer opacity={windowed(frame, a[0], a[1])}>
        <div style={{ position: 'absolute', left: 0, top: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <VecRow label="h_{t−1}" v={GH_PREV} p={ease(frame, a[0] + 6, 16)} cell={84} />
          <div style={{ height: 6 }} />
          <VecRow label="r" v={GRU.r} gate hue={HEAD[0]} p={ease(frame, twoAt, 14)} cell={84} highlight={ease(frame, rAt, 10) * (1 - ease(frame, zAt, 10))} />
          <VecRow label="z" v={GRU.z} gate hue={HEAD[1]} p={ease(frame, twoAt + 8, 14)} cell={84} highlight={ease(frame, zAt, 10)} />
          <VecRow label="n" v={GRU.n} p={ease(frame, rAt + 20, 14)} cell={84} />
          <div style={{ height: 6 }} />
          <VecRow label="h_t" v={GRU.h} p={ease(frame, formAt + 30, 16)} cell={84} />
        </div>
        <div style={{ position: 'absolute', left: 820, top: 0, display: 'flex', flexDirection: 'column', gap: 26 }}>
          <div style={{ opacity: ease(frame, rAt, 16) }}>
            <Tex size={40}>{'n = tanh(x W_{in}^T + b_{in} + r ⊙ (h W_{hn}^T + b_{hn}))'}</Tex>
          </div>
          <div style={{ opacity: ease(frame, formAt, 16), padding: '8px 14px', borderRadius: 12, boxShadow: `0 0 0 2px ${rgba(C.violetLight, 0.7 * ease(frame, formAt, 16))}`, alignSelf: 'flex-start' }}>
            <Tex size={46} color={C.violetLight}>{'h_t = (1 − z) ⊙ n + z ⊙ h_{t−1}'}</Tex>
          </div>
          <div style={{ opacity: ease(frame, formAt + 20, 16) }}>
            <Blend p={ease(frame, formAt + 30, 30)} copyHl={ease(frame, copyAt, 14)} />
          </div>
          <div style={{ display: 'flex', gap: 24, fontFamily: F.body, fontSize: 24, color: C.muted, marginTop: -8, alignItems: 'baseline', opacity: ease(frame, formAt + 20, 16) }}>
            <span><span style={{ color: HEAD[2] }}>●</span> n</span>
            <span><span style={{ color: C.muted }}>●</span> <Tex size={30} color={C.muted}>{'h_{t−1}'}</Tex></span>
            <span><span style={{ color: C.violetLight }}>●</span> <Tex size={30} color={C.muted}>{'h_t'}</Tex></span>
          </div>
        </div>
      </Layer>

      <Layer opacity={windowed(frame, b[0], b[1] + 30)}>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 0, display: 'flex', justifyContent: 'center', opacity: ease(frame, resetAfterAt, 16) }}>
          <Tex size={42}>{'r ⊙ (h W_{hn}^T + b_{hn})'}</Tex>
          <span style={{ fontFamily: F.body, fontSize: 26, color: C.tealLight, marginLeft: 26, alignSelf: 'center' }}>PyTorch</span>
          <span style={{ width: 60 }} />
          <Tex size={42} color={C.dim}>{'(r ⊙ h) W_{hn}^T'}</Tex>
          <span style={{ fontFamily: F.body, fontSize: 26, color: C.dim, marginLeft: 26, alignSelf: 'center' }}>original paper</span>
        </div>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 110, display: 'flex', justifyContent: 'center', gap: 120 }}>
          {[
            { name: 'LSTM', blocks: ['i', 'f', 'g', 'o'], total: lstmP, colors: [HEAD[0], HEAD[1], HEAD[2], HEAD[3]] },
            { name: 'GRU', blocks: ['r', 'z', 'n'], total: gruP, colors: [HEAD[0], HEAD[1], HEAD[2]] },
          ].map((cell, ci) => (
            <div key={cell.name} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, opacity: ease(frame, orderAt + ci * 10, 16) }}>
              <div style={{ fontFamily: F.body, fontSize: 30, color: C.text, fontWeight: 500 }}>{cell.name}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {cell.blocks.map((k, n) => (
                  <div key={k} style={{ width: 300, height: 60, borderRadius: 8, background: rgba(cell.colors[n], 0.35), border: `2px solid ${cell.colors[n]}`, display: 'flex', alignItems: 'center', paddingLeft: 18, fontFamily: F.mono, fontSize: 26, color: C.text }}>
                    {k}
                  </div>
                ))}
                {ci === 1 && <div style={{ width: 300, height: 60, borderRadius: 8, border: `2px dashed ${C.line2}` }} />}
              </div>
              <div style={{ fontFamily: F.mono, fontSize: 26, color: C.muted, opacity: ease(frame, paramAt, 16) }}>
                {cell.blocks.length}(HD + H² + 2H) = <span style={{ color: C.amber }}>{cell.total.toLocaleString('en-US')}</span>
              </div>
            </div>
          ))}
        </div>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 520, textAlign: 'center', fontFamily: F.body, fontSize: 26, color: C.muted, opacity: ease(frame, paramAt, 16) }}>
          H = D = {PARAM_HD.h}: GRU / LSTM = {(gruP / lstmP).toFixed(2)}
        </div>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 600, display: 'flex', justifyContent: 'center' }}>
          <ProblemChip title="GRU Cell" progress={ease(frame, cues.sentence("You'll build it in the GRU"), 18)} />
        </div>
      </Layer>
    </>
  );
};
