import React from 'react';
import { useCurrentFrame } from 'remotion';
import type { SceneProps } from '..';
import { C, F, rgba } from '../../theme';
import { ease, lin } from '../../lib/anim';
import { ProblemChip, Tex } from '../../components/ui';
import { NumGrid } from '../../components/charts';
import { IMG, KERNEL, OUT } from './data';

const imgColor = (v: number) => rgba(C.violetLight, 0.05 + (v / 9) * 0.6);
const kColor = (v: number) => (v > 0 ? rgba(C.amber, 0.45) : v < 0 ? rgba(C.teal, 0.4) : rgba(C.text, 0.05));
const outMax = Math.max(...OUT.flat().map(Math.abs));
const outColor = (v: number) => rgba(v >= 0 ? C.amber : C.teal, 0.08 + (Math.abs(v) / outMax) * 0.55);
const sgn = (v: number) => (v < 0 ? `−${-v}` : `${v}`);

export const ConvolutionScene: React.FC<SceneProps> = ({ cues, durationInFrames }) => {
  const frame = useCurrentFrame();
  const imgAt = cues.sentence('An image is a grid');
  const kAt = cues.at('called a kernel');
  const slide = [cues.at('At each position'), cues.at('checking every spot')];
  const shareAt = cues.at('Because the weights are shared');
  const xcorrAt = cues.at('cross-correlation');
  const chipAt = cues.sentence("You'll write it");

  const nPos = OUT.length * OUT[0].length;
  const prog = lin(frame, slide[0], slide[1]);
  const idx = Math.min(nPos - 1, Math.floor(prog * nPos));
  const sliding = frame >= slide[0];
  const done = prog >= 1;
  const oi = Math.floor(idx / OUT[0].length);
  const oj = idx % OUT[0].length;
  const patch = IMG.slice(oi, oi + 3).map((r) => r.slice(oj, oj + 3));
  const kp = ease(frame, kAt, 18);
  const share = ease(frame, shareAt, 16);
  const imgIn = ease(frame, imgAt, 20);
  const fade = 1 - ease(frame, durationInFrames - 20, 14);

  return (
    <div style={{ position: 'absolute', inset: 0, opacity: imgIn * fade }}>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 20, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 46 }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <Tex size={40}>image  `7×7`</Tex>
          <NumGrid
            data={IMG}
            cell={62}
            color={imgColor}
            windows={sliding ? [{ i: oi, j: oj, h: 3, w: 3, color: C.amber, opacity: done ? 1 - share : 1 }] : []}
          />
        </div>
        <div style={{ opacity: kp, fontFamily: F.display, fontSize: 64, color: C.muted }}>⋆</div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, opacity: kp, transform: `translateY(${(1 - kp) * 20}px)` }}>
          <Tex size={40}>kernel  `3×3`</Tex>
          <NumGrid data={KERNEL} cell={62} color={kColor} />
          <div style={{ fontFamily: F.body, fontSize: 24, color: C.muted, marginTop: 8 }}>vertical-edge detector</div>
        </div>
        <div style={{ opacity: ease(frame, slide[0], 14), fontFamily: F.display, fontSize: 64, color: C.muted }}>=</div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, opacity: ease(frame, slide[0], 14) }}>
          <Tex size={40}>output  `5×5`</Tex>
          <NumGrid
            data={OUT}
            cell={62}
            fontSize={22}
            color={outColor}
            reveal={(i, j) => (i * OUT[0].length + j < idx || done ? 1 : i * OUT[0].length + j === idx ? 1 : 0)}
            windows={sliding && !done ? [{ i: oi, j: oj, h: 1, w: 1, color: C.amber }] : []}
          />
        </div>
      </div>

      {/* the multiply-add at the current position */}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 560, display: 'flex', justifyContent: 'center', opacity: ease(frame, slide[0], 14) * (1 - share) }}>
        <div style={{ fontFamily: F.mono, fontSize: 28, color: C.text, padding: '14px 26px', borderRadius: 14, background: rgba(C.panel, 0.85), border: `1px solid ${C.line2}`, whiteSpace: 'nowrap' }}>
          <span style={{ color: C.muted }}>Σ patch ⊙ kernel = </span>
          {patch.map((r, a) => `(${sgn(r[0] * KERNEL[a][0] + r[1] * KERNEL[a][1] + r[2] * KERNEL[a][2])})`).join(' + ')}
          <span style={{ color: C.muted }}> = </span>
          <span style={{ color: C.amber }}>{sgn(OUT[oi][oj])}</span>
          <span style={{ color: C.dim, fontSize: 22 }}>   (row sums)</span>
        </div>
      </div>

      <div style={{ position: 'absolute', left: 0, right: 0, top: 552, display: 'flex', justifyContent: 'center', gap: 30 }}>
        <div style={{ opacity: share, padding: '14px 28px', borderRadius: 999, background: rgba(C.amber, 0.12), border: `1px solid ${rgba(C.amber, 0.45)}`, fontFamily: F.body, fontSize: 28, color: C.text }}>
          {KERNEL.length * KERNEL[0].length} weights, shared by all {nPos} positions
        </div>
        <div style={{ opacity: ease(frame, xcorrAt, 16), padding: '14px 28px', borderRadius: 999, background: rgba(C.text, 0.05), border: `1px solid ${C.line2}`, fontFamily: F.body, fontSize: 28, color: C.muted }}>
          cross-correlation: kernel not flipped
        </div>
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 640, display: 'flex', justifyContent: 'center' }}>
        <ProblemChip title="2D Convolution" progress={ease(frame, chipAt, 18)} />
      </div>
    </div>
  );
};
