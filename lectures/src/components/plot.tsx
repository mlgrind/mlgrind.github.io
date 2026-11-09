// Small chart primitives shared by lectures (bar charts and panels).
import React from 'react';
import { C, F, rgba } from '../theme';
import { fmt } from '../lib/math';

export interface BarsProps {
  values: number[];
  labels?: string[];
  width: number;
  height: number;
  /** value mapped to full height (default: max |value|) */
  max?: number;
  /** when there are negative values, the zero line sits at this fraction from the top */
  zeroAt?: number;
  color?: (v: number, i: number) => string;
  /** per-bar opacity 0..1 */
  alpha?: (i: number) => number;
  showValues?: boolean;
  digits?: number;
  valueSize?: number;
  labelSize?: number;
  gap?: number;
  /** per-bar reveal 0..1 (grows the bar) */
  reveal?: (i: number) => number;
  /** label colour per bar */
  labelColor?: (i: number) => string;
}

/** Vertical bar chart with value labels above and category labels below. */
export const Bars: React.FC<BarsProps> = ({
  values,
  labels,
  width,
  height,
  max,
  zeroAt,
  color = () => C.violet,
  alpha = () => 1,
  showValues = true,
  digits = 2,
  valueSize = 22,
  labelSize = 24,
  gap = 14,
  reveal = () => 1,
  labelColor = () => C.muted,
}) => {
  const n = values.length;
  const bw = (width - gap * (n - 1)) / n;
  const hasNeg = values.some((v) => v < 0);
  const z = hasNeg ? (zeroAt ?? 0.6) : 1;
  const top = valueSize + 12;
  const plotH = height - top;
  const m = max ?? Math.max(1e-9, ...values.map(Math.abs));
  const zeroY = top + plotH * z;
  return (
    <div style={{ position: 'relative', width, height: height + (labels ? labelSize + 22 : 0) }}>
      {values.map((v, i) => {
        const r = reveal(i);
        const room = v >= 0 ? plotH * z : plotH * (1 - z);
        const h = Math.max(v === 0 ? 0 : 2, (Math.min(Math.abs(v), m) / m) * room * r);
        const x = i * (bw + gap);
        const y = v >= 0 ? zeroY - h : zeroY;
        const a = alpha(i);
        return (
          <React.Fragment key={i}>
            <div
              style={{
                position: 'absolute',
                left: x,
                top: y,
                width: bw,
                height: h,
                borderRadius: v >= 0 ? '6px 6px 0 0' : '0 0 6px 6px',
                background: color(v, i),
                opacity: a,
              }}
            />
            {showValues && (
              <div
                style={{
                  position: 'absolute',
                  left: x - 10,
                  width: bw + 20,
                  top: v >= 0 ? y - valueSize - 8 : zeroY - valueSize - 8,
                  textAlign: 'center',
                  fontFamily: F.mono,
                  fontSize: valueSize,
                  color: C.text,
                  opacity: Math.max(0.25, a) * r,
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {fmt(v, digits)}
              </div>
            )}
            {labels && (
              <div
                style={{
                  position: 'absolute',
                  left: x - 12,
                  width: bw + 24,
                  top: height + 14,
                  textAlign: 'center',
                  fontFamily: F.mono,
                  fontSize: labelSize,
                  color: labelColor(i),
                  opacity: Math.max(0.35, a),
                  whiteSpace: 'nowrap',
                }}
              >
                {labels[i]}
              </div>
            )}
          </React.Fragment>
        );
      })}
      <div style={{ position: 'absolute', left: -8, right: -8, top: zeroY, height: 2, background: C.line2 }} />
    </div>
  );
};

/** Rounded panel with an optional small title. */
export const Panel: React.FC<{
  title?: React.ReactNode;
  children: React.ReactNode;
  style?: React.CSSProperties;
  accent?: string;
}> = ({ title, children, style, accent = C.muted }) => (
  <div
    style={{
      borderRadius: 22,
      border: `1px solid ${C.line}`,
      background: rgba(C.panel, 0.75),
      padding: '28px 34px',
      ...style,
    }}
  >
    {title !== undefined && (
      <div style={{ fontFamily: F.body, fontSize: 26, fontWeight: 500, color: accent, marginBottom: 22 }}>{title}</div>
    )}
    {children}
  </div>
);

/** Big monospace readout such as "kept = 3". */
export const Readout: React.FC<{ children: React.ReactNode; color?: string; size?: number; style?: React.CSSProperties }> = ({
  children,
  color = C.text,
  size = 30,
  style,
}) => <div style={{ fontFamily: F.mono, fontSize: size, color, fontVariantNumeric: 'tabular-nums', ...style }}>{children}</div>;
