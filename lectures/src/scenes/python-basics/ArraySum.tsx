import React from 'react';
import { useCurrentFrame } from 'remotion';
import type { SceneProps } from '..';
import { C, F } from '../../theme';
import { ease, lin, windowed } from '../../lib/anim';
import { Layer, ProblemChip } from '../../components/ui';
import { Code, Plot } from '../../components/kit';
import { fmt } from '../../lib/math';
import { CUMSUM, SUM_ARR, TOTAL } from './data';

const N = SUM_ARR.length;

export const ArraySumScene: React.FC<SceneProps> = ({ cues, durationInFrames }) => {
  const frame = useCurrentFrame();
  const start = cues.sentence("Let's start with");
  const loopAt = cues.at('write a loop');
  const npAt = cues.at("NumPy's sum");
  const watchAt = cues.sentence('Watch the running total');
  const watchEnd = cues.end('Watch the running total');
  const finalAt = cues.at('The final value is the same');
  const chipAt = cues.sentence('That is the Array Sum');
  // how many elements the running total has consumed (0..N)
  const prog = lin(frame, watchAt, watchEnd) * N;
  const k = Math.floor(prog);
  const running = k > 0 ? CUMSUM[Math.min(k, N) - 1] : 0;
  const lo = Math.min(...SUM_ARR, ...CUMSUM, 0) - 1;
  const hi = Math.max(...SUM_ARR, ...CUMSUM, 0) + 1;
  return (
    <Layer opacity={windowed(frame, start, durationInFrames + 30)}>
      <div style={{ position: 'absolute', left: 0, top: 0, display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div style={{ opacity: ease(frame, loopAt, 14) }}>
          <Code size={26} color={C.violetLight}>{'total = 0\nfor x in arr:\n    total += x'}</Code>
        </div>
        <div style={{ opacity: ease(frame, npAt, 14) }}>
          <Code size={26} color={C.tealLight}>np.sum(arr)</Code>
        </div>
      </div>
      <div style={{ position: 'absolute', left: 520, top: 0 }}>
        <Plot width={1100} height={560} x={[-0.5, N - 0.5]} y={[lo, hi]} yTicks={[-8, -4, 0, 4, 8]} xTicks={[]} yLabel="value">
          {(s) => {
            const bw = (s.w / N) * 0.55;
            return (
              <>
                <line x1={0} y1={s.y(0)} x2={s.w} y2={s.y(0)} stroke={C.line2} strokeWidth={1.5} strokeDasharray="6 6" />
                {SUM_ARR.map((v, i) => {
                  const p = ease(frame, start + 10 + i * 4, 14);
                  const active = i < prog;
                  const y0 = s.y(0);
                  const y1 = s.y(v * p);
                  return (
                    <g key={i}>
                      <rect x={s.x(i) - bw / 2} y={Math.min(y0, y1)} width={bw} height={Math.abs(y1 - y0)} rx={5} fill={v >= 0 ? C.violet : C.rose} opacity={active ? 0.95 : 0.45} />
                      <text x={s.x(i)} y={v >= 0 ? y1 - 12 : y1 + 30} fill={C.text} fontFamily={F.mono} fontSize={24} textAnchor="middle" opacity={p}>
                        {fmt(v, 0)}
                      </text>
                    </g>
                  );
                })}
                {/* running total line */}
                <polyline
                  points={CUMSUM.slice(0, Math.max(0, Math.min(N, k)))
                    .map((c, i) => `${s.x(i)},${s.y(c)}`)
                    .join(' ')}
                  fill="none"
                  stroke={C.amber}
                  strokeWidth={4}
                  strokeLinejoin="round"
                />
                {CUMSUM.slice(0, Math.max(0, Math.min(N, k))).map((c, i) => (
                  <circle key={i} cx={s.x(i)} cy={s.y(c)} r={8} fill={C.amber} />
                ))}
              </>
            );
          }}
        </Plot>
      </div>
      <div style={{ position: 'absolute', left: 0, top: 300, opacity: ease(frame, watchAt, 14) }}>
        <div style={{ fontFamily: F.body, fontSize: 26, color: C.amber }}>running total</div>
        <div style={{ fontFamily: F.mono, fontSize: 84, color: C.text, fontVariantNumeric: 'tabular-nums' }}>{fmt(running, 0)}</div>
      </div>
      <div style={{ position: 'absolute', left: 0, top: 460, display: 'flex', alignItems: 'center', gap: 16, opacity: ease(frame, finalAt, 14) }}>
        <Code size={28} color={C.tealLight} glow={1}>np.sum(arr) = {fmt(TOTAL, 0)}</Code>
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 610, display: 'flex', justifyContent: 'center' }}>
        <ProblemChip title="Array Sum" progress={ease(frame, chipAt, 20)} />
      </div>
    </Layer>
  );
};
