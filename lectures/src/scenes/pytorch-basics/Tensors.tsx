import React from 'react';
import { useCurrentFrame } from 'remotion';
import type { SceneProps } from '..';
import { C, F, rgba } from '../../theme';
import { ease, windowed } from '../../lib/anim';
import { Layer, Matrix, ProblemChip, signedColor } from '../../components/ui';
import { Code, ShapeTag } from '../../components/kit';
import { T23, T_SUM_DIM1, T_VIEW32 } from './data';

const ROWS: [string, string][] = [
  ['torch.tensor([1, 2, 3])', 'np.array([1, 2, 3])'],
  ['torch.zeros(3, 4)', 'np.zeros((3, 4))'],
  ['torch.ones(2, 3)', 'np.ones((2, 3))'],
  ['torch.arange(10)', 'np.arange(10)'],
  ['torch.randn(2, 3)', 'np.random.randn(2, 3)'],
];

const Tag: React.FC<{ children: React.ReactNode; o: number; hue: string }> = ({ children, o, hue }) => (
  <div style={{ padding: '10px 20px', borderRadius: 12, border: `1px solid ${rgba(hue, 0.6)}`, background: rgba(hue, 0.12), fontFamily: F.mono, fontSize: 26, color: hue, opacity: o, transform: `translateY(${(1 - o) * 12}px)` }}>{children}</div>
);

export const TensorsScene: React.FC<SceneProps> = ({ cues, durationInFrames }) => {
  const frame = useCurrentFrame();
  const pA = [cues.sentence('If you know NumPy'), cues.sentence('Creating tensors')];
  const pB = [pA[1], cues.sentence('Operations carry over')];
  const pC = [pB[1], durationInFrames + 30];
  const gpuAt = cues.at('live on a GPU');
  const gradAt = cues.at('remember how it was computed');
  const trackAt = cues.at('a PyTorch track');
  const toggleAt = cues.at('a toggle');
  const f32At = cues.at('thirty-two bit');
  const dimAt = cues.at('take dim instead');
  const viewAt = cues.at('View reshapes');
  const unsqAt = cues.at('unsqueeze adds');
  const sqAt = cues.at('squeeze removes');
  const chipAt = cues.sentence('You will practice these');
  const unsq = frame >= unsqAt && frame < sqAt;

  return (
    <>
      <Layer opacity={windowed(frame, pA[0], pA[1])} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 40, paddingBottom: 60 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 50 }}>
          <Matrix data={T23} digits={1} cellW={100} cellH={64} fontSize={30} label="x" color={signedColor(2.5, 0.45)} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <Tag o={ease(frame, gpuAt, 14)} hue={C.teal}>device = 'cuda'</Tag>
            <Tag o={ease(frame, gradAt, 14)} hue={C.amber}>requires_grad = True</Tag>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, opacity: ease(frame, trackAt, 14) }}>
          <div style={{ display: 'flex', borderRadius: 999, border: `1px solid ${C.line2}`, overflow: 'hidden', fontFamily: F.body, fontSize: 28 }}>
            {['PyTorch', 'NumPy'].map((l, k) => {
              const on = k === (frame >= toggleAt + 25 ? 1 : 0);
              return (
                <div key={l} style={{ padding: '12px 30px', background: on ? rgba(C.violet, 0.5) : 'transparent', color: on ? '#fff' : C.muted }}>
                  {l}
                </div>
              );
            })}
          </div>
          <span style={{ fontFamily: F.body, fontSize: 26, color: C.muted }}>runs in your browser</span>
        </div>
      </Layer>

      <Layer opacity={windowed(frame, pB[0], pB[1])} style={{ display: 'flex', justifyContent: 'center', paddingTop: 30 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '560px 560px', rowGap: 16, columnGap: 40, alignContent: 'start' }}>
          <div style={{ fontFamily: F.body, fontSize: 28, color: C.violetLight }}>PyTorch</div>
          <div style={{ fontFamily: F.body, fontSize: 28, color: C.muted }}>NumPy</div>
          {ROWS.flatMap(([t, n], k) => {
            const o = ease(frame, pB[0] + 10 + k * 8, 14);
            return [
              <div key={`t${k}`} style={{ opacity: o }}>
                <Code size={28}>{t}</Code>
              </div>,
              <div key={`n${k}`} style={{ opacity: o }}>
                <Code size={28} color={C.muted}>{n}</Code>
              </div>,
            ];
          })}
          <div style={{ opacity: ease(frame, f32At, 14) }}>
            <Code size={28} color={C.amber} glow={1}>dtype: torch.float32</Code>
          </div>
          <div style={{ opacity: ease(frame, f32At, 14) }}>
            <Code size={28} color={C.muted}>dtype: float64</Code>
          </div>
        </div>
      </Layer>

      <Layer opacity={windowed(frame, pC[0], pC[1])}>
        <div style={{ position: 'absolute', left: 60, top: 40, display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Code size={30}>x</Code>
            <ShapeTag shape={[2, 3]} size={26} />
          </div>
          {unsq ? (
            <div style={{ position: 'relative', height: 220, width: 420 }}>
              <div style={{ position: 'absolute', left: 16, top: 16, opacity: 0.6, width: 360, height: 160, borderRadius: 12, border: `2px dashed ${C.amber}` }} />
              <Matrix data={T23} digits={1} cellW={100} cellH={64} fontSize={30} color={signedColor(2.5, 0.45)} />
            </div>
          ) : (
            <Matrix data={T23} digits={1} cellW={100} cellH={64} fontSize={30} color={signedColor(2.5, 0.45)} />
          )}
        </div>
        <div style={{ position: 'absolute', left: 620, top: 40, display: 'flex', flexDirection: 'column', gap: 34 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 22, opacity: ease(frame, dimAt, 14) }}>
            <Code size={30}>x.sum(dim=1)</Code>
            <span style={{ fontFamily: F.mono, fontSize: 30, color: C.teal }}>[{T_SUM_DIM1.map((v) => v.toFixed(1)).join(', ')}]</span>
            <span style={{ fontFamily: F.body, fontSize: 24, color: C.muted }}>dim = NumPy's axis</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 22, opacity: ease(frame, viewAt, 14) }}>
            <Code size={30}>x.view(3, 2)</Code>
            <Matrix data={T_VIEW32} digits={1} cellW={84} cellH={50} fontSize={26} color={signedColor(2.5, 0.45)} />
            <span style={{ fontFamily: F.body, fontSize: 24, color: C.muted }}>same memory</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 22, opacity: ease(frame, unsqAt, 14) }}>
            <Code size={30} glow={unsq ? 1 : 0}>x.unsqueeze(0)</Code>
            <ShapeTag shape={[1, 2, 3]} size={28} glow={unsq ? 1 : 0} />
            <span style={{ fontFamily: F.body, fontSize: 24, color: C.muted }}>a batch of one</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 22, opacity: ease(frame, sqAt, 14) }}>
            <Code size={30}>.squeeze(0)</Code>
            <ShapeTag shape={[2, 3]} size={28} glow={frame >= sqAt ? 1 : 0} />
          </div>
        </div>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 600, display: 'flex', justifyContent: 'center', gap: 20 }}>
          <ProblemChip title="Tensor Creation (NumPy Style)" progress={ease(frame, chipAt, 20)} />
          <ProblemChip title="Tensor Operations" progress={ease(frame, chipAt + 8, 20)} />
        </div>
      </Layer>
    </>
  );
};
