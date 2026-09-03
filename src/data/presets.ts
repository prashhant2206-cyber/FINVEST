import { StrategyProfile, ScreeningFilters } from '../types';

export const DEFAULT_PILLARS = {
  businessQuality: 25,
  growth: 25,
  financialRisk: 25,
  valuation: 25,
};

export const DEFAULT_SUB_WEIGHTS = {
  quality: {
    roce: 30,
    roe: 25,
    operatingMargin: 20,
    fcfConversion: 15,
    interestCoverage: 10,
  },
  growth: {
    revenueCagr: 35,
    profitCagr: 35,
    epsCagr: 15,
    ebitdaGrowth: 15,
  },
  risk: {
    debtToEquity: 35,
    interestCoverage: 20,
    earningsVolatility: 15,
    cashFlowStability: 15,
    workingCapitalDays: 15,
  },
  valuation: {
    peRatio: 40,
    evEbitda: 25,
    pbRatio: 15,
    fcfYield: 20,
  },
};

export const DEFAULT_FILTERS: ScreeningFilters = {
  minRoce: 15,
  minRevenueCagr: 8,
  minProfitCagr: 10,
  maxDebtToEquity: 0.5,
  maxPeRatio: 60,
  minOperatingMargin: 12,
  minFcfYield: 1.0,
};

export const STRATEGY_PRESETS: StrategyProfile[] = [
  {
    id: 'balanced',
    name: 'Balanced Institutional',
    description: 'Equally balanced 25/25/25/25 multi-factor research priority combining high return on capital, steady compounding, robust balance sheet, and reasonable entry multiple.',
    isPreset: true,
    pillars: {
      businessQuality: 25,
      growth: 25,
      financialRisk: 25,
      valuation: 25,
    },
    subWeights: DEFAULT_SUB_WEIGHTS,
  },
  {
    id: 'quality_growth',
    name: 'Quality Growth',
    description: 'Prioritizes rapid top-line/earnings momentum and high-quality unit economics, with moderate risk discipline.',
    isPreset: true,
    pillars: {
      businessQuality: 35,
      growth: 45,
      financialRisk: 20,
      valuation: 0,
    },
    subWeights: {
      quality: { roce: 35, roe: 30, operatingMargin: 20, fcfConversion: 10, interestCoverage: 5 },
      growth: { revenueCagr: 40, profitCagr: 35, epsCagr: 15, ebitdaGrowth: 10 },
      risk: { debtToEquity: 40, interestCoverage: 20, earningsVolatility: 15, cashFlowStability: 15, workingCapitalDays: 10 },
      valuation: { peRatio: 40, evEbitda: 25, pbRatio: 15, fcfYield: 20 },
    },
  },
  {
    id: 'deep_value',
    name: 'Deep Value',
    description: 'Focuses heavily on low multiples (P/E, EV/EBITDA, P/B, high FCF Yield) backed by low leverage and margin of safety.',
    isPreset: true,
    pillars: {
      businessQuality: 0,
      growth: 10,
      financialRisk: 20,
      valuation: 70,
    },
    subWeights: {
      quality: { roce: 30, roe: 25, operatingMargin: 20, fcfConversion: 15, interestCoverage: 10 },
      growth: { revenueCagr: 40, profitCagr: 40, epsCagr: 10, ebitdaGrowth: 10 },
      risk: { debtToEquity: 50, interestCoverage: 20, earningsVolatility: 10, cashFlowStability: 10, workingCapitalDays: 10 },
      valuation: { peRatio: 45, evEbitda: 25, pbRatio: 10, fcfYield: 20 },
    },
  },
  {
    id: 'conservative',
    name: 'Conservative / Low Risk',
    description: 'Fortress balance sheet discipline prioritizing near-zero debt, robust interest coverage, cash flow stability, and proven return on capital.',
    isPreset: true,
    pillars: {
      businessQuality: 30,
      growth: 0,
      financialRisk: 60,
      valuation: 10,
    },
    subWeights: {
      quality: { roce: 35, roe: 30, operatingMargin: 15, fcfConversion: 10, interestCoverage: 10 },
      growth: { revenueCagr: 35, profitCagr: 35, epsCagr: 15, ebitdaGrowth: 15 },
      risk: { debtToEquity: 45, interestCoverage: 25, earningsVolatility: 10, cashFlowStability: 10, workingCapitalDays: 10 },
      valuation: { peRatio: 35, evEbitda: 25, pbRatio: 15, fcfYield: 25 },
    },
  },
  {
    id: 'growth_risk',
    name: 'Growth & Risk (40/60)',
    description: 'Specialized 40% Growth and 60% Financial Risk allocation matching analyst risk-adjusted expansion priority test.',
    isPreset: true,
    pillars: {
      businessQuality: 0,
      growth: 40,
      financialRisk: 60,
      valuation: 0,
    },
    subWeights: DEFAULT_SUB_WEIGHTS,
  },
  {
    id: 'pure_valuation',
    name: 'Pure Valuation (100% Multiple)',
    description: 'Ranks strictly based on valuation multiples and cash yield to identify the cheapest assets in the universe.',
    isPreset: true,
    pillars: {
      businessQuality: 0,
      growth: 0,
      financialRisk: 0,
      valuation: 100,
    },
    subWeights: DEFAULT_SUB_WEIGHTS,
  },
];
