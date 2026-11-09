import React from 'react';
import { useCurrentFrame } from 'remotion';
import type { SceneProps } from '..';
import { C, F, HEAD, rgba } from '../../theme';
import { ease, mix, windowed } from '../../lib/anim';
import { Layer, ProblemChip } from '../../components/ui';
import { Code } from '../../components/kit';
import { fmt } from '../../lib/math';
import { BATCH, BATCHES, DN, DX, DY, PERM } from './data';

const CW = 104;
const G = 14;

export const BatchesScene: React.FC<SceneProps> = ({ cues, durationInFrames }) => {
  const frame = useCurrentFrame();
  const start = cues.sentence('Real datasets');
  const shufAt = cues.at('shuffles the sample indices');
  const cutAt = cues.at('cuts them into chunks');
  const pairAt = cues.at('Rows of X stay paired');
  const dropAt = cues.at('drop last');
  const chipAt = cues.sentence('You will write this');
  const restAt = cues.sentence('The rest of the section');
  const shuf = ease(frame, shufAt + 10, 30);
  const cut = ease(frame, cutAt, 20);
  const pair = ease(frame, pairAt, 16);
  const drop = ease(frame, dropAt + 10, 16);
  const width = DN * CW + (DN - 1) * G + cut * 2 * 60;
  const x0 = (1680 - width) / 2;
  const posOf = (i: number) => {
    const slot = mix(i, PERM.indexOf(i), shuf);
    const batch = Math.floor(PERM.indexOf(i) / BATCH);
    return x0 + slot * (CW + G) + cut * batch * 60;
  };
  const restO = ease(frame, restAt, 16);

  return (
    <Layer opacity={windowed(frame, start, durationInFrames + 30)}>
      <div style={{ opacity: 1 - restO }}>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 0, display: 'flex', justifyContent: 'center', opacity: ease(frame, start + 10, 14) }}>
          <Code size={26}>{`DataLoader(dataset, batch_size=${BATCH}, shuffle=True, generator=torch.Generator().manual_seed(0))`}</Code>
        </div>
        <div style={{ position: 'absolute', left: x0 - 150, top: 196, fontFamily: F.body, fontSize: 24, color: C.muted }}>index</div>
        <div style={{ position: 'absolute', left: x0 - 150, top: 300, fontFamily: F.body, fontSize: 24, color: C.muted, opacity: pair }}>x, y</div>
        {Array.from({ length: DN }, (_, i) => {
          const batch = Math.floor(PERM.indexOf(i) / BATCH);
          const hue = cut > 0 ? HEAD[batch] : C.violetLight;
          const dropped = batch === BATCHES.length - 1 && BATCHES[batch].length < BATCH;
          const o = ease(frame, start + i * 2, 12) * (dropped ? 1 - 0.75 * drop : 1);
          return (
            <div key={i} style={{ position: 'absolute', left: posOf(i), top: 170, width: CW, opacity: o }}>
              <div style={{ height: 80, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F.mono, fontSize: 34, color: C.text, background: rgba(hue, 0.2 + 0.15 * cut), border: `1px solid ${rgba(hue, 0.6)}` }}>{i}</div>
              <div style={{ marginTop: 14, height: 76, borderRadius: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: F.mono, fontSize: 22, color: C.muted, background: rgba(C.text, 0.04), opacity: pair }}>
                <span style={{ color: C.text }}>{fmt(DX[i], 1)}</span>
                <span style={{ color: DY[i] ? C.teal : C.amber }}>y={DY[i]}</span>
              </div>
            </div>
          );
        })}
        {BATCHES.map((b, k) => (
          <div key={k} style={{ position: 'absolute', left: posOf(b[0]), top: 400, width: b.length * CW + (b.length - 1) * G, textAlign: 'center', fontFamily: F.body, fontSize: 26, color: HEAD[k], opacity: cut * (k === BATCHES.length - 1 && b.length < BATCH ? 1 - 0.6 * drop : 1) }}>
            batch {k + 1} · {b.length}
            {k === BATCHES.length - 1 && b.length < BATCH && <div style={{ color: C.rose, opacity: drop, marginTop: 6 }}>dropped (drop_last)</div>}
          </div>
        ))}
        <div style={{ position: 'absolute', left: 0, right: 0, top: 110, textAlign: 'center', fontFamily: F.body, fontSize: 26, color: C.muted, opacity: shuf }}>
          seeded shuffle: same seed, same batches
        </div>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 560, display: 'flex', justifyContent: 'center' }}>
          <ProblemChip title="Minibatches: Dataset & DataLoader" progress={ease(frame, chipAt, 20)} />
        </div>
      </div>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexWrap: 'wrap', alignContent: 'center', justifyContent: 'center', gap: 22, padding: '0 120px 80px', opacity: restO }}>
        {['RMS Normalization', 'Group Normalization', 'SGD with Momentum', 'Adam Optimizer', 'Learning Rate Scheduling', 'Gradient Accumulation', 'Cross-Attention', 'LoRA Adapter'].map((t, k) => (
          <ProblemChip key={t} title={t} progress={ease(frame, restAt + k * 5, 16)} />
        ))}
      </div>
    </Layer>
  );
};
