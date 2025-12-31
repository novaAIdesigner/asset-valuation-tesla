'use client';

import React, { useMemo, useState, useEffect } from 'react';
import type { ValuationParameters, ValuationResult, Scenario } from '../types/valuation';
import { SCENARIOS, HISTORICAL_DATA, MARKET_REFERENCE } from '../types/valuation';
import { calculateValuation, runMonteCarlo } from '../utils/simulation';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine } from 'recharts';
import { Activity, RefreshCw, TrendingUp, AlertTriangle } from 'lucide-react';

import { ScenarioSelector } from './ScenarioSelector';
import { MacroPanel } from './modules/MacroPanel';
import { AutoModule } from './modules/AutoModule';
import { EnergyModule } from './modules/EnergyModule';
import { ServicesModule } from './modules/ServicesModule';
import { RobotaxiModule } from './modules/RobotaxiModule';
import { OptimusModule } from './modules/OptimusModule';

export default function ValuationSimulator() {
  const [scenarioId, setScenarioId] = useState<Scenario['id']>('base');
  const [params, setParams] = useState<ValuationParameters>(() => JSON.parse(JSON.stringify(SCENARIOS[0].params)));
  const [result, setResult] = useState<ValuationResult>(() => calculateValuation(SCENARIOS[0].params));
  const [isMonteCarloRunning, setIsMonteCarloRunning] = useState(false);
  const [mcIterations, setMcIterations] = useState(2000);

  useEffect(() => {
    const res = calculateValuation(params);
    setResult(res);
  }, [params]);

  useEffect(() => {
    const next = SCENARIOS.find((s) => s.id === scenarioId)?.params;
    if (!next) return;
    setParams(JSON.parse(JSON.stringify(next)) as ValuationParameters);
  }, [scenarioId]);

  const handleRunMonteCarlo = async () => {
    setIsMonteCarloRunning(true);
    // Allow UI to update
    setTimeout(() => {
      const res = runMonteCarlo(params, mcIterations);
      setResult(res);
      setIsMonteCarloRunning(false);
    }, 100);
  };

  const combinedChartData = [
    ...HISTORICAL_DATA.map((h) => ({
      year: h.year,
      Historical: h.ebit,
      Auto: 0,
      Energy: 0,
      Services: 0,
      Robotaxi: 0,
      Optimus: 0,
    })),
    ...result.yearlyProjections.map((p) => ({
      year: p.year,
      Historical: 0,
      Auto: p.segmentBreakdown.auto,
      Energy: p.segmentBreakdown.energy,
      Services: p.segmentBreakdown.services,
      Robotaxi: p.segmentBreakdown.robotaxi,
      Optimus: p.segmentBreakdown.optimus,
    })),
  ];

  const previewDataByScenario = useMemo(() => {
    const byId: Record<string, { year: string; value: number }[]> = {};
    for (const s of SCENARIOS) {
      const p = s.params;
      const d = [2025, 2026, 2027].map((y) => {
        const autoRev = p.auto.deliveriesM[y as 2025] * p.auto.aspK[y as 2025];
        const robotaxiFleetM = (p.robotaxi.citiesCovered[y as 2025] * p.robotaxi.carsPerCity[y as 2025]) / 1_000_000;
        const robotaxiRev = robotaxiFleetM * p.robotaxi.annualRevenuePerCarK[y as 2025];
        const optimusRev = p.optimus.unitsM[y as 2025] * p.optimus.priceK[y as 2025];
        const total = autoRev + p.energy.revenueB[y as 2025] + p.services.revenueB[y as 2025] + robotaxiRev + optimusRev;
        return { year: String(y), value: total };
      });
      byId[s.id] = d;
    }
    return byId;
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-7xl p-6">
        <header className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-white flex items-center gap-3">
              <Activity className="text-blue-500" />
              Tesla 市值模拟器（DCF + Monte Carlo）
            </h1>
            <p className="mt-1 text-sm text-slate-400">2025-2027 业务驱动假设 → 现金流折现 → 估值分布</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-lg border border-slate-800 bg-slate-950/40 px-3 py-2">
              <div className="text-[11px] text-slate-500">Monte Carlo</div>
              <input
                type="number"
                value={mcIterations}
                min={200}
                step={100}
                onChange={(e) => setMcIterations(Number(e.target.value))}
                className="w-28 bg-transparent text-sm text-slate-100 outline-none"
              />
            </div>
            <button
              onClick={handleRunMonteCarlo}
              disabled={isMonteCarloRunning}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${isMonteCarloRunning ? 'animate-spin' : ''}`} />
              运行模拟
            </button>
          </div>
        </header>

        {/* Top: Macro + Scenarios */}
        <div className="space-y-4">
          <ScenarioSelector
            scenarios={SCENARIOS}
            selectedId={scenarioId}
            onSelect={setScenarioId}
            previewDataByScenario={previewDataByScenario}
          />
          <MacroPanel value={params.macro} onChange={(macro) => setParams((p) => ({ ...p, macro }))} />
        </div>

        {/* Middle: Business modules */}
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          <AutoModule value={params.auto} onChange={(auto) => setParams((p) => ({ ...p, auto }))} />
          <EnergyModule value={params.energy} onChange={(energy) => setParams((p) => ({ ...p, energy }))} />
          <ServicesModule value={params.services} onChange={(services) => setParams((p) => ({ ...p, services }))} />
          <RobotaxiModule value={params.robotaxi} onChange={(robotaxi) => setParams((p) => ({ ...p, robotaxi }))} />
          <OptimusModule value={params.optimus} onChange={(optimus) => setParams((p) => ({ ...p, optimus }))} />
        </div>

        {/* Bottom: Simulation + Results */}
        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
            <div className="flex items-center justify-between">
              <div className="text-xs text-slate-400">DCF 估算股价</div>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span>Ref: ${MARKET_REFERENCE.sharePrice}</span>
              </div>
            </div>
            <div className="mt-1 flex items-baseline gap-3">
              <div className="text-4xl font-semibold text-green-400">${result.sharePrice.toFixed(2)}</div>
              <div
                className={`flex items-center text-sm font-medium ${
                  result.sharePrice >= MARKET_REFERENCE.sharePrice ? 'text-green-500' : 'text-red-400'
                }`}
              >
                {result.sharePrice >= MARKET_REFERENCE.sharePrice ? (
                  <TrendingUp className="mr-1 h-3 w-3" />
                ) : (
                  <AlertTriangle className="mr-1 h-3 w-3" />
                )}
                {((result.sharePrice / MARKET_REFERENCE.sharePrice - 1) * 100).toFixed(1)}%
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-slate-800 bg-slate-950/40 p-3">
                <div className="text-[11px] text-slate-500">Enterprise Value</div>
                <div className="text-lg font-semibold text-slate-100">${(result.enterpriseValue / 1000).toFixed(2)}T</div>
              </div>
              <div className="rounded-lg border border-slate-800 bg-slate-950/40 p-3">
                <div className="text-[11px] text-slate-500">2027 Revenue</div>
                <div className="text-lg font-semibold text-slate-100">
                  ${result.yearlyProjections[2].revenue.toFixed(0)}B
                </div>
              </div>
            </div>

            {result.monteCarloDistribution ? (
              <div className="mt-4 space-y-2">
                <div className="text-xs text-slate-400">Monte Carlo 分布（股价）</div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-lg border border-slate-800 bg-slate-950/40 p-3">
                    <div className="text-[11px] text-slate-500">P10</div>
                    <div className="text-lg font-semibold text-red-300">
                      ${result.monteCarloDistribution.p10.toFixed(2)}
                    </div>
                  </div>
                  <div className="rounded-lg border border-slate-800 bg-slate-950/40 p-3">
                    <div className="text-[11px] text-slate-500">Median</div>
                    <div className="text-lg font-semibold text-slate-100">
                      ${result.monteCarloDistribution.median.toFixed(2)}
                    </div>
                  </div>
                  <div className="rounded-lg border border-slate-800 bg-slate-950/40 p-3">
                    <div className="text-[11px] text-slate-500">P90</div>
                    <div className="text-lg font-semibold text-green-300">
                      ${result.monteCarloDistribution.p90.toFixed(2)}
                    </div>
                  </div>
                  <div className="rounded-lg border border-slate-800 bg-slate-950/40 p-3">
                    <div className="text-[11px] text-slate-500">Max</div>
                    <div className="text-lg font-semibold text-green-400">
                      ${result.monteCarloDistribution.max.toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-4 text-xs text-slate-500">点击“运行模拟”生成 Monte Carlo 分布。</div>
            )}
          </div>

          <div className="lg:col-span-2 rounded-xl border border-slate-800 bg-slate-900/60 p-5">
            <div className="mb-3 flex items-center justify-between">
              <div className="text-sm font-semibold text-slate-100">EBIT 贡献（$B）- 历史 vs 预测</div>
              <div className="text-xs text-slate-500">2022-2024为历史数据</div>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={combinedChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2a3a" />
                  <XAxis dataKey="year" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0b1220', borderColor: '#334155', color: '#f1f5f9' }}
                    labelStyle={{ color: '#cbd5e1' }}
                    itemStyle={{ color: '#f1f5f9' }}
                  />
                  <Legend />
                  <ReferenceLine
                    x="2024"
                    stroke="#64748b"
                    strokeDasharray="3 3"
                    label={{ value: 'Forecast >', position: 'insideTopRight', fill: '#64748b', fontSize: 12 }}
                  />
                  <Bar dataKey="Historical" stackId="a" fill="#475569" name="Historical EBIT" />
                  <Bar dataKey="Auto" stackId="a" fill="#3b82f6" />
                  <Bar dataKey="Energy" stackId="a" fill="#eab308" />
                  <Bar dataKey="Services" stackId="a" fill="#64748b" />
                  <Bar dataKey="Robotaxi" stackId="a" fill="#22c55e" />
                  <Bar dataKey="Optimus" stackId="a" fill="#a855f7" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
