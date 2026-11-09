import React from 'react';
import { useCurrentFrame } from 'remotion';
import type { SceneProps } from '..';
import { C, F, rgba } from '../../theme';
import { ease, lin, windowed } from '../../lib/anim';
import { Layer, Matrix, ProblemChip } from '../../components/ui';
import { Cell } from '../../components/kit';
import { LETTER, Spec } from './Spec';
import { FROB, H2, HAD, MA, MB, MC, OUTER, OV, U, UdotW, UW, Wv } from './data';

const CW = 100;
const CH = 74;
const G = 12;
const VX = (1680 - (4 * CW + 3 * G)) / 2;

export const ProductsScene: React.FC<SceneProps> = ({ cues, durationInFrames }) => {
  const frame = useCurrentFrame();
  const pA = [cues.sentence('Things get powerful'), cues.sentence('Matrix multiplication is')];
  const pB = [pA[1], cues.sentence('Keep every letter')];
  const pC = [pB[1], durationInFrames + 30];
  const mulAt = cues.at('are multiplied');
  const addAt = cues.at('the products are added up');
  const contrAt = cues.at('called a contraction');
  const shakeAt = cues.at('handshake');
  const hadAt = pC[0];
  const frobAt = cues.at('Drop them all');
  const outerAt = cues.at('Two vectors');
  const chipAt = cues.sentence('You will write all');

  // matrix multiply: walk over the 4 output cells while the sentence plays
  const walkStart = cues.at('the shared letter k');
  const walkEnd = pB[1] - 20;
  const cellIdx = Math.min(3, Math.floor(lin(frame, walkStart, walkEnd) * 4));
  const ci = Math.floor(cellIdx / 2);
  const cj = cellIdx % 2;
  const walking = frame >= walkStart;
  const filled = (i: number, j: number) => (walking && i * 2 + j <= cellIdx ? 1 : 0);
  const terms = MA[ci].map((a, k) => `${a}·${MB[k][cj]}`).join(' + ');

  return (
    <>
      <Layer opacity={windowed(frame, pA[0], pA[1])}>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 10, display: 'flex', justifyContent: 'center' }}>
          <Spec spec={frame >= addAt ? 'i,i->' : 'i,i->i'} size={52} vanish={ease(frame, addAt, 16)} />
        </div>
        {[U, Wv].map((vec, r) =>
          vec.map((v, k) => <Cell key={`${r}${k}`} x={VX + k * (CW + G)} y={130 + r * (CH + 16)} w={CW} h={CH} value={v} fontSize={34} bg={rgba(r ? C.teal : C.violet, 0.22)} opacity={ease(frame, pA[0] + k * 2 + r * 6, 12)} />),
        )}
        <div style={{ position: 'absolute', left: VX - 80, top: 150, fontFamily: F.mono, fontSize: 32, color: C.muted }}>u</div>
        <div style={{ position: 'absolute', left: VX - 80, top: 240, fontFamily: F.mono, fontSize: 32, color: C.muted }}>w</div>
        <div style={{ position: 'absolute', left: VX - 80, top: 360, fontFamily: F.mono, fontSize: 32, color: C.muted, opacity: ease(frame, mulAt, 14) }}>×</div>
        {UW.map((v, k) => (
          <Cell key={`p${k}`} x={VX + k * (CW + G)} y={340} w={CW} h={CH} value={v} fontSize={34} bg={rgba(C.amber, 0.3)} border={rgba(C.amber, 0.7)} opacity={ease(frame, mulAt + k * 4, 12) * (1 - 0.6 * ease(frame, addAt + 20, 16))} />
        ))}
        <div style={{ position: 'absolute', left: 0, right: 0, top: 470, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 24, opacity: ease(frame, addAt, 16) }}>
          <span style={{ fontFamily: F.mono, fontSize: 36, color: C.text }}>{UW.join(' + ')} =</span>
          <span style={{ fontFamily: F.mono, fontSize: 48, color: C.amber }}>{UdotW}</span>
        </div>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 560, textAlign: 'center', fontFamily: F.display, fontSize: 48, color: C.text, opacity: ease(frame, contrAt, 16) }}>
          multiply along <span style={{ fontFamily: F.mono, color: LETTER.i }}>i</span>, then sum it away: a <span style={{ color: C.rose }}>contraction</span>
        </div>
      </Layer>

      <Layer opacity={windowed(frame, pB[0], pB[1])}>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 10, display: 'flex', justifyContent: 'center' }}>
          <Spec spec="ik,kj->ij" size={52} vanish={ease(frame, walkStart + 10, 16)} />
        </div>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 140, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 50 }}>
          <Matrix data={MA} digits={0} cellW={86} fontSize={30} rowLabels={['i=0', 'i=1']} colLabels={['k=0', 'k=1', 'k=2']} axisLabelSize={22}
            color={(_, i) => (walking && i === ci ? rgba(C.violet, 0.5) : undefined)}
            textColor={() => (frame >= shakeAt ? C.amber : undefined)} />
          <span style={{ fontFamily: F.mono, fontSize: 40, color: C.muted }}>·</span>
          <Matrix data={MB} digits={0} cellW={86} fontSize={30} rowLabels={['k=0', 'k=1', 'k=2']} colLabels={['j=0', 'j=1']} axisLabelSize={22}
            color={(_, __, j) => (walking && j === cj ? rgba(C.teal, 0.45) : undefined)}
            textColor={() => (frame >= shakeAt ? C.amber : undefined)} />
          <span style={{ fontFamily: F.mono, fontSize: 40, color: C.muted }}>=</span>
          <Matrix data={MC} digits={0} cellW={86} fontSize={30} colLabels={['j=0', 'j=1']} axisLabelSize={22} reveal={filled}
            color={(_, i, j) => (walking && i === ci && j === cj ? rgba(C.amber, 0.5) : rgba(C.amber, 0.2))} />
        </div>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 470, textAlign: 'center', fontFamily: F.mono, fontSize: 36, color: C.text, opacity: walking ? 1 : 0 }}>
          C[{ci},{cj}] = Σ<sub style={{ color: LETTER.k }}>k</sub> {terms} = <span style={{ color: C.amber }}>{MC[ci][cj]}</span>
        </div>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 560, textAlign: 'center', fontFamily: F.body, fontSize: 30, color: C.amber, opacity: ease(frame, shakeAt, 16) }}>
          k is the handshake: shared by both inputs, gone from the output
        </div>
      </Layer>

      <Layer opacity={windowed(frame, pC[0], pC[1])}>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', justifyContent: 'center', gap: 70, paddingTop: 30 }}>
          {[
            { spec: 'ij,ij->ij', at: hadAt, body: <Matrix data={HAD} digits={0} cellW={80} fontSize={30} color={() => rgba(C.violet, 0.4)} />, note: 'element-wise product' },
            { spec: 'ij,ij->', at: frobAt, body: <Cell x={0} y={0} w={120} h={80} value={FROB} fontSize={40} bg={rgba(C.amber, 0.35)} border={C.amber} />, note: 'sum of all products', box: { w: 120, h: 80 } },
            { spec: 'i,j->ij', at: outerAt, body: <Matrix data={OUTER} digits={0} cellW={72} fontSize={28} rowLabels={OV.map(String)} colLabels={OV.map(String)} axisLabelSize={22} color={() => rgba(C.teal, 0.35)} />, note: 'outer product' },
          ].map(({ spec, at, body, note, box }) => (
            <div key={spec} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 30, opacity: ease(frame, at, 16), transform: `translateY(${(1 - ease(frame, at, 16)) * 16}px)` }}>
              <Spec spec={spec} size={40} vanish={1} />
              <div style={{ position: 'relative', minHeight: 230, display: 'flex', alignItems: 'center' }}>{box ? <div style={{ position: 'relative', width: box.w, height: box.h }}>{body}</div> : body}</div>
              <span style={{ fontFamily: F.body, fontSize: 28, color: C.muted }}>{note}</span>
            </div>
          ))}
        </div>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 440, textAlign: 'center', fontFamily: F.mono, fontSize: 26, color: C.dim, opacity: ease(frame, hadAt, 16) }}>
          A = [{H2.map((r) => `[${r.join(', ')}]`).join(', ')}]   v = [{OV.join(', ')}]
        </div>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 560, display: 'flex', justifyContent: 'center' }}>
          <ProblemChip title="Matrix Operations with Einsum" progress={ease(frame, chipAt, 20)} />
        </div>
      </Layer>
    </>
  );
};
