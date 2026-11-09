// Shared pieces for the classical-ML lectures (preprocessing, supervised,
// unsupervised): labelled matrices with legible headers, panels, scatter-plot
// axes and point clouds. Kept separate from ui.tsx so parallel lectures merge cleanly.
import React from 'react';
import { C, F, rgba } from '../theme';
import { Matrix, Tex, type MatrixProps } from './ui';

/** Class colours used for points, clusters and bars across these lectures. */
export const CLASS = [C.violetLight, C.teal, C.amber, '#ff8fa3', '#7fb2ff'];

/** A Matrix with column headers (and optional row headers) at a legible size. */
export const LMatrix: React.FC<
  MatrixProps & { headers?: string[]; headerSize?: number; title?: string; titleSize?: number; titleColor?: string; rowHeaders?: string[] }
> = ({ headers, headerSize = 22, title, titleSize = 44, titleColor = C.text, rowHeaders, ...m }) => {
  const cellW = m.cellW ?? 92;
  const cellH = m.cellH ?? 58;
  const gap = m.gap ?? 6;
  const rowW = rowHeaders ? Math.max(...rowHeaders.map((r) => r.length)) * headerSize * 0.62 + 18 : 0;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, ...m.style }}>
      {title !== undefined && <Tex size={titleSize} color={titleColor}>{title}</Tex>}
      {headers && (
        <div style={{ display: 'flex', gap, paddingLeft: rowW }}>
          {headers.map((h, j) => (
            <div key={j} style={{ width: cellW, textAlign: 'center', fontFamily: F.mono, fontSize: headerSize, color: C.muted, whiteSpace: 'nowrap' }}>
              {h}
            </div>
          ))}
        </div>
      )}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {rowHeaders && (
          <div style={{ display: 'flex', flexDirection: 'column', gap, width: rowW, alignItems: 'flex-end', paddingRight: 22 }}>
            {rowHeaders.map((r, i) => (
              <div
                key={i}
                style={{
                  height: cellH,
                  display: 'flex',
                  alignItems: 'center',
                  fontFamily: F.mono,
                  fontSize: headerSize,
                  color: C.muted,
                  opacity: m.rowFocus ? 0.35 + 0.65 * m.rowFocus(i) : 1,
                }}
              >
                {r}
              </div>
            ))}
          </div>
        )}
        <Matrix {...m} shape={false} label={undefined} style={undefined} />
      </div>
    </div>
  );
};

export const Panel: React.FC<{ style?: React.CSSProperties; children?: React.ReactNode; accent?: string }> = ({ style, children, accent }) => (
  <div
    style={{
      position: 'absolute',
      borderRadius: 22,
      border: `1px solid ${accent ?? C.line}`,
      background: rgba(C.panel, 0.78),
      padding: '26px 32px',
      ...style,
    }}
  >
    {children}
  </div>
);

/** Small monospace label. */
export const Label: React.FC<{ children: React.ReactNode; color?: string; size?: number; style?: React.CSSProperties }> = ({
  children,
  color = C.muted,
  size = 24,
  style,
}) => <div style={{ fontFamily: F.mono, fontSize: size, color, whiteSpace: 'nowrap', ...style }}>{children}</div>;

/** Linear map from data space to pixels for a w x h plot (y up). */
export function scales(xd: [number, number], yd: [number, number], w: number, h: number) {
  return {
    x: (v: number) => ((v - xd[0]) / (xd[1] - xd[0])) * w,
    y: (v: number) => h - ((v - yd[0]) / (yd[1] - yd[0])) * h,
  };
}

/** Plot frame: axes, ticks and labels in an SVG <g>. */
export const Axes: React.FC<{
  w: number;
  h: number;
  xTicks?: { v: number; label: string }[];
  yTicks?: { v: number; label: string }[];
  sx: (v: number) => number;
  sy: (v: number) => number;
  xLabel?: string;
  yLabel?: string;
  grid?: boolean;
  opacity?: number;
  fontSize?: number;
}> = ({ w, h, xTicks = [], yTicks = [], sx, sy, xLabel, yLabel, grid = true, opacity = 1, fontSize = 22 }) => (
  <g opacity={opacity}>
    {grid &&
      xTicks.map((t) => <line key={`gx${t.v}`} x1={sx(t.v)} x2={sx(t.v)} y1={0} y2={h} stroke={rgba(C.text, 0.06)} strokeWidth={1.5} />)}
    {grid &&
      yTicks.map((t) => <line key={`gy${t.v}`} x1={0} x2={w} y1={sy(t.v)} y2={sy(t.v)} stroke={rgba(C.text, 0.06)} strokeWidth={1.5} />)}
    <line x1={0} y1={h} x2={w} y2={h} stroke={C.line2} strokeWidth={2} />
    <line x1={0} y1={0} x2={0} y2={h} stroke={C.line2} strokeWidth={2} />
    {xTicks.map((t) => (
      <text key={`tx${t.v}`} x={sx(t.v)} y={h + fontSize + 10} fill={C.dim} fontFamily={F.mono} fontSize={fontSize} textAnchor="middle">
        {t.label}
      </text>
    ))}
    {yTicks.map((t) => (
      <text key={`ty${t.v}`} x={-12} y={sy(t.v) + fontSize * 0.35} fill={C.dim} fontFamily={F.mono} fontSize={fontSize} textAnchor="end">
        {t.label}
      </text>
    ))}
    {xLabel && (
      <text x={w} y={h + fontSize * 2 + 22} fill={C.muted} fontFamily={F.mono} fontSize={fontSize} textAnchor="end">
        {xLabel}
      </text>
    )}
    {yLabel && (
      <text x={0} y={-18} fill={C.muted} fontFamily={F.mono} fontSize={fontSize} textAnchor="start">
        {yLabel}
      </text>
    )}
  </g>
);
