export type ModelYear = 2025 | 2026 | 2027;

export interface YearlyMetric {
  2025: number;
  2026: number;
  2027: number;
}

export interface MacroAssumptions {
  discountRate: number; // %
  terminalGrowthRate: number; // %
  taxRate: number; // %
  capexPctOfRevenue: YearlyMetric; // %
  workingCapitalPctOfRevenue: YearlyMetric; // %
  shareCount: number; // Billions
  currentCash: number; // Billions
  currentDebt: number; // Billions
  elonCompDilution: number; // % dilution if targets met
}

export interface AutoAssumptions {
  deliveriesM: YearlyMetric; // Millions of vehicles
  aspK: YearlyMetric; // Average selling price ($K)
  grossMarginPct: YearlyMetric; // %
  opexPctOfRevenue: YearlyMetric; // % (R&D + SG&A allocated)
}

export interface EnergyAssumptions {
  revenueB: YearlyMetric; // Billions
  grossMarginPct: YearlyMetric; // %
  opexPctOfRevenue: YearlyMetric; // %
}

export interface ServicesAssumptions {
  revenueB: YearlyMetric; // Billions
  grossMarginPct: YearlyMetric; // %
  opexPctOfRevenue: YearlyMetric; // %
}

export interface RobotaxiAssumptions {
  citiesCovered: YearlyMetric; // Count of cities
  carsPerCity: YearlyMetric; // Vehicles per city
  annualRevenuePerCarK: YearlyMetric; // $K per car per year
  grossMarginPct: YearlyMetric; // %
  opexPctOfRevenue: YearlyMetric; // %
  probability: number; // % chance of success
}

export interface OptimusAssumptions {
  unitsM: YearlyMetric; // Millions of units
  priceK: YearlyMetric; // $K per unit
  grossMarginPct: YearlyMetric; // %
  opexPctOfRevenue: YearlyMetric; // %
  probability: number; // % chance of success
}

export interface ValuationParameters {
  macro: MacroAssumptions;
  auto: AutoAssumptions;
  energy: EnergyAssumptions;
  services: ServicesAssumptions;
  robotaxi: RobotaxiAssumptions;
  optimus: OptimusAssumptions;
}

export interface Scenario {
  id: 'base' | 'analyst' | 'elon';
  name: string;
  shortLabel: string;
  description: string;
  assumptionsNotes: string[];
  references: { title: string; url: string }[];
  params: ValuationParameters;
}

export interface SimulationResult {
  year: number;
  revenue: number;
  ebit: number;
  fcf: number;
  discountedFcf: number;
  segmentBreakdown: {
    auto: number;
    energy: number;
    services: number;
    robotaxi: number;
    optimus: number;
  };
}

export interface ValuationResult {
  enterpriseValue: number;
  equityValue: number;
  sharePrice: number;
  yearlyProjections: SimulationResult[];
  monteCarloDistribution?: {
    min: number;
    max: number;
    median: number;
    p10: number;
    p90: number;
    values: number[];
  };
}

const BASE_PARAMS: ValuationParameters = {
  macro: {
    discountRate: 10,
    terminalGrowthRate: 3,
    taxRate: 21,
    capexPctOfRevenue: { 2025: 6, 2026: 6, 2027: 6 },
    workingCapitalPctOfRevenue: { 2025: 1, 2026: 1, 2027: 1 },
    shareCount: 3.19,
    currentCash: 29,
    currentDebt: 5,
    elonCompDilution: 5,
  },
  auto: {
    deliveriesM: { 2025: 2.1, 2026: 2.4, 2027: 2.8 },
    aspK: { 2025: 43, 2026: 42, 2027: 41 },
    grossMarginPct: { 2025: 18, 2026: 19, 2027: 20 },
    opexPctOfRevenue: { 2025: 8, 2026: 8, 2027: 8 },
  },
  energy: {
    revenueB: { 2025: 12, 2026: 16, 2027: 22 },
    grossMarginPct: { 2025: 18, 2026: 20, 2027: 22 },
    opexPctOfRevenue: { 2025: 6, 2026: 6, 2027: 6 },
  },
  services: {
    revenueB: { 2025: 10, 2026: 12, 2027: 15 },
    grossMarginPct: { 2025: 30, 2026: 32, 2027: 34 },
    opexPctOfRevenue: { 2025: 20, 2026: 20, 2027: 20 },
  },
  robotaxi: {
    citiesCovered: { 2025: 0, 2026: 5, 2027: 25 },
    carsPerCity: { 2025: 0, 2026: 1000, 2027: 8000 },
    annualRevenuePerCarK: { 2025: 0, 2026: 35, 2027: 30 },
    grossMarginPct: { 2025: 0, 2026: 45, 2027: 50 },
    opexPctOfRevenue: { 2025: 0, 2026: 15, 2027: 12 },
    probability: 20,
  },
  optimus: {
    unitsM: { 2025: 0, 2026: 0.001, 2027: 0.02 },
    priceK: { 2025: 0, 2026: 50, 2027: 35 },
    grossMarginPct: { 2025: 0, 2026: 20, 2027: 30 },
    opexPctOfRevenue: { 2025: 0, 2026: 25, 2027: 18 },
    probability: 10,
  },
};

