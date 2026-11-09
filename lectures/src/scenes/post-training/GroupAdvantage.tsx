import React from 'react';
import { useCurrentFrame } from 'remotion';
import type { SceneProps } from '..';
import { C, F, rgba } from '../../theme';
import { ease, mix, windowed } from '../../lib/anim';
import { Layer, Tex } from '../../components/ui';
import { Node } from '../../components/plot';
import { fmt } from '../../lib/math';
import { G, GROUP, GROUP_R, GROUP_SAME } from './data';

const Models: React.FC<{ frame: number; criticAt: number; dropAt: number }> = ({ frame, criticAt, dropAt }) => {
  const crit = ease(frame, criticAt, 16);
  const drop = ease(frame, dropAt, 18);
  const col = (title: string, items: { name: string; color: string; critic?: boolean }[], p: number) => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18, opacity: p }}>
      <div style={{ fontFamily: F.body, fontSize: 36, fontWeight: 600, color: C.text, marginBottom: 6 }}>{title}</div>
      {items.map((it) => {
        const cross = it.critic ? drop : 0;
        return (
          <div key={it.name} style={{ position: 'relative' }}>
            <Node w={420} h={84} color={it.color} active={it.critic ? crit * (1 - cross) : 0.15} style={{ opacity: 1 - 0.6 * cross }}>
              {it.name}
            </Node>
            {it.critic && cross > 0 && (
              <svg width={420} height={84} style={{ position: 'absolute', inset: 0 }}>
                <line x1={20} y1={42} x2={20 + 380 * cross} y2={42} stroke={C.rose} strokeWidth={5} strokeLinecap="round" />
              </svg>
            )}
          </div>
        );
      })}
    </div>
  );
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', justifyContent: 'center', gap: 160, paddingTop: 40 }}>
      {col(
        'PPO-RLHF',
        [
          { name: 'policy', color: C.violet },
          { name: 'reference (frozen)', color: C.violet },
          { name: 'reward model', color: C.violet },
          { name: 'value network (critic)', color: C.amber, critic: true },
        ],
        1,
      )}
      {col(
        'GRPO',
        [
          { name: 'policy', color: C.teal },
          { name: 'reference (frozen)', color: C.teal },
          { name: 'reward: checker or model', color: C.teal },
          { name: 'group mean as baseline', color: C.teal },
        ],
        drop,
      )}
    </div>
  );
};

export const GroupAdvantageScene: React.FC<SceneProps> = ({ cues, durationInFrames }) => {
  const frame = useCurrentFrame();
  const pA = [cues.sentence('PPO for language'), cues.sentence('For each prompt')];
  const pB = [pA[1], durationInFrames];

  const cardsAt = cues.at('samples a group');
  const scoreAt = cues.at('a checker simply');
  const meanAt = cues.at("the group's own mean");
  const stdAt = cues.at('population standard deviation');
  const advAt = cues.at("Each response's advantage");
  const curveAt = cues.at('grading on a curve');
  const sameAt = cues.at('if every response gets the same');
  const same = ease(frame, sameAt, 24);

  const CW = 168;
  const GAP = 22;
  const x0 = (1680 - (G * CW + (G - 1) * GAP)) / 2;
  const zeroY = 500;
  const UNIT = 120;
  const showAdv = ease(frame, advAt + 10, 20);

  const rewards = same > 0.5 ? GROUP_SAME.adv.map(() => 1) : GROUP_R;
  const stats = same > 0.5 ? GROUP_SAME : GROUP;

  return (
    <>
      <Layer opacity={windowed(frame, pA[0], pA[1])}>
        <Models frame={frame} criticAt={cues.at('a critic as big')} dropAt={cues.at('throws the critic away')} />
      </Layer>

      <Layer opacity={windowed(frame, pB[0], pB[1] + 30)}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, textAlign: 'center', fontFamily: F.mono, fontSize: 28, color: C.muted, opacity: ease(frame, cardsAt - 10, 16) }}>
          one prompt · {G} sampled answers · checker reward
        </div>
        {rewards.map((r, i) => {
          const p = ease(frame, cardsAt + i * 4, 14);
          const s = ease(frame, scoreAt + i * 3, 12);
          const ok = r === 1;
          const a = mix(GROUP.adv[i], 0, same);
          const h = a * UNIT * showAdv;
          const curve = ease(frame, curveAt, 16) * (1 - same);
          const x = x0 + i * (CW + GAP);
          return (
            <React.Fragment key={i}>
              <div
                style={{
                  position: 'absolute',
                  left: x,
                  top: 60,
                  width: CW,
                  height: 150,
                  borderRadius: 16,
                  border: `2px solid ${s > 0.5 ? rgba(ok ? C.teal : C.rose, 0.7) : C.line2}`,
                  background: s > 0.5 ? rgba(ok ? C.teal : C.rose, 0.12) : rgba(C.panel2, 0.8),
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  opacity: p,
                  transform: `translateY(${(1 - p) * 14}px)`,
                }}
              >
                <span style={{ fontFamily: F.mono, fontSize: 22, color: C.muted }}>answer {i + 1}</span>
                <span style={{ fontFamily: F.body, fontSize: 44, color: ok ? C.teal : C.rose, opacity: s }}>{ok ? '✓' : '✗'}</span>
                <span style={{ fontFamily: F.mono, fontSize: 26, color: C.text, opacity: s }}>r = {r}</span>
              </div>
              <svg width={CW} height={340} style={{ position: 'absolute', left: x, top: zeroY - 170, overflow: 'visible' }}>
                <rect x={30} y={h >= 0 ? 170 - h : 170} width={CW - 60} height={Math.abs(h)} rx={8} fill={a >= 0 ? C.teal : C.rose} opacity={0.6 + 0.4 * curve} />
                <text x={CW / 2} y={h >= 0 ? 170 - h - 14 : 170 - h + 34} textAnchor="middle" fontFamily={F.mono} fontSize={28} fill={C.text} opacity={showAdv}>
                  {fmt(a, 2)}
                </text>
              </svg>
            </React.Fragment>
          );
        })}
        <div style={{ position: 'absolute', left: x0 - 20, width: G * CW + (G - 1) * GAP + 40, top: zeroY, height: 2, background: C.line2, opacity: showAdv }} />
        <div style={{ position: 'absolute', left: 0, top: zeroY - 20, width: x0 - 30, textAlign: 'right', opacity: showAdv }}>
          <Tex size={40} color={C.muted}>A_i</Tex>
        </div>
        <div style={{ position: 'absolute', top: 236, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 60, fontFamily: F.mono, fontSize: 30 }}>
          <span style={{ color: C.violetLight, opacity: ease(frame, meanAt, 16) }}>mean = {fmt(stats.mean, 3)}</span>
          <span style={{ color: C.violetLight, opacity: ease(frame, stdAt, 16) }}>std (population) = {fmt(stats.std, 3)}</span>
        </div>
        <div style={{ position: 'absolute', top: 664, left: 0, right: 0, display: 'flex', justifyContent: 'center', opacity: ease(frame, advAt, 16) }}>
          <Tex size={48}>A_i = (r_i − mean) / (std + ε)</Tex>
          <span style={{ fontFamily: F.body, fontSize: 28, color: C.amber, marginLeft: 40, alignSelf: 'center', opacity: same }}>every answer correct: std = 0, so A = 0</span>
        </div>
      </Layer>
    </>
  );
};
