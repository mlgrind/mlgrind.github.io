import React from 'react';
import { C, F, rgba } from '../../theme';
import { fmt } from '../../lib/math';
import { Tex } from '../../components/ui';

/** A labelled row of vector entries, coloured by sign/magnitude (or as a gate in [0, 1]). */
export const VecRow: React.FC<{
  label: string;
  v: number[];
  p?: number;
  gate?: boolean;
  hue?: string;
  note?: string;
  highlight?: number;
  cell?: number;
}> = ({ label, v, p = 1, gate = false, hue = C.violet, note, highlight = 0, cell = 92 }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 22, opacity: p, transform: `translateX(${(1 - p) * -16}px)` }}>
    <div style={{ width: 130, textAlign: 'right' }}>
      <Tex size={40} color={highlight > 0.5 ? hue : C.text}>{label}</Tex>
    </div>
    <div style={{ display: 'flex', gap: 6, padding: 4, borderRadius: 12, boxShadow: `0 0 0 ${highlight * 3}px ${rgba(hue, 0.9)}` }}>
      {v.map((x, k) => (
        <div
          key={k}
          style={{
            width: cell,
            height: 54,
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: F.mono,
            fontSize: 24,
            color: C.text,
            background: gate ? rgba(hue, 0.08 + 0.7 * x) : rgba(x >= 0 ? C.violet : C.teal, 0.1 + Math.min(1, Math.abs(x)) * 0.55),
          }}
        >
          {fmt(x, 2)}
        </div>
      ))}
    </div>
    {note && <div style={{ fontFamily: F.body, fontSize: 24, color: C.muted, width: 300 }}>{note}</div>}
  </div>
);
