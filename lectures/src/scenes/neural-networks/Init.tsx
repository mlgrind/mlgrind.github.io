import React from 'react';
import { useCurrentFrame } from 'remotion';
import type { SceneProps } from '..';
import { C, F, HEAD, rgba } from '../../theme';
import { ease, lin } from '../../lib/anim';
import { ProblemChip, Tex } from '../../components/ui';
import { Axes, polyline, scales } from '../../components/plot';
import { DEPTH, HE_STD, INIT, WIDTH, XAVIER_STD } from './data';

const PW = 760;
const PH = 470;
const COLORS = [C.rose, C.amber, HEAD[0], C.teal];
const LOG: [number, number] = [-7, 3];
/** y ticks are log10 values; x ticks (layers) are 1, 4, 7, 10, so the keys never collide */
const POW: Record<number, string> = { [-6]: '10⁻⁶', [-3]: '10⁻³', 0: '1', 3: '10³' };

export const InitScene: React.FC<SceneProps> = ({ cues }) => {
  const frame = useCurrentFrame();
  const axesAt = cues.at('Each layer multiplies');
  const at = [cues.at('Too small'), cues.at('Too large'), cues.at('Xavier initialization'), cues.at('He initialization')];
  const twoAt = cues.at('The extra factor of two');
  const chipAt = cues.at("That's the Xavier");

  const { sx, sy } = scales(PW, PH, [1, DEPTH], LOG);
  return (
    <>
      <svg width={PW + 300} height={PH + 100} style={{ position: 'absolute', left: 130, top: 20, overflow: 'visible', opacity: ease(frame, axesAt - 10, 16) }}>
        <Axes
          w={PW}
          h={PH}
          x={[1, DEPTH]}
          y={LOG}
          xTicks={[1, 4, 7, 10]}
          yTicks={[-6, -3, 0, 3]}
          fmtTick={(v) => POW[v] ?? String(v)}
          xLabel="layer"
          yLabel="activation scale (RMS)"
        />
        {INIT.map((c, k) => {
          const pts = c.rms.map((v, l) => ({ x: sx(l + 1), y: sy(Math.log10(v)) }));
          const draw = lin(frame, at[k], at[k] + 30);
          const last = pts[pts.length - 1];
          return (
            <g key={c.name} opacity={ease(frame, at[k], 10)}>
              <path d={polyline(pts, draw)} fill="none" stroke={COLORS[k]} strokeWidth={5} strokeLinejoin="round" />
              {pts.map((p, l) => (draw * (DEPTH - 1) >= l - 0.01 ? <circle key={l} cx={p.x} cy={p.y} r={6} fill={COLORS[k]} /> : null))}
              <text x={last.x + 18} y={last.y + 8} fill={COLORS[k]} fontFamily={F.mono} fontSize={24} opacity={ease(frame, at[k] + 30, 12)}>
                {c.rms[DEPTH - 1].toExponential(1)}
              </text>
            </g>
          );
        })}
      </svg>

      <div style={{ position: 'absolute', left: 1080, top: 10, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ fontFamily: F.body, fontSize: 24, color: C.muted, opacity: ease(frame, axesAt, 16) }}>
          10 layers · width {WIDTH} · weights ~ N(0, std²)
        </div>
        {INIT.map((c, k) => (
          <div key={c.name} style={{ display: 'flex', alignItems: 'center', gap: 14, opacity: ease(frame, at[k], 14) }}>
            <div style={{ width: 30, height: 6, borderRadius: 3, background: COLORS[k] }} />
            <span style={{ fontFamily: F.mono, fontSize: 26, color: C.text }}>{c.name}</span>
            <span style={{ fontFamily: F.body, fontSize: 24, color: C.muted }}>{c.act}</span>
          </div>
        ))}
        <div style={{ opacity: ease(frame, at[2], 14), marginTop: 20, padding: '18px 22px', borderRadius: 16, background: rgba(C.panel, 0.8), border: `1px solid ${C.line}`, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ opacity: ease(frame, at[2], 14) }}>
            <Tex size={38}>{`Xavier: √(2 / (n_{in} + n_{out})) = ${XAVIER_STD.toFixed(3)}`}</Tex>
          </div>
          <div style={{ opacity: ease(frame, at[3], 14) }}>
            <Tex size={38}>{`He: √(2 / n_{in}) = ${HE_STD.toFixed(3)}`}</Tex>
          </div>
          <div style={{ fontFamily: F.body, fontSize: 24, color: C.amber, opacity: ease(frame, twoAt, 14) }}>
            ×2 because ReLU zeroes about half its inputs
          </div>
        </div>
        <div style={{ height: 70, marginTop: 10 }}>
          <ProblemChip title="Xavier/He Weight Initialization" progress={ease(frame, chipAt, 18)} />
        </div>
      </div>
    </>
  );
};
