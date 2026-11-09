import React from 'react';
import { useCurrentFrame } from 'remotion';
import type { SceneProps } from '..';
import { C, F, rgba } from '../../theme';
import { ease, lin, windowed } from '../../lib/anim';
import { Layer, ProblemChip, Tex } from '../../components/ui';
import { Axes, Legend, Panel, linear, linePath } from '../../components/charts';
import { BETA, BOX_A, BOX_B, DETS, IOU_AB, NMS, NMS_T, curve, iou, smoothL1, type Box } from './data';

const area = (b: Box) => (b[2] - b[0]) * (b[3] - b[1]);

const IouPanel: React.FC<{ frame: number; boxesAt: number; interAt: number; unionAt: number; edgeAt: number }> = ({ frame, boxesAt, interAt, unionAt, edgeAt }) => {
  const U = 62; // px per unit
  const GW = 10;
  const GH = 8;
  const X = (v: number) => v * U;
  const inter = ease(frame, interAt, 18);
  const union = ease(frame, unionAt, 18);
  const ix = IOU_AB.ix;
  const rect = (b: Box, color: string, fill: number, p: number) => (
    <rect x={X(b[0])} y={X(b[1])} width={X(b[2] - b[0])} height={X(b[3] - b[1])} fill={rgba(color, fill)} stroke={color} strokeWidth={4} opacity={p} rx={4} />
  );
  const same = iou(BOX_A, BOX_A).iou;
  const apart = iou(BOX_A, [7, 6, 9, 8]).iou;
  return (
    <>
      <svg width={GW * U + 2} height={GH * U + 2} style={{ position: 'absolute', left: 60, top: 40 }}>
        {Array.from({ length: GW + 1 }, (_, i) => <line key={`v${i}`} x1={X(i)} x2={X(i)} y1={0} y2={X(GH)} stroke={rgba(C.text, 0.06)} />)}
        {Array.from({ length: GH + 1 }, (_, i) => <line key={`h${i}`} y1={X(i)} y2={X(i)} x1={0} x2={X(GW)} stroke={rgba(C.text, 0.06)} />)}
        {rect(BOX_A, C.violetLight, 0.12 + 0.1 * union, ease(frame, boxesAt, 16))}
        {rect(BOX_B, C.amber, 0.1 + 0.1 * union, ease(frame, boxesAt + 10, 16))}
        <rect x={X(ix[0])} y={X(ix[1])} width={X(ix[2] - ix[0])} height={X(ix[3] - ix[1])} fill={rgba(C.teal, 0.6)} opacity={inter} />
        <text x={X(BOX_A[0]) + 12} y={X(BOX_A[1]) + 34} fill={C.violetLight} fontFamily={F.mono} fontSize={26} opacity={ease(frame, boxesAt, 16)}>A</text>
        <text x={X(BOX_B[2]) - 32} y={X(BOX_B[3]) - 14} fill={C.amber} fontFamily={F.mono} fontSize={26} opacity={ease(frame, boxesAt + 10, 16)}>B</text>
      </svg>
      <div style={{ position: 'absolute', left: 780, top: 60, display: 'flex', flexDirection: 'column', gap: 26, fontFamily: F.mono, fontSize: 30 }}>
        <div style={{ color: C.muted, opacity: ease(frame, boxesAt, 16) }}>
          A = [{BOX_A.join(', ')}]  area {area(BOX_A)}
        </div>
        <div style={{ color: C.muted, opacity: ease(frame, boxesAt + 10, 16) }}>
          B = [{BOX_B.join(', ')}]  area {area(BOX_B)}
        </div>
        <div style={{ color: C.tealLight, opacity: inter }}>intersection = {IOU_AB.inter}</div>
        <div style={{ color: C.text, opacity: union }}>
          union = {area(BOX_A)} + {area(BOX_B)} − {IOU_AB.inter} = {IOU_AB.union}
        </div>
        <div style={{ opacity: union, marginTop: 10 }}>
          <Tex size={62} color={C.amber}>{`IoU = ${IOU_AB.inter} / ${IOU_AB.union} = ${IOU_AB.iou.toFixed(2)}`}</Tex>
        </div>
        <div style={{ display: 'flex', gap: 40, color: C.muted, fontSize: 26, opacity: ease(frame, edgeAt, 16) }}>
          <span>identical: {same.toFixed(0)}</span>
          <span>not touching: {apart.toFixed(0)}</span>
        </div>
      </div>
    </>
  );
};

