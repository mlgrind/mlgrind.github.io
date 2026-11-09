import React from 'react';
import { useCurrentFrame } from 'remotion';
import type { SceneProps } from '..';
import { C, F } from '../../theme';
import { ease, lin, mix, windowed } from '../../lib/anim';
import { Layer, ProblemChip, Tex } from '../../components/ui';
import { Panel, Readout } from '../../components/plot';
import { EPS_C, EPS_U, EULER_ERR, FM_PAIRS, SPIRAL, W_SHOW, guided } from './data';

const GS = 520;
const GU = 300; // pixels per unit in the guidance plot
const gx = (x: number) => 70 + x * GU;
const gy = (y: number) => 70 - y * GU;

const FS = 560;
const fx = (x: number) => FS / 2 - 40 + x * (FS / 4.2);
const fy = (y: number) => FS / 2 - y * (FS / 4.2);

const Arrow: React.FC<{ to: number[]; color: string; w?: number; label?: string; o?: number; left?: boolean }> = ({ to, color, w = 4, label, o = 1, left = false }) => {
  const x2 = gx(to[0]);
  const y2 = gy(to[1]);
  const a = Math.atan2(y2 - gy(0), x2 - gx(0));
  return (
    <g opacity={o}>
      <line x1={gx(0)} y1={gy(0)} x2={x2} y2={y2} stroke={color} strokeWidth={w} />
      <path d={`M${x2} ${y2} L${x2 - 16 * Math.cos(a - 0.4)} ${y2 - 16 * Math.sin(a - 0.4)} M${x2} ${y2} L${x2 - 16 * Math.cos(a + 0.4)} ${y2 - 16 * Math.sin(a + 0.4)}`} stroke={color} strokeWidth={w} fill="none" />
      {label && (
        <text x={left ? x2 - 14 : x2 + 12} y={y2 + 24} fill={color} fontFamily={F.mono} fontSize={24} textAnchor={left ? 'end' : 'start'}>
          {label}
        </text>
      )}
    </g>
  );
};

