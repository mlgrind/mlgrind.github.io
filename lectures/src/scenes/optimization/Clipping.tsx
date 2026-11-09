import React from 'react';
import { useCurrentFrame } from 'remotion';
import type { SceneProps } from '..';
import { C, F } from '../../theme';
import { ease, lin, windowed } from '../../lib/anim';
import { Arrow, Eyebrow, Layer, Matrix, ProblemChip, Tex, signedColor } from '../../components/ui';
import { Axes, Legend, Panel, linear, linePath } from '../../components/charts';
import { BAD_STEP, CLIP, CLIP_FLAT, CLIP_FLAT_OUT, CLIP_GRADS, CLIP_MAX, CLIP_SQ_SUM, RUN_STEPS, TRAIN } from './data';

const PW = 1480;

/** Eval loss and gradient norm of a small run with one corrupted batch. */
const SpikeCharts: React.FC<{ frame: number; drawAt: number; drawEnd: number; clipAt: number }> = ({ frame, drawAt, drawEnd, clipAt }) => {
  const p = lin(frame, drawAt, drawEnd);
  const clip = ease(frame, clipAt, 24);
  const sx = linear(0, RUN_STEPS, 0, PW);
  const lossMax = Math.max(...TRAIN.plain.loss);
  const sy = linear(0, Math.ceil(lossMax * 1.1 * 2) / 2, 220, 0);
  const plain = TRAIN.plain.loss.map((v, i) => [i, v] as [number, number]);
  const clipped = TRAIN.clipped.loss.map((v, i) => [i, v] as [number, number]);
  // gradient norms on a log axis, 0.01 .. 100
  const lg = linear(-2, 2, 170, 0);
  const sn = Object.assign((v: number) => lg(Math.log10(Math.max(v, 0.01))), { d: lg.d, r: lg.r }) as typeof lg;
  const shown = Math.floor(p * RUN_STEPS);
  return (
    <>
      <svg width={1680} height={640} style={{ position: 'absolute', top: 0, left: 0 }}>
        <g transform="translate(130,50)">
          <Axes sx={sx} sy={sy} yTicks={[0, 1, 2]} yLabel="loss" />
          <path d={linePath(plain, sx, sy, p)} fill="none" stroke={C.rose} strokeWidth={4} opacity={1 - 0.6 * clip} />
          <path d={linePath(clipped, sx, sy, clip)} fill="none" stroke={C.teal} strokeWidth={4} />
          {p > BAD_STEP / RUN_STEPS && (
            <text x={sx(BAD_STEP) + 40} y={sy(TRAIN.plain.loss[BAD_STEP + 1]) + 30} fill={C.rose} fontFamily={F.body} fontSize={24} opacity={1 - 0.6 * clip}>
              one bad batch
            </text>
          )}
        </g>
        <g transform="translate(130,380)">
          <Axes sx={sx} sy={sn} yTicks={[0.01, 0.1, 1, 10, 100]} yFormat={(v) => String(v)} yLabel="gradient norm (log)" xTicks={[0, 30, 60, 90, 120]} xLabel="step" />
          {TRAIN.plain.norms.map((n, i) => {
            if (i >= shown) return null;
            // after clipping: the clipped run's own norms, capped at max_norm = 1
            const v = n * (1 - clip) + Math.min(TRAIN.clipped.norms[i], 1) * clip;
            return (
              <rect
                key={i}
                x={sx(i) + 1}
                y={sn(v)}
                width={PW / RUN_STEPS - 3}
                height={sn(0) - sn(v)}
                fill={clip > 0.5 ? C.teal : i === BAD_STEP ? C.rose : C.violet}
                opacity={0.9}
              />
            );
          })}
          <line x1={0} x2={PW} y1={sn(1)} y2={sn(1)} stroke={C.tealLight} strokeWidth={2} strokeDasharray="8 6" opacity={clip} />
        </g>
      </svg>
      <div style={{ position: 'absolute', left: 900, top: 4 }}>
        <Legend items={[{ color: C.rose, label: 'no clipping' }, { color: C.teal, label: 'clip to norm 1', opacity: clip }]} />
      </div>
      <div style={{ position: 'absolute', left: 940, top: 380, fontFamily: F.mono, fontSize: 26, color: C.rose, opacity: ease(frame, drawAt + (drawEnd - drawAt) * (BAD_STEP / RUN_STEPS), 12) * (1 - clip) }}>
        norm {TRAIN.plain.norms[BAD_STEP].toFixed(1)} at the bad batch
      </div>
    </>
  );
};

const small = { cellW: 92, cellH: 56, fontSize: 24, labelSize: 40 };

