'use client';

import React from 'react';
import type { AutoAssumptions } from '@/types/valuation';
import { Panel } from '@/components/ui/Panel';
import { YearlyRow } from '@/components/ui/YearlyRow';

export function AutoModule({
  value,
  onChange,
}: {
  value: AutoAssumptions;
  onChange: (next: AutoAssumptions) => void;
}) {
  const set = <K extends keyof AutoAssumptions>(key: K, v: AutoAssumptions[K]) => onChange({ ...value, [key]: v });

  return (
    <Panel
      title="汽车业务（运营驱动）"
      description="交付量×ASP = 收入；毛利率与Opex占比决定经营利润。"
    >
      <div className="space-y-3">
        <YearlyRow label="Deliveries" unit="M units" value={value.deliveriesM} step={0.01} min={0} onChange={(v) => set('deliveriesM', v)} />
        <YearlyRow label="ASP" unit="$K" value={value.aspK} step={0.5} min={0} onChange={(v) => set('aspK', v)} />
        <YearlyRow label="Gross Margin" unit="%" value={value.grossMarginPct} step={0.1} onChange={(v) => set('grossMarginPct', v)} />
        <YearlyRow label="Opex % of Revenue" unit="%" value={value.opexPctOfRevenue} step={0.1} min={0} onChange={(v) => set('opexPctOfRevenue', v)} />
      </div>
    </Panel>
  );
}
