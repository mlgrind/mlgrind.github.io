// Small SVG chart helpers: linear scales, axes with ticks, line paths and a
// panel frame. Used by the optimization, cnn and sequence-models lectures.
import React from 'react';
import { C, F, rgba } from '../theme';

export type Scale = ((v: number) => number) & { d: [number, number]; r: [number, number] };

export function linear(d0: number, d1: number, r0: number, r1: number): Scale {
  const f = ((v: number) => r0 + ((v - d0) / (d1 - d0)) * (r1 - r0)) as Scale;
  f.d = [d0, d1];
  f.r = [r0, r1];
  return f;
}

/** SVG path through points; `upTo` (0..1) draws only the first fraction, interpolating the last segment. */
export function linePath(pts: [number, number][], sx: (v: number) => number, sy: (v: number) => number, upTo = 1): string {
  if (pts.length === 0) return '';
  const n = (pts.length - 1) * Math.max(0, Math.min(1, upTo));
  const whole = Math.floor(n);
  const out: string[] = [];
  for (let i = 0; i <= whole; i++) out.push(`${i === 0 ? 'M' : 'L'}${sx(pts[i][0]).toFixed(1)},${sy(pts[i][1]).toFixed(1)}`);
  const frac = n - whole;
  if (frac > 0 && whole + 1 < pts.length) {
    const [x0, y0] = pts[whole];
    const [x1, y1] = pts[whole + 1];
    out.push(`L${sx(x0 + (x1 - x0) * frac).toFixed(1)},${sy(y0 + (y1 - y0) * frac).toFixed(1)}`);
  }
  return out.join(' ');
}

/** Point at fraction `t` (0..1) along a polyline's vertex sequence. */
export function pointAt(pts: [number, number][], t: number): [number, number] {
  const n = (pts.length - 1) * Math.max(0, Math.min(1, t));
  const i = Math.min(pts.length - 2, Math.floor(n));
  const f = n - i;
  return [pts[i][0] + (pts[i + 1][0] - pts[i][0]) * f, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * f];
}

export interface AxesProps {
  sx: Scale;
  sy: Scale;
  xTicks?: number[];
  yTicks?: number[];
  xFormat?: (v: number) => string;
  yFormat?: (v: number) => string;
  xLabel?: string;
  yLabel?: string;
  grid?: boolean;
  fontSize?: number;
}

/** Axis lines, ticks and labels, drawn inside an <svg>. */
export const Axes: React.FC<AxesProps> = ({ sx, sy, xTicks = [], yTicks = [], xFormat = String, yFormat = String, xLabel, yLabel, grid = true, fontSize = 22 }) => {
  const [x0, x1] = sx.r;
  const [y0, y1] = sy.r; // y0 = bottom (larger), y1 = top
  return (
    <g>
      {grid &&
        yTicks.map((t) => <line key={`gy${t}`} x1={x0} x2={x1} y1={sy(t)} y2={sy(t)} stroke={rgba(C.text, 0.06)} strokeWidth={1.5} />)}
      <line x1={x0} x2={x1} y1={y0} y2={y0} stroke={C.line2} strokeWidth={2} />
      <line x1={x0} x2={x0} y1={y0} y2={y1} stroke={C.line2} strokeWidth={2} />
      {xTicks.map((t) => (
        <text key={`x${t}`} x={sx(t)} y={y0 + fontSize + 10} fill={C.dim} fontFamily={F.mono} fontSize={fontSize} textAnchor="middle">
          {xFormat(t)}
        </text>
      ))}
      {yTicks.map((t) => (
        <text key={`y${t}`} x={x0 - 12} y={sy(t) + fontSize * 0.35} fill={C.dim} fontFamily={F.mono} fontSize={fontSize} textAnchor="end">
          {yFormat(t)}
        </text>
      ))}
      {xLabel && (
        <text x={(x0 + x1) / 2} y={y0 + fontSize * 2 + 22} fill={C.muted} fontFamily={F.body} fontSize={fontSize + 2} textAnchor="middle">
          {xLabel}
        </text>
      )}
      {yLabel && (
        <text x={x0} y={y1 - 18} fill={C.muted} fontFamily={F.body} fontSize={fontSize + 2} textAnchor="start">
          {yLabel}
        </text>
      )}
    </g>
  );
};