const NmsPanel: React.FC<{ frame: number; showAt: number; sortAt: number; keepAt: number; delAt: number; repeatAt: number }> = ({ frame, showAt, sortAt, keepAt, delAt, repeatAt }) => {
  const U = 56;
  const ox = 30;
  const oy = 100;
  // per-step timing: step 0 keep at keepAt, delete at delAt; step 1 at repeatAt
  const stepKeep = [keepAt, repeatAt - 10];
  const stepDel = [delAt, repeatAt + 12];
  const state = (i: number) => {
    let kept = 0;
    let removed = 0;
    let iouVal: number | undefined;
    NMS.steps.forEach((s, k) => {
      if (s.keep === i) kept = ease(frame, stepKeep[k] ?? repeatAt, 14);
      const r = s.removed.find((x) => x.i === i);
      if (r) {
        removed = ease(frame, (stepDel[k] ?? repeatAt) + 16, 14);
        if (frame >= (stepDel[k] ?? repeatAt)) iouVal = r.iou;
      }
    });
    return { kept, removed, iouVal };
  };
  const sorted = ease(frame, sortAt, 20);
  // score tags: stack upward when two boxes' top-left corners are close
  const tags: { x: number; y: number }[] = [];
  DETS.map((d, i) => ({ i, x: ox + d.box[0] * U, y: oy + d.box[1] * U - 32 }))
    .sort((a, b) => b.y - a.y)
    .forEach((t) => {
      let y = t.y;
      for (let pass = 0; pass < DETS.length; pass++) {
        const hit = tags.some((o) => o && Math.abs(o.x - t.x) < 80 && Math.abs(o.y - y) < 32);
        if (!hit) break;
        y -= 34;
      }
      tags[t.i] = { x: t.x, y };
    });
  return (
    <>
      <svg width={900} height={660} style={{ position: "absolute", left: 0, top: 0 }}>
        {DETS.map((d, i) => {
          const s = state(i);
          const color = s.kept > 0.5 ? C.teal : s.iouVal !== undefined ? C.rose : C.violetLight;
          const b = d.box;
          return (
            <g key={i} opacity={ease(frame, showAt + i * 4, 12) * (1 - 0.85 * s.removed)}>
              <rect x={ox + b[0] * U} y={oy + b[1] * U} width={(b[2] - b[0]) * U} height={(b[3] - b[1]) * U} fill="none" stroke={color} strokeWidth={s.kept > 0.5 ? 6 : 3} rx={4} />
              <rect x={tags[i].x} y={tags[i].y} width={74} height={30} rx={6} fill={rgba(color, 0.85)} />
              <text x={tags[i].x + 37} y={tags[i].y + 23} fill={C.bg} fontFamily={F.mono} fontSize={22} textAnchor="middle">
                {d.score.toFixed(2)}
              </text>
            </g>
          );
        })}
      </svg>
      {/* ranked list */}
      <div style={{ position: 'absolute', left: 980, top: 10, display: 'flex', flexDirection: 'column', gap: 10, width: 680 }}>
        <div style={{ fontFamily: F.mono, fontSize: 22, color: C.muted, marginBottom: 6 }}>sorted by score · threshold {NMS_T}</div>
        {DETS.map((d, i) => {
          const rank = NMS.order.indexOf(i);
          const y = (sorted * rank + (1 - sorted) * i) * 62;
          const s = state(i);
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                top: 40 + y,
                left: 0,
                width: 640,
                height: 52,
                borderRadius: 10,
                display: 'flex',
                alignItems: 'center',
                gap: 24,
                padding: '0 18px',
                background: s.kept > 0.5 ? rgba(C.teal, 0.2) : rgba(C.panel, 0.85),
                border: `1px solid ${s.kept > 0.5 ? C.teal : s.iouVal !== undefined ? rgba(C.rose, 0.6) : C.line2}`,
                opacity: ease(frame, showAt + i * 4, 12) * (1 - 0.6 * s.removed),
                fontFamily: F.mono,
                fontSize: 24,
                color: C.text,
              }}
            >
              <span style={{ color: C.amber, width: 70 }}>{d.score.toFixed(2)}</span>
              <span style={{ width: 120, color: s.kept > 0.5 ? C.tealLight : C.muted }}>{s.kept > 0.5 ? 'keep' : s.iouVal !== undefined ? 'remove' : ''}</span>
              <span style={{ color: C.rose }}>{s.iouVal !== undefined ? `IoU ${s.iouVal.toFixed(2)} > ${NMS_T}` : ''}</span>
            </div>
          );
        })}
      </div>
    </>
  );
};

