export interface FinancialMetrics {
  marketCapCr: number;
  currentPrice: number;
  peRatio: number;
  pbRatio: number;
  evEbitda: number;
  rocePct: number;
  roePct: number;
  opmPct: number;
  revenueCagr3yPct: number;
  revenueCagr5yPct: number;
  profitCagr3yPct: number;
  profitCagr5yPct: number;
  epsCagr3yPct: number;
  ebitdaGrowthPct: number;
  debtToEquity: number;
  interestCoverage: number;
  fcfConversionPct: number;
  fcfYieldPct: number;
  workingCapitalDays: number;
  cfoToPatRatio: number;
  earningsVolatilityIndex: number;
  cashFlowStabilityScore: number;
  dividendYieldPct: number;
  changePct?: number;
  lastUpdatedPrice?: string;
  liveQuote?: DynamicQuote;
}

export interface HistoricalYearData {
  year: string;
  revenue: number;
  operatingProfit: number;
  netProfit: number;
  operatingCashFlow: number;
  freeCashFlow: number;
  debt: number;
  workingCapitalDays: number;
}

export interface Company {
  id: string;
  ticker: string;
  name: string;
  sector: string;
  industry: string;
  screenerUrl: string;
  metrics: FinancialMetrics;
  history: HistoricalYearData[];
  description: string;
}

export interface PillarWeights {
  businessQuality: number;
  growth: number;
  financialRisk: number;
  valuation: number;
}

export interface QualitySubWeights {
  roce: number;
  roe: number;
  operatingMargin: number;
  fcfConversion: number;
  interestCoverage: number;
}

export interface GrowthSubWeights {
  revenueCagr: number;
  profitCagr: number;
  epsCagr: number;
  ebitdaGrowth: number;
}

export interface RiskSubWeights {
  debtToEquity: number;
  interestCoverage: number;
  earningsVolatility: number;
  cashFlowStability: number;
  workingCapitalDays: number;
}

export interface ValuationSubWeights {
  peRatio: number;
  evEbitda: number;
  pbRatio: number;
  fcfYield: number;
}

export interface SubMetricWeights {
  quality: QualitySubWeights;
  growth: GrowthSubWeights;
  risk: RiskSubWeights;
  valuation: ValuationSubWeights;
}

export interface StrategyProfile {
  id: string;
  name: string;
  description: string;
  isPreset?: boolean;
  pillars: PillarWeights;
  subWeights: SubMetricWeights;
}

export interface ScreeningFilters {
  minRoce: number;
  minRevenueCagr: number;
  minProfitCagr: number;
  maxDebtToEquity: number;
  maxPeRatio: number;
  minOperatingMargin: number;
  minFcfYield: number;
}

export interface ScorePillarBreakdown {
  score: number;
  weight: number;
  contribution: number;
}

export interface NormalizedScoreBreakdown {
  overallScore: number;
  quality: ScorePillarBreakdown;
  growth: ScorePillarBreakdown;
  risk: ScorePillarBreakdown;
  valuation: ScorePillarBreakdown;
  normalizedSubMetrics: Record<string, number>;
}

export interface AnomalyRecord {
  id: string;
  companyId: string;
  companyName: string;
  ticker: string;
  metric: string;
  observedValue: string;
  expectedRange: string;
  severity: 'high' | 'medium' | 'low';
  explanation: string;
  suggestedAction: string;
}

export interface MLCluster {
  id: number;
  name: string;
  label: string;
  description: string;
  color: string;
  centroid: {
    rocePct: number;
    revenueCagr3yPct: number;
    profitCagr3yPct: number;
    debtToEquity: number;
    opmPct: number;
    fcfYieldPct: number;
    peRatio: number;
  };
  companyIds: string[];
}

export type ResearchPriority = 'High' | 'Medium' | 'Low';

export interface EvaluatedCompany {
  company: Company;
  rank: number;
  passesFilter: boolean;
  filterRejectionReasons: string[];
  scores: NormalizedScoreBreakdown;
  cluster: MLCluster;
  anomalies: AnomalyRecord[];
  researchPriority: ResearchPriority;
}

export interface AIResearchBrief {
  companyId: string;
  ticker: string;
  companyName: string;
  generatedAt: string;
  researchPriority: 'HIGH' | 'MEDIUM' | 'LOW';
  priorityRationale: string;
  keyStrengths: string[];
  keyConcerns: string[];
  anomalyNotes?: string[];
  analystFollowUpQuestions: string[];
  mlClusterContext: string;
  dataSummary: string;
}

export interface DataSourceStatus {
  sourceName: string;
  sourceType: 'screener_feed' | 'screener_export' | 'csv_import' | 'synthetic_demo';
  status: 'connected' | 'last_updated' | 'error' | 'demo_mode';
  lastUpdated: string;
  dataPeriod: string;
  totalCompanies: number;
  availableSectors: string[];
  isDemo: boolean;
  message?: string;
}

export interface DynamicQuote {
  ticker: string;
  price: number;
  change: number;
  changePercent: number;
  latestTradingDay: string;
  volume: number;
  source: 'alphavantage' | 'live_feed' | 'market_tick';
  updatedAt: string;
}