/** Rounded translucent panel, absolutely positioned within the stage. */
export const Panel: React.FC<{ x: number; y: number; w: number; h: number; children?: React.ReactNode; style?: React.CSSProperties }> = ({ x, y, w, h, children, style }) => (
  <div
    style={{
      position: 'absolute',
      left: x,
      top: y,
      width: w,
      height: h,
      borderRadius: 22,
      border: `1px solid ${C.line}`,
      background: rgba(C.panel, 0.75),
      ...style,
    }}
  >
    {children}
  </div>
);

/** Colour swatch + label, for chart legends. */
export const Legend: React.FC<{ items: { color: string; label: string; opacity?: number }[]; style?: React.CSSProperties }> = ({ items, style }) => (
  <div style={{ display: 'flex', gap: 30, alignItems: 'center', ...style }}>
    {items.map((it) => (
      <div key={it.label} style={{ display: 'flex', alignItems: 'center', gap: 12, opacity: it.opacity ?? 1 }}>
        <div style={{ width: 28, height: 6, borderRadius: 3, background: it.color }} />
        <span style={{ fontFamily: F.body, fontSize: 24, color: C.muted }}>{it.label}</span>
      </div>
    ))}
  </div>
);

export interface NumGridProps {
  data: number[][];
  cell?: number;
  gap?: number;
  fontSize?: number;
  /** background per cell */
  color?: (v: number, i: number, j: number) => string;
  textColor?: (v: number, i: number, j: number) => string;
  /** per-cell visibility 0..1 */
  reveal?: (i: number, j: number) => number;
  /** highlighted window(s): top-left row/col and size, in cells */
  windows?: { i: number; j: number; h: number; w: number; color: string; opacity?: number }[];
  format?: (v: number) => string;
  style?: React.CSSProperties;
}

/** A grid of numbers (image, kernel, feature map) with optional sliding-window outlines. */
export const NumGrid: React.FC<NumGridProps> = ({ data, cell = 60, gap = 5, fontSize = 24, color, textColor, reveal, windows = [], format = (v) => String(v).replace('-', '−'), style }) => {
  const rows = data.length;
  const cols = data[0].length;
  const step = cell + gap;
  return (
    <div style={{ position: 'relative', width: cols * step - gap, height: rows * step - gap, ...style }}>
      {data.map((row, i) =>
        row.map((v, j) => {
          const r = reveal ? reveal(i, j) : 1;
          return (
            <div
              key={`${i}-${j}`}
              style={{
                position: 'absolute',
                left: j * step,
                top: i * step,
                width: cell,
                height: cell,
                borderRadius: 8,
                background: r > 0 ? color?.(v, i, j) ?? rgba(C.text, 0.05) : rgba(C.text, 0.025),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: F.mono,
                fontSize,
                color: textColor?.(v, i, j) ?? C.text,
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {r > 0.02 ? <span style={{ opacity: r }}>{format(v)}</span> : null}
            </div>
          );
        }),
      )}
      {windows.map((w, k) => (
        <div
          key={k}
          style={{
            position: 'absolute',
            left: w.j * step - 5,
            top: w.i * step - 5,
            width: w.w * step - gap + 10,
            height: w.h * step - gap + 10,
            borderRadius: 12,
            border: `4px solid ${w.color}`,
            boxShadow: `0 0 24px ${rgba(w.color, 0.45)}`,
            opacity: w.opacity ?? 1,
          }}
        />
      ))}
    </div>
  );
};
