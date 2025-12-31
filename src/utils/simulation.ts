import { ModelYear, ValuationParameters, ValuationResult, SimulationResult, YearlyMetric } from '../types/valuation';

const YEARS: ModelYear[] = [2025, 2026, 2027];

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function autoRevenueB(params: ValuationParameters, year: ModelYear): number {
  // deliveries in M, ASP in $K => revenue in $B
  return params.auto.deliveriesM[year] * params.auto.aspK[year];
}

function robotaxiFleetM(params: ValuationParameters, year: ModelYear): number {
  return (params.robotaxi.citiesCovered[year] * params.robotaxi.carsPerCity[year]) / 1_000_000;
}

function robotaxiRevenueB(params: ValuationParameters, year: ModelYear): number {
  // fleet in M, annual revenue per car in $K => $B
  return robotaxiFleetM(params, year) * params.robotaxi.annualRevenuePerCarK[year];
}

function optimusRevenueB(params: ValuationParameters, year: ModelYear): number {
  // units in M, price in $K => $B
  return params.optimus.unitsM[year] * params.optimus.priceK[year];
}

function segmentEbit(revenueB: number, grossMarginPct: number, opexPctOfRevenue: number): number {
  // EBIT approx = revenue * (gross margin - opex as % of revenue)
  const operatingMargin = (grossMarginPct - opexPctOfRevenue) / 100;
  return revenueB * operatingMargin;
}

function calculateYearlyFlows(params: ValuationParameters): SimulationResult[] {
  const results: SimulationResult[] = [];

  for (const year of YEARS) {
    // Existing business (operational -> revenue)
    const autoRev = autoRevenueB(params, year);
    const energyRev = params.energy.revenueB[year];
    const servicesRev = params.services.revenueB[year];

    const autoEbit = segmentEbit(autoRev, params.auto.grossMarginPct[year], params.auto.opexPctOfRevenue[year]);
    const energyEbit = segmentEbit(energyRev, params.energy.grossMarginPct[year], params.energy.opexPctOfRevenue[year]);
    const servicesEbit = segmentEbit(servicesRev, params.services.grossMarginPct[year], params.services.opexPctOfRevenue[year]);

    // New business (business drivers)
    const robotaxiRev = robotaxiRevenueB(params, year);
    let robotaxiEbit = segmentEbit(robotaxiRev, params.robotaxi.grossMarginPct[year], params.robotaxi.opexPctOfRevenue[year]);

    const optimusRev = optimusRevenueB(params, year);
    let optimusEbit = segmentEbit(optimusRev, params.optimus.grossMarginPct[year], params.optimus.opexPctOfRevenue[year]);

    // Apply success probabilities (expected value)
    robotaxiEbit *= params.robotaxi.probability / 100;
    optimusEbit *= params.optimus.probability / 100;

    const totalRevenue = autoRev + energyRev + servicesRev + robotaxiRev + optimusRev;
    const totalEbit = autoEbit + energyEbit + servicesEbit + robotaxiEbit + optimusEbit;

    const nopat = totalEbit * (1 - params.macro.taxRate / 100);
    const capex = totalRevenue * (params.macro.capexPctOfRevenue[year] / 100);
    const deltaWc = totalRevenue * (params.macro.workingCapitalPctOfRevenue[year] / 100);
    const fcf = nopat - capex - deltaWc;

    const period = year - 2024;
    const discountFactor = 1 / Math.pow(1 + params.macro.discountRate / 100, period);
    const discountedFcf = fcf * discountFactor;

    results.push({
      year,
      revenue: totalRevenue,
      ebit: totalEbit,
      fcf,
      discountedFcf,
      segmentBreakdown: {
        auto: autoEbit,
        energy: energyEbit,
        services: servicesEbit,
        robotaxi: robotaxiEbit,
        optimus: optimusEbit,
      },
    });
  }

  return results;
}

export function calculateValuation(params: ValuationParameters): ValuationResult {
  const projections = calculateYearlyFlows(params);
  
  const sumDiscountedFcf = projections.reduce((sum, p) => sum + p.discountedFcf, 0);
  
  // Terminal Value
  const lastFcf = projections[projections.length - 1].fcf;
  const terminalValue = (lastFcf * (1 + params.macro.terminalGrowthRate / 100)) /
                        ((params.macro.discountRate - params.macro.terminalGrowthRate) / 100);
  
  const discountFactorTerminal = 1 / Math.pow(1 + params.macro.discountRate / 100, 3);
  const discountedTerminalValue = terminalValue * discountFactorTerminal;

  const enterpriseValue = sumDiscountedFcf + discountedTerminalValue;
  
  const equityValue = enterpriseValue + params.macro.currentCash - params.macro.currentDebt;
  
  const dilutedShareCount = params.macro.shareCount * (1 + params.macro.elonCompDilution / 100);
  const sharePrice = equityValue / dilutedShareCount;

  return {
    enterpriseValue,
    equityValue,
    sharePrice,
    yearlyProjections: projections
  };
}

