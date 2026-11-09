import React from 'react';
import { useCurrentFrame } from 'remotion';
import type { SceneProps } from '..';
import { C, F, rgba } from '../../theme';
import { ease, windowed } from '../../lib/anim';
import { Layer, Matrix, ProblemChip, weightColor } from '../../components/ui';
import { Node } from '../../components/plot';
import { fmt } from '../../lib/math';
import { CAUSAL_ATT, FUTURE_MAX, IMAGE, IMG, INIT_LOSS, LOG_V, N_PATCH, PATCH, ROW_SUMS, VOCAB } from './data';

const shade = (v: number) => `rgb(${Math.round(30 + 150 * v)}, ${Math.round(28 + 110 * v)}, ${Math.round(60 + 190 * v)})`;

const Pixels: React.FC<{ y0: number; x0: number; n: number; px: number }> = ({ y0, x0, n, px }) => (
  <svg width={n * px} height={n * px} style={{ display: 'block' }}>
    {Array.from({ length: n }, (_, r) =>
      Array.from({ length: n }, (_, c) => <rect key={`${r}-${c}`} x={c * px} y={r * px} width={px + 0.3} height={px + 0.3} fill={shade(IMAGE[y0 + r][x0 + c])} />),
    )}
  </svg>
);

/** windowed() with a 7-frame overlap on each side, so consecutive panels cross-fade */
const xfade = (f: number, a: number, b: number) => windowed(f, a - 7, b + 7);

