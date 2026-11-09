import React from 'react';
import { useCurrentFrame } from 'remotion';
import type { SceneProps } from '..';
import { C, rgba } from '../../theme';
import { ease, lin } from '../../lib/anim';
import { ProblemChip } from '../../components/ui';
import { CLASS, Label, Panel, scales } from '../../components/classical';
import { DB, DB_CORE, DB_EPS, DB_MIN, DB_NEIGH, DB_PROBE, DB_X } from './data';

const PX = 235;
const s = scales([-1.45, 2.45], [-0.95, 1.35], 3.9 * PX, 2.3 * PX);

export const DBSCANScene: React.FC<SceneProps> = ({ cues }) => {
  const frame = useCurrentFrame();
  const inAt = cues.sentence('Finally, DBSCAN');
  const epsAt = cues.at('a radius, eps');
  const minAt = cues.at('a count, min samples');
  const coreAt = cues.at('A core point has');
  const growAt = cues.at('Clusters grow outward');
  const noiseAt = cues.at('labelled noise');
  const shapeAt = cues.at('any shape');
  const chipAt = cues.at("That's the DBSCAN");

  const probe = DB_X[DB_PROBE];
  const nb = DB_NEIGH[DB_PROBE];
  const probeO = ease(frame, epsAt, 14) * (1 - ease(frame, growAt, 14));
  const coreP = ease(frame, coreAt + 50, 18);
  const growT = lin(frame, growAt + 10, noiseAt) * DB.steps;
  const noiseP = ease(frame, noiseAt, 14);

  return (
    <>
      <Panel style={{ left: 0, top: 0, width: 1260, height: 600, opacity: ease(frame, inAt, 14) }}>
        <svg width={1200} height={540} style={{ overflow: 'visible' }}>
          <g transform="translate(140, 0)">
            {/* eps circles around core points once clusters grow (faint) */}
            <g opacity={probeO}>
              <circle cx={s.x(probe[0])} cy={s.y(probe[1])} r={DB_EPS * PX} fill={rgba(C.amber, 0.08)} stroke={C.amber} strokeWidth={3} strokeDasharray="10 8" />
              <line x1={s.x(probe[0])} y1={s.y(probe[1])} x2={s.x(probe[0]) + DB_EPS * PX} y2={s.y(probe[1])} stroke={C.amber} strokeWidth={3} />
              <text x={s.x(probe[0]) + (DB_EPS * PX) / 2} y={s.y(probe[1]) - 12} fill={C.amber} fontFamily="JetBrains Mono" fontSize={26} textAnchor="middle">
                eps
              </text>
            </g>
            {DB_X.map((x, i) => {
              const label = DB.labels[i];
              const reached = label >= 0 && DB.order[i] < growT;
              const isNoise = label < 0;
              const inProbe = nb.includes(i) && frame >= coreAt && frame < growAt;
              const core = DB_CORE[i];
              const fill = reached ? CLASS[label] : inProbe ? C.amber : C.muted;
              const o = ease(frame, inAt + 4 + i * 0.4, 10);
              if (isNoise && noiseP > 0) {
                const cx = s.x(x[0]);
                const cy = s.y(x[1]);
                return (
                  <g key={i} opacity={o}>
                    <circle cx={cx} cy={cy} r={10} fill={C.muted} opacity={1 - noiseP} />
                    <path d={`M ${cx - 11} ${cy - 11} L ${cx + 11} ${cy + 11} M ${cx + 11} ${cy - 11} L ${cx - 11} ${cy + 11}`} stroke={C.rose} strokeWidth={4.5} strokeLinecap="round" opacity={noiseP} />
                  </g>
                );
              }
              return (
                <g key={i} opacity={o}>
                  <circle
                    cx={s.x(x[0])}
                    cy={s.y(x[1])}
                    r={core ? 10 : 9}
                    fill={!core && coreP > 0.5 ? 'transparent' : fill}
                    stroke={!core && coreP > 0.5 ? fill : C.bg}
                    strokeWidth={!core && coreP > 0.5 ? 3.5 : 2}
                  />
                </g>
              );
            })}
          </g>
        </svg>
      </Panel>

      <Panel style={{ left: 1300, top: 0, width: 380, height: 600, opacity: ease(frame, epsAt, 14) }}>
        <Label size={30} color={C.amber}>eps = {DB_EPS}</Label>
        <Label size={30} color={C.amber} style={{ marginTop: 8, opacity: ease(frame, minAt, 14) }}>
          min_samples = {DB_MIN}
        </Label>
        <div style={{ marginTop: 34, opacity: ease(frame, coreAt, 14) * (1 - ease(frame, growAt, 12)) }}>
          <Label size={24}>neighbours of ●</Label>
          <Label size={32} color={C.text}>
            {nb.length} ≥ {DB_MIN} → core
          </Label>
        </div>
        <div style={{ position: 'absolute', left: 32, top: 230, opacity: coreP, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Label size={24} color={C.text}>● core ({DB_CORE.filter(Boolean).length})</Label>
          <Label size={24} color={C.text}>○ border ({DB.labels.filter((l, i) => l >= 0 && !DB_CORE[i]).length})</Label>
          <Label size={24} color={C.rose} style={{ opacity: noiseP }}>
            × noise ({DB.labels.filter((l) => l < 0).length})
          </Label>
        </div>
        <div style={{ position: 'absolute', left: 32, top: 400, opacity: ease(frame, shapeAt, 14) }}>
          <Label size={30} color={C.teal}>{DB.nClusters} clusters found</Label>
          <Label size={22} style={{ marginTop: 6 }}>
            k was never chosen
          </Label>
        </div>
      </Panel>

      <div style={{ position: 'absolute', left: 0, right: 0, top: 625, display: 'flex', justifyContent: 'center' }}>
        <ProblemChip title="DBSCAN Clustering" progress={ease(frame, chipAt, 14)} />
      </div>
    </>
  );
};
