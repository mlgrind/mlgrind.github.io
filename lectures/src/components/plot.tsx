// Small chart and table building blocks shared by lectures: an SVG axes frame
// with a linear scale, a labelled number table, and a box-and-arrow node.
import React from 'react';
import { C, F, rgba } from '../theme';
import { fmt } from '../lib/math';
import { Tex } from './ui';

export interface Scale {
  sx: (x: number) => number;
  sy: (y: number) => number;
  w: number;
  h: number;
}

export const linScale = (d0: number, d1: number, r0: number, r1: number) => (v: number) => r0 + ((v - d0) / (d1 - d0)) * (r1 - r0);

/** Path through points, skipping non-finite values. */
export function linePath(pts: [number, number][], s: Scale): string {
  let d = '';
  let pen = false;
  for (const [x, y] of pts) {
    if (!Number.isFinite(y)) {
      pen = false;
      continue;
    }
    d += `${pen ? 'L' : 'M'}${s.sx(x).toFixed(1)} ${s.sy(y).toFixed(1)} `;
    pen = true;
  }
  return d;
}

export interface AxesProps {
  width: number;
  height: number;
  x: [number, number];
  y: [number, number];
  xTicks?: number[];
  yTicks?: number[];
  xLabel?: string;
  yLabel?: string;
  tickDigits?: number;
  /** draw the x = 0 / y = 0 lines when inside the domain */
  zeroLines?: boolean;
  pad?: { l: number; r: number; t: number; b: number };
  opacity?: number;
  children?: (s: Scale) => React.ReactNode;
  style?: React.CSSProperties;
}

/** An SVG plot frame: axes, ticks and labels; `children` draws the data. */
export const Axes: React.FC<AxesProps> = ({
  width,
  height,
  x,
  y,
  xTicks = [],
  yTicks = [],
  xLabel,
  yLabel,
  tickDigits = 1,
  zeroLines = true,
  pad,
  opacity = 1,
  children,
  style,
}) => {
  pad = pad ?? { l: 78, r: 24, t: yLabel ? 64 : 20, b: 92 };
  const w = width - pad.l - pad.r;
  const h = height - pad.t - pad.b;
  const s: Scale = { sx: linScale(x[0], x[1], 0, w), sy: linScale(y[0], y[1], h, 0), w, h };
  const tick = (v: number) => fmt(v, Number.isInteger(v) ? 0 : tickDigits);
  return (
    <svg width={width} height={height} style={{ overflow: 'visible', opacity, ...style }}>
      <g transform={`translate(${pad.l} ${pad.t})`}>
        {yTicks.map((v) => (
          <g key={`y${v}`}>
            <line x1={0} x2={w} y1={s.sy(v)} y2={s.sy(v)} stroke={rgba(C.text, 0.06)} strokeWidth={1} />
            <text x={-14} y={s.sy(v) + 8} textAnchor="end" fontFamily={F.mono} fontSize={22} fill={C.dim}>
              {tick(v)}
            </text>
          </g>
        ))}
        {xTicks.map((v) => (
          <text key={`x${v}`} x={s.sx(v)} y={h + 32} textAnchor="middle" fontFamily={F.mono} fontSize={22} fill={C.dim}>
            {tick(v)}
          </text>
        ))}
        {zeroLines && y[0] < 0 && y[1] > 0 && <line x1={0} x2={w} y1={s.sy(0)} y2={s.sy(0)} stroke={C.line2} strokeWidth={1.5} />}
        {zeroLines && x[0] < 0 && x[1] > 0 && <line x1={s.sx(0)} x2={s.sx(0)} y1={0} y2={h} stroke={C.line2} strokeWidth={1.5} />}
        <line x1={0} x2={w} y1={h} y2={h} stroke={C.line2} strokeWidth={2} />
        <line x1={0} x2={0} y1={0} y2={h} stroke={C.line2} strokeWidth={2} />
        {children?.(s)}
      </g>
      {xLabel && (
        <foreignObject x={pad.l} y={height - 46} width={w} height={46}>
          <div style={{ textAlign: 'center' }}>
            <Tex size={30} color={C.muted}>{xLabel}</Tex>
          </div>
        </foreignObject>
      )}
      {yLabel && (
        <foreignObject x={pad.l - 40} y={pad.t - 58} width={300} height={46}>
          <div style={{ textAlign: 'left' }}>
            <Tex size={30} color={C.muted}>{yLabel}</Tex>
          </div>
        </foreignObject>
      )}
    </svg>
  );
};

