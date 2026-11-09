import React from 'react';
import { useCurrentFrame } from 'remotion';
import type { SceneProps } from '..';
import { C, F, rgba } from '../../theme';
import { ease, windowed } from '../../lib/anim';
import { Layer, Matrix, ProblemChip, Tex, signedColor } from '../../components/ui';
import { D_LIN, D_SQ, GRAD_B, GRAD_W, LG, LIN, LX, SQ, X0, XGRAD, Y0 } from './data';

const Node: React.FC<{ x: number; y: number; label: string; value?: string; o: number; vo: number; hue?: string; w?: number }> = ({ x, y, label, value, o, vo, hue = C.violetLight, w = 170 }) => (
  <div style={{ position: 'absolute', left: x - w / 2, top: y - 50, width: w, height: 100, borderRadius: 18, border: `2px solid ${rgba(hue, 0.7)}`, background: rgba(hue, 0.1), display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: o }}>
    <span style={{ fontFamily: F.mono, fontSize: 30, color: C.text }}>{label}</span>
    {value !== undefined && <span style={{ fontFamily: F.mono, fontSize: 28, color: hue, opacity: vo }}>{value}</span>}
  </div>
);

export const AutogradScene: React.FC<SceneProps> = ({ cues, durationInFrames }) => {
  const frame = useCurrentFrame();
  const pA = [cues.sentence('Now the real magic'), cues.sentence('The same chain rule')];
  const pB = [pA[1], durationInFrames + 30];
  const eqAt = cues.at('Take y equals');
  const fwdAt = cues.at('compute the forward pass');
  const bwdAt = cues.at('walks the breadcrumbs');
  const sqAt = cues.at('The square contributes');
  const linAt = cues.at('the linear term contributes');
  const gradAt = cues.at('comes out as seven');
  const gyAt = cues.at('Given the gradient');
  const gwAt = cues.at('the gradient for W');
  const gbAt = cues.at('the gradient for b');
  const chipAt = cues.sentence('In Autograd Concepts');

  const nodes = { x: [180, 320], sq: [620, 160], lin: [620, 480], add: [980, 320], y: [1340, 320] };
  const fo = (k: number) => ease(frame, fwdAt + k * 12, 14);
  const bo = ease(frame, bwdAt, 16);
  const edge = (a: number[], b: number[], k: number, grad?: string, gradO = 0, gHue = C.amber) => (
    <g key={`${a}-${b}`}>
      <line x1={a[0] + 85} y1={a[1]} x2={b[0] - 85} y2={b[1]} stroke={C.line2} strokeWidth={3} opacity={fo(k)} />
      {grad && (
        <text x={(a[0] + b[0]) / 2} y={(a[1] + b[1]) / 2 - 16} fill={gHue} fontFamily={F.mono} fontSize={30} textAnchor="middle" opacity={gradO}>
          {grad}
        </text>
      )}
    </g>
  );

  return (
    <>
      <Layer opacity={windowed(frame, pA[0], pA[1])}>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 0, textAlign: 'center', opacity: ease(frame, eqAt, 14) }}>
          <Tex size={56}>y = x^2 + 3x + 1,   x = 2</Tex>
        </div>
        <div style={{ position: 'absolute', left: 0, top: 120, width: 1680, height: 560 }}>
          <svg width={1680} height={600} style={{ position: 'absolute', inset: 0 }}>
            {edge(nodes.x, nodes.sq, 0, `${D_SQ} = 2x`, ease(frame, sqAt, 14))}
            {edge(nodes.x, nodes.lin, 0, `${D_LIN}`, ease(frame, linAt, 14))}
            {edge(nodes.sq, nodes.add, 1, '1', bo)}
            {edge(nodes.lin, nodes.add, 1, '1', bo)}
            {edge(nodes.add, nodes.y, 2, '1', bo)}
          </svg>
          <Node x={nodes.x[0]} y={nodes.x[1]} label="x" value={`${X0}`} o={1} vo={1} />
          <Node x={nodes.sq[0]} y={nodes.sq[1]} label="x²" value={`${SQ}`} o={fo(0)} vo={fo(0)} />
          <Node x={nodes.lin[0]} y={nodes.lin[1]} label="3x" value={`${LIN}`} o={fo(0)} vo={fo(0)} />
          <Node x={nodes.add[0]} y={nodes.add[1]} label="+ 1" value={`${SQ + LIN + 1}`} o={fo(1)} vo={fo(1)} />
          <Node x={nodes.y[0]} y={nodes.y[1]} label="y" value={`${Y0}`} o={fo(2)} vo={fo(2)} hue={C.teal} />
          <div style={{ position: 'absolute', left: nodes.x[0] - 160, top: nodes.x[1] + 80, width: 320, textAlign: 'center', opacity: ease(frame, gradAt, 14) }}>
            <span style={{ fontFamily: F.mono, fontSize: 36, color: C.amber, padding: '8px 16px', borderRadius: 12, background: rgba(C.amber, 0.14), border: `1px solid ${rgba(C.amber, 0.6)}` }}>
              x.grad = {D_SQ} + {D_LIN} = {XGRAD}
            </span>
          </div>
          <div style={{ position: 'absolute', left: 900, top: 470, fontFamily: F.body, fontSize: 28, color: C.amber, opacity: bo }}>← backward: chain rule, in reverse</div>
          <div style={{ position: 'absolute', left: 900, top: 40, fontFamily: F.body, fontSize: 28, color: C.muted, opacity: fo(0) }}>forward: record each op →</div>
        </div>
      </Layer>

      <Layer opacity={windowed(frame, pB[0], pB[1])}>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 0, textAlign: 'center' }}>
          <Tex size={52}>Y = XW + b</Tex>
        </div>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 110, display: 'flex', justifyContent: 'center', alignItems: 'flex-start', gap: 50 }}>
          <div style={{ opacity: ease(frame, pB[0], 14) }}>
            <Matrix data={LX} digits={0} cellW={70} cellH={54} fontSize={26} label="X" labelSize={40} color={signedColor(3, 0.4)} />
          </div>
          <div style={{ opacity: ease(frame, gyAt, 14) }}>
            <Matrix data={LG} digits={0} cellW={70} cellH={54} fontSize={26} label="∂L/∂Y" labelSize={40} color={signedColor(3, 0.4)} />
          </div>
          <div style={{ opacity: ease(frame, gwAt, 14), display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            <Matrix data={GRAD_W} digits={0} cellW={74} cellH={54} fontSize={26} label="∂L/∂W = X^T ∂L/∂Y" labelSize={36} color={() => rgba(C.amber, 0.3)} />
          </div>
          <div style={{ opacity: ease(frame, gbAt, 14) }}>
            <Matrix data={[GRAD_B]} digits={0} cellW={74} cellH={54} fontSize={26} label="∂L/∂b = Σ_{rows}" labelSize={36} color={() => rgba(C.teal, 0.3)} />
          </div>
        </div>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 470, textAlign: 'center', fontFamily: F.mono, fontSize: 28, color: C.muted, opacity: ease(frame, gwAt + 20, 14) }}>
          (3, 4) @ (4, 2) → (3, 2)      sum over the batch → (2,)
        </div>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 590, display: 'flex', justifyContent: 'center' }}>
          <ProblemChip title="Autograd Concepts (Manual)" progress={ease(frame, chipAt, 20)} />
        </div>
      </Layer>
    </>
  );
};
