import React from 'react';
import { useCurrentFrame } from 'remotion';
import type { SceneProps } from '..';
import { C, F, rgba } from '../../theme';
import { ease } from '../../lib/anim';
import { Arrow } from '../../components/ui';
import { Node } from '../../components/plot';

const A = 17;
const NODE_W = 286;
const PITCH = NODE_W + 62; // node + gap + arrow + gap
const LEFT0 = (1680 - (5 * NODE_W + 4 * 62)) / 2;
const B = 24;

export const PipelineScene: React.FC<SceneProps> = ({ cues }) => {
  const frame = useCurrentFrame();
  const stages = [
    { title: 'Pretrained model', sub: 'next-token prediction', at: cues.at('A pretrained'), color: C.dim },
    { title: 'Supervised fine-tuning', sub: 'example conversations', at: cues.at('Supervised fine-tuning'), color: C.violet },
    { title: 'Preference learning', sub: 'reward model + PPO, or DPO', at: cues.at('Then preference learning'), color: C.violet },
    { title: 'GRPO', sub: 'verifiable rewards', at: cues.at('GRPO, the method'), color: C.teal },
    { title: 'Int8 quantization', sub: 'cheap to serve', at: cues.at('quantization, which'), color: C.amber },
  ];
  const practiced = ease(frame, cues.sentence('You practiced'), 16);
  const thisSection = ease(frame, cues.sentence('This section adds'), 16);
  const base = ease(frame, cues.at('brilliant autocomplete'), 16);
  const fixed = ease(frame, cues.at('closes that gap'), 16);

  return (
    <>
      <div style={{ position: 'absolute', top: 40, left: 0, right: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6 }}>
        {stages.map((s, i) => {
          const p = ease(frame, s.at, 18);
          const done = i === 0 ? base : p;
          return (
            <React.Fragment key={s.title}>
              {i > 0 && <Arrow width={50} progress={p} />}
              <div style={{ opacity: 0.25 + 0.75 * done, transform: `translateY(${(1 - done) * 12}px)` }}>
                <Node w={NODE_W} h={170} color={s.color} active={done * 0.5} style={{ flexDirection: 'column', gap: 10 }}>
                  <span style={{ fontSize: 30, fontWeight: 600 }}>{s.title}</span>
                  <span style={{ fontSize: 23, fontWeight: 400, color: C.muted }}>{s.sub}</span>
                </Node>
              </div>
            </React.Fragment>
          );
        })}
      </div>

      {/* brackets: what you practiced vs what this section adds */}
      <div style={{ position: 'absolute', top: 236, left: LEFT0 + PITCH, width: NODE_W + PITCH, opacity: practiced }}>
        <div style={{ height: 14, borderLeft: `2px solid ${C.violetLight}`, borderRight: `2px solid ${C.violetLight}`, borderBottom: `2px solid ${C.violetLight}` }} />
        <div style={{ textAlign: 'center', marginTop: 10, fontFamily: F.body, fontSize: 26, color: C.violetLight }}>practiced in Reinforcement Learning</div>
      </div>
      <div style={{ position: 'absolute', top: 236, left: LEFT0 + 3 * PITCH, width: NODE_W + PITCH, opacity: thisSection }}>
        <div style={{ height: 14, borderLeft: `2px solid ${C.teal}`, borderRight: `2px solid ${C.teal}`, borderBottom: `2px solid ${C.teal}` }} />
        <div style={{ textAlign: 'center', marginTop: 10, fontFamily: F.body, fontSize: 26, color: C.teal }}>this section</div>
      </div>

      {/* base model vs assistant on the same prompt */}
      <div style={{ position: 'absolute', top: 360, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 50 }}>
        {[
          { who: 'base model', text: `What is ${A + 1} × ${B + 1}?\nWhat is ${A + 2} × ${B + 2}?\nWhat is ${A + 3} × …`, p: base, color: C.dim },
          { who: 'after post-training', text: `${A} × ${B} = ${A * B}`, p: fixed, color: C.teal },
        ].map((c) => (
          <div
            key={c.who}
            style={{
              width: 620,
              padding: '24px 30px',
              borderRadius: 18,
              border: `1px solid ${rgba(c.color, 0.6)}`,
              background: rgba(C.panel, 0.8),
              opacity: c.p,
              transform: `translateY(${(1 - c.p) * 16}px)`,
            }}
          >
            <div style={{ fontFamily: F.mono, fontSize: 22, letterSpacing: '0.1em', color: c.color === C.dim ? C.muted : c.color, textTransform: 'uppercase', marginBottom: 14 }}>
              {c.who}
            </div>
            <div style={{ fontFamily: F.mono, fontSize: 26, color: C.muted, marginBottom: 8 }}>
              prompt: What is {A} × {B}?
            </div>
            <div style={{ fontFamily: F.mono, fontSize: 30, color: C.text, whiteSpace: 'pre-line', lineHeight: 1.45 }}>{c.text}</div>
          </div>
        ))}
      </div>
    </>
  );
};