export const TransformersScene: React.FC<SceneProps> = ({ cues, durationInFrames }) => {
  const frame = useCurrentFrame();
  const pA = [cues.sentence('The Transformer Encoder'), cues.sentence('The Tiny Vision')];
  const pB = [pA[1], cues.sentence('Then the Transformer Bug Hunt')];
  const pC = [pB[1], durationInFrames];

  const stackAt = [cues.at('positional encoding'), cues.at('multi-head self-attention'), cues.at('then a feed-forward'), cues.at('each wrapped'), cues.at('a layer norm')];
  const gptAt = cues.at('Mini GPT turns');
  const maskAt = cues.at('adds a causal mask');
  const lossAt = cues.at('the first loss should');
  const gpt = ease(frame, gptAt, 18);

  const cutAt = cues.at('cuts the image into patches');
  const embedAt = cues.at('embeds each one');
  const clsAt = cues.at('prepends a CLS');
  const posAt = cues.at('adds position embeddings');
  const countAt = cues.at('becomes sixteen tokens');

  const causalAt = cues.at('no position may attend');
  const rowsAt = cues.at('every attention row');

  const PX = 11; // image pixel size
  const G = IMG / PATCH;

  return (
    <>
      <Layer opacity={xfade(frame, pA[0], pA[1])}>
        <div style={{ position: 'absolute', top: 0, left: 40, display: 'flex', flexDirection: 'column-reverse', gap: 14, width: 560 }}>
          {[
            { t: gpt > 0.5 ? 'token + position embeddings' : 'embeddings + positional encoding', c: C.dim },
            { t: gpt > 0.5 ? 'x + Attn(LN(x)), causal' : 'multi-head self-attention', c: C.violet },
            { t: gpt > 0.5 ? 'x + MLP(LN(x))' : 'add & layer norm', c: gpt > 0.5 ? C.violet : C.teal },
            { t: gpt > 0.5 ? 'final layer norm' : 'feed-forward network', c: gpt > 0.5 ? C.teal : C.violet },
            { t: gpt > 0.5 ? `logits over ${VOCAB} characters` : 'add & layer norm', c: gpt > 0.5 ? C.amber : C.teal },
          ].map((n, i) => {
            const p = ease(frame, stackAt[i], 14);
            return (
              <div key={i} style={{ opacity: 0.15 + 0.85 * p }}>
                <Node w={560} h={86} color={n.c} active={0.2} style={{ fontSize: 27 }}>
                  {n.t}
                </Node>
              </div>
            );
          })}
          <div style={{ fontFamily: F.body, fontSize: 30, fontWeight: 600, color: gpt > 0.5 ? C.amber : C.text, textAlign: 'center', marginBottom: 6 }}>
            {gpt > 0.5 ? 'Mini GPT block (pre-norm)' : 'Transformer encoder block'}
          </div>
        </div>
        <div style={{ position: 'absolute', top: 30, left: 760, opacity: ease(frame, maskAt, 16) }}>
          <Matrix
            data={CAUSAL_ATT}
            digits={2}
            cellW={80}
            cellH={52}
            fontSize={21}
            label="causal attention"
            labelSize={38}
            shape={false}
            color={(v, i, j) => (j > i ? rgba(C.text, 0.02) : weightColor()(v, i, j))}
            textColor={(_, i, j) => (j > i ? C.dim : undefined)}
          />
        </div>
        <div style={{ position: 'absolute', top: 150, left: 1330, width: 350, display: 'flex', flexDirection: 'column', gap: 26, opacity: ease(frame, lossAt, 16) }}>
          <div style={{ fontFamily: F.body, fontSize: 26, color: C.muted }}>loss at initialization</div>
          <div style={{ fontFamily: F.mono, fontSize: 40, color: C.amber }}>{fmt(INIT_LOSS, 3)}</div>
          <div style={{ fontFamily: F.body, fontSize: 26, color: C.muted }}>
            log V, V = {VOCAB} characters
          </div>
          <div style={{ fontFamily: F.mono, fontSize: 40, color: C.text }}>{fmt(LOG_V, 3)}</div>
        </div>
        <div style={{ position: 'absolute', top: 470, left: 760, fontFamily: F.body, fontSize: 26, color: C.muted, opacity: ease(frame, maskAt + 20, 16) }}>
          zeros above the diagonal: no peeking at future characters
        </div>
        <div style={{ position: 'absolute', top: 630, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 20 }}>
          <ProblemChip title="E2E: Transformer Encoder" progress={ease(frame, pA[0] + 10, 16)} />
          <ProblemChip title="Mini GPT" progress={gpt} />
        </div>
      </Layer>

      <Layer opacity={xfade(frame, pB[0], pB[1])}>
        <div style={{ position: 'absolute', top: 20, left: 60 }}>
          <div style={{ position: 'relative', width: IMG * PX, height: IMG * PX }}>
            <Pixels y0={0} x0={0} n={IMG} px={PX} />
            <svg width={IMG * PX} height={IMG * PX} style={{ position: 'absolute', inset: 0, opacity: ease(frame, cutAt, 16) }}>
              {Array.from({ length: G - 1 }, (_, i) => (
                <g key={i}>
                  <line x1={(i + 1) * PATCH * PX} x2={(i + 1) * PATCH * PX} y1={0} y2={IMG * PX} stroke={C.amber} strokeWidth={3} />
                  <line y1={(i + 1) * PATCH * PX} y2={(i + 1) * PATCH * PX} x1={0} x2={IMG * PX} stroke={C.amber} strokeWidth={3} />
                </g>
              ))}
            </svg>
          </div>
          <div style={{ marginTop: 16, textAlign: 'center', fontFamily: F.mono, fontSize: 26, color: C.muted }}>
            {IMG}×{IMG} image · {PATCH}×{PATCH} patches
          </div>
        </div>
        {/* token row */}
        <div style={{ position: 'absolute', top: 60, left: 470, width: 1210, display: 'flex', flexWrap: 'wrap', gap: 12 }}>
          {[-1, ...Array.from({ length: N_PATCH }, (_, i) => i)].map((i, slot) => {
            const p = i < 0 ? ease(frame, clsAt, 16) : ease(frame, cutAt + 8 + i * 2, 12);
            const r = Math.floor(Math.max(i, 0) / G);
            const c = Math.max(i, 0) % G;
            return (
              <div key={slot} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, opacity: p, transform: `translateY(${(1 - p) * 16}px)` }}>
                {i < 0 ? (
                  <div style={{ width: 8 * 7, height: 8 * 7, borderRadius: 8, background: rgba(C.amber, 0.35), border: `2px solid ${C.amber}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F.mono, fontSize: 22, color: C.text }}>
                    CLS
                  </div>
                ) : (
                  <div style={{ borderRadius: 6, overflow: 'hidden', outline: `2px solid ${rgba(C.violetLight, 0.3 + 0.5 * ease(frame, embedAt, 12))}` }}>
                    <Pixels y0={r * PATCH} x0={c * PATCH} n={PATCH} px={7} />
                  </div>
                )}
                <div style={{ fontFamily: F.mono, fontSize: 22, color: C.teal, opacity: ease(frame, posAt + slot, 10) }}>+p{slot}</div>
              </div>
            );
          })}
        </div>
        <div style={{ position: 'absolute', top: 330, left: 470, display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div style={{ fontFamily: F.body, fontSize: 28, color: C.violetLight, opacity: ease(frame, embedAt, 16) }}>
            each patch: {PATCH}·{PATCH}·C values → one embedding vector
          </div>
          <div style={{ fontFamily: F.body, fontSize: 28, color: C.teal, opacity: ease(frame, posAt, 16) }}>
            position embeddings: the only source of spatial order
          </div>
          <div style={{ fontFamily: F.mono, fontSize: 36, color: C.amber, opacity: ease(frame, countAt, 16) }}>
            ({IMG}/{PATCH})² = {N_PATCH} patches + CLS = {N_PATCH + 1} tokens
          </div>
        </div>
        <div style={{ position: 'absolute', top: 630, left: 0, right: 0, display: 'flex', justifyContent: 'center' }}>
          <ProblemChip title="E2E: Tiny Vision Transformer" progress={ease(frame, pB[0] + 10, 16)} />
        </div>
      </Layer>

      <Layer opacity={xfade(frame, pC[0], pC[1] + 30)}>
        <div style={{ position: 'absolute', top: 20, left: 120 }}>
          <Matrix
            data={CAUSAL_ATT}
            digits={2}
            cellW={88}
            cellH={58}
            fontSize={22}
            label="att = softmax(masked scores)"
            labelSize={36}
            shape={false}
            color={(v, i, j) => (j > i ? rgba(C.rose, 0.12 * ease(frame, causalAt, 16)) : weightColor()(v, i, j))}
          />
        </div>
        <div style={{ position: 'absolute', top: 20 + 54 + 3, left: 120 + 6 * 94 + 50, display: 'flex', flexDirection: 'column', gap: 6 }}>
          {ROW_SUMS.map((s, i) => (
            <div key={i} style={{ height: 58, display: 'flex', alignItems: 'center', fontFamily: F.mono, fontSize: 24, color: C.teal, opacity: ease(frame, rowsAt + i * 4, 12) }}>
              Σ = {fmt(s, 2)}
            </div>
          ))}
        </div>
        <div style={{ position: 'absolute', top: 60, left: 1000, width: 680, display: 'flex', flexDirection: 'column', gap: 30 }}>
          <div style={{ fontFamily: F.body, fontSize: 30, color: C.text }}>
            a broken mini GPT · <span style={{ color: C.rose }}>4 bugs</span> in <span style={{ fontFamily: F.mono }}>gpt_forward</span>
          </div>
          <div style={{ fontFamily: F.body, fontSize: 28, color: C.rose, opacity: ease(frame, causalAt, 16) }}>
            check 1: weight on future positions = {fmt(FUTURE_MAX, 2)} ✓
          </div>
          <div style={{ fontFamily: F.body, fontSize: 28, color: C.teal, opacity: ease(frame, rowsAt + 20, 16) }}>
            check 2: every row sums to {fmt(ROW_SUMS[0], 2)} ✓
          </div>
          <ProblemChip title="Transformer Bug Hunt" progress={ease(frame, pC[0] + 10, 16)} />
        </div>
      </Layer>
    </>
  );
};
