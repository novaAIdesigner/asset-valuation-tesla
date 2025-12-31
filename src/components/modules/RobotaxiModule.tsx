'use client';

import React from 'react';
import type { RobotaxiAssumptions } from '@/types/valuation';
import { Panel } from '@/components/ui/Panel';
import { YearlyRow } from '@/components/ui/YearlyRow';
import { NumberInput } from '@/components/ui/NumberInput';

export function RobotaxiModule({
  value,
  onChange,
}: {
  value: RobotaxiAssumptions;
  onChange: (next: RobotaxiAssumptions) => void;
}) {
  const set = <K extends keyof RobotaxiAssumptions>(key: K, v: RobotaxiAssumptions[K]) => onChange({ ...value, [key]: v });

  return (
    <Panel
      title="Robotaxi（覆盖×车辆×单车收入）"
      description="覆盖城市数×每城车辆数=车队规模；车队×单车年收入=收入。成功概率用于刻画监管/技术不确定性。"
    >
      <div className="space-y-3">
        <YearlyRow label="Cities Covered" unit="count" value={value.citiesCovered} step={1} min={0} onChange={(v) => set('citiesCovered', v)} />
        <YearlyRow label="Cars per City" unit="cars" value={value.carsPerCity} step={100} min={0} onChange={(v) => set('carsPerCity', v)} />
        <YearlyRow label="Annual Revenue per Car" unit="$K" value={value.annualRevenuePerCarK} step={1} min={0} onChange={(v) => set('annualRevenuePerCarK', v)} />
        <YearlyRow label="Gross Margin" unit="%" value={value.grossMarginPct} step={0.1} onChange={(v) => set('grossMarginPct', v)} />
        <YearlyRow label="Opex % of Revenue" unit="%" value={value.opexPctOfRevenue} step={0.1} min={0} onChange={(v) => set('opexPctOfRevenue', v)} />
        <div className="pt-2">
          <NumberInput label="Success Probability" value={value.probability} onChange={(v) => set('probability', v)} unit="%" step={1} min={0} max={100} />
        </div>
      </div>
    </Panel>
  );
}
