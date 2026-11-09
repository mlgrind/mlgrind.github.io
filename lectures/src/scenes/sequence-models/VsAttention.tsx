import React from 'react';
import { useCurrentFrame } from 'remotion';
import type { SceneProps } from '..';
import { C, F, rgba } from '../../theme';
import { ease, lin } from '../../lib/anim';
import { Axes, Legend, Panel, linear, linePath } from '../../components/charts';
import { MEM, MEM_T, kvCacheBytes, rnnStateBytes } from './data';

const N = 8;
const mb = (b: number) => b / 2 ** 20;

export const VsAttentionScene: React.FC<SceneProps> = ({ cues, durationInFrames }) => {
  const frame = useCurrentFrame();
  const parAt = cues.at('trains in parallel');
  const advAt = cues.at('one big advantage');
  const growAt = cues.at('keeps growing');
  const ssmAt = cues.at('state space models');
  const fade = Math.min(ease(frame, 54, 16), 1 - ease(frame, durationInFrames - 20, 14));

  // left: training dependency (RNN steps sequential, attention all at once)
  const seqP = lin(frame, 60, parAt + 60) * N;
  const parP = ease(frame, parAt, 20);

  // right: memory per generated token
  const W = 640;
  const Hh = 330;
  const tMax = MEM_T[MEM_T.length - 1];
  const sx = linear(0, tMax, 0, W);
  const yMax = mb(kvCacheBytes(tMax)) * 1.1;
  const sy = linear(0, yMax, Hh, 0);
  const draw = lin(frame, advAt, growAt + 20);
  const kv = Array.from({ length: 41 }, (_, i) => [(i / 40) * tMax, mb(kvCacheBytes((i / 40) * tMax))] as [number, number]);
  const rnn = Array.from({ length: 41 }, (_, i) => [(i / 40) * tMax, mb(rnnStateBytes())] as [number, number]);

  return (
    <div style={{ position: 'absolute', inset: 0, opacity: fade }}>
      <Panel x={0} y={0} w={780} h={560}>
        <div style={{ position: 'absolute', left: 36, top: 26, fontFamily: F.body, fontSize: 26, color: C.muted }}>training over {N} positions</div>
        {[
          { name: 'RNN', y: 140, p: (k: number) => Math.max(0, Math.min(1, seqP - k)), color: C.violetLight, chain: true },
          { name: 'attention', y: 330, p: () => parP, color: C.teal, chain: false },
        ].map((row) => (
          <div key={row.name} style={{ position: 'absolute', left: 36, top: row.y }}>
            <div style={{ fontFamily: F.mono, fontSize: 26, color: row.color, marginBottom: 16 }}>{row.name}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: row.chain ? 0 : 18 }}>
              {Array.from({ length: N }, (_, k) => (
                <React.Fragment key={k}>
                  {row.chain && k > 0 && <div style={{ width: 22, height: 3, background: C.dim }} />}
                  <div style={{ width: 62, height: 62, borderRadius: 10, background: rgba(row.color, 0.1 + 0.6 * row.p(k)), border: `2px solid ${rgba(row.color, 0.3 + 0.7 * row.p(k))}` }} />
                </React.Fragment>
              ))}
            </div>
            <div style={{ fontFamily: F.body, fontSize: 24, color: C.muted, marginTop: 14 }}>
              {row.chain ? `${N} steps, one after another` : '1 step, all positions at once'}
            </div>
          </div>
        ))}
      </Panel>

      <Panel x={820} y={0} w={860} h={560}>
        <div style={{ position: 'absolute', left: 36, top: 26, fontFamily: F.body, fontSize: 26, color: C.muted, opacity: ease(frame, advAt, 16) }}>
          memory kept while generating (1 layer, d = {MEM.d}, fp16)
        </div>
        <svg width={860} height={500} style={{ position: 'absolute', left: 0, top: 70, opacity: ease(frame, advAt, 16) }}>
          <g transform="translate(120,30)">
            <Axes sx={sx} sy={sy} xTicks={MEM_T} yTicks={[0, 4, 8, 12, 16]} yFormat={(v) => `${v} MB`} xLabel="tokens generated" />
            <path d={linePath(kv, sx, sy, draw)} fill="none" stroke={C.rose} strokeWidth={5} />
            <path d={linePath(rnn, sx, sy, draw)} fill="none" stroke={C.violetLight} strokeWidth={5} />
          </g>
        </svg>
        <div style={{ position: 'absolute', left: 150, top: 110, display: 'flex', flexDirection: 'column', gap: 12, opacity: ease(frame, growAt, 16) }}>
          <Legend items={[{ color: C.rose, label: `KV cache: ${mb(kvCacheBytes(tMax)).toFixed(0)} MB at ${tMax} tokens` }]} />
          <Legend items={[{ color: C.violetLight, label: `RNN state: ${(rnnStateBytes() / 1024).toFixed(0)} KB, always` }]} />
        </div>
      </Panel>

      <div style={{ position: 'absolute', left: 0, right: 0, top: 610, display: 'flex', justifyContent: 'center', opacity: ease(frame, ssmAt, 18) }}>
        <div style={{ padding: '14px 28px', borderRadius: 999, background: rgba(C.violet, 0.14), border: `1px solid ${rgba(C.violetLight, 0.4)}`, fontFamily: F.body, fontSize: 28, color: C.text }}>
          state space models such as Mamba: recurrent at inference, parallel in training
        </div>
      </div>
    </div>
  );
};
