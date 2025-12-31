'use client';

import React from 'react';
import type { MacroAssumptions, YearlyMetric } from '@/types/valuation';
import { Panel } from '@/components/ui/Panel';
import { NumberInput } from '@/components/ui/NumberInput';
import { YearlyRow } from '@/components/ui/YearlyRow';

export function MacroPanel({
  value,
  onChange,
}: {
  value: MacroAssumptions;
  onChange: (next: MacroAssumptions) => void;
}) {
  const set = <K extends keyof MacroAssumptions>(key: K, v: MacroAssumptions[K]) => onChange({ ...value, [key]: v });

  return (
    <Panel
      title="宏观经济 / 市场假设"
      description="折现率、税率、CapEx与营运资本占比（逐年可调），以及现金/债务/股本与潜在稀释。"
    >
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <NumberInput label="Discount Rate (WACC)" value={value.discountRate} onChange={(v) => set('discountRate', v)} unit="%" step={0.1} />
        <NumberInput label="Terminal Growth" value={value.terminalGrowthRate} onChange={(v) => set('terminalGrowthRate', v)} unit="%" step={0.1} />
        <NumberInput label="Tax Rate" value={value.taxRate} onChange={(v) => set('taxRate', v)} unit="%" step={0.1} />
        <NumberInput label="Elon Dilution (if hit)" value={value.elonCompDilution} onChange={(v) => set('elonCompDilution', v)} unit="%" step={0.1} />
        <NumberInput label="Share Count" value={value.shareCount} onChange={(v) => set('shareCount', v)} unit="B" step={0.01} />
        <NumberInput label="Cash" value={value.currentCash} onChange={(v) => set('currentCash', v)} unit="$B" step={0.1} />
        <NumberInput label="Debt" value={value.currentDebt} onChange={(v) => set('currentDebt', v)} unit="$B" step={0.1} />
      </div>

      <div className="mt-4 space-y-3">
        <YearlyRow
          label="CapEx % of Revenue"
          unit="%"
          value={value.capexPctOfRevenue}
          step={0.1}
          onChange={(v) => set('capexPctOfRevenue', v as YearlyMetric)}
        />
        <YearlyRow
          label="ΔWorking Capital % of Revenue"
          unit="%"
          value={value.workingCapitalPctOfRevenue}
          step={0.1}
          onChange={(v) => set('workingCapitalPctOfRevenue', v as YearlyMetric)}
        />
      </div>
    </Panel>
  );
}
