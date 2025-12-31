'use client';

import React from 'react';
import type { OptimusAssumptions } from '@/types/valuation';
import { Panel } from '@/components/ui/Panel';
import { YearlyRow } from '@/components/ui/YearlyRow';
import { NumberInput } from '@/components/ui/NumberInput';

export function OptimusModule({
  value,
  onChange,
}: {
  value: OptimusAssumptions;
  onChange: (next: OptimusAssumptions) => void;
}) {
  const set = <K extends keyof OptimusAssumptions>(key: K, v: OptimusAssumptions[K]) => onChange({ ...value, [key]: v });

  return (
    <Panel title="Optimus（产量×单价）" description="单位数×单价=收入。成功概率用于刻画量产/需求不确定性。">
      <div className="space-y-3">
        <YearlyRow label="Units" unit="M units" value={value.unitsM} step={0.001} min={0} onChange={(v) => set('unitsM', v)} />
        <YearlyRow label="Price" unit="$K" value={value.priceK} step={1} min={0} onChange={(v) => set('priceK', v)} />
        <YearlyRow label="Gross Margin" unit="%" value={value.grossMarginPct} step={0.1} onChange={(v) => set('grossMarginPct', v)} />
        <YearlyRow label="Opex % of Revenue" unit="%" value={value.opexPctOfRevenue} step={0.1} min={0} onChange={(v) => set('opexPctOfRevenue', v)} />
        <div className="pt-2">
          <NumberInput label="Success Probability" value={value.probability} onChange={(v) => set('probability', v)} unit="%" step={1} min={0} max={100} />
        </div>
      </div>
    </Panel>
  );
}