const SmoothL1Panel: React.FC<{ frame: number; at: number; quadAt: number; linAt: number }> = ({ frame, at, quadAt, linAt }) => {
  const W = 900;
  const H = 400;
  const sx = linear(-3, 3, 0, W);
  const sy = linear(0, 3, H, 0);
  const draw = lin(frame, at, at + 40);
  const l2 = curve((x) => 0.5 * x * x, -Math.sqrt(6), Math.sqrt(6));
  const l1 = curve((x) => Math.abs(x), -3, 3);
  const sl = curve((x) => smoothL1(x), -3, 3);
  return (
    <Panel x={0} y={0} w={1680} h={560}>
      <svg width={1100} height={540} style={{ position: 'absolute', left: 60, top: 30 }}>
        <g transform="translate(80,30)">
          <rect x={sx(-BETA)} y={0} width={sx(BETA) - sx(-BETA)} height={H} fill={rgba(C.teal, 0.08 * ease(frame, quadAt, 16))} />
          <Axes sx={sx} sy={sy} xTicks={[-3, -2, -1, 0, 1, 2, 3]} yTicks={[0, 1, 2, 3]} xFormat={(v) => String(v).replace('-', '−')} xLabel="x = prediction − target" />
          <path d={linePath(l2, sx, sy, draw)} fill="none" stroke={C.rose} strokeWidth={3} strokeDasharray="10 8" opacity={0.8} />
          <path d={linePath(l1, sx, sy, draw)} fill="none" stroke={C.muted} strokeWidth={3} strokeDasharray="4 8" opacity={0.8} />
          <path d={linePath(sl, sx, sy, draw)} fill="none" stroke={C.teal} strokeWidth={6} />
        </g>
      </svg>
      <div style={{ position: 'absolute', left: 1160, top: 70, display: 'flex', flexDirection: 'column', gap: 30 }}>
        <Legend items={[{ color: C.teal, label: `Smooth L1 (β = ${BETA})` }]} />
        <Legend items={[{ color: C.rose, label: 'L2: ½x²' }]} />
        <Legend items={[{ color: C.muted, label: 'L1: |x|' }]} />
        <div style={{ marginTop: 20, opacity: ease(frame, quadAt, 16) }}>
          <Tex size={34} color={C.tealLight}>{'|x| < β:  0.5x² / β'}</Tex>
        </div>
        <div style={{ opacity: ease(frame, linAt, 16) }}>
          <Tex size={34} color={C.tealLight}>{'|x| ≥ β:  |x| − 0.5β'}</Tex>
        </div>
        <div style={{ fontFamily: F.mono, fontSize: 24, color: C.muted, opacity: ease(frame, linAt + 20, 16) }}>
          x = 3: L2 {(0.5 * 9).toFixed(1)}, Smooth L1 {smoothL1(3).toFixed(1)}
        </div>
      </div>
    </Panel>
  );
};

export const DetectionScene: React.FC<SceneProps> = ({ cues, durationInFrames }) => {
  const frame = useCurrentFrame();
  const a = [54, cues.sentence('A detector fires')];
  const b = [a[1], cues.sentence('To train the box') + 45];
  const c = [b[1] - 14, durationInFrames];
  return (
    <>
      <Layer opacity={windowed(frame, a[0], a[1])}>
        <IouPanel frame={frame} boxesAt={a[0] + 6} interAt={cues.at('the area where they overlap')} unionAt={cues.at('the area they cover')} edgeAt={cues.at('Identical boxes')} />
      </Layer>
      <Layer opacity={windowed(frame, b[0], b[1])}>
        <NmsPanel
          frame={frame}
          showAt={b[0] + 4}
          sortAt={cues.at('Sort the boxes')}
          keepAt={cues.at('keep the best one')}
          delAt={cues.at('delete every remaining')}
          repeatAt={cues.at('and repeat')}
        />
      </Layer>
      <Layer opacity={windowed(frame, c[0], c[1] + 30)}>
        <SmoothL1Panel frame={frame} at={c[0] + 6} quadAt={cues.at('quadratic for small')} linAt={cues.at('linear for large')} />
        <div style={{ position: 'absolute', left: 0, right: 0, top: 600, display: 'flex', justifyContent: 'center', gap: 20 }}>
          {['IoU (Intersection over Union)', 'Non-Maximum Suppression (NMS)', 'Smooth L1 Loss'].map((t, i) => (
            <ProblemChip key={t} title={t} progress={ease(frame, cues.at('one wild prediction') + i * 8, 18)} />
          ))}
        </div>
      </Layer>
    </>
  );
};