export const SCENARIOS: Scenario[] = [
  {
    id: 'base',
    name: '基本假设（业务驱动）',
    shortLabel: 'Base',
    description: '从实际业务出发：汽车=交付量×ASP×毛利；Robotaxi=覆盖城市×每城车辆×每车年收入。新业务以较低成功率计入期望值。',
    assumptionsNotes: [
      '汽车：交付量温和增长，ASP小幅下行，毛利逐步修复。',
      'Robotaxi/Optimus：按“覆盖/产量×单体经济”建模，并带成功概率。',
      'FCF：EBIT(1-T)后扣CapEx与营运资本占比（可逐年调整）。'
    ],
    references: [
      { title: 'Tesla Investor Relations', url: 'https://ir.tesla.com/' },
      { title: 'Tesla Form 10-K (SEC search)', url: 'https://www.sec.gov/edgar/search/' },
    ],
    params: BASE_PARAMS,
  },
  {
    id: 'analyst',
    name: '分析师假设（更高渗透）',
    shortLabel: 'Analyst',
    description: '更偏向“分析师/研报”叙事：能源与服务更强，Robotaxi更快扩城更快放量，但仍保留不确定性。',
    assumptionsNotes: [
      '能源：装机扩张更快，毛利更快改善。',
      'Robotaxi：更快覆盖更多城市、更高每车年收入（利用率更高）。',
      '仍使用成功概率，避免把不确定性当成确定现金流。'
    ],
    references: [
      { title: 'Ark Invest Tesla Model', url: 'https://ark-invest.com/articles/valuation-models/ark-tesla-price-target-2029/' },
      { title: 'Seeking Alpha (estimates hub)', url: 'https://seekingalpha.com/symbol/TSLA/earnings' },
    ],
    params: {
      ...BASE_PARAMS,
      energy: {
        revenueB: { 2025: 14, 2026: 20, 2027: 28 },
        grossMarginPct: { 2025: 20, 2026: 22, 2027: 24 },
        opexPctOfRevenue: { 2025: 6, 2026: 6, 2027: 6 },
      },
      robotaxi: {
        citiesCovered: { 2025: 0, 2026: 10, 2027: 60 },
        carsPerCity: { 2025: 0, 2026: 1500, 2027: 12000 },
        annualRevenuePerCarK: { 2025: 0, 2026: 45, 2027: 40 },
        grossMarginPct: { 2025: 0, 2026: 50, 2027: 55 },
        opexPctOfRevenue: { 2025: 0, 2026: 14, 2027: 10 },
        probability: 40,
      },
    },
  },
  {
    id: 'elon',
    name: 'Elon 薪酬/对赌假设（更激进）',
    shortLabel: 'Elon',
    description: '更激进的增长与新业务落地假设，并体现达标时的潜在稀释。用于压力测试“高增长+更大稀释”的净效应。',
    assumptionsNotes: [
      '汽车交付更快增长，毛利回升更快。',
      'Robotaxi/Optimus成功概率更高（但你可以调回更保守）。',
      '稀释上调用于模拟“对赌/激励达标”情景。'
    ],
    references: [
      { title: '2018 CEO Performance Award (SEC)', url: 'https://www.sec.gov/Archives/edgar/data/1318605/000119312518035345/d524719ddef14a.htm' },
      { title: 'Growth target statement (CNBC)', url: 'https://www.cnbc.com/2021/01/27/tesla-says-it-expects-50percent-growth-in-deliveries-in-2021.html' },
    ],
    params: {
      ...BASE_PARAMS,
      macro: {
        ...BASE_PARAMS.macro,
        elonCompDilution: 12,
      },
      auto: {
        deliveriesM: { 2025: 2.4, 2026: 3.0, 2027: 3.8 },
        aspK: { 2025: 44, 2026: 43, 2027: 42 },
        grossMarginPct: { 2025: 20, 2026: 22, 2027: 24 },
        opexPctOfRevenue: { 2025: 8, 2026: 8, 2027: 8 },
      },
      robotaxi: {
        citiesCovered: { 2025: 0, 2026: 20, 2027: 120 },
        carsPerCity: { 2025: 0, 2026: 2000, 2027: 15000 },
        annualRevenuePerCarK: { 2025: 0, 2026: 55, 2027: 50 },
        grossMarginPct: { 2025: 0, 2026: 55, 2027: 60 },
        opexPctOfRevenue: { 2025: 0, 2026: 12, 2027: 9 },
        probability: 60,
      },
      optimus: {
        unitsM: { 2025: 0, 2026: 0.01, 2027: 0.2 },
        priceK: { 2025: 0, 2026: 45, 2027: 30 },
        grossMarginPct: { 2025: 0, 2026: 25, 2027: 35 },
        opexPctOfRevenue: { 2025: 0, 2026: 20, 2027: 14 },
        probability: 50,
      },
    },
  },
];

export interface HistoricalYear {
  year: number;
  revenue: number;
  ebit: number;
  deliveries?: number; // Millions
}

export const HISTORICAL_DATA: HistoricalYear[] = [
  { year: 2022, revenue: 81.5, ebit: 13.7, deliveries: 1.31 },
  { year: 2023, revenue: 96.8, ebit: 8.9, deliveries: 1.81 },
  { year: 2024, revenue: 98.5, ebit: 6.5, deliveries: 1.80 }, // Est
];

export const MARKET_REFERENCE = {
  sharePrice: 415, // Reference price (approx late 2024/2025 high)
  marketCap: 1320, // Billions
  date: '2024-12-31',
};
