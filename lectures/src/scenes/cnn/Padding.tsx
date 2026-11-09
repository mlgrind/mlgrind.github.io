import React from 'react';
import { useCurrentFrame } from 'remotion';
import type { SceneProps } from '..';
import { C, F, rgba } from '../../theme';
import { ease, lin, windowed } from '../../lib/anim';
import { Layer, ProblemChip, Tex } from '../../components/ui';
import { NumGrid } from '../../components/charts';
import { CH, EX, EX_OUT, PAD, SMALL_K, SMALL_OUT, SMALL_PADDED, STRIDE, convOutputSize, paramsFor } from './data';

const outMax = Math.max(...SMALL_OUT.flat().map(Math.abs));
const GROUPS = [1, 2, CH.cin];

/** Input channels on the left, output channels on the right, a line for every kernel slice. */
const GroupDiagram: React.FC<{ groups: number; p: number }> = ({ groups, p }) => {
  const W = 420;
  const H = 300;
  const ys = (k: number, n: number) => 30 + (k * (H - 60)) / (n - 1);
  const per = CH.cin / groups;
  const lines: React.ReactNode[] = [];
  for (let o = 0; o < CH.cout; o++) {
    const g = Math.floor(o / (CH.cout / groups));
    for (let c = g * per; c < (g + 1) * per; c++) {
      lines.push(<line key={`${o}-${c}`} x1={90} y1={ys(c, CH.cin)} x2={W - 90} y2={ys(o, CH.cout)} stroke={['#b3a6ff', '#00c9a7', '#f5b454', '#ff8fa3'][g % 4]} strokeWidth={3} opacity={0.8 * p} />);
    }
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, opacity: 0.15 + 0.85 * p }}>
      <svg width={W} height={H}>
        {lines}
        {Array.from({ length: CH.cin }, (_, c) => (
          <rect key={`i${c}`} x={50} y={ys(c, CH.cin) - 22} width={40} height={44} rx={8} fill={rgba(C.violetLight, 0.25)} stroke={C.violetLight} strokeWidth={2} />
        ))}
        {Array.from({ length: CH.cout }, (_, o) => (
          <rect key={`o${o}`} x={W - 90} y={ys(o, CH.cout) - 22} width={40} height={44} rx={8} fill={rgba(C.amber, 0.2)} stroke={C.amber} strokeWidth={2} />
        ))}
      </svg>
      <div style={{ fontFamily: F.mono, fontSize: 28, color: C.text }}>groups = {groups}</div>
      <div style={{ fontFamily: F.mono, fontSize: 26, color: C.muted }}>
        {CH.cout}×{CH.cin / groups}×{CH.k}×{CH.k} = <span style={{ color: C.amber }}>{paramsFor(groups)}</span> weights
      </div>
      <div style={{ fontFamily: F.body, fontSize: 24, color: C.tealLight, height: 30 }}>{groups === CH.cin ? 'depthwise' : groups === 1 ? 'standard' : ''}</div>
    </div>
  );
};

