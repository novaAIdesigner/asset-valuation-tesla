'use client';

import React from 'react';

export function NumberInput({
  label,
  value,
  onChange,
  unit,
  step,
  min,
  max,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  unit?: string;
  step?: number;
  min?: number;
  max?: number;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs text-slate-400">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="number"
          value={Number.isFinite(value) ? value : 0}
          onChange={(e) => onChange(Number(e.target.value))}
          step={step}
          min={min}
          max={max}
          className="w-full rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-sm text-slate-100 outline-none focus:border-blue-500"
        />
        {unit ? <span className="w-10 text-right text-xs text-slate-500">{unit}</span> : null}
      </div>
    </div>
  );
}