export interface TableRow {
  label: string;
  values: number[];
  digits?: number;
  color?: (v: number, j: number) => string | undefined;
  /** 0..1 reveal for each cell */
  reveal?: (j: number) => number;
  /** row emphasis 0..1 */
  focus?: number;
  labelColor?: string;
}

/** Rows of numbers with a maths label on the left and optional column headers. */
export const NumTable: React.FC<{
  rows: TableRow[];
  cols?: string[];
  cellW?: number;
  cellH?: number;
  fontSize?: number;
  labelW?: number;
  labelSize?: number;
  gap?: number;
  highlightCol?: (j: number) => number;
  style?: React.CSSProperties;
}> = ({ rows, cols, cellW = 120, cellH = 60, fontSize = 26, labelW = 220, labelSize = 36, gap = 8, highlightCol, style }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap, ...style }}>
    {cols && (
      <div style={{ display: 'flex', gap, paddingLeft: labelW + 18 }}>
        {cols.map((c, j) => (
          <div key={j} style={{ width: cellW, textAlign: 'center', fontFamily: F.mono, fontSize: 22, color: C.muted }}>
            {c}
          </div>
        ))}
      </div>
    )}
    {rows.map((r, i) => {
      const focus = r.focus ?? 1;
      return (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 18, opacity: 0.3 + 0.7 * focus }}>
          <div style={{ width: labelW, textAlign: 'right' }}>
            <Tex size={labelSize} color={r.labelColor ?? C.text}>{r.label}</Tex>
          </div>
          <div style={{ display: 'flex', gap }}>
            {r.values.map((v, j) => {
              const rv = r.reveal ? r.reveal(j) : 1;
              const hl = highlightCol ? highlightCol(j) : 0;
              return (
                <div
                  key={j}
                  style={{
                    width: cellW,
                    height: cellH,
                    borderRadius: 10,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: F.mono,
                    fontSize,
                    fontVariantNumeric: 'tabular-nums',
                    color: C.text,
                    background: rv > 0 ? r.color?.(v, j) ?? rgba(C.text, 0.05) : rgba(C.text, 0.025),
                    boxShadow: hl > 0 ? `0 0 0 ${2 + hl}px ${rgba(C.amber, 0.9 * hl)}` : undefined,
                    opacity: 0.3 + 0.7 * rv,
                  }}
                >
                  {rv > 0.02 ? <span style={{ opacity: rv }}>{fmt(v, r.digits ?? 2)}</span> : null}
                </div>
              );
            })}
          </div>
        </div>
      );
    })}
  </div>
);

/** A rounded box with a title, used for block diagrams. */
export const Node: React.FC<{
  children: React.ReactNode;
  color?: string;
  active?: number;
  w?: number;
  h?: number;
  style?: React.CSSProperties;
}> = ({ children, color = C.violet, active = 0, w, h, style }) => (
  <div
    style={{
      width: w,
      height: h,
      padding: '14px 22px',
      borderRadius: 16,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      fontFamily: F.body,
      fontSize: 28,
      fontWeight: 500,
      color: C.text,
      background: rgba(color, 0.1 + 0.3 * active),
      border: `2px solid ${rgba(color, 0.35 + 0.6 * active)}`,
      boxShadow: active > 0 ? `0 0 ${30 * active}px ${rgba(color, 0.35 * active)}` : undefined,
      boxSizing: 'border-box',
      ...style,
    }}
  >
    {children}
  </div>
);
