'use client';

import React from 'react';
import type { Scenario } from '@/types/valuation';
import { Panel } from '@/components/ui/Panel';
import { ResponsiveContainer, BarChart, Bar, XAxis, Tooltip } from 'recharts';

export function ScenarioSelector({
  scenarios,
  selectedId,
  onSelect,
  previewDataByScenario,
}: {
  scenarios: Scenario[];
  selectedId: Scenario['id'];
  onSelect: (id: Scenario['id']) => void;
  previewDataByScenario: Record<string, { year: string; value: number }[]>;
}) {
  return (
    <Panel title="预设条件（可一键切换）" description="每套假设包含说明、简图与参考文章；切换后你可继续逐项微调。">
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        {scenarios.map((s) => {
          const active = s.id === selectedId;
          const preview = previewDataByScenario[s.id] ?? [];
          return (
            <button
              key={s.id}
              onClick={() => onSelect(s.id)}
              className={
                'text-left rounded-xl border p-4 transition-colors ' +
                (active
                  ? 'border-blue-500 bg-slate-950/60'
                  : 'border-slate-800 bg-slate-950/30 hover:border-slate-700')
              }
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-xs text-slate-400">{s.shortLabel}</div>
                  <div className="text-sm font-semibold text-slate-100">{s.name}</div>
                </div>
                <div className={active ? 'text-xs text-blue-400' : 'text-xs text-slate-500'}>
                  {active ? '已选中' : '选择'}
                </div>
              </div>

              <p className="mt-2 line-clamp-3 text-xs text-slate-400">{s.description}</p>

              <div className="mt-3 h-16">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={preview} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                    <XAxis dataKey="year" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0b1220', borderColor: '#334155', color: '#f1f5f9' }}
                      labelStyle={{ color: '#cbd5e1' }}
                      itemStyle={{ color: '#f1f5f9' }}
                      formatter={(v) => [`$${Number(v).toFixed(0)}B`, 'Total Rev']}
                    />
                    <Bar dataKey="value" fill={active ? '#3b82f6' : '#475569'} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-3 space-y-1">
                {s.assumptionsNotes.slice(0, 2).map((n) => (
                  <div key={n} className="text-[11px] text-slate-500">
                    • {n}
                  </div>
                ))}
              </div>

              <div className="mt-3 space-y-1">
                {s.references.slice(0, 2).map((r) => (
                  <a
                    key={r.url}
                    href={r.url}
                    target="_blank"
                    rel="noreferrer"
                    className="block text-[11px] text-slate-400 underline decoration-slate-700 hover:text-slate-200"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {r.title}
                  </a>
                ))}
              </div>
            </button>
          );
        })}
      </div>
    </Panel>
  );
}
