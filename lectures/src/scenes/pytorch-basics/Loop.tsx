import React from 'react';
import { useCurrentFrame } from 'remotion';
import type { SceneProps } from '..';
import { C, F, rgba } from '../../theme';
import { ease, lin, windowed } from '../../lib/anim';
import { Layer, ProblemChip } from '../../components/ui';
import { Plot } from '../../components/kit';
import { fmt } from '../../lib/math';
import { BUGGY, EPOCHS, GOOD, LR } from './data';

const STEPS = ['optimizer.zero_grad()', 'pred = model(X)', 'loss = loss_fn(pred, y)', 'loss.backward()', 'optimizer.step()'];

export const LoopScene: React.FC<SceneProps> = ({ cues, durationInFrames }) => {
  const frame = useCurrentFrame();
  const start = cues.sentence('Everything comes together');
  const stepAt = [cues.sentence('Zero the gradients'), cues.sentence('Run the forward'), cues.sentence('Compute the loss'), cues.sentence('Call backward'), cues.sentence('And step the')];
  const repAt = cues.sentence('Repeat, and the loss');
  const bugAt = cues.sentence('The classic bug');
  const accAt = cues.at('Gradients accumulate');
  const chipAt = cues.sentence('The Training Loop problem');
  // cycle through the steps once per "epoch" while the loss curve draws
  let active = -1;
  stepAt.forEach((t, k) => {
    if (frame >= t) active = k;
  });
  const drawn = lin(frame, repAt, repAt + 60) * EPOCHS;
  if (frame >= repAt) active = Math.floor(drawn * 5) % 5;
  const bugDrawn = lin(frame, accAt, accAt + 90) * EPOCHS;
  const bugO = ease(frame, bugAt, 14);
  if (frame >= bugAt) active = 0;
  const yMax = 4;
  const pts = (ls: number[], n: number, s: { x: (v: number) => number; y: (v: number) => number }) =>
    ls
      .slice(0, Math.max(1, Math.ceil(n)))
      .map((l, e) => `${s.x(e)},${s.y(Math.min(l, yMax))}`)
      .join(' ');

  return (
    <Layer opacity={windowed(frame, start, durationInFrames + 30)}>
      <div style={{ position: 'absolute', left: 0, top: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ fontFamily: F.mono, fontSize: 26, color: C.muted, marginBottom: 6 }}>for epoch in range(epochs):</div>
        {STEPS.map((s, k) => {
          const on = k === active;
          const isBug = k === 0 && frame >= bugAt;
          return (
            <div
              key={s}
              style={{
                marginLeft: 40,
                padding: '12px 20px',
                borderRadius: 12,
                fontFamily: F.mono,
                fontSize: 28,
                color: isBug ? C.rose : on ? '#fff' : C.text,
                background: isBug ? rgba(C.rose, 0.14) : on ? rgba(C.violet, 0.45) : rgba(C.panel2, 0.9),
                border: `1px solid ${isBug ? C.rose : on ? C.violetLight : C.line2}`,
                opacity: ease(frame, stepAt[k] - 4, 12),
                textDecoration: isBug && frame >= accAt ? 'line-through' : 'none',
                width: 470,
              }}
            >
              <span style={{ color: C.dim, marginRight: 14 }}>{k + 1}</span>
              {s}
            </div>
          );
        })}
      </div>
      <div style={{ position: 'absolute', left: 660, top: 10, opacity: ease(frame, repAt - 10, 14) }}>
        <Plot width={1000} height={520} x={[0, EPOCHS - 1]} y={[0, yMax]} xTicks={[0, 10, 20, 30]} yTicks={[0, 1, 2, 3, 4]} xLabel="epoch" yLabel="MSE loss">
          {(s) => (
            <>
              <polyline points={pts(GOOD.losses, drawn, s)} fill="none" stroke={C.teal} strokeWidth={5} strokeLinejoin="round" />
              <polyline points={pts(BUGGY.losses, bugDrawn, s)} fill="none" stroke={C.rose} strokeWidth={4} strokeLinejoin="round" opacity={bugO} />
            </>
          )}
        </Plot>
        <div style={{ display: 'flex', gap: 40, marginLeft: 70, marginTop: 4, fontFamily: F.mono, fontSize: 24 }}>
          <span style={{ color: C.teal }}>with zero_grad: {fmt(GOOD.losses[0], 2)} → {fmt(GOOD.losses[EPOCHS - 1], 3)}</span>
          <span style={{ color: C.rose, opacity: bugO }}>without: gradients pile up</span>
        </div>
        <div style={{ marginLeft: 70, marginTop: 8, fontFamily: F.body, fontSize: 22, color: C.dim }}>linear model, full-batch gradient descent, lr = {LR}, w = 0 and b = 0 at the start</div>
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 630, display: 'flex', justifyContent: 'center' }}>
        <ProblemChip title="The Training Loop" progress={ease(frame, chipAt, 20)} />
      </div>
    </Layer>
  );
};
