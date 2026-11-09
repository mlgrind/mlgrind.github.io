import React from 'react';
import { useCurrentFrame } from 'remotion';
import type { SceneProps } from '..';
import { C, F, rgba } from '../../theme';
import { ease, windowed } from '../../lib/anim';
import { Layer, Tex } from '../../components/ui';
import { Bars, Panel, Readout } from '../../components/plot';
import { RMS, RMS_OUT, RMS_OUT_MEAN, RMS_OUT_MS, RMS_X, X_MEAN } from './data';

const Box: React.FC<{ label: string; p: number; hi?: number; color?: string; w?: number; h?: number }> = ({ label, p, hi = 0, color = C.violetLight, w = 150, h = 74 }) => (
  <div
    style={{
      width: w,
      height: h,
      borderRadius: 14,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      fontFamily: F.body,
      fontSize: 25,
      fontWeight: 500,
      lineHeight: 1.1,
      color: C.text,
      background: rgba(color, 0.1 + 0.3 * hi),
      border: `2px solid ${rgba(color, 0.35 + 0.6 * hi)}`,
      opacity: p,
      transform: `translateY(${(1 - p) * 12}px)`,
      flexShrink: 0,
    }}
  >
    {label}
  </div>
);

const Arr: React.FC<{ p: number; w?: number }> = ({ p, w = 34 }) => (
  <svg width={w} height={20} style={{ opacity: p, flexShrink: 0 }}>
    <line x1={2} y1={10} x2={w - 8} y2={10} stroke={C.dim} strokeWidth={2.5} />
    <path d={`M${w - 12} 4 L${w - 3} 10 L${w - 12} 16`} fill="none" stroke={C.dim} strokeWidth={2.5} />
  </svg>
);

const Plus: React.FC<{ p: number }> = ({ p }) => (
  <div style={{ width: 40, height: 40, borderRadius: 20, border: `2px solid ${C.teal}`, color: C.teal, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F.mono, fontSize: 28, opacity: p, flexShrink: 0 }}>+</div>
);