function perturbYearlyMultiply(metric: YearlyMetric, factor: number): YearlyMetric {
  return {
    2025: metric[2025] * factor,
    2026: metric[2026] * factor,
    2027: metric[2027] * factor,
  };
}

function perturbYearlyAdd(metric: YearlyMetric, delta: number): YearlyMetric {
  return {
    2025: metric[2025] + delta,
    2026: metric[2026] + delta,
    2027: metric[2027] + delta,
  };
}

export function runMonteCarlo(baseParams: ValuationParameters, iterations: number = 1000): ValuationResult {
  const prices: number[] = [];
  
  for (let i = 0; i < iterations; i++) {
    // Perturb parameters
    // We clone the params deeply enough for the yearly metrics
    const p = JSON.parse(JSON.stringify(baseParams)) as ValuationParameters;
    
    // Auto: deliveries & ASP volatility
    const deliveriesFactor = 1 + (Math.random() - 0.5) * 0.12;
    p.auto.deliveriesM = perturbYearlyMultiply(p.auto.deliveriesM, deliveriesFactor);

    const aspFactor = 1 + (Math.random() - 0.5) * 0.06;
    p.auto.aspK = perturbYearlyMultiply(p.auto.aspK, aspFactor);

    // Margin volatility (+/- 2% absolute)
    const gmDelta = (Math.random() - 0.5) * 4;
    p.auto.grossMarginPct = perturbYearlyAdd(p.auto.grossMarginPct, gmDelta);
    
    // Randomize New Business Success (Binary outcome based on probability)
    const robotaxiSuccess = Math.random() * 100 < p.robotaxi.probability;
    const optimusSuccess = Math.random() * 100 < p.optimus.probability;
    
    p.robotaxi.probability = robotaxiSuccess ? 100 : 0;
    p.optimus.probability = optimusSuccess ? 100 : 0;

    // Robotaxi: city/cars/revenue per car volatility (only matters if succeeds)
    const citiesFactor = 1 + (Math.random() - 0.5) * 0.2;
    p.robotaxi.citiesCovered = perturbYearlyMultiply(p.robotaxi.citiesCovered, citiesFactor);
    const carsFactor = 1 + (Math.random() - 0.5) * 0.25;
    p.robotaxi.carsPerCity = perturbYearlyMultiply(p.robotaxi.carsPerCity, carsFactor);
    const revCarFactor = 1 + (Math.random() - 0.5) * 0.25;
    p.robotaxi.annualRevenuePerCarK = perturbYearlyMultiply(p.robotaxi.annualRevenuePerCarK, revCarFactor);

    // Optimus: units/price volatility
    const unitsFactor = 1 + (Math.random() - 0.5) * 0.5;
    p.optimus.unitsM = perturbYearlyMultiply(p.optimus.unitsM, unitsFactor);
    const priceFactor = 1 + (Math.random() - 0.5) * 0.15;
    p.optimus.priceK = perturbYearlyMultiply(p.optimus.priceK, priceFactor);

    // Clamp obviously invalid values
    for (const y of YEARS) {
      p.auto.deliveriesM[y] = Math.max(0, p.auto.deliveriesM[y]);
      p.auto.aspK[y] = Math.max(0, p.auto.aspK[y]);
      p.auto.grossMarginPct[y] = clamp(p.auto.grossMarginPct[y], -20, 60);
      p.robotaxi.citiesCovered[y] = Math.max(0, p.robotaxi.citiesCovered[y]);
      p.robotaxi.carsPerCity[y] = Math.max(0, p.robotaxi.carsPerCity[y]);
      p.robotaxi.annualRevenuePerCarK[y] = Math.max(0, p.robotaxi.annualRevenuePerCarK[y]);
      p.optimus.unitsM[y] = Math.max(0, p.optimus.unitsM[y]);
      p.optimus.priceK[y] = Math.max(0, p.optimus.priceK[y]);
    }

    const result = calculateValuation(p);
    prices.push(result.sharePrice);
  }

  prices.sort((a, b) => a - b);
  
  const baseResult = calculateValuation(baseParams);
  
  return {
    ...baseResult,
    monteCarloDistribution: {
      min: prices[0],
      max: prices[prices.length - 1],
      median: prices[Math.floor(prices.length * 0.5)],
      p10: prices[Math.floor(prices.length * 0.1)],
      p90: prices[Math.floor(prices.length * 0.9)],
      values: prices
    }
  };
}
