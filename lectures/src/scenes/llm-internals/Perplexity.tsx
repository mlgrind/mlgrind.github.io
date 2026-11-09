import React from 'react';
import { useCurrentFrame } from 'remotion';
import type { SceneProps } from '..';
import { C, F, rgba } from '../../theme';
import { ease, windowed } from '../../lib/anim';
import { Layer, ProblemChip, Tex } from '../../components/ui';
import { Bars, Panel, Readout } from '../../components/plot';
import { MEAN_NLL, NLL_UNMASKED, PERPLEXITY, PPL_MASK, PPL_P_TRUE, PPL_TOKENS, PPL_UNIFORM, TOKEN_NLL, V } from './data';

const W = 1080;
const N = PPL_TOKENS.length;
const GAP = 14;
const BW = (W - GAP * (N - 1)) / N;

export const PerplexityScene: React.FC<SceneProps> = ({ cues, durationInFrames }) => {
  const frame = useCurrentFrame();

  const pAt = cues.at('read off the log probability');
  const nllAt = cues.sentence('Its negative');
  const maskAt = cues.at('skipping padding');
  const ceAt = cues.at('cross-entropy');
  const expAt = cues.at('Exponentiate');
  const uniAt = cues.at('guessing uniformly');
  const perfAt = cues.at('perfect model');
  const tokAt = cues.at('share a tokenizer');
  const chip = ease(frame, cues.sentence("That's Token"), 20);

  const mask = ease(frame, maskAt, 18);
  const nll = ease(frame, nllAt, 20);
  const meanY = ease(frame, ceAt, 18);

  return (
    <Layer opacity={windowed(frame, 0, durationInFrames + 30)}>
      <div style={{ position: 'absolute', left: 0, top: 0, width: W }}>
        {/* tokens + p(true) */}
        <div style={{ display: 'flex', gap: GAP }}>
          {PPL_TOKENS.map((t, i) => {
            const pad = PPL_MASK[i] === 0;
            return (
              <div key={i} style={{ width: BW, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, opacity: pad ? 1 - 0.65 * mask : 1 }}>
                <div style={{ width: BW, padding: '10px 0', borderRadius: 12, textAlign: 'center', fontFamily: F.mono, fontSize: pad ? 22 : 28, color: pad ? C.dim : C.text, background: rgba(C.text, 0.05), border: `1px solid ${pad && mask > 0.5 ? C.rose : C.line2}`, textDecoration: pad && mask > 0.5 ? 'line-through' : 'none' }}>
                  {t}
                </div>
                <div style={{ fontFamily: F.mono, fontSize: 22, color: C.violetLight, opacity: ease(frame, pAt + i * 3, 12) }}>p {PPL_P_TRUE[i].toFixed(2)}</div>
              </div>
            );
          })}
        </div>
        <div style={{ marginTop: 8, fontFamily: F.body, fontSize: 22, color: C.muted, opacity: ease(frame, pAt, 16) }}>p = model's probability of the true next token</div>

        <div style={{ position: 'relative', marginTop: 40, opacity: nll }}>
          <Bars
            values={TOKEN_NLL.map((v, i) => (PPL_MASK[i] ? v : mask > 0.5 ? 0 : -Math.log(PPL_P_TRUE[i])))}
            width={W}
            height={300}
            max={2}
            gap={GAP}
            reveal={() => nll}
            color={(_, i) => (PPL_MASK[i] ? C.violet : C.rose)}
          />
          {/* mean NLL line */}
          <div style={{ position: 'absolute', left: -10, right: -10, top: 34 + (300 - 34) * (1 - MEAN_NLL / 2), height: 3, background: C.amber, opacity: meanY }} />
          <div style={{ position: 'absolute', right: -10, top: 314, fontFamily: F.mono, fontSize: 26, color: C.amber, opacity: meanY }}>
            — mean NLL {MEAN_NLL.toFixed(3)}
          </div>
        </div>
        <div style={{ marginTop: 10, fontFamily: F.body, fontSize: 22, color: C.muted, opacity: nll }}>token loss = −log p</div>
      </div>

      <div style={{ position: 'absolute', left: 1140, top: 0, width: 540, display: 'flex', flexDirection: 'column', gap: 22 }}>
        <Panel style={{ opacity: ease(frame, ceAt, 18) }}>
          <Tex size={38}>{'mean NLL = Σ nll · mask / Σ mask'}</Tex>
          <div style={{ marginTop: 14, fontFamily: F.body, fontSize: 22, color: C.rose, opacity: mask }}>
            counting padding would give {NLL_UNMASKED.toFixed(3)}: wrong
          </div>
        </Panel>
        <Panel style={{ opacity: ease(frame, expAt, 18) }}>
          <Tex size={38}>{'perplexity = e^{mean NLL}'}</Tex>
          <Readout size={52} color={C.amber} style={{ marginTop: 14 }}>
            {PERPLEXITY.toFixed(2)}
          </Readout>
          <div style={{ fontFamily: F.body, fontSize: 22, color: C.muted }}>≈ choosing among {PERPLEXITY.toFixed(1)} tokens</div>
        </Panel>
        <Panel style={{ opacity: ease(frame, uniAt, 18) }}>
          <Readout size={28} color={C.text}>
            uniform over V = {V} → {PPL_UNIFORM.toFixed(0)}
          </Readout>
          <Readout size={28} color={C.teal} style={{ marginTop: 10, opacity: ease(frame, perfAt, 16) }}>
            perfect: e^0 = 1
          </Readout>
          <div style={{ marginTop: 10, fontFamily: F.body, fontSize: 22, color: C.muted, opacity: ease(frame, tokAt, 16) }}>compare only with the same tokenizer</div>
        </Panel>
      </div>

      <div style={{ position: 'absolute', left: 0, top: 630 }}>
        <ProblemChip title="Token Cross-Entropy and Perplexity" progress={chip} />
      </div>
    </Layer>
  );
};
