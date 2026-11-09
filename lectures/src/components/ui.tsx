import React from 'react';
import { C, F, rgba } from '../theme';
import { fmt, type Mat } from '../lib/math';

/**
 * Inline math in the serif display face. `_x` / `_{xy}` become subscripts,
 * `^x` / `^{xy}` superscripts. Upright runs can be wrapped in backticks.
 */
export const Tex: React.FC<{ children: string; size?: number; color?: string; style?: React.CSSProperties }> = ({
  children,
  size = 40,
  color = C.text,
  style,
}) => {
  const out: React.ReactNode[] = [];
  const re = /([_^])(\{[^}]*\}|.)|`([^`]*)`/g;
  let last = 0;
  let k = 0;
  for (const m of children.matchAll(re)) {
    if (m.index! > last) out.push(<span key={k++}>{children.slice(last, m.index)}</span>);
    if (m[3] !== undefined) {
      out.push(
        <span key={k++} style={{ fontFamily: F.body, fontStyle: 'normal', fontSize: '0.78em' }}>
          {m[3]}
        </span>,
      );
    } else {
      const body = m[2].startsWith('{') ? m[2].slice(1, -1) : m[2];
      out.push(
        <span key={k++} style={{ fontSize: '0.62em', verticalAlign: m[1] === '_' ? '-0.28em' : '0.62em', lineHeight: 0 }}>
          {body}
        </span>,
      );
    }
    last = m.index! + m[0].length;
  }
  if (last < children.length) out.push(<span key={k++}>{children.slice(last)}</span>);
  return (
    <span style={{ fontFamily: F.display, fontStyle: 'italic', fontSize: size, color, lineHeight: 1.1, whiteSpace: 'nowrap', ...style }}>
      {out}
    </span>
  );
};

export const Eyebrow: React.FC<{ children: React.ReactNode; color?: string; style?: React.CSSProperties }> = ({
  children,
  color = C.violetLight,
  style,
}) => (
  <div
    style={{
      fontFamily: F.mono,
      fontSize: 18,
      letterSpacing: '0.16em',
      textTransform: 'uppercase',
      color,
      ...style,
    }}
  >
    {children}
  </div>
);

export type CellColor = (v: number, i: number, j: number) => string | undefined;

export const signedColor =
  (maxAbs: number, alpha = 0.6): CellColor =>
  (v) => {
    if (!Number.isFinite(v)) return undefined;
    const a = Math.min(1, Math.abs(v) / maxAbs) * alpha;
    return rgba(v >= 0 ? C.violet : C.teal, Math.max(0.05, a));
  };

export const weightColor =
  (alpha = 0.9, hex = C.violet): CellColor =>
  (v) =>
    rgba(hex, 0.05 + Math.max(0, Math.min(1, v)) * alpha);

export interface MatrixProps {
  data: Mat;
  digits?: number;
  cellW?: number;
  cellH?: number;
  gap?: number;
  fontSize?: number;
  label?: string;
  labelSize?: number;
  shape?: boolean;
  rowLabels?: string[];
  colLabels?: string[];
  /** per-cell reveal 0..1 */
  reveal?: (i: number, j: number) => number;
  color?: CellColor;
  textColor?: (v: number, i: number, j: number) => string | undefined;
  /** per-row emphasis 0..1 (dims other rows) */
  rowFocus?: (i: number) => number;
  showValues?: boolean;
  /** font size of row/column labels (defaults 18 / 16) */
  axisLabelSize?: number;
  style?: React.CSSProperties;
}

export const Matrix: React.FC<MatrixProps> = ({
  data,
  digits = 2,
  cellW = 92,
  cellH = 58,
  gap = 6,
  fontSize = 22,
  label,
  labelSize = 44,
  shape = true,
  rowLabels,
  colLabels,
  reveal,
  color,
  textColor,
  rowFocus,
  showValues = true,
  axisLabelSize,
  style,
}) => {
  const rows = data.length;
  const cols = data[0].length;
  const bracket = (side: 'left' | 'right'): React.CSSProperties => ({
    position: 'absolute',
    top: -6,
    bottom: -6,
    width: 12,
    [side]: -16,
    border: `2px solid ${C.line2}`,
    [side === 'left' ? 'borderRight' : 'borderLeft']: 'none',
    borderRadius: side === 'left' ? '6px 0 0 6px' : '0 6px 6px 0',
  });
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18, ...style }}>
      {label !== undefined && (
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 14 }}>
          <Tex size={labelSize}>{label}</Tex>
          {shape && (
            <span style={{ fontFamily: F.mono, fontSize: 16, color: C.dim }}>
              {rows}×{cols}
            </span>
          )}
        </div>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
        {rowLabels && (
          <div style={{ display: 'flex', flexDirection: 'column', gap, alignItems: 'flex-end' }}>
            {rowLabels.map((r, i) => (
              <div
                key={i}
                style={{
                  height: cellH,
                  display: 'flex',
                  alignItems: 'center',
                  fontFamily: F.mono,
                  fontSize: axisLabelSize ?? 18,
                  color: C.muted,
                  opacity: rowFocus ? 0.35 + 0.65 * rowFocus(i) : 1,
                }}
              >
                {r}
              </div>
            ))}
          </div>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {colLabels && (
            <div style={{ display: 'flex', gap, marginBottom: -2 }}>
              {colLabels.map((c, j) => (
                <div key={j} style={{ width: cellW, textAlign: 'center', fontFamily: F.mono, fontSize: axisLabelSize ?? 16, color: C.muted }}>
                  {c}
                </div>
              ))}
            </div>
          )}
          <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: `repeat(${cols}, ${cellW}px)`, gap }}>
            <div style={bracket('left')} />
            <div style={bracket('right')} />
            {data.map((row, i) =>
              row.map((v, j) => {
                const r = reveal ? reveal(i, j) : 1;
                const focus = rowFocus ? 0.3 + 0.7 * rowFocus(i) : 1;
                return (
                  <div
                    key={`${i}-${j}`}
                    style={{
                      height: cellH,
                      borderRadius: 8,
                      background: r > 0 ? color?.(v, i, j) ?? rgba(C.text, 0.04) : rgba(C.text, 0.025),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontFamily: F.mono,
                      fontSize,
                      color: textColor?.(v, i, j) ?? C.text,
                      opacity: (0.25 + 0.75 * r) * focus,
                      transform: `scale(${0.85 + 0.15 * r})`,
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {showValues && r > 0.02 ? <span style={{ opacity: r }}>{fmt(v, digits)}</span> : null}
                  </div>
                );
              }),
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/** Small "you'll build this" chip that names a site problem. */
export const ProblemChip: React.FC<{ title: string; progress: number }> = ({ title, progress }) => (
  <div
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 16,
      padding: '14px 24px',
      borderRadius: 999,
      border: `1px solid ${rgba(C.violetLight, 0.35)}`,
      background: rgba(C.violet, 0.12),
      opacity: progress,
      transform: `translateY(${(1 - progress) * 16}px)`,
    }}
  >
    <span style={{ fontFamily: F.mono, fontSize: 16, letterSpacing: '0.14em', color: C.violetLight }}>PROBLEM</span>
    <span style={{ fontFamily: F.body, fontSize: 26, fontWeight: 500, color: C.text }}>{title}</span>
  </div>
);

/** A right-pointing arrow with an optional label above it. */
export const Arrow: React.FC<{ width?: number; label?: string; progress?: number; color?: string }> = ({
  width = 90,
  label,
  progress = 1,
  color = C.dim,
}) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, opacity: progress }}>
    {label ? <Tex size={30} color={C.muted}>{label}</Tex> : null}
    <svg width={width} height={20} viewBox={`0 0 ${width} 20`}>
      <line x1={0} y1={10} x2={(width - 10) * progress} y2={10} stroke={color} strokeWidth={2.5} strokeLinecap="round" />
      <path d={`M${width - 14} 3 L${width - 2} 10 L${width - 14} 17`} fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" opacity={progress > 0.9 ? 1 : 0} />
    </svg>
  </div>
);

/** Absolutely-positioned layer that fades in/out. */
export const Layer: React.FC<{ opacity: number; children: React.ReactNode; style?: React.CSSProperties; y?: number }> = ({
  opacity,
  children,
  style,
  y = 0,
}) =>
  opacity <= 0.001 ? null : (
    <div style={{ position: 'absolute', inset: 0, opacity, transform: `translateY(${y}px)`, ...style }}>{children}</div>
  );