export const PaddingScene: React.FC<SceneProps> = ({ cues, durationInFrames }) => {
  const frame = useCurrentFrame();
  const a = [54, cues.sentence('The output size is')];
  const b = [a[1], cues.sentence('Real layers also')];
  const c = [b[1], durationInFrames];

  const shrinkAt = cues.at('shrinks the output');
  const padAt = cues.at('Padding adds');
  const strideAt = cues.at('the stride is how far');
  const slide = [strideAt, cues.end('the stride is how far', 0.4)];
  const nPos = SMALL_OUT.length * SMALL_OUT[0].length;
  const prog = lin(frame, slide[0], slide[1]);
  const idx = Math.min(nPos - 1, Math.floor(prog * nPos));
  const oi = Math.floor(idx / SMALL_OUT[0].length);
  const oj = idx % SMALL_OUT[0].length;
  const padP = ease(frame, padAt, 20);
  const sliding = frame >= slide[0];

  const exAt = cues.at('So a 32 pixel');
  const resAt = cues.at('gives 16');

  return (
    <>
      <Layer opacity={windowed(frame, a[0], a[1])}>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 70 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}>
            <Tex size={38}>{padP > 0.5 ? `input 5×5, padding ${PAD}` : 'input 5×5'}</Tex>
            <NumGrid
              data={SMALL_PADDED}
              cell={60}
              fontSize={22}
              color={(v, i, j) => {
                const border = i < PAD || j < PAD || i >= SMALL_PADDED.length - PAD || j >= SMALL_PADDED.length - PAD;
                return border ? rgba(C.text, 0.03 * padP) : rgba(C.violetLight, 0.06 + (v / 4) * 0.5);
              }}
              textColor={(_, i, j) => (i < PAD || j < PAD || i >= SMALL_PADDED.length - PAD || j >= SMALL_PADDED.length - PAD ? rgba(C.muted, padP) : C.text)}
              windows={sliding ? [{ i: oi * STRIDE, j: oj * STRIDE, h: 3, w: 3, color: C.amber }] : []}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}>
            <Tex size={38}>kernel</Tex>
            <NumGrid data={SMALL_K} cell={60} color={(v) => (v > 0 ? rgba(C.amber, 0.4) : v < 0 ? rgba(C.teal, 0.4) : rgba(C.text, 0.05))} />
            <div style={{ marginTop: 26, display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'center' }}>
              <div style={{ fontFamily: F.mono, fontSize: 28, color: C.muted, opacity: ease(frame, shrinkAt, 16) * (1 - padP) }}>
                no padding: 5 → {convOutputSize(5, 3)}
              </div>
              <div style={{ fontFamily: F.mono, fontSize: 28, color: C.amber, opacity: ease(frame, strideAt, 16), marginTop: -50 }}>stride {STRIDE}</div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18, opacity: ease(frame, slide[0], 14) }}>
            <Tex size={38}>{`output ${SMALL_OUT.length}×${SMALL_OUT.length}`}</Tex>
            <NumGrid
              data={SMALL_OUT}
              cell={60}
              fontSize={22}
              color={(v) => rgba(v >= 0 ? C.amber : C.teal, 0.08 + (Math.abs(v) / outMax) * 0.5)}
              reveal={(i, j) => (i * SMALL_OUT[0].length + j <= idx ? 1 : 0)}
            />
          </div>
        </div>
      </Layer>

      <Layer opacity={windowed(frame, b[0], b[1])} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 70, paddingBottom: 60 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <Tex size={80}>out = ⌊</Tex>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Tex size={70}>n − k + 2p</Tex>
            <div style={{ width: 330, height: 3, background: C.text, margin: '6px 0' }} />
            <Tex size={70}>s</Tex>
          </div>
          <Tex size={80}>⌋ + 1</Tex>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 26, opacity: ease(frame, exAt, 18) }}>
          <Tex size={58} color={C.muted}>{`⌊(${EX.n} − ${EX.k} + 2·${EX.pad}) / ${EX.stride}⌋ + 1 = ⌊${EX.n - EX.k + 2 * EX.pad} / ${EX.stride}⌋ + 1 =`}</Tex>
          <Tex size={72} color={C.amber} style={{ opacity: ease(frame, resAt, 14) }}>{String(EX_OUT)}</Tex>
        </div>
        <div style={{ display: 'flex', gap: 50, fontFamily: F.mono, fontSize: 26, color: C.dim }}>
          <span>n input</span>
          <span>k kernel</span>
          <span>p padding</span>
          <span>s stride</span>
        </div>
      </Layer>

      <Layer opacity={windowed(frame, c[0], c[1] + 30)}>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 0, display: 'flex', justifyContent: 'center', gap: 60 }}>
          <GroupDiagram groups={GROUPS[0]} p={ease(frame, c[0] + 10, 18)} />
          <GroupDiagram groups={GROUPS[1]} p={ease(frame, cues.at('Groups split'), 18)} />
          <GroupDiagram groups={GROUPS[2]} p={ease(frame, cues.at('one group per channel'), 18)} />
        </div>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 520, display: 'flex', justifyContent: 'center', gap: 50, fontFamily: F.body, fontSize: 26, color: C.muted }}>
          <span><span style={{ color: C.violetLight }}>■</span> {CH.cin} input channels</span>
          <span><span style={{ color: C.amber }}>■</span> {CH.cout} output channels</span>
          <span>{CH.k}×{CH.k} kernels</span>
        </div>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 610, display: 'flex', justifyContent: 'center', gap: 24 }}>
          <ProblemChip title="Convolution Output Size" progress={ease(frame, cues.sentence("That's Convolution"), 18)} />
          <ProblemChip title="Advanced 2D Convolution" progress={ease(frame, cues.sentence("That's Convolution") + 8, 18)} />
        </div>
      </Layer>
    </>
  );
};
