import React from 'react';
import { useCurrentFrame } from 'remotion';
import type { SceneProps } from '..';
import { C, F, rgba } from '../../theme';
import { ease, mix, windowed } from '../../lib/anim';
import { Layer, ProblemChip, Tex } from '../../components/ui';
import { Bars, Panel, Readout } from '../../components/plot';
import {
  GENERATED,
  LOGITS,
  LOGITS_PEN,
  NUC_CONF,
  NUC_FLAT,
  NUC_P1,
  P1,
  PENALTY,
  P_CONFIDENT,
  P_FLAT,
  P_PEN,
  P_TOPK,
  TOP_K,
  TOP_P,
  VOCAB,
  topK,
} from './data';

const sum = (v: number[]) => v.reduce((a, b) => a + b, 0);

export const FilteringScene: React.FC<SceneProps> = ({ cues, durationInFrames }) => {
  const frame = useCurrentFrame();

  const kA = [0, cues.sentence('The weakness is')];
  const kB = [kA[1], cues.sentence('Nucleus, or top-p')];
  const pA = [kB[1], cues.sentence('A confident prediction')];
  const pB = [pA[1], cues.sentence('Models also love')];
  const rA = [pB[1], durationInFrames];

  // top-k
  const keepAt = cues.at('keeps only the k');
  const zeroAt = cues.at('sets every other');
  const renormAt = cues.at('renormalizes');
  const cut = ease(frame, zeroAt, 18);
  const ren = ease(frame, renormAt, 24);
  const topkVals = P1.map((p, i) => mix(i < TOP_K ? p : mix(p, 0, cut), P_TOPK[i], ren));
  const confAt = cues.at('When the model is confident');
  const unsureAt = cues.at('when it is unsure');

  // top-p
  const sortAt = cues.at('Sort the probabilities');
  const cumAt = cues.at('running sum');
  const lineAt = cues.at('keep the smallest set');
  const crossAt = cues.at('crosses the line');

  // repetition penalty
  const penAt = cues.at('A positive logit');
  const negAt = cues.at('a negative logit');
  const lessAt = cues.at('becomes less likely');
  const posP = ease(frame, penAt, 22);
  const negP = ease(frame, negAt, 22);
  const penLogits = LOGITS.map((l, i) => (i === GENERATED[0] ? mix(l, LOGITS_PEN[i], posP) : i === GENERATED[1] ? mix(l, LOGITS_PEN[i], negP) : l));
  const chip = ease(frame, cues.sentence('The Repetition Penalty'), 20);

  const mini = (title: string, p: number[], k: number, at: number, color: string) => {
    const kept = topK(p, k);
    return (
      <Panel title={title} style={{ width: 760, opacity: ease(frame, at, 18) }}>
        <Bars values={p} labels={VOCAB} width={690} height={250} max={1} labelSize={22} valueSize={20} alpha={(i) => (kept[i] > 0 ? 1 : 0.25)} color={() => color} />
      </Panel>
    );
  };

  return (
    <>
      <Layer opacity={windowed(frame, kA[0], kA[1] + 6)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 60, alignItems: 'center', height: 90 }}>
          <Tex size={60}>{`top-k, k = ${TOP_K}`}</Tex>
          <Readout color={ren > 0.5 ? C.teal : C.muted} style={{ opacity: ease(frame, keepAt, 16) }}>
            Σ kept = {sum(topkVals.filter((_, i) => i < TOP_K || cut < 1)).toFixed(2)}
          </Readout>
        </div>
        <div style={{ marginTop: 50 }}>
          <Bars
            values={topkVals}
            labels={VOCAB}
            width={1200}
            height={400}
            max={0.6}
            alpha={(i) => (i < TOP_K ? 1 : 1 - 0.6 * ease(frame, keepAt, 16))}
            color={(_, i) => (i < TOP_K && ease(frame, keepAt, 16) > 0.5 ? C.violetLight : C.violet)}
          />
        </div>
      </Layer>

      <Layer opacity={windowed(frame, kB[0], kB[1] + 6)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 40 }}>
        {mini('confident: k = 3 still keeps junk', P_CONFIDENT, TOP_K, Math.min(confAt, kB[0] + 10), C.violet)}
        {mini('unsure: k = 3 cuts good options', P_FLAT, TOP_K, unsureAt, C.amber)}
      </Layer>

      <Layer opacity={windowed(frame, pA[0], pA[1] + 6)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 60, alignItems: 'center', height: 90 }}>
          <Tex size={60}>{`top-p, p = ${TOP_P}`}</Tex>
          <Readout color={C.teal} style={{ opacity: ease(frame, crossAt, 16) }}>
            kept = {NUC_P1.kept} tokens
          </Readout>
        </div>
        <div style={{ position: 'relative', marginTop: 50, opacity: ease(frame, sortAt, 16) }}>
          <Bars
            values={NUC_P1.sorted}
            labels={NUC_P1.order.map((i) => VOCAB[i])}
            showValues={frame < cumAt}
            width={1200}
            height={400}
            max={1}
            alpha={(i) => (i < NUC_P1.kept ? 1 : 1 - 0.65 * ease(frame, crossAt, 16))}
            color={(_, i) => (i < NUC_P1.kept && ease(frame, crossAt, 16) > 0.5 ? C.teal : C.violet)}
          />
          {/* cumulative sum and threshold */}
          <svg width={1200} height={400} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}>
            {(() => {
              const n = NUC_P1.cum.length;
              const bw = (1200 - 14 * (n - 1)) / n;
              const top = 34;
              const y = (v: number) => top + (400 - top) * (1 - v);
              const pts = NUC_P1.cum.map((c, i) => `${i * (bw + 14) + bw / 2},${y(c)}`);
              const shown = ease(frame, cumAt, 30);
              const visible = Math.max(1, Math.round(shown * n));
              return (
                <>
                  <polyline points={pts.slice(0, visible).join(' ')} fill="none" stroke={C.amber} strokeWidth={4} opacity={shown} />
                  {NUC_P1.cum.slice(0, visible).map((c, i) => (
                    <g key={i}>
                      <circle cx={i * (bw + 14) + bw / 2} cy={y(c)} r={8} fill={C.amber} opacity={shown} />
                      <text x={i * (bw + 14) + bw / 2} y={y(c) - 18} fill={C.amber} fontFamily={F.mono} fontSize={22} textAnchor="middle" opacity={shown}>
                        {c.toFixed(2)}
                      </text>
                    </g>
                  ))}
                  <line x1={-10} x2={1210} y1={y(TOP_P)} y2={y(TOP_P)} stroke={C.rose} strokeWidth={3} strokeDasharray="10 8" opacity={ease(frame, lineAt, 16)} />
                  <text x={1220} y={y(TOP_P) + 9} fill={C.rose} fontFamily={F.mono} fontSize={26} opacity={ease(frame, lineAt, 16)}>
                    p
                  </text>
                  <text x={0} y={y(1) - 48} fill={C.amber} fontFamily={F.mono} fontSize={24} opacity={shown}>
                    running sum
                  </text>
                </>
              );
            })()}
          </svg>
        </div>
      </Layer>

      <Layer opacity={windowed(frame, pB[0], pB[1] + 6)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 40 }}>
        {[
          { t: `confident: keeps ${NUC_CONF.kept}`, p: P_CONFIDENT, nuc: NUC_CONF, at: pB[0] },
          { t: `flat: keeps ${NUC_FLAT.kept}`, p: P_FLAT, nuc: NUC_FLAT, at: cues.at('a flat one') },
        ].map(({ t, p, nuc, at }) => (
          <Panel key={t} title={t} accent={C.teal} style={{ width: 760, opacity: ease(frame, at, 18) }}>
            <Bars values={p} labels={VOCAB} width={690} height={250} max={1} labelSize={22} valueSize={20} alpha={(i) => (nuc.probs[i] > 0 ? 1 : 0.25)} color={() => C.teal} />
          </Panel>
        ))}
      </Layer>

      <Layer opacity={windowed(frame, rA[0], rA[1] + 30)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 40, alignItems: 'center', height: 90 }}>
          <Tex size={50}>{`z > 0:  z / ${PENALTY}`}</Tex>
          <span style={{ width: 2, height: 50, background: C.line2 }} />
          <Tex size={50}>{`z ≤ 0:  z × ${PENALTY}`}</Tex>
          <span style={{ fontFamily: F.body, fontSize: 26, color: C.muted, marginLeft: 20 }}>for tokens already generated</span>
        </div>
        <div style={{ display: 'flex', gap: 80, marginTop: 34, alignItems: 'flex-start' }}>
          <Panel title="logits" style={{ width: 900 }}>
            <Bars
              values={penLogits}
              labels={VOCAB}
              width={830}
              height={280}
              max={2}
              zeroAt={0.5}
              labelSize={22}
              valueSize={20}
              color={(_, i) => (GENERATED.includes(i) ? C.rose : rgba(C.violet, 0.8))}
              labelColor={(i) => (GENERATED.includes(i) ? C.rose : C.muted)}
            />
          </Panel>
          <Panel title={`p(${VOCAB[GENERATED[0]]})`} style={{ width: 420, opacity: ease(frame, lessAt, 18) }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 26, marginTop: 20 }}>
              <Readout size={36} color={C.muted}>before {P1[GENERATED[0]].toFixed(3)}</Readout>
              <Readout size={36} color={C.rose}>after&nbsp; {P_PEN[GENERATED[0]].toFixed(3)}</Readout>
              <div style={{ fontFamily: F.body, fontSize: 24, color: C.muted }}>
                p({VOCAB[GENERATED[1]]}): {P1[GENERATED[1]].toFixed(3)} → {P_PEN[GENERATED[1]].toFixed(3)}
              </div>
            </div>
          </Panel>
        </div>
        <div style={{ marginTop: 20, height: 70 }}>
          <ProblemChip title="Repetition Penalty" progress={chip} />
        </div>
      </Layer>
    </>
  );
};