export const DecoderBlockScene: React.FC<SceneProps> = ({ cues, durationInFrames }) => {
  const frame = useCurrentFrame();

  const tokAt = cues.at('split into tokens');
  const embAt = cues.at('embedding table');
  const stackAt = cues.at('stack of decoder blocks');
  const attnAt = cues.at('causal attention');
  const ffnAt = cues.at('then a feed-forward');
  const resAt = cues.at('residual connection');
  const preAt = cues.at('pre-norm');
  const rmsAt = cues.sentence('Modern models normalize');
  const skipAt = cues.at('skips the mean');
  const divAt = cues.at('divides each vector');
  const weightAt = cues.at('learned weight');
  const headAt = cues.at('one more norm');
  const logitsAt = cues.at('produce logits');

  const pre = ease(frame, preAt, 16);
  const rmsHi = Math.max(windowed(frame, preAt, rmsAt + 40, 10), windowed(frame, rmsAt, headAt, 10));

  const sub = (norm: string, op: string, opAt: number, color: string) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <Box label={norm} p={ease(frame, opAt, 16)} hi={rmsHi} color={C.amber} w={150} h={64} />
      <Arr p={ease(frame, opAt, 16)} w={30} />
      <Box label={op} p={ease(frame, opAt, 16)} color={color} w={170} h={64} />
      <Arr p={ease(frame, resAt, 16)} w={30} />
      <Plus p={ease(frame, resAt, 16)} />
    </div>
  );

  const oldAt = cues.sentence('You already know');
  const prodAt = cues.at('production language model');
  const textAt = cues.sentence('Text is split');

  return (
    <>
      <Layer opacity={windowed(frame, oldAt, textAt + 4)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 40, paddingBottom: 60 }}>
        <div style={{ fontFamily: F.mono, fontSize: 24, color: C.muted, letterSpacing: '0.08em' }}>THE 2017 TRANSFORMER BLOCK (POST-NORM)</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Box label="attention" p={ease(frame, oldAt + 4, 16)} w={180} />
          <Arr p={ease(frame, oldAt + 10, 16)} />
          <Box label="add & LayerNorm" p={ease(frame, oldAt + 10, 16)} color={C.muted} w={230} />
          <Arr p={ease(frame, oldAt + 16, 16)} />
          <Box label="ReLU MLP" p={ease(frame, oldAt + 16, 16)} color={C.teal} w={180} />
          <Arr p={ease(frame, oldAt + 22, 16)} />
          <Box label="add & LayerNorm" p={ease(frame, oldAt + 22, 16)} color={C.muted} w={230} />
        </div>
        <div style={{ fontFamily: F.body, fontSize: 30, color: C.violetLight, opacity: ease(frame, prodAt, 16) }}>what changes in a production LLM?</div>
      </Layer>

      <Layer opacity={windowed(frame, textAt - 4, durationInFrames + 30)}>
        <div style={{ position: 'absolute', top: 10, left: 0, right: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <Box label="tokens" p={ease(frame, tokAt, 16)} w={130} />
          <Arr p={ease(frame, embAt, 16)} />
          <Box label="embed" p={ease(frame, embAt, 16)} w={130} />
          <Arr p={ease(frame, stackAt, 16)} />
          <div
            style={{
              position: 'relative',
              padding: '26px 22px 18px',
              borderRadius: 20,
              border: `2px dashed ${rgba(C.violetLight, 0.5)}`,
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
              opacity: ease(frame, stackAt, 16),
            }}
          >
            <div style={{ position: 'absolute', top: -16, left: 20, padding: '0 10px', background: C.bg, fontFamily: F.mono, fontSize: 22, color: C.violetLight }}>decoder block × N</div>
            {sub('RMSNorm', 'causal attn', attnAt, C.violetLight)}
            {sub('RMSNorm', 'FFN', ffnAt, C.teal)}
          </div>
          <Arr p={ease(frame, headAt, 16)} />
          <Box label="RMSNorm" p={ease(frame, headAt, 16)} color={C.amber} w={150} />
          <Arr p={ease(frame, headAt + 8, 16)} />
          <Box label="LM head" p={ease(frame, headAt + 8, 16)} w={130} />
          <Arr p={ease(frame, logitsAt, 16)} />
          <Box label="logits" p={ease(frame, logitsAt, 16)} w={120} color={C.teal} />
        </div>
        <div style={{ position: 'absolute', top: 228, left: 0, right: 0, textAlign: 'center', fontFamily: F.body, fontSize: 26, color: C.amber, opacity: windowed(frame, preAt, rmsAt + 20) * pre }}>
          pre-norm: each sub-layer sees a normalized copy, the residual carries the raw signal
        </div>

        <div style={{ position: 'absolute', top: 300, left: 0, right: 0, display: 'flex', gap: 40, alignItems: 'flex-start', justifyContent: 'center', opacity: ease(frame, rmsAt, 18) }}>
          <Panel title="one token's features" style={{ width: 520 }}>
            <Bars values={RMS_X} width={450} height={230} max={1.8} labelSize={22} valueSize={22} color={() => C.violet} />
          </Panel>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18, paddingTop: 70, width: 420 }}>
            <Tex size={44}>{'x / √(mean(x²) + ε) · w'}</Tex>
            <Readout size={28} color={C.amber} style={{ opacity: ease(frame, divAt, 16) }}>
              rms = {RMS.toFixed(2)}
            </Readout>
            <Readout size={24} color={C.muted} style={{ opacity: ease(frame, skipAt, 16) }}>
              mean {X_MEAN.toFixed(2)} not subtracted
            </Readout>
            <Readout size={24} color={C.muted} style={{ opacity: ease(frame, weightAt, 16) }}>
              w: learned scale (here 1)
            </Readout>
          </div>
          <Panel title="after RMSNorm" accent={C.amber} style={{ width: 520, opacity: ease(frame, divAt + 10, 18) }}>
            <Bars values={RMS_OUT} width={450} height={230} max={1.8} labelSize={22} valueSize={22} color={() => C.amber} reveal={() => ease(frame, divAt + 10, 24)} />
            <div style={{ marginTop: 12, fontFamily: F.mono, fontSize: 22, color: C.muted }}>
              mean(x²) = {RMS_OUT_MS.toFixed(2)} · mean = {RMS_OUT_MEAN.toFixed(2)}
            </div>
          </Panel>
        </div>
      </Layer>
    </>
  );
};