export const GuidanceFlowScene: React.FC<SceneProps> = ({ cues, durationInFrames }) => {
  const frame = useCurrentFrame();

  const twiceAt = cues.at('runs the network twice');
  const extraAt = cues.at('extrapolates');
  const oneAt = cues.at('A guidance scale of one');
  const fidAt = cues.at('larger values');
  const flowAt = cues.sentence('Flow matching simplifies');
  const lineAt = cues.at('straight line');
  const velAt = cues.at('constant velocity');
  const eulerAt = cues.at('few Euler steps');
  const singleAt = cues.at('a single step');
  const chip = ease(frame, cues.sentence('Those are'), 20);

  // guidance scale animates through 0 -> 1 -> 3 -> 7.5
  const wKeys = [extraAt, oneAt, fidAt, fidAt + 50];
  let wIdx = 0;
  wKeys.forEach((t, i) => {
    if (frame >= t) wIdx = i;
  });
  const wP = ease(frame, wKeys[wIdx], 20);
  const wPrev = W_SHOW[Math.max(0, wIdx - 1)];
  const w = wIdx === 0 ? W_SHOW[0] : mix(wPrev, W_SHOW[wIdx], wP);
  const g = guided(w);

  // flow: t sweeps 0 -> 1 along the straight paths
  const tFlow = lin(frame, velAt, eulerAt);

  return (
    <Layer opacity={windowed(frame, 0, durationInFrames + 30)}>
      <Panel title="classifier-free guidance" style={{ position: 'absolute', left: 0, top: 0, width: 800 }}>
        <svg width={730} height={GS - 120} style={{ overflow: 'visible' }}>
          <line x1={gx(0)} x2={730} y1={gy(0)} y2={gy(0)} stroke={C.line2} strokeWidth={1.5} />
          <Arrow to={EPS_U} color={C.muted} label="ε_u" left o={ease(frame, twiceAt, 16)} />
          <Arrow to={EPS_C} color={C.violetLight} label="ε_c" o={ease(frame, twiceAt + 15, 16)} />
          <line x1={gx(EPS_U[0])} y1={gy(EPS_U[1])} x2={gx(g[0])} y2={gy(g[1])} stroke={C.amber} strokeWidth={2} strokeDasharray="6 6" opacity={ease(frame, extraAt, 16)} />
          <Arrow to={g} color={C.amber} w={5} o={ease(frame, extraAt, 16)} />
        </svg>
        <Tex size={36} style={{ opacity: ease(frame, extraAt, 16) }}>{'ε = ε_u + w · (ε_c − ε_u)'}</Tex>
        <Readout size={30} color={C.amber} style={{ marginTop: 12, opacity: ease(frame, extraAt, 16) }}>
          w = {w.toFixed(1)}   ε = ({g.map((v) => v.toFixed(2)).join(', ')})
        </Readout>
        <div style={{ marginTop: 8, fontFamily: F.body, fontSize: 24, color: C.muted, opacity: ease(frame, oneAt, 16) }}>
          {w < 0.5 ? 'w = 0: unconditional' : w < 1.5 ? 'w = 1: plain conditional' : 'w > 1: more prompt fidelity, less diversity'}
        </div>
      </Panel>

      <Panel title="flow matching: straight paths noise → data" accent={C.teal} style={{ position: 'absolute', left: 840, top: 0, width: 840, opacity: ease(frame, flowAt, 18) }}>
        <svg width={FS} height={FS - 80} viewBox={`0 40 ${FS} ${FS - 80}`} style={{ overflow: 'visible' }}>
          {SPIRAL.map((p, i) => (
            <circle key={i} cx={fx(p[0])} cy={fy(p[1])} r={3} fill={C.violetLight} opacity={0.35} />
          ))}
          {FM_PAIRS.map((p, i) => {
            const xt = [mix(p.x0[0], p.x1[0], tFlow), mix(p.x0[1], p.x1[1], tFlow)];
            return (
              <g key={i}>
                <line x1={fx(p.x0[0])} y1={fy(p.x0[1])} x2={fx(p.x1[0])} y2={fy(p.x1[1])} stroke={C.teal} strokeWidth={1.5} opacity={0.45 * ease(frame, lineAt, 16)} />
                <circle cx={fx(p.x0[0])} cy={fy(p.x0[1])} r={5} fill={C.muted} opacity={ease(frame, lineAt - 20, 16)} />
                <circle cx={fx(xt[0])} cy={fy(xt[1])} r={7} fill={C.teal} opacity={ease(frame, velAt, 16)} />
              </g>
            );
          })}
        </svg>
        <div style={{ position: 'absolute', right: 30, top: 90, width: 220, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Tex size={30} style={{ opacity: ease(frame, lineAt, 16) }}>{'x_t = (1−t) x_0 + t x_1'}</Tex>
          <Tex size={30} style={{ opacity: ease(frame, velAt, 16) }}>{'v = x_1 − x_0'}</Tex>
          <Readout size={26} color={C.teal} style={{ opacity: ease(frame, velAt, 16) }}>
            t = {tFlow.toFixed(2)}
          </Readout>
          <div style={{ fontFamily: F.body, fontSize: 22, color: C.muted, opacity: ease(frame, singleAt, 16) }}>
            one Euler step:
            <br />x_0 + 1·v lands on x_1
            <br />max error {EULER_ERR.toFixed(3)}
          </div>
        </div>
      </Panel>

      <div style={{ position: 'absolute', left: 0, right: 0, top: 620, display: 'flex', justifyContent: 'center', gap: 20 }}>
        <ProblemChip title="Classifier-Free Guidance" progress={chip} />
        <ProblemChip title="Flow Matching (Rectified Flow)" progress={ease(frame, cues.at('Flow Matching.'), 20)} />
      </div>
    </Layer>
  );
};
