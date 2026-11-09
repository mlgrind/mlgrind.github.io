import React from 'react';
import { useCurrentFrame } from 'remotion';
import type { SceneProps } from '..';
import { C, F, HEAD, rgba } from '../../theme';
import { ease, windowed } from '../../lib/anim';
import { Layer, ProblemChip, Tex } from '../../components/ui';
import { C_PREV, F_STEPS, LH, LSTM, forgetProduct } from './data';
import { VecRow } from './common';

const GATE_COLORS = { i: HEAD[0], f: HEAD[1], g: HEAD[2], o: HEAD[3] };
const F_DEMO = [0.99, 0.9, 0.5];
const rowsH = (k: number) => (k === 0 ? '0' : k === 1 ? 'H' : `${k}H`);

export const LstmScene: React.FC<SceneProps> = ({ cues, durationInFrames }) => {
  const frame = useCurrentFrame();
  const a = [54, cues.sentence('When the forget gate')];
  const b = [a[1], cues.sentence('In PyTorch the four')];
  const c = [b[1], durationInFrames];

  const beltAt = cues.at('conveyor belt');
  const gatesAt = cues.at('Three sigmoid gates');
  const fAt = cues.at('The forget gate decides');
  const iAt = cues.at('the input gate');
  const oAt = cues.at('the output gate');
  const keyAt = cues.at('The key line');
  const cAt = cues.at('the new cell is');
  const hl = (at: number, until: number) => ease(frame, at, 10) * (1 - ease(frame, until, 10));

  return (
    <>
      <Layer opacity={windowed(frame, a[0], a[1])}>
        <div style={{ position: 'absolute', left: 0, top: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <VecRow label="c_{t−1}" v={C_PREV} p={ease(frame, a[0] + 6, 16)} note="old cell state" />
          <div style={{ height: 6 }} />
          <VecRow label="f" v={LSTM.f} gate hue={GATE_COLORS.f} p={ease(frame, gatesAt, 14)} highlight={hl(fAt, iAt)} note="forget: keep" />
          <VecRow label="i" v={LSTM.i} gate hue={GATE_COLORS.i} p={ease(frame, gatesAt + 6, 14)} highlight={hl(iAt, oAt)} note="input: write" />
          <VecRow label="g" v={LSTM.g} p={ease(frame, iAt + 10, 14)} note="candidate (tanh)" />
          <VecRow label="o" v={LSTM.o} gate hue={GATE_COLORS.o} p={ease(frame, gatesAt + 12, 14)} highlight={hl(oAt, keyAt)} note="output: expose" />
          <div style={{ height: 6 }} />
          <VecRow label="c_t" v={LSTM.c} p={ease(frame, cAt + 30, 16)} highlight={ease(frame, cAt + 30, 16)} hue={C.amber} />
          <VecRow label="h_t" v={LSTM.h} p={ease(frame, cAt + 60, 16)} />
        </div>
        <div style={{ position: 'absolute', left: 1020, top: 20, display: 'flex', flexDirection: 'column', gap: 34 }}>
          <div style={{ opacity: ease(frame, beltAt, 16), padding: '16px 22px', borderRadius: 14, border: `1px solid ${rgba(C.amber, 0.5)}`, background: rgba(C.amber, 0.08) }}>
            <div style={{ fontFamily: F.body, fontSize: 24, color: C.muted, marginBottom: 10 }}>cell state: the conveyor belt</div>
            <svg width={560} height={40}>
              <line x1={0} x2={540} y1={20} y2={20} stroke={C.amber} strokeWidth={6} />
              {[0, 1, 2, 3, 4, 5].map((k) => (
                <rect key={k} x={((k * 100 + frame * 2) % 600) - 30} y={10} width={30} height={20} rx={4} fill={rgba(C.amber, 0.7)} />
              ))}
            </svg>
          </div>
          <div style={{ opacity: ease(frame, gatesAt, 16) }}>
            <Tex size={38}>{'gates = x W_{ih}^T + h W_{hh}^T + b'}</Tex>
            <div style={{ fontFamily: F.body, fontSize: 24, color: C.muted, marginTop: 8 }}>σ for i, f, o · tanh for g</div>
          </div>
          <div style={{ opacity: ease(frame, keyAt, 16), padding: '10px 16px', borderRadius: 12, boxShadow: `0 0 0 2px ${rgba(C.amber, 0.8 * ease(frame, keyAt, 16))}` }}>
            <Tex size={46} color={C.amber}>{'c_t = f ⊙ c_{t−1} + i ⊙ g'}</Tex>
          </div>
          <div style={{ opacity: ease(frame, cAt + 60, 16) }}>
            <Tex size={46}>{'h_t = o ⊙ tanh(c_t)'}</Tex>
          </div>
          <div style={{ fontFamily: F.mono, fontSize: 24, color: C.muted, opacity: ease(frame, cAt + 30, 16) }}>
            e.g. {LSTM.f[0].toFixed(2)}·({C_PREV[0].toFixed(2)}) + {LSTM.i[0].toFixed(2)}·({LSTM.g[0].toFixed(2)}) = {LSTM.c[0].toFixed(2)}
          </div>
        </div>
      </Layer>

      <Layer opacity={windowed(frame, b[0], b[1])} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 40, paddingBottom: 40 }}>
        <Tex size={50}>{`∂c_t / ∂c_{t−1} = f   ⇒   after ${F_STEPS} steps:  f^{${F_STEPS}}`}</Tex>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
          {F_DEMO.map((f, k) => {
            const v = forgetProduct(f, F_STEPS);
            const p = ease(frame, b[0] + 20 + k * 12, 20);
            const w = Math.max(4, (Math.log10(v) + 32) / 32 * 900);
            return (
              <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 24, opacity: p }}>
                <span style={{ width: 150, fontFamily: F.mono, fontSize: 28, color: C.text, textAlign: 'right' }}>f = {f}</span>
                <div style={{ width: 920 }}>
                  <div style={{ width: w * p, height: 34, borderRadius: 6, background: [C.teal, C.amber, C.rose][k] }} />
                </div>
                <span style={{ width: 200, fontFamily: F.mono, fontSize: 28, color: [C.tealLight, C.amber, C.rose][k] }}>{v < 0.01 ? v.toExponential(1).replace('-', '−') : v.toFixed(2)}</span>
              </div>
            );
          })}
        </div>
        <div style={{ fontFamily: F.body, fontSize: 24, color: C.dim }}>log scale · forget bias is often initialised to 1 so f starts near 1</div>
      </Layer>

      <Layer opacity={windowed(frame, c[0], c[1] + 30)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 40, paddingBottom: 40 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 30 }}>
          <Tex size={44}>{'W_{ih}'}</Tex>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {(['i', 'f', 'g', 'o'] as const).map((k, n) => (
              <div key={k} style={{ width: 340, height: 64, borderRadius: 8, background: rgba(GATE_COLORS[k], 0.4), border: `2px solid ${GATE_COLORS[k]}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 18px', fontFamily: F.mono, fontSize: 26, color: C.text, opacity: ease(frame, c[0] + 10 + n * 10, 14) }}>
                <span>{k}</span>
                <span style={{ color: C.muted, fontSize: 22 }}>rows {rowsH(n)}:{rowsH(n + 1)}</span>
              </div>
            ))}
          </div>
          <div style={{ fontFamily: F.mono, fontSize: 28, color: C.muted }}>(4H, D)</div>
        </div>
        <div style={{ fontFamily: F.body, fontSize: 26, color: C.muted }}>split(gates, 4) → i, f, g, o   (H = {LH} here)</div>
        <ProblemChip title="LSTM Cell" progress={ease(frame, cues.sentence("That's the LSTM"), 18)} />
      </Layer>
    </>
  );
};
