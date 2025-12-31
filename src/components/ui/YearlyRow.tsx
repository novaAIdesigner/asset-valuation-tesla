'use client';

import React from 'react';
import type { ModelYear, YearlyMetric } from '@/types/valuation';

const YEARS: ModelYear[] = [2025, 2026, 2027];

export function YearlyRow({
  label,
  unit,
  value,
  step,
  min,
  max,
  onChange,
}: {
  label: string;
  unit?: string;
  value: YearlyMetric;
  step?: number;
  min?: number;
  max?: number;
  onChange: (next: YearlyMetric) => void;
}) {
  return (
    <div className="grid grid-cols-4 items-end gap-2">
      <div className="col-span-1">
        <div className="text-xs text-slate-400">{label}</div>
        {unit ? <div className="text-[11px] text-slate-500">{unit}</div> : null}
      </div>
      {YEARS.map((y) => (
        <div key={y} className="col-span-1">
          <div className="text-[11px] text-slate-500">{y}</div>
          <input
            type="number"
            value={Number.isFinite(value[y]) ? value[y] : 0}
            onChange={(e) => onChange({ ...value, [y]: Number(e.target.value) })}
            step={step}
            min={min}
            max={max}
            className="w-full rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-sm text-slate-100 outline-none focus:border-blue-500"
          />
        </div>
      ))}
    </div>
  );
}
