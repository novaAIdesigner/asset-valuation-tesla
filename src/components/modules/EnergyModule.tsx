'use client';

import React from 'react';
import type { EnergyAssumptions } from '@/types/valuation';
import { Panel } from '@/components/ui/Panel';
import { YearlyRow } from '@/components/ui/YearlyRow';

export function EnergyModule({
  value,
  onChange,
}: {
  value: EnergyAssumptions;
  onChange: (next: EnergyAssumptions) => void;
}) {
  const set = <K extends keyof EnergyAssumptions>(key: K, v: EnergyAssumptions[K]) => onChange({ ...value, [key]: v });

  return (
    <Panel title="能源业务" description="当前简化为收入驱动（可后续细化为装机量×单价）。">
      <div className="space-y-3">
        <YearlyRow label="Revenue" unit="$B" value={value.revenueB} step={0.1} min={0} onChange={(v) => set('revenueB', v)} />
        <YearlyRow label="Gross Margin" unit="%" value={value.grossMarginPct} step={0.1} onChange={(v) => set('grossMarginPct', v)} />
        <YearlyRow label="Opex % of Revenue" unit="%" value={value.opexPctOfRevenue} step={0.1} min={0} onChange={(v) => set('opexPctOfRevenue', v)} />
      </div>
    </Panel>
  );
}
