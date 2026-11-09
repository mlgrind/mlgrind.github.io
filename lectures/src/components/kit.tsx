// Small building blocks shared by the foundations lectures (numpy, einsum,
// pytorch…): absolutely positioned cells that can move between layouts, code
// chips, shape tags and a minimal 2D plot.
import React from 'react';
import { C, F, rgba } from '../theme';
import { fmt } from '../lib/math';

/** One array cell, absolutely positioned (so it can animate between layouts). */
export const Cell: React.FC<{
  x: number;
  y: number;
  w?: number;
  h?: number;
  value?: number | string;
  digits?: number;
  bg?: string;
  border?: string;
  color?: string;
  fontSize?: number;
  opacity?: number;
  scale?: number;
}> = ({ x, y, w = 72, h = 60, value, digits = 0, bg, border, color = C.text, fontSize = 26, opacity = 1, scale = 1 }) =>
  opacity <= 0.001 ? null : (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: w,
        height: h,
        borderRadius: 9,
        background: bg ?? rgba(C.text, 0.05),
        border: `1px solid ${border ?? rgba(C.text, 0.08)}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: F.mono,
        fontSize,
        color,
        opacity,
        transform: `scale(${scale})`,
        fontVariantNumeric: 'tabular-nums',
      }}
    >
      {value === undefined ? null : typeof value === 'number' ? fmt(value, digits) : value}
    </div>
  );

/** A line of code in a pill. */
export const Code: React.FC<{ children: React.ReactNode; size?: number; color?: string; style?: React.CSSProperties; glow?: number }> = ({
  children,
  size = 30,
  color = C.text,
  style,
  glow = 0,
}) => (
  <span
    style={{
      display: 'inline-block',
      fontFamily: F.mono,
      fontSize: size,
      color,
      padding: '8px 18px',
      borderRadius: 12,
      background: rgba(C.panel2, 0.9),
      border: `1px solid ${glow > 0 ? rgba(C.violetLight, 0.3 + 0.6 * glow) : C.line2}`,
      boxShadow: glow > 0 ? `0 0 ${24 * glow}px ${rgba(C.violet, 0.5 * glow)}` : undefined,
      whiteSpace: 'pre',
      ...style,
    }}
  >
    {children}
  </span>
);

/** "(3, 4)"-style shape tag. */
export const ShapeTag: React.FC<{ shape: number[]; glow?: number; size?: number; style?: React.CSSProperties }> = ({ shape, glow = 0, size = 24, style }) => (
  <span
    style={{
      fontFamily: F.mono,
      fontSize: size,
      color: glow > 0.5 ? C.teal : C.muted,
      padding: '3px 12px',
      borderRadius: 9,
      background: rgba(C.teal, 0.14 * glow),
      border: `1px solid ${rgba(C.teal, 0.6 * glow)}`,
      ...style,
    }}
  >
    ({shape.join(', ')}{shape.length === 1 ? ',' : ''})
  </span>
);

/** Rounded panel. */
export const Panel: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div style={{ borderRadius: 22, border: `1px solid ${C.line}`, background: rgba(C.panel, 0.75), padding: '28px 34px', ...style }}>
    {children}
  </div>
);

export interface PlotScale {
  x: (v: number) => number;
  y: (v: number) => number;
  w: number;
  h: number;
}

/** Minimal 2D plot: axes, ticks and a render prop for the marks. */
export const Plot: React.FC<{
  width: number;
  height: number;
  x: [number, number];
  y: [number, number];
  xTicks?: number[];
  yTicks?: number[];
  xLabel?: string;
  yLabel?: string;
  tickDigits?: number;
  children: (s: PlotScale) => React.ReactNode;
  style?: React.CSSProperties;
}> = ({ width, height, x, y, xTicks = [], yTicks = [], xLabel, yLabel, tickDigits = 0, children, style }) => {
  const m = { l: 70, r: 20, t: 16, b: 56 };
  const w = width - m.l - m.r;
  const h = height - m.t - m.b;
  const s: PlotScale = {
    x: (v) => ((v - x[0]) / (x[1] - x[0])) * w,
    y: (v) => h - ((v - y[0]) / (y[1] - y[0])) * h,
    w,
    h,
  };
  return (
    <svg width={width} height={height} style={{ overflow: 'visible', ...style }}>
      <g transform={`translate(${m.l},${m.t})`}>
        <line x1={0} y1={h} x2={w} y2={h} stroke={C.line2} strokeWidth={2} />
        <line x1={0} y1={0} x2={0} y2={h} stroke={C.line2} strokeWidth={2} />
        {xTicks.map((t) => (
          <text key={`x${t}`} x={s.x(t)} y={h + 32} fill={C.dim} fontFamily={F.mono} fontSize={22} textAnchor="middle">
            {fmt(t, tickDigits)}
          </text>
        ))}
        {yTicks.map((t) => (
          <text key={`y${t}`} x={-14} y={s.y(t) + 8} fill={C.dim} fontFamily={F.mono} fontSize={22} textAnchor="end">
            {fmt(t, tickDigits)}
          </text>
        ))}
        {xLabel && (
          <text x={w} y={h - 12} fill={C.muted} fontFamily={F.body} fontSize={24} textAnchor="end">
            {xLabel}
          </text>
        )}
        {yLabel && (
          <text x={12} y={18} fill={C.muted} fontFamily={F.body} fontSize={24}>
            {yLabel}
          </text>
        )}
        {children(s)}
      </g>
    </svg>
  );
};
