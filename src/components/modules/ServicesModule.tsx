'use client';

import React from 'react';
import type { ServicesAssumptions } from '@/types/valuation';
import { Panel } from '@/components/ui/Panel';
import { YearlyRow } from '@/components/ui/YearlyRow';

export function ServicesModule({
  value,
  onChange,
}: {
  value: ServicesAssumptions;
  onChange: (next: ServicesAssumptions) => void;
}) {
  const set = <K extends keyof ServicesAssumptions>(key: K, v: ServicesAssumptions[K]) => onChange({ ...value, [key]: v });

  return (
    <Panel title="服务与其他" description="当前简化为收入驱动（可后续拆分软件/金融/服务）。">
      <div className="space-y-3">
        <YearlyRow label="Revenue" unit="$B" value={value.revenueB} step={0.1} min={0} onChange={(v) => set('revenueB', v)} />
        <YearlyRow label="Gross Margin" unit="%" value={value.grossMarginPct} step={0.1} onChange={(v) => set('grossMarginPct', v)} />
        <YearlyRow label="Opex % of Revenue" unit="%" value={value.opexPctOfRevenue} step={0.1} min={0} onChange={(v) => set('opexPctOfRevenue', v)} />
      </div>
    </Panel>
  );
}
