import React from 'react';
import { useCurrentFrame } from 'remotion';
import type { SceneProps } from '..';
import { C, F, HEAD, rgba } from '../../theme';
import { ease, lin, windowed } from '../../lib/anim';
import { Layer, ProblemChip, Tex } from '../../components/ui';
import { Axes, Legend, Panel, linear, linePath } from '../../components/charts';
import { EASY_PT, GAMMAS, HARD_PT, PRED, SEG, SEG_N, TARGET, curve, focal } from './data';

const FocalPanel: React.FC<{ frame: number; at: number; gammaAt: number; easyAt: number }> = ({ frame, at, gammaAt, easyAt }) => {
  const W = 980;
  const H = 420;
  const sx = linear(0, 1, 0, W);
  const sy = linear(0, 4, H, 0);
  const ce = ease(frame, at, 20);
  const easy = ease(frame, easyAt, 16);
  return (
    <Panel x={0} y={0} w={1680} h={580}>
      <svg width={1200} height={560} style={{ position: 'absolute', left: 50, top: 20 }}>
        <g transform="translate(90,40)">
          <rect x={sx(0.6)} y={0} width={W - sx(0.6)} height={H} fill={rgba(C.teal, 0.07 * easy)} />
          <text x={sx(0.8)} y={36} fill={C.tealLight} opacity={easy} fontFamily={F.body} fontSize={24} textAnchor="middle">easy examples</text>
          <Axes sx={sx} sy={sy} xTicks={[0, 0.2, 0.4, 0.6, 0.8, 1]} yTicks={[0, 1, 2, 3, 4]} xLabel="p_t: probability of the true class" yLabel="loss" />
          {GAMMAS.map((g, k) => {
            const p = k === 0 ? ce : lin(frame, gammaAt + (k - 1) * 12, gammaAt + (k - 1) * 12 + 30);
            return <path key={g} d={linePath(curve((x) => Math.min(focal(x, g), 4.2), 0.02, 1, 120), sx, sy, p)} fill="none" stroke={HEAD[k]} strokeWidth={k === 0 ? 4 : 5} />;
          })}
          {[EASY_PT, HARD_PT].map((pt) => (
            <line key={pt} x1={sx(pt)} x2={sx(pt)} y1={0} y2={H} stroke={C.text} strokeDasharray="6 8" opacity={0.4 * easy} />
          ))}
        </g>
      </svg>
      <div style={{ position: 'absolute', left: 1210, top: 50, display: 'flex', flexDirection: 'column', gap: 18 }}>
        {GAMMAS.map((g, k) => (
          <Legend key={g} items={[{ color: HEAD[k], label: g === 0 ? 'γ = 0  (cross-entropy)' : `γ = ${g}`, opacity: k === 0 ? ce : ease(frame, gammaAt + (k - 1) * 12, 14) }]} />
        ))}
        <div style={{ marginTop: 14, opacity: ease(frame, gammaAt, 16) }}>
          <Tex size={34}>{'FL = −(1 − p_t)^γ log p_t'}</Tex>
        </div>
        <div style={{ fontFamily: F.mono, fontSize: 24, color: C.muted, opacity: easy, display: 'flex', flexDirection: 'column', gap: 8, marginTop: 10 }}>
          <span>p_t = {EASY_PT}: {focal(EASY_PT, 0).toFixed(3)} → <span style={{ color: HEAD[2] }}>{focal(EASY_PT, 2).toFixed(5)}</span></span>
          <span>p_t = {HARD_PT}: {focal(HARD_PT, 0).toFixed(2)} → <span style={{ color: HEAD[2] }}>{focal(HARD_PT, 2).toFixed(2)}</span></span>
          <span style={{ fontFamily: F.body, fontSize: 22, color: C.dim }}>γ = 2, α_t left out</span>
        </div>
      </div>
    </Panel>
  );
};

