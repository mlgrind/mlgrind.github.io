import React from 'react';
import { useCurrentFrame } from 'remotion';
import type { SceneProps } from '..';
import { C, F, rgba } from '../../theme';
import { ease, lin } from '../../lib/anim';
import { ProblemChip, Tex } from '../../components/ui';
import { Axes, Label, Panel, scales } from '../../components/classical';
import { GMM_HIST, GMM_ITERS, GMM_PROBE, GMM_X } from './data';

const COMP = [C.violetLight, C.amber];
const s = scales([-4, 5], [0, 0.5], 820, 360);
const pdf = (x: number, mu: number, v: number) => Math.exp((-0.5 * (x - mu) ** 2) / v) / Math.sqrt(2 * Math.PI * v);
const hex = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const blend = (a: string, b: string, t: number) => {
  const [x, y] = [hex(a), hex(b)];
  return `rgb(${x.map((v, i) => Math.round(v + (y[i] - v) * t)).join(',')})`;
};
const lls = GMM_HIST.map((h) => h.ll);
const ls = scales([0, GMM_ITERS], [Math.min(...lls) - 2, Math.max(...lls) + 2], 470, 330);

export const GMMScene: React.FC<SceneProps> = ({ cues }) => {
  const frame = useCurrentFrame();
  const inAt = cues.sentence('K-means makes hard');
  const softAt = cues.at('A Gaussian mixture is softer');
  const curvesAt = cues.at('weighted sum of bell curves');
  const eAt = cues.at('The E-step');
  const mAt = cues.at('The M-step');
  const llAt = cues.at('never lowers');
  const chipAt = cues.at("You'll build both steps");

  const iterP = lin(frame, mAt + 10, chipAt);
  const it = Math.min(GMM_HIST.length - 1, Math.floor(iterP * (GMM_HIST.length - 1) + 1e-9));
  const h = GMM_HIST[frame >= mAt + 10 ? it : 0];
  const softP = ease(frame, softAt, 18);
  const final = GMM_HIST[GMM_HIST.length - 1].resp;
  const probe = GMM_X[GMM_PROBE];
  const pr = h.resp[GMM_PROBE];

  return (
    <>
      <Panel style={{ left: 0, top: 0, width: 1000, height: 600, opacity: ease(frame, inAt, 14) }}>
        <svg width={940} height={540} style={{ overflow: 'visible' }}>
          <g transform="translate(70, 40)">
            <Axes w={820} h={360} sx={s.x} sy={s.y} xTicks={[-4, -2, 0, 2, 4].map((v) => ({ v, label: v < 0 ? `−${-v}` : String(v) }))} yTicks={[]} xLabel="x" yLabel="density" grid={false} />
            {[0, 1].map((k) => (
              <polyline
                key={k}
                points={Array.from({ length: 181 }, (_, i) => {
                  const x = -4 + i * 0.05;
                  return `${s.x(x)},${s.y(h.p.weights[k] * pdf(x, h.p.means[k], h.p.vars[k]))}`;
                }).join(' ')}
                fill={rgba(COMP[k], 0.12)}
                stroke={COMP[k]}
                strokeWidth={4}
                opacity={ease(frame, curvesAt, 18)}
              />
            ))}
            <polyline
              points={Array.from({ length: 181 }, (_, i) => {
                const x = -4 + i * 0.05;
                return `${s.x(x)},${s.y(h.p.weights[0] * pdf(x, h.p.means[0], h.p.vars[0]) + h.p.weights[1] * pdf(x, h.p.means[1], h.p.vars[1]))}`;
              }).join(' ')}
              fill="none"
              stroke={C.text}
              strokeWidth={2.5}
              strokeDasharray="10 8"
              opacity={ease(frame, curvesAt + 20, 18)}
            />
            {GMM_X.map((x, i) => {
              const hard = final[i][1] > 0.5 ? 1 : 0;
              const soft = h.resp[i][1];
              const t = hard + (soft - hard) * softP;
              const jitter = ((i * 37) % 11) * 2.4;
              return (
                <circle
                  key={i}
                  cx={s.x(x)}
                  cy={344 - jitter}
                  r={i === GMM_PROBE && frame >= eAt ? 11 : 8}
                  fill={blend(COMP[0], COMP[1], t)}
                  stroke={i === GMM_PROBE && frame >= eAt ? C.text : C.bg}
                  strokeWidth={i === GMM_PROBE && frame >= eAt ? 3 : 1.5}
                  opacity={ease(frame, inAt + 4 + i * 0.4, 10)}
                />
              );
            })}
          </g>
        </svg>
        <div style={{ position: 'absolute', right: 30, top: 22, textAlign: 'right', opacity: ease(frame, mAt + 10, 12) }}>
          <Label size={26} color={C.text}>
            EM iteration {it}
          </Label>
        </div>
        {/* responsibilities of one point */}
        <div style={{ position: 'absolute', left: 30, top: 22, opacity: ease(frame, eAt, 14), background: 'rgba(19, 22, 29, 0.85)', padding: '6px 12px', borderRadius: 10 }}>
          <Label size={24}>responsibilities of x = {probe.toFixed(2)}</Label>
          <div style={{ display: 'flex', width: 380, height: 28, borderRadius: 8, overflow: 'hidden', marginTop: 8 }}>
            {pr.map((r, k) => (
              <div key={k} style={{ width: `${r * 100}%`, background: COMP[k], display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F.mono, fontSize: 20, color: C.bg }}>
                {r > 0.12 ? r.toFixed(2) : ''}
              </div>
            ))}
          </div>
        </div>
      </Panel>

      {/* log-likelihood per iteration */}
      <Panel style={{ left: 1040, top: 0, width: 640, height: 600, opacity: ease(frame, mAt, 14) }}>
        <Label size={24}>log-likelihood</Label>
        <svg width={580} height={470} style={{ overflow: 'visible', marginTop: 10 }}>
          <g transform="translate(90, 30)">
            <Axes
              w={470}
              h={330}
              sx={ls.x}
              sy={ls.y}
              xTicks={[0, 5, 10, 15].map((v) => ({ v, label: String(v) }))}
              yTicks={[-120, -110, -100].map((v) => ({ v, label: `−${-v}` }))}
              xLabel="iteration"
              grid={false}
            />
            <polyline points={lls.slice(0, it + 1).map((v, i) => `${ls.x(i)},${ls.y(v)}`).join(' ')} fill="none" stroke={C.teal} strokeWidth={4} />
            {lls.slice(0, it + 1).map((v, i) => (
              <circle key={i} cx={ls.x(i)} cy={ls.y(v)} r={5} fill={C.teal} />
            ))}
          </g>
        </svg>
        <div style={{ position: 'absolute', right: 30, top: 22, textAlign: 'right' }}>
          <Label size={30} color={C.teal}>
            {lls[it].toFixed(2)}
          </Label>
          <Label size={22} style={{ opacity: ease(frame, llAt, 14) }}>
            never decreases
          </Label>
        </div>
      </Panel>

      <div style={{ position: 'absolute', left: 0, width: 1000, top: 620, display: 'flex', justifyContent: 'center' }}>
        <div style={{ position: 'relative', height: 70, width: 1000, display: 'flex', justifyContent: 'center' }}>
          <div style={{ position: 'absolute', opacity: ease(frame, curvesAt, 14) * (1 - ease(frame, eAt, 12)) }}>
            <Tex size={42}>{'p(x) = Σ_k π_k N(x | μ_k, σ_k²)'}</Tex>
          </div>
          <div style={{ position: 'absolute', opacity: ease(frame, eAt, 14) * (1 - ease(frame, mAt, 12)) }}>
            <Tex size={40}>{'r_{ik} = exp(log π_k N_k(x_i) − logsumexp_j)'}</Tex>
          </div>
          <div style={{ position: 'absolute', opacity: ease(frame, mAt, 14) * (1 - ease(frame, chipAt, 12)) }}>
            <Tex size={40}>{'π_k = N_k / n,  μ_k = Σ_i r_{ik} x_i / N_k'}</Tex>
          </div>
          <div style={{ position: 'absolute' }}>
            <ProblemChip title="Gaussian Mixture Model (EM)" progress={ease(frame, chipAt, 14)} />
          </div>
        </div>
      </div>
    </>
  );
};