export const ClippingScene: React.FC<SceneProps> = ({ cues, durationInFrames }) => {
  const frame = useCurrentFrame();
  const a = [50, cues.sentence('Treat the gradients')];
  const b = [a[1], durationInFrames];

  const drawAt = cues.at('one bad batch') - 20;
  const drawEnd = cues.end('spike in the loss');
  const clipAt = cues.at('caps the size');

  const sqAt = cues.at('square every element');
  const sumAt = cues.at('add them all up');
  const sqrtAt = cues.at('take the square root');
  const coefAt = cues.at('multiply every gradient');
  const outAt = cues.at('divided by the norm');
  const dirAt = cues.at('keeps its direction');
  const chipAt = cues.sentence("That's the Gradient");

  const barMax = Math.max(...CLIP_FLAT.map(Math.abs));
  const shrink = ease(frame, dirAt + 10, 30);

  return (
    <>
      <Layer opacity={windowed(frame, a[0], a[1])}>
        <SpikeCharts frame={frame} drawAt={drawAt} drawEnd={drawEnd} clipAt={clipAt} />
      </Layer>

      <Layer opacity={windowed(frame, b[0], b[1] + 30)}>
        <div style={{ position: 'absolute', left: 0, top: 0, display: 'flex', alignItems: 'center', gap: 36 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 34, alignItems: 'center' }}>
            <Matrix data={CLIP_GRADS[0]} label="g_1" digits={0} {...small} color={signedColor(5, 0.5)} />
            <Matrix data={CLIP_GRADS[1]} label="g_2" digits={0} {...small} color={signedColor(5, 0.5)} />
          </div>
          <Arrow width={70} progress={ease(frame, sqAt - 10, 14)} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 28, width: 640 }}>
            <div style={{ opacity: ease(frame, sqAt, 16) }}>
              <Tex size={40}>{`Σ g² = ${CLIP_FLAT.map((v) => `${v}²`).join(' + ')}`}</Tex>
            </div>
            <div style={{ opacity: ease(frame, sumAt, 16) }}>
              <Tex size={40}>{`     = ${CLIP_SQ_SUM}`}</Tex>
            </div>
            <div style={{ opacity: ease(frame, sqrtAt, 16) }}>
              <Tex size={46} color={C.violetLight}>{`‖g‖ = √${CLIP_SQ_SUM} = ${CLIP.total.toFixed(2)}`}</Tex>
            </div>
            <div style={{ opacity: ease(frame, coefAt, 16) }}>
              <Tex size={46} color={C.tealLight}>{`coef = ${CLIP_MAX} / ${CLIP.total.toFixed(2)} = ${CLIP.coef.toFixed(3)}`}</Tex>
            </div>
          </div>
          <Arrow width={70} progress={ease(frame, outAt - 6, 14)} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 34, alignItems: 'center', opacity: ease(frame, outAt, 18) }}>
            <Matrix data={CLIP.clipped[0]} label="coef · g_1" digits={2} {...small} color={signedColor(5, 0.5)} />
            <Matrix data={CLIP.clipped[1]} label="coef · g_2" digits={2} {...small} color={signedColor(5, 0.5)} />
          </div>
        </div>

        <Panel x={0} y={400} w={1680} h={200} style={{ opacity: ease(frame, dirAt, 16) }}>
          <div style={{ position: 'absolute', left: 40, top: 22 }}>
            <Eyebrow color={C.muted} style={{ textTransform: 'none', letterSpacing: '0.04em', fontSize: 22 }}>all 6 entries as one vector</Eyebrow>
          </div>
          <div style={{ position: 'absolute', left: 40, bottom: 24, display: 'flex', alignItems: 'flex-end', gap: 18, height: 110 }}>
            {CLIP_FLAT.map((v, i) => {
              const h0 = (Math.abs(v) / barMax) * 110;
              const h1 = (Math.abs(CLIP_FLAT_OUT[i]) / barMax) * 110;
              return (
                <div key={i} style={{ position: 'relative', width: 54, height: 110 }}>
                  <div style={{ position: 'absolute', bottom: 0, width: 54, height: h0, borderRadius: 6, border: `2px solid ${C.violet}`, opacity: 0.7 }} />
                  <div style={{ position: 'absolute', bottom: 0, width: 54, height: h0 + (h1 - h0) * shrink, borderRadius: 6, background: shrink > 0 ? C.teal : C.violet, opacity: 0.85 }} />
                </div>
              );
            })}
          </div>
          <div style={{ position: 'absolute', left: 560, top: 80, display: 'flex', gap: 50, alignItems: 'baseline', fontFamily: F.mono, fontSize: 32 }}>
            <span style={{ color: C.violetLight }}>norm {CLIP.total.toFixed(2)}</span>
            <span style={{ color: C.muted }}>→</span>
            <span style={{ color: C.tealLight, opacity: shrink }}>
              norm {Math.sqrt(CLIP_FLAT_OUT.reduce((a, v) => a + v * v, 0)).toFixed(2)}
            </span>
            <span style={{ fontFamily: F.body, fontSize: 26, color: C.muted, opacity: shrink }}>same direction, shorter</span>
          </div>
        </Panel>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 628, display: 'flex', justifyContent: 'center' }}>
          <ProblemChip title="Gradient Clipping by Global Norm" progress={ease(frame, chipAt, 18)} />
        </div>
      </Layer>
    </>
  );
};
