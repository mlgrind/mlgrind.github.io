import React from 'react';
import { useCurrentFrame } from 'remotion';
import type { SceneProps } from '..';
import { C, F } from '../../theme';
import { ease, windowed } from '../../lib/anim';
import { Layer, Matrix, ProblemChip, Tex, signedColor } from '../../components/ui';
import { Panel, Readout } from '../../components/plot';
import { DFF_SWIGLU, D_BIG, GATE, GATED, PRE_GATE, RELU_PARAMS, SILU_MIN, SWIGLU_PARAMS, UP, relu, silu } from './data';

const PW = 620;
const PH = 380;
const ZMIN = -6;
const ZMAX = 3;
const YMIN = -0.7;
const YMAX = 3;
const px = (z: number) => ((z - ZMIN) / (ZMAX - ZMIN)) * PW;
const py = (y: number) => PH - ((y - YMIN) / (YMAX - YMIN)) * PH;
const curve = (f: (z: number) => number, upto = 1) => {
  const pts: string[] = [];
  for (let i = 0; i <= 200 * upto; i++) {
    const z = ZMIN + ((ZMAX - ZMIN) * i) / 200;
    pts.push(`${px(z).toFixed(1)},${py(f(z)).toFixed(1)}`);
  }
  return pts.join(' ');
};

const ROW = { cellW: 80, cellH: 58, fontSize: 22, labelSize: 34, shape: false };

export const SwiGLUScene: React.FC<SceneProps> = ({ cues, durationInFrames }) => {
  const frame = useCurrentFrame();

  const reluAt = cues.at('used a ReLU');
  const swAt = cues.at('use SwiGLU');
  const twiceAt = cues.sentence('The input is projected twice');
  const siluAt = cues.at('passes through SiLU');
  const negAt = cues.at('little negative signal');
  const gateAt = cues.at('acts as a gate');
  const elemAt = cues.at('element by element');
  const downAt = cues.at('A third matrix');
  const paramsAt = cues.sentence('Because there are three');
  const eightAt = cues.at('eight thirds');
  const chip = ease(frame, cues.sentence("That's the SwiGLU"), 20);

  const curveP = ease(frame, siluAt, 40);
  const silu1 = windowed(frame, twiceAt, paramsAt + 6);

  return (
    <>
      <Layer opacity={windowed(frame, 0, twiceAt + 6)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 70, paddingBottom: 60 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 30, opacity: ease(frame, reluAt, 18) }}>
          <span style={{ fontFamily: F.body, fontSize: 28, color: C.muted, width: 300, textAlign: 'right' }}>original</span>
          <Tex size={66}>{'ReLU(x W_1) W_2'}</Tex>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 30, opacity: ease(frame, swAt, 18) }}>
          <span style={{ fontFamily: F.body, fontSize: 28, color: C.teal, width: 300, textAlign: 'right' }}>SwiGLU (LLaMA)</span>
          <Tex size={66}>{'(silu(x W_{gate}) ⊙ x W_{up}) W_{down}'}</Tex>
        </div>
      </Layer>

      <Layer opacity={silu1}>
        <Panel title="SiLU(z) = z · σ(z)" accent={C.teal} style={{ position: 'absolute', left: 0, top: 20, width: 700 }}>
          <svg width={PW} height={PH} style={{ overflow: 'visible' }}>
            <line x1={0} x2={PW} y1={py(0)} y2={py(0)} stroke={C.line2} strokeWidth={2} />
            <line x1={px(0)} x2={px(0)} y1={0} y2={PH} stroke={C.line2} strokeWidth={2} />
            {[-6, -4, 2].map((z) => (
              <text key={z} x={px(z)} y={py(0) + 30} fill={C.dim} fontFamily={F.mono} fontSize={22} textAnchor="middle">
                {z > 0 ? z : `−${-z}`}
              </text>
            ))}
            <polyline points={curve(relu)} fill="none" stroke={C.dim} strokeWidth={3} strokeDasharray="8 7" />
            <text x={px(-5.9)} y={py(0) - 14} fill={C.dim} fontFamily={F.mono} fontSize={22}>
              ReLU
            </text>
            <polyline points={curve(silu, curveP)} fill="none" stroke={C.teal} strokeWidth={5} />
            <g opacity={ease(frame, negAt, 16)}>
              <circle cx={px(SILU_MIN.z)} cy={py(SILU_MIN.v)} r={9} fill={C.amber} />
              <text x={px(SILU_MIN.z)} y={py(SILU_MIN.v) + 46} fill={C.amber} fontFamily={F.mono} fontSize={22} textAnchor="middle">
                min {SILU_MIN.v.toFixed(2)} at z = {SILU_MIN.z.toFixed(2)}
              </text>
            </g>
          </svg>
        </Panel>

        <div style={{ position: 'absolute', left: 760, top: 30, display: 'flex', flexDirection: 'column', gap: 34 }}>
          {[
            { d: PRE_GATE, l: 'x W_{gate}', at: twiceAt },
            { d: GATE, l: 'silu(·) = gate', at: siluAt + 10 },
            { d: UP, l: 'x W_{up}', at: twiceAt + 15 },
            { d: GATED, l: 'gate ⊙ up', at: elemAt },
          ].map(({ d, l, at }, k) => (
            <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 24, opacity: ease(frame, at, 16) }}>
              <div style={{ width: 170, textAlign: 'right' }}>
                <Tex size={32} color={k === 3 ? C.teal : k === 1 ? C.amber : C.text}>{l}</Tex>
              </div>
              <Matrix
                data={[d]}
                {...ROW}
                color={k === 1 ? (v) => (Math.abs(v) < 0.3 ? 'rgba(90,100,120,0.25)' : 'rgba(245,180,84,0.45)') : signedColor(2.5, 0.5)}
              />
            </div>
          ))}
          <div style={{ marginLeft: 194, fontFamily: F.body, fontSize: 24, color: C.amber, opacity: windowed(frame, gateAt, downAt + 20) }}>
            gate near 0 closes a feature, large gate lets it through
          </div>
          <div style={{ marginLeft: 194, fontFamily: F.body, fontSize: 24, color: C.muted, opacity: ease(frame, downAt, 16) }}>
            then W_down maps d_ff = 8 back to d_model = 4
          </div>
        </div>
      </Layer>

      <Layer opacity={windowed(frame, paramsAt, durationInFrames + 30)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 40, paddingBottom: 30 }}>
        <div style={{ fontFamily: F.body, fontSize: 28, color: C.muted }}>parameters at d_model = {D_BIG.toLocaleString('en-US')}</div>
        <div style={{ display: 'flex', gap: 60 }}>
          <Panel title="ReLU MLP, d_ff = 4 d" style={{ width: 640 }}>
            <Tex size={44}>{'2 × d × 4d'}</Tex>
            <Readout size={44} style={{ marginTop: 18 }}>{RELU_PARAMS.toLocaleString('en-US')}</Readout>
          </Panel>
          <Panel title={`SwiGLU, d_ff = (8/3) d ≈ ${DFF_SWIGLU.toLocaleString('en-US')}`} accent={C.teal} style={{ width: 640, opacity: ease(frame, eightAt, 18) }}>
            <Tex size={44}>{'3 × d × (8/3)d'}</Tex>
            <Readout size={44} color={C.teal} style={{ marginTop: 18 }}>
              {SWIGLU_PARAMS.toLocaleString('en-US')}
            </Readout>
          </Panel>
        </div>
        <div style={{ height: 70 }}>
          <ProblemChip title="SwiGLU Feed-Forward Block" progress={chip} />
        </div>
      </Layer>
    </>
  );
};
