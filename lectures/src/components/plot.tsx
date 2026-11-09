import React from 'react';
import { C, F } from '../theme';

/** Linear scales for a plot of `w`x`h` pixels (y grows upwards). */
export function scales(w: number, h: number, x: [number, number], y: [number, number]) {
  return {
    sx: (v: number) => ((v - x[0]) / (x[1] - x[0])) * w,
    sy: (v: number) => h - ((v - y[0]) / (y[1] - y[0])) * h,
  };
}

export interface AxesProps {
  w: number;
  h: number;
  x: [number, number];
  y: [number, number];
  xTicks?: number[];
  yTicks?: number[];
  xLabel?: string;
  yLabel?: string;
  fmtTick?: (v: number) => string;
  grid?: boolean;
  opacity?: number;
}

/**
 * Axis lines, ticks and labels for an SVG plot whose origin is the top-left of
 * the plot area. Put it inside an <svg> with `overflow: visible`.
 */
export const Axes: React.FC<AxesProps> = ({ w, h, x, y, xTicks = [], yTicks = [], xLabel, yLabel, fmtTick = (v) => String(v), grid = true, opacity = 1 }) => {
  const { sx, sy } = scales(w, h, x, y);
  return (
    <g opacity={opacity}>
      {grid &&
        yTicks.map((t) => <line key={`gy${t}`} x1={0} x2={w} y1={sy(t)} y2={sy(t)} stroke={C.line} strokeWidth={1} />)}
      {grid &&
        xTicks.map((t) => <line key={`gx${t}`} x1={sx(t)} x2={sx(t)} y1={0} y2={h} stroke={C.line} strokeWidth={1} />)}
      <line x1={0} y1={h} x2={w} y2={h} stroke={C.line2} strokeWidth={2} />
      <line x1={0} y1={0} x2={0} y2={h} stroke={C.line2} strokeWidth={2} />
      {xTicks.map((t) => (
        <text key={`x${t}`} x={sx(t)} y={h + 32} fill={C.muted} fontFamily={F.mono} fontSize={22} textAnchor="middle">
          {fmtTick(t)}
        </text>
      ))}
      {yTicks.map((t) => (
        <text key={`y${t}`} x={-14} y={sy(t) + 8} fill={C.muted} fontFamily={F.mono} fontSize={22} textAnchor="end">
          {fmtTick(t)}
        </text>
      ))}
      {xLabel && (
        <text x={w / 2} y={h + 72} fill={C.text} fontFamily={F.body} fontSize={26} textAnchor="middle">
          {xLabel}
        </text>
      )}
      {yLabel && (
        <text x={-72} y={h / 2} fill={C.text} fontFamily={F.body} fontSize={26} textAnchor="middle" transform={`rotate(-90 ${-72} ${h / 2})`}>
          {yLabel}
        </text>
      )}
    </g>
  );
};

/** SVG path through points, drawn up to `progress` (0..1) of its vertices. */
export function polyline(pts: { x: number; y: number }[], progress = 1): string {
  if (!pts.length) return '';
  const n = (pts.length - 1) * Math.max(0, Math.min(1, progress));
  const whole = Math.floor(n);
  const out = pts.slice(0, whole + 1).map((p, i) => `${i ? 'L' : 'M'}${p.x.toFixed(1)},${p.y.toFixed(1)}`);
  const f = n - whole;
  if (f > 0 && whole + 1 < pts.length) {
    const a = pts[whole];
    const b = pts[whole + 1];
    out.push(`L${(a.x + (b.x - a.x) * f).toFixed(1)},${(a.y + (b.y - a.y) * f).toFixed(1)}`);
  }
  return out.join(' ');
}
