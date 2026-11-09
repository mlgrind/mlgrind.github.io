import React from 'react';
import { useCurrentFrame } from 'remotion';
import type { SceneProps } from '..';
import { C, F, HEAD, rgba } from '../../theme';
import { ease, windowed } from '../../lib/anim';
import { Arrow, Layer, ProblemChip, Tex } from '../../components/ui';
import { NumGrid } from '../../components/charts';
import { FL, FLAT, FMAP, FMAP_SHIFT, POOLED, POOLED_SHIFT, POOL_SAME, RES } from './data';

const WIN = [C.violetLight, C.teal, C.amber, '#ff8fa3'];
const winOf = (i: number, j: number) => Math.floor(i / 2) * 2 + Math.floor(j / 2);
const isMax = (m: number[][], p: number[][], i: number, j: number) => m[i][j] === p[Math.floor(i / 2)][Math.floor(j / 2)];

const PoolPair: React.FC<{ map: number[][]; pooled: number[][]; label: string; p: number; reveal: number }> = ({ map, pooled, label, p, reveal }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 34, opacity: p }}>
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
      <Tex size={34} color={C.muted}>{label}</Tex>
      <NumGrid
        data={map}
        cell={64}
        color={(_, i, j) => rgba(WIN[winOf(i, j)], isMax(map, pooled, i, j) ? 0.12 + 0.45 * reveal : 0.1)}
        textColor={(_, i, j) => (isMax(map, pooled, i, j) ? C.text : rgba(C.text, 1 - 0.55 * reveal))}
        windows={[0, 1, 2, 3].map((w) => ({ i: Math.floor(w / 2) * 2, j: (w % 2) * 2, h: 2, w: 2, color: WIN[w], opacity: 0.8 * reveal }))}
      />
    </div>
    <Arrow width={80} label="max" progress={reveal} />
    <NumGrid data={pooled} cell={64} reveal={() => reveal} color={(_, i, j) => rgba(WIN[i * 2 + j], 0.5)} style={{ marginTop: 50 }} />
  </div>
);

const BLOCKS = ['conv 3×3', 'BN', 'ReLU', 'conv 3×3', 'BN'];

