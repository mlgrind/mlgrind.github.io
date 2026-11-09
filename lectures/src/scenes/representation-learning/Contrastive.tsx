import React from 'react';
import { useCurrentFrame } from 'remotion';
import type { SceneProps } from '..';
import { C, F, rgba } from '../../theme';
import { ease, windowed } from '../../lib/anim';
import { Layer, ProblemChip, Tex } from '../../components/ui';
import { Bars, Panel, Readout } from '../../components/plot';
import { fmt } from '../../lib/math';
import { CLIP_IMG, CLIP_TXT, COS, LOGITS, LOSS, LOSS_I2T, LOSS_T2I, N, P_I2T, P_T2I, ROW0_TAU, ROW0_TAU1, TAU } from './data';

const CW = 124;
const CH = 70;
const LW = 190;

export const ContrastiveScene: React.FC<SceneProps> = ({ cues, durationInFrames }) => {
  const frame = useCurrentFrame();

  const pairsAt = cues.at('learns from pairs');
  const gridAt = cues.at('compare every image');
  const tauAt = cues.at('divided by a temperature');
  const diagAt = cues.at('sit on the diagonal');
  const rowAt = cues.at('softmax across its row');
  const colAt = cues.at('down the columns');
  const avgAt = cues.at('average the two');
  const negAt = cues.at('free negative');
  const tempAt = cues.sentence('A small temperature');
  const chip = ease(frame, cues.sentence("That's the CLIP"), 20);

  const mode = frame < tauAt ? 'cos' : frame < rowAt ? 'logit' : frame < colAt ? 'row' : 'col';
  const val = (i: number, j: number) => (mode === 'cos' ? COS[i][j] : mode === 'logit' ? LOGITS[i][j] : mode === 'row' ? P_I2T[i][j] : P_T2I[i][j]);
  const heat = (i: number, j: number) =>
    mode === 'cos' ? Math.max(0, COS[i][j]) * 0.6 : mode === 'logit' ? Math.max(0, LOGITS[i][j] / 12) * 0.6 : val(i, j) * 0.8;
  const diag = ease(frame, diagAt, 16);
  const neg = windowed(frame, negAt, tempAt + 10);
  const caption =
    mode === 'cos' ? 'cosine similarity' : mode === 'logit' ? `cosine / τ   (τ = ${TAU})` : mode === 'row' ? 'softmax over each row: image → caption' : 'softmax over each column: caption → image';

  return (
    <Layer opacity={windowed(frame, cues.sentence('Contrastive learning') - 6, durationInFrames + 30)}>
      <div style={{ position: 'absolute', left: 0, top: 0, opacity: ease(frame, pairsAt, 16) }}>
        <div style={{ display: 'flex', marginLeft: LW, gap: 6, marginBottom: 10 }}>
          {CLIP_TXT.map((t, j) => (
            <div key={j} style={{ width: CW, textAlign: 'center', fontFamily: F.mono, fontSize: 22, color: C.teal, whiteSpace: 'nowrap' }}>
              {t}
            </div>
          ))}
        </div>
        {CLIP_IMG.map((im, i) => (
          <div key={i} style={{ display: 'flex', gap: 6, marginBottom: 6, alignItems: 'center' }}>
            <div style={{ width: LW - 16, marginRight: 10, textAlign: 'right', fontFamily: F.mono, fontSize: 22, color: C.violetLight, whiteSpace: 'nowrap' }}>img: {im}</div>
            {Array.from({ length: N }, (_, j) => {
              const r = ease(frame, gridAt + (i * N + j) * 1.5, 10);
              const isDiag = i === j;
              const hiCol = mode === 'col' ? C.teal : C.violet;
              return (
                <div
                  key={j}
                  style={{
                    width: CW,
                    height: CH,
                    borderRadius: 10,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: F.mono,
                    fontSize: 24,
                    color: C.text,
                    background: rgba(hiCol, 0.05 + heat(i, j) * r),
                    border: `2px solid ${isDiag && diag > 0 ? rgba(C.amber, diag) : !isDiag && neg > 0 ? rgba(C.rose, 0.6 * neg) : 'transparent'}`,
                    opacity: r,
                  }}
                >
                  {fmt(val(i, j), 2)}
                </div>
              );
            })}
          </div>
        ))}
        <div style={{ marginLeft: LW, marginTop: 12, fontFamily: F.body, fontSize: 26, color: mode === 'col' ? C.teal : C.muted, opacity: ease(frame, gridAt, 16) }}>{caption}</div>
        <div style={{ marginLeft: LW, marginTop: 6, fontFamily: F.body, fontSize: 24, color: C.amber, opacity: diag }}>
          diagonal = matching pairs (the labels)
          <span style={{ color: C.rose, opacity: neg }}>  ·  everything else = negatives</span>
        </div>
      </div>

      <div style={{ position: 'absolute', left: 880, top: 0, width: 800, display: 'flex', flexDirection: 'column', gap: 24 }}>
        <Panel style={{ opacity: ease(frame, rowAt, 18) }}>
          <Tex size={36}>{'loss_{i→t} = mean_i −log softmax(row_i)_i'}</Tex>
          <Readout size={32} color={C.violetLight} style={{ marginTop: 12 }}>
            image → text  {LOSS_I2T.toFixed(3)}
          </Readout>
          <Readout size={32} color={C.teal} style={{ marginTop: 8, opacity: ease(frame, colAt, 16) }}>
            text → image  {LOSS_T2I.toFixed(3)}
          </Readout>
          <Readout size={36} color={C.amber} style={{ marginTop: 12, opacity: ease(frame, avgAt, 16) }}>
            loss = average = {LOSS.toFixed(3)}
          </Readout>
        </Panel>
        <Panel title="row “img: dog”: softmax at two temperatures" style={{ opacity: ease(frame, tempAt, 18) }}>
          <div style={{ display: 'flex', gap: 40 }}>
            {[
              { t: 'τ = 1', v: ROW0_TAU1, c: C.dim },
              { t: `τ = ${TAU}`, v: ROW0_TAU, c: C.violetLight },
            ].map(({ t, v, c }) => (
              <div key={t}>
                <Bars values={v} width={320} height={150} max={1} valueSize={18} gap={8} color={(_, k) => (k === 0 ? C.amber : c)} />
                <div style={{ marginTop: 8, fontFamily: F.mono, fontSize: 24, color: C.muted, textAlign: 'center' }}>{t}</div>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <div style={{ position: 'absolute', left: 0, top: 640 }}>
        <ProblemChip title="CLIP Contrastive Loss (InfoNCE)" progress={chip} />
      </div>
    </Layer>
  );
};
