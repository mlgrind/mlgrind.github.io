import React from 'react';
import { useCurrentFrame } from 'remotion';
import type { SceneProps } from '..';
import { C, F, HEAD, rgba } from '../../theme';
import { ease, windowed } from '../../lib/anim';
import { Layer, ProblemChip, Tex } from '../../components/ui';
import { Bars, Panel, Readout } from '../../components/plot';
import { AUX, AUX_COLLAPSED, AUX_UNIFORM, E, GATES, MOE_TOKENS, ROUTER_P, TOPK, TOP_IDX } from './data';

const CW = 145;
const CH = 70;

export const MoEScene: React.FC<SceneProps> = ({ cues, durationInFrames }) => {
  const frame = useCurrentFrame();

  const expertsAt = cues.at('many smaller experts');
  const routerAt = cues.at('router scores every');
  const topAt = cues.at('keeps the top k');
  const gateAt = cues.at('renormalizes those');
  const runAt = cues.at('runs through only');
  const collapseAt = cues.at('collapse onto');
  const lossAt = cues.sentence('The load-balancing loss');
  const evenAt = cues.at('perfectly even');
  const chip = ease(frame, cues.sentence("That's Mixture"), 20);

  const top = ease(frame, topAt, 16);
  const gates = ease(frame, gateAt, 16);

  return (
    <Layer opacity={windowed(frame, 0, durationInFrames + 30)}>
      {/* router table */}
      <div style={{ position: 'absolute', left: 0, top: 0, opacity: ease(frame, expertsAt, 18) }}>
        <div style={{ display: 'flex', marginLeft: 110, gap: 8, marginBottom: 10 }}>
          {Array.from({ length: E }, (_, e) => (
            <div key={e} style={{ width: CW, textAlign: 'center', fontFamily: F.mono, fontSize: 24, color: HEAD[e] }}>
              expert {e + 1}
            </div>
          ))}
        </div>
        {MOE_TOKENS.map((t, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <div style={{ width: 102, fontFamily: F.mono, fontSize: 26, color: C.muted, textAlign: 'right', paddingRight: 8 }}>{t}</div>
            {ROUTER_P[i].map((p, e) => {
              const slot = TOP_IDX[i].indexOf(e);
              const chosen = slot >= 0;
              const r = ease(frame, routerAt + i * 3, 14);
              return (
                <div
                  key={e}
                  style={{
                    width: CW,
                    height: CH,
                    borderRadius: 10,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: F.mono,
                    fontSize: 24,
                    color: chosen && gates > 0.5 ? '#fff' : C.text,
                    background: rgba(HEAD[e], 0.06 + 0.5 * p * r),
                    border: `2px solid ${chosen ? rgba(HEAD[e], top) : 'transparent'}`,
                    opacity: (chosen ? 1 : 1 - 0.6 * top) * r,
                  }}
                >
                  {chosen && gates > 0.5 ? `g ${GATES[i][slot].toFixed(2)}` : p.toFixed(2)}
                </div>
              );
            })}
          </div>
        ))}
        <div style={{ marginLeft: 110, marginTop: 10, fontFamily: F.body, fontSize: 24, color: C.muted, width: 560 }}>
          {gates > 0.5 ? `gates = softmax over the top ${TOPK} logits` : top > 0.5 ? `top ${TOPK} experts per token` : 'router probabilities'}
        </div>
      </div>

      <div style={{ position: 'absolute', left: 0, top: 560, opacity: windowed(frame, runAt, collapseAt + 10) }}>
        <Tex size={44}>{'y = Σ_j g_j · expert_{i_j}(x)'}</Tex>
        <div style={{ fontFamily: F.body, fontSize: 24, color: C.muted, marginTop: 8 }}>
          each token pays for {TOPK} experts, not {E}
        </div>
      </div>

      {/* load balancing */}
      <Panel title="share of routing slots f_e" style={{ position: 'absolute', left: 770, top: 0, width: 520, opacity: ease(frame, collapseAt - 20, 18) }}>
        <Bars values={AUX.f} labels={['E1', 'E2', 'E3', 'E4']} width={450} height={210} max={0.6} labelSize={22} valueSize={22} color={(_, e) => HEAD[e]} />
      </Panel>
      <Panel title="collapsed router" accent={C.rose} style={{ position: 'absolute', left: 770, top: 365, width: 520, opacity: ease(frame, collapseAt, 18) }}>
        <Bars values={AUX_COLLAPSED.f} labels={['E1', 'E2', 'E3', 'E4']} width={450} height={150} max={0.6} labelSize={22} valueSize={22} color={() => C.rose} />
      </Panel>

      <div style={{ position: 'absolute', left: 1320, top: 0, width: 360, display: 'flex', flexDirection: 'column', gap: 22, opacity: ease(frame, lossAt, 18) }}>
        <Tex size={40}>{'aux = E · Σ_e f_e P_e'}</Tex>
        <Readout size={30} color={C.violetLight}>this router {AUX.loss.toFixed(2)}</Readout>
        <Readout size={30} color={C.rose}>collapsed {AUX_COLLAPSED.loss.toFixed(2)}</Readout>
        <Readout size={30} color={C.teal} style={{ opacity: ease(frame, evenAt, 16) }}>
          uniform {AUX_UNIFORM.toFixed(2)}
        </Readout>
        <div style={{ fontFamily: F.body, fontSize: 24, color: C.muted }}>P_e = mean router prob of expert e</div>
      </div>

      <div style={{ position: 'absolute', left: 0, top: 630 }}>
        <ProblemChip title="Mixture-of-Experts Routing" progress={chip} />
      </div>
    </Layer>
  );
};
