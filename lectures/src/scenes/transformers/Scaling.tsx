import React from 'react';
import { useCurrentFrame } from 'remotion';
import type { SceneProps } from '..';
import { C, F, rgba } from '../../theme';
import { ease, mix, windowed } from '../../lib/anim';
import { Eyebrow, Layer, Tex } from '../../components/ui';
import { DK_STEPS, HIST_BINS, HIST_RANGE, N_KEYS, SCALING } from './data';

const PANEL: React.CSSProperties = {
  position: 'absolute',
  top: 96,
  height: 560,
  borderRadius: 22,
  border: `1px solid ${C.line}`,
  background: rgba(C.panel, 0.75),
  padding: '34px 40px',
};

/** Value of a per-step quantity, morphing between d_k steps. */
function morph(stepF: number, get: (s: (typeof SCALING)[number]) => number): number {
  const a = Math.floor(stepF);
  const b = Math.min(SCALING.length - 1, a + 1);
  return mix(get(SCALING[a]), get(SCALING[b]), stepF - a);
}

export const ScalingScene: React.FC<SceneProps> = ({ cues, durationInFrames }) => {
  const frame = useCurrentFrame();

  const f1 = [cues.sentence('Before the softmax'), cues.sentence('If the entries')];
  const f2 = [f1[1], durationInFrames];
  const boxAt = cues.at('divide every score');
  const dkNoteAt = cues.at('the length of the key');

  // d_k steps, timed to the narration
  const stepTimes = [f2[0], cues.at('grows in proportion'), cues.at('With big vectors'), cues.at('nearly one-hot')];
  let stepF = 0;
  stepTimes.forEach((t, i) => {
    if (i > 0) stepF += ease(frame, t, 20);
  });
  const step = Math.round(stepF);
  const gradAt = cues.at('gradients almost vanish');
  const scaledAt = cues.at('Dividing by the square root');
  const sc = ease(frame, scaledAt, 26); // 0 = raw, 1 = scaled

  const varRaw = morph(stepF, (s) => s.varRaw);
  const last = SCALING[SCALING.length - 1];
  const maxW = morph(stepF, (s) => Math.max(...s.pRaw));
  const grad = morph(stepF, (s) => s.gradRaw);
  const gradAlarm = ease(frame, gradAt, 14) * (1 - sc);

  // histogram geometry
  const HW = 700;
  const HH = 280;
  const binW = HW / HIST_BINS;
  const yMax = 0.42; // probability mass per bin mapped to full height
  const hist = (i: number) => morph(stepF, (s) => s.histRaw[i]);

  return (
    <>
      <Layer opacity={windowed(frame, f1[0] - 10, f1[1])} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 48, paddingBottom: 60 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <Tex size={84}>Attention(Q, K, V) = softmax</Tex>
          <Tex size={190} color={C.muted} style={{ fontStyle: 'normal', fontWeight: 300, marginTop: -16 }}>(</Tex>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Tex size={78}>QK^T</Tex>
            <div style={{ width: 190, height: 3, background: C.text, margin: '8px 0' }} />
            <div
              style={{
                padding: '2px 18px',
                borderRadius: 12,
                background: rgba(C.violet, 0.35 * ease(frame, boxAt, 16)),
                boxShadow: `0 0 0 2px ${rgba(C.violetLight, 0.8 * ease(frame, boxAt, 16))}`,
              }}
            >
              <Tex size={78} color={C.violetLight}>√d_k</Tex>
            </div>
          </div>
          <Tex size={190} color={C.muted} style={{ fontStyle: 'normal', fontWeight: 300, marginTop: -16 }}>)</Tex>
          <Tex size={84}>V</Tex>
        </div>
        <div style={{ fontFamily: F.body, fontSize: 30, color: C.muted, opacity: ease(frame, dkNoteAt, 16) }}>
          <Tex size={36} color={C.violetLight}>d_k</Tex> = length of each key vector
        </div>
      </Layer>

      <Layer opacity={windowed(frame, f2[0], f2[1] + 30)}>
        {/* d_k stepper */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16 }}>
          <Tex size={40} color={C.muted} style={{ marginRight: 10 }}>d_k =</Tex>
          {DK_STEPS.map((dk, i) => (
            <div
              key={dk}
              style={{
                width: 108,
                padding: '10px 0',
                textAlign: 'center',
                borderRadius: 12,
                fontFamily: F.mono,
                fontSize: 26,
                color: i === step ? '#fff' : C.dim,
                background: i === step ? rgba(C.violet, 0.55) : rgba(C.text, 0.03),
                border: `1px solid ${i === step ? C.violetLight : C.line2}`,
              }}
            >
              {dk}
            </div>
          ))}
        </div>

        {/* left: distribution of q.k */}
        <div style={{ ...PANEL, left: 0, width: 800 }}>
          <Eyebrow color={C.muted} style={{ textTransform: 'none', letterSpacing: '0.06em' }}>q · k  for 4,000 random unit-variance pairs</Eyebrow>
          <svg width={HW} height={HH + 40} style={{ marginTop: 40, overflow: 'visible' }}>
            {Array.from({ length: HIST_BINS }, (_, i) => {
              const hRaw = (Math.min(hist(i), yMax) / yMax) * HH;
              const hSc = (Math.min(last.histScaled[i], yMax) / yMax) * HH;
              return (
                <g key={i}>
                  <rect x={i * binW + 0.5} y={HH - hRaw} width={binW - 1} height={hRaw} rx={1.5} fill={C.violet} opacity={mix(0.95, 0.25, sc)} />
                  <rect x={i * binW + 0.5} y={HH - hSc * sc} width={binW - 1} height={hSc * sc} rx={1.5} fill={C.teal} opacity={0.95} />
                </g>
              );
            })}
            <line x1={0} y1={HH} x2={HW} y2={HH} stroke={C.line2} strokeWidth={2} />
            {[-48, -24, 0, 24, 48].map((v) => (
              <text key={v} x={((v + HIST_RANGE) / (2 * HIST_RANGE)) * HW} y={HH + 32} fill={C.dim} fontFamily={F.mono} fontSize={18} textAnchor="middle">
                {v === 0 ? '0' : v > 0 ? `+${v}` : `−${-v}`}
              </text>
            ))}
          </svg>
          <div style={{ display: 'flex', gap: 40, marginTop: 22, alignItems: 'baseline' }}>
            <div style={{ fontFamily: F.mono, fontSize: 28, color: C.violetLight }}>
              Var = {varRaw.toFixed(1)}
            </div>
            <div style={{ fontFamily: F.mono, fontSize: 28, color: C.teal, opacity: sc }}>
              Var(÷√d_k) = {last.varScaled.toFixed(2)}
            </div>
          </div>
        </div>

        {/* right: one softmax row */}
        <div style={{ ...PANEL, left: 840, width: 840 }}>
          <Eyebrow color={C.muted} style={{ textTransform: 'none', letterSpacing: '0.06em' }}>softmax over {N_KEYS} keys, one query</Eyebrow>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 22, height: HH, marginTop: 40, borderBottom: `2px solid ${C.line2}` }}>
            {Array.from({ length: N_KEYS }, (_, k) => {
              const raw = morph(stepF, (s) => s.pRaw[k]);
              const v = mix(raw, last.pScaled[k], sc);
              return (
                <div key={k} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', height: '100%' }}>
                  <div style={{ fontFamily: F.mono, fontSize: 18, color: C.muted, marginBottom: 8 }}>{v.toFixed(2)}</div>
                  <div style={{ width: '100%', height: Math.max(2, v * (HH - 40)), borderRadius: '6px 6px 0 0', background: sc > 0.5 ? C.teal : C.violet, opacity: 0.9 }} />
                </div>
              );
            })}
          </div>
          <div style={{ display: 'flex', gap: 44, marginTop: 22, alignItems: 'baseline', fontFamily: F.mono, fontSize: 28 }}>
            <div style={{ color: C.text }}>
              max = {mix(maxW, Math.max(...last.pScaled), sc).toFixed(2)}
            </div>
            <div
              style={{
                color: gradAlarm > 0.5 ? C.rose : sc > 0.5 ? C.teal : C.text,
                padding: '4px 12px',
                borderRadius: 10,
                background: rgba(C.rose, 0.14 * gradAlarm),
              }}
            >
              gradient = {mix(grad, last.gradScaled, sc).toFixed(3)}
            </div>
          </div>
          <div style={{ marginTop: 14, fontFamily: F.body, fontSize: 20, color: C.dim }}>gradient = size of the softmax Jacobian ∂p/∂s</div>
        </div>

        <div style={{ position: 'absolute', top: 680, left: 0, right: 0, textAlign: 'center', opacity: sc }}>
          <span style={{ fontFamily: F.body, fontSize: 22, color: C.muted }}>after dividing by √d_k = {Math.sqrt(last.dk)}</span>
        </div>
      </Layer>
    </>
  );
};