export const PoolingScene: React.FC<SceneProps> = ({ cues, durationInFrames }) => {
  const frame = useCurrentFrame();
  const a = [54, cues.sentence('After a few rounds')];
  const b = [a[1], cues.sentence('Very deep stacks')];
  const c = [b[1], durationInFrames];

  const poolAt = cues.at('keeping only the largest');
  const shiftAt = cues.at('a small shift');
  const flatAt = cues.at('Flatten turns');
  const blockAt = cues.at('computes convolution');
  const addAt = cues.at('adds its input back');
  const idAt = cues.at('If the identity');
  const chipAt = cues.sentence("You'll build Max Pooling");

  const flatP = ease(frame, flatAt + 20, 40);

  return (
    <>
      <Layer opacity={windowed(frame, a[0], a[1])}>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 30, display: 'flex', justifyContent: 'center', gap: 120 }}>
          <PoolPair map={FMAP} pooled={POOLED} label="feature map 4×4" p={1} reveal={ease(frame, poolAt, 24)} />
          <PoolPair map={FMAP_SHIFT} pooled={POOLED_SHIFT} label="shifted right by 1" p={ease(frame, shiftAt, 18)} reveal={ease(frame, shiftAt + 20, 20)} />
        </div>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 440, display: 'flex', justifyContent: 'center', gap: 60, fontFamily: F.body, fontSize: 30, color: C.muted }}>
          <span style={{ opacity: ease(frame, cues.at('It halves'), 16) }}>4×4 → 2×2</span>
          <span style={{ opacity: ease(frame, shiftAt + 40, 16), color: C.tealLight }}>{POOL_SAME} of 4 outputs unchanged after the shift</span>
        </div>
      </Layer>

      <Layer opacity={windowed(frame, b[0], b[1])}>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 90, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 50 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 50 }}>
            {/* H x W grid, each cell holding C channel values */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
              <Tex size={36} color={C.muted}>{`(1, ${FL.h}, ${FL.w}, ${FL.c})`}</Tex>
              <div style={{ display: 'grid', gridTemplateColumns: `repeat(${FL.w}, auto)`, gap: 18 }}>
                {Array.from({ length: FL.h * FL.w }, (_, cell) => (
                  <div key={cell} style={{ display: 'flex', gap: 6, padding: 10, borderRadius: 12, border: `1px solid ${C.line2}`, background: rgba(C.panel, 0.8) }}>
                    {FLAT.filter((f) => f.h * FL.w + f.w === cell).map((f) => (
                      <div key={f.v} style={{ width: 52, height: 52, borderRadius: 8, background: rgba(HEAD[f.c], 0.35 * (1 - flatP) + 0.08), display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F.mono, fontSize: 22, color: C.text }}>
                        {f.v}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
              <div style={{ fontFamily: F.body, fontSize: 24, color: C.muted }}>(batch, height, width, channels)</div>
            </div>
            <Arrow width={100} label="flatten" progress={ease(frame, flatAt, 16)} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, opacity: ease(frame, flatAt + 10, 16) }}>
            <div style={{ display: 'flex', gap: 6 }}>
              {FLAT.map((f, k) => (
                <div key={f.v} style={{ width: 54, height: 54, borderRadius: 8, background: rgba(HEAD[f.c], 0.35), display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F.mono, fontSize: 22, color: C.text, opacity: ease(frame, flatAt + 20 + k * 3, 10) }}>
                  {f.v}
                </div>
              ))}
            </div>
            <Tex size={36} color={C.muted}>{`(1, ${FL.h * FL.w * FL.c})`}</Tex>
          </div>
        </div>
      </Layer>

      <Layer opacity={windowed(frame, c[0], c[1] + 30)}>
        <svg width={1680} height={360} style={{ position: 'absolute', top: 0, left: 0 }}>
          {/* skip connection */}
          <path
            d="M 290 196 C 290 30, 1218 30, 1218 198"
            fill="none"
            stroke={C.teal}
            strokeWidth={4}
            pathLength={1}
            strokeDasharray={1}
            strokeDashoffset={1 - ease(frame, addAt, 30)}
          />
          <text x={754} y={62} fill={C.tealLight} fontFamily={F.body} fontSize={26} textAnchor="middle" opacity={ease(frame, addAt + 20, 14)}>
            shortcut: x
          </text>
        </svg>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 200, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 14 }}>
          <div style={{ fontFamily: F.display, fontStyle: 'italic', fontSize: 52, color: C.text, width: 60 }}>x</div>
          {BLOCKS.map((bl, i) => {
            const p = ease(frame, blockAt + i * 12, 14);
            return (
              <React.Fragment key={i}>
                <div style={{ fontFamily: F.mono, fontSize: 26, color: C.dim, opacity: p }}>→</div>
                <div style={{ padding: '18px 20px', borderRadius: 14, fontFamily: F.mono, fontSize: 26, color: C.text, background: rgba(C.violet, 0.18), border: `1px solid ${rgba(C.violetLight, 0.5)}`, opacity: p }}>{bl}</div>
              </React.Fragment>
            );
          })}
          <div style={{ fontFamily: F.mono, fontSize: 26, color: C.dim, opacity: ease(frame, addAt, 14) }}>→</div>
          <div style={{ width: 62, height: 62, borderRadius: 31, border: `3px solid ${C.teal}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, color: C.tealLight, opacity: ease(frame, addAt, 14) }}>+</div>
          <div style={{ fontFamily: F.mono, fontSize: 26, color: C.dim, opacity: ease(frame, addAt + 10, 14) }}>→</div>
          <div style={{ padding: '18px 20px', borderRadius: 14, fontFamily: F.mono, fontSize: 26, color: C.text, background: rgba(C.teal, 0.18), border: `1px solid ${rgba(C.tealLight, 0.5)}`, opacity: ease(frame, addAt + 10, 14) }}>ReLU</div>
        </div>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 330, display: 'flex', justifyContent: 'center', opacity: ease(frame, idAt, 16) }}>
          <Tex size={44}>{'out = ReLU(F(x) + x),   F(x) → 0  ⇒  out = ReLU(x)'}</Tex>
        </div>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 420, display: 'flex', justifyContent: 'center', gap: 24, opacity: ease(frame, addAt + 30, 16) }}>
          {RES.map((r) => (
            <div key={r.cout} style={{ padding: '14px 22px', borderRadius: 14, border: `1px solid ${C.line2}`, background: rgba(C.panel, 0.8), fontFamily: F.mono, fontSize: 22, color: C.muted, whiteSpace: 'nowrap' }}>
              ({r.cin}, {r.h}, {r.h}) → ({r.cout}, {r.hout}, {r.hout}) stride {r.stride}:{' '}
              <span style={{ color: r.projection ? C.amber : C.tealLight }}>{r.projection ? '1×1 conv + BN' : 'identity'}</span>
            </div>
          ))}
        </div>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 560, display: 'flex', justifyContent: 'center', gap: 20 }}>
          {['Max Pooling', 'Flatten Layer', 'ResNet Basic Block'].map((t, i) => (
            <ProblemChip key={t} title={t} progress={ease(frame, chipAt + i * 8, 18)} />
          ))}
        </div>
      </Layer>
    </>
  );
};
