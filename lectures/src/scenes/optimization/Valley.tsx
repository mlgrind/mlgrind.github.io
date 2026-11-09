import React from 'react';
import { C, F, rgba } from '../../theme';
import { linear, linePath, pointAt } from '../../components/charts';
import { VA, VB } from './data';

type P = [number, number];

export const X_RANGE: [number, number] = [-10, 3];
export const Y_RANGE: [number, number] = [-2.8, 2.8];
const LEVELS = [0.05, 0.2, 0.6, 1.5, 3.5, 7, 13, 22, 34];

/** Contour plot of the valley f = 0.5 (A x² + B y²) with optimizer paths drawn over it. */
export const ValleyPlot: React.FC<{
  w: number;
  paths: { pts: P[]; color: string; progress: number; opacity?: number; dots?: boolean }[];
}> = ({ w, paths }) => {
  const unit = w / (X_RANGE[1] - X_RANGE[0]);
  const h = unit * (Y_RANGE[1] - Y_RANGE[0]);
  const sx = linear(X_RANGE[0], X_RANGE[1], 0, w);
  const sy = linear(Y_RANGE[0], Y_RANGE[1], h, 0);
  return (
    <svg width={w} height={h} style={{ overflow: 'hidden', borderRadius: 18 }}>
      <rect width={w} height={h} fill={rgba(C.bgDeep, 0.5)} />
      {LEVELS.map((c, i) => {
        const rx = Math.sqrt((2 * c) / VA) * unit;
        const ry = Math.sqrt((2 * c) / VB) * unit;
        return <ellipse key={c} cx={sx(0)} cy={sy(0)} rx={rx} ry={ry} fill="none" stroke={C.violet} strokeOpacity={0.45 - i * 0.035} strokeWidth={2} />;
      })}
      <circle cx={sx(0)} cy={sy(0)} r={8} fill={C.text} opacity={0.8} />
      <text x={sx(0) + 16} y={sy(0) - 14} fill={C.muted} fontFamily={F.body} fontSize={22}>
        minimum
      </text>
      {paths.map(({ pts, color, progress, opacity = 1, dots = true }, k) => {
        if (progress <= 0) return null;
        const n = Math.floor((pts.length - 1) * progress);
        const head = pointAt(pts, progress);
        return (
          <g key={k} opacity={opacity}>
            <path d={linePath(pts, sx, sy, progress)} fill="none" stroke={color} strokeWidth={3.5} strokeLinejoin="round" />
            {dots && pts.slice(0, n + 1).map((p, i) => <circle key={i} cx={sx(p[0])} cy={sy(p[1])} r={4.5} fill={color} />)}
            <circle cx={sx(head[0])} cy={sy(head[1])} r={10} fill={color} stroke={C.bg} strokeWidth={3} />
          </g>
        );
      })}
      <circle cx={sx(paths[0]?.pts[0][0] ?? 0)} cy={sy(paths[0]?.pts[0][1] ?? 0)} r={9} fill="none" stroke={C.text} strokeWidth={2.5} />
    </svg>
  );
};