const CELL = 26;
const Mask: React.FC<{ m: number[][]; color: (i: number, j: number) => string; label: string; p: number }> = ({ m, color, label, p }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, opacity: p }}>
    <div style={{ fontFamily: F.body, fontSize: 28, color: C.muted }}>{label}</div>
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${SEG_N}, ${CELL}px)`, gap: 2 }}>
      {m.map((row, i) => row.map((_, j) => <div key={`${i}-${j}`} style={{ width: CELL, height: CELL, borderRadius: 3, background: color(i, j) }} />))}
    </div>
  </div>
);

export const SegmentationScene: React.FC<SceneProps> = ({ cues, durationInFrames }) => {
  const frame = useCurrentFrame();
  const a = [54, cues.sentence('Finally, segmentation')];
  const b = [a[1], durationInFrames];
  const overlayAt = cues.at('labels every pixel');
  const accAt = cues.at('Pixel accuracy counts');
  const objAt = cues.at('look only at the object');
  const diceAt = cues.at('Dice is twice');
  const relAt = cues.at('it always equals');
  const ov = ease(frame, overlayAt + 15, 20);
  const bg = rgba(C.text, 0.05);
  const overlay = (i: number, j: number) => {
    const p = PRED[i][j];
    const t = TARGET[i][j];
    if (p && t) return rgba(C.teal, 0.85);
    if (p) return rgba(C.amber, 0.75);
    if (t) return rgba(C.rose, 0.75);
    return bg;
  };
  return (
    <>
      <Layer opacity={windowed(frame, a[0], a[1])}>
        <FocalPanel frame={frame} at={a[0] + 10} gammaAt={cues.at('Focal loss multiplies')} easyAt={cues.at('Confident, easy')} />
      </Layer>
      <Layer opacity={windowed(frame, b[0], b[1] + 30)}>
        <div style={{ position: 'absolute', left: 0, top: 0, display: 'flex', gap: 40, alignItems: 'flex-start' }}>
          <Mask m={TARGET} label="target" p={1} color={(i, j) => (TARGET[i][j] ? rgba(C.violetLight, 0.8) : bg)} />
          <Mask m={PRED} label="prediction" p={ease(frame, b[0] + 12, 16)} color={(i, j) => (PRED[i][j] ? rgba(C.violetLight, 0.8) : bg)} />
          <Mask m={PRED} label="overlap" p={ov} color={overlay} />
        </div>
        <div style={{ position: 'absolute', left: 0, top: 440, opacity: ov }}>
          <Legend items={[{ color: C.teal, label: `both ${SEG.inter}` }, { color: C.amber, label: `pred only ${SEG.sp - SEG.inter}` }, { color: C.rose, label: `target only ${SEG.st - SEG.inter}` }]} />
        </div>
        <div style={{ position: 'absolute', left: 1130, top: 40, display: 'flex', flexDirection: 'column', gap: 30, fontFamily: F.mono, fontSize: 30 }}>
          <div style={{ opacity: ease(frame, accAt, 16) }}>
            <div style={{ color: C.muted, fontSize: 24 }}>pixel accuracy</div>
            <div style={{ color: C.text }}>{SEG.correct} / {SEG.n} = <span style={{ color: C.amber }}>{SEG.acc.toFixed(3)}</span></div>
          </div>
          <div style={{ opacity: ease(frame, objAt, 16) }}>
            <div style={{ color: C.muted, fontSize: 24 }}>IoU</div>
            <div style={{ color: C.text }}>{SEG.inter} / {SEG.union} = <span style={{ color: C.amber }}>{SEG.iou.toFixed(3)}</span></div>
          </div>
          <div style={{ opacity: ease(frame, diceAt, 16) }}>
            <div style={{ color: C.muted, fontSize: 24 }}>Dice</div>
            <div style={{ color: C.text }}>2·{SEG.inter} / ({SEG.sp} + {SEG.st}) = <span style={{ color: C.amber }}>{SEG.dice.toFixed(3)}</span></div>
          </div>
          <div style={{ opacity: ease(frame, relAt, 16), fontSize: 26, color: C.tealLight }}>
            2·{SEG.iou.toFixed(3)} / (1 + {SEG.iou.toFixed(3)}) = {((2 * SEG.iou) / (1 + SEG.iou)).toFixed(3)}
          </div>
        </div>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 610, display: 'flex', justifyContent: 'center', gap: 20 }}>
          {['Focal Loss', 'Segmentation Metrics'].map((t, i) => (
            <ProblemChip key={t} title={t} progress={ease(frame, cues.sentence('These are the Focal') + i * 8, 18)} />
          ))}
        </div>
      </Layer>
    </>
  );
};
