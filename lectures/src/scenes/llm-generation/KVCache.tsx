import React from 'react';
import { useCurrentFrame } from 'remotion';
import type { SceneProps } from '..';
import { C, F, rgba } from '../../theme';
import { ease, lin, windowed } from '../../lib/anim';
import { Layer, Matrix, ProblemChip } from '../../components/ui';
import { Bars, Panel, Readout } from '../../components/plot';
import { KK, KV_ATTN, KV_TOKENS, KV_V, cachedRows, naiveRows } from './data';

const N = KV_TOKENS.length;

export const KVCacheScene: React.FC<SceneProps> = ({ cues, durationInFrames }) => {
  const frame = useCurrentFrame();

  const naive0 = cues.at('a naive implementation');
  const naive1 = cues.sentence('But those keys');
  const sameAt = cues.at('never change');
  const cache0 = cues.at('At each step we project');
  const cache1 = cues.end('let that single query', -0.5);
  const workAt = cues.at('The work per step');
  const memAt = cues.at('paid for with memory');
  const chip = ease(frame, cues.sentence("You'll build this"), 20);

  const intro = frame < naive0;
  const naive = !intro && frame < cache0;
  const prog = intro ? lin(frame, 40, naive0 - 10) : naive ? lin(frame, naive0, naive1) : lin(frame, cache0, cache1);
  const started = frame >= 40;
  const step = started ? Math.min(N - 1, Math.floor(prog * N * 0.999)) : -1; // 0-based newest token
  const within = started ? prog * N - Math.floor(prog * N) : 0;
  const flash = 1 - ease(within * 30, 6, 16); // highlight fades during each step

  const computedNow = (i: number) => (step < 0 ? false : naive ? i <= step : i === step);
  const hi = intro ? C.violet : naive ? C.rose : C.teal;
  const cellColor = (base: (v: number, i: number, j: number) => string | undefined) => (v: number, i: number, j: number) =>
    computedNow(i) && flash > 0.05 ? rgba(hi, 0.25 + 0.5 * flash) : base(v, i, j);
  const base = () => rgba(C.text, 0.05);

  const naiveCount = intro ? 0 : naiveRows(naive ? step + 1 : N);
  const cachedCount = naive ? 0 : cachedRows(step + 1);

  return (
    <Layer opacity={windowed(frame, 0, durationInFrames + 30)}>
      {/* token strip */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 16 }}>
        {KV_TOKENS.map((t, i) => (
          <div
            key={i}
            style={{
              width: 130,
              padding: '10px 0',
              textAlign: 'center',
              borderRadius: 12,
              fontFamily: F.mono,
              fontSize: 32,
              color: i === step ? '#fff' : i < step ? C.text : C.dim,
              background: i === step ? rgba(hi, 0.45) : rgba(C.text, i <= step ? 0.06 : 0.02),
              border: `1px solid ${i === step ? hi : C.line2}`,
            }}
          >
            {t}
          </div>
        ))}
      </div>

      <div style={{ position: 'absolute', top: 110, left: 0, display: 'flex', gap: 70 }}>
        <Matrix data={KK} label="K cache" shape={false} cellW={88} cellH={52} fontSize={20} rowLabels={KV_TOKENS} reveal={(i) => (i <= step ? 1 : 0)} color={cellColor(base)} />
        <Matrix data={KV_V} label="V cache" shape={false} cellW={88} cellH={52} fontSize={20} reveal={(i) => (i <= step ? 1 : 0)} color={cellColor(base)} />
      </div>
      <div style={{ position: 'absolute', top: 545, left: 0, width: 980, textAlign: 'center', fontFamily: F.body, fontSize: 28, color: naive ? C.rose : C.teal, opacity: intro ? 0 : 1 }}>
        {naive ? 'naive: re-project every previous token' : 'cached: project only the new token'}
      </div>
      <div style={{ position: 'absolute', top: 592, left: 0, width: 980, textAlign: 'center', fontFamily: F.body, fontSize: 26, color: C.muted, opacity: windowed(frame, sameAt, cache0) }}>
        …but old rows come out identical every time
      </div>

      <Panel title="newest query attends to the cache" style={{ position: 'absolute', top: 110, left: 1010, width: 670, opacity: ease(frame, cache0, 18) }}>
        <Bars
          values={step >= 0 ? KV_ATTN[step].concat(new Array(N - step - 1).fill(0)) : new Array(N).fill(0)}
          labels={KV_TOKENS}
          width={600}
          height={250}
          max={0.8}
          labelSize={22}
          valueSize={20}
          alpha={(i) => (i <= step ? 1 : 0.15)}
          color={() => C.teal}
        />
      </Panel>
      <Panel title="K, V rows projected so far" style={{ position: 'absolute', top: 525, left: 1010, width: 670, opacity: ease(frame, naive0, 18) }}>
        <div style={{ display: 'flex', gap: 60 }}>
          <Readout size={40} color={C.rose}>naive {naiveCount}</Readout>
          <Readout size={40} color={C.teal} style={{ opacity: ease(frame, cache0, 16) }}>
            cached {cachedCount}
          </Readout>
        </div>
        <div style={{ marginTop: 16, fontFamily: F.body, fontSize: 24, color: C.muted, opacity: ease(frame, workAt, 16) }}>
          {`n(n+1)/2 vs n for n = ${N} tokens`}
          <span style={{ opacity: ease(frame, memAt, 16) }}> · cache grows with n</span>
        </div>
      </Panel>

      <div style={{ position: 'absolute', top: 630, left: 0, width: 980, display: 'flex', justifyContent: 'center' }}>
        <ProblemChip title="KV Cache for Efficient Generation" progress={chip} />
      </div>
    </Layer>
  );
};
