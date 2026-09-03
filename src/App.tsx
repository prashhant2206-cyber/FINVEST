import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  DataSourceStatus,
  EvaluatedCompany,
  MLCluster,
  AnomalyRecord,
  PillarWeights,
  SubMetricWeights,
  ScreeningFilters as IScreeningFilters,
  StrategyProfile,
  Company,
} from './types';
import { DEFAULT_PILLARS, DEFAULT_SUB_WEIGHTS, DEFAULT_FILTERS, STRATEGY_PRESETS } from './data/presets';
import { INITIAL_COMPANIES } from './data/defaultDataset';
import { ScoringEngine } from './data/scoringEngine';
import { MLEngine } from './data/mlEngine';
import { Header } from './components/Header';
import { AcademicBanner } from './components/AcademicBanner';
import { KpiSummary } from './components/KpiSummary';
import { StrategyBuilder } from './components/StrategyBuilder';
import { ScreeningFilters } from './components/ScreeningFilters';
import { RankedTable } from './components/RankedTable';
import { MLAnalysisView } from './components/MLAnalysisView';
import { StrategyComparisonView } from './components/StrategyComparisonView';
import { CompanyDetailModal } from './components/CompanyDetailModal';
import { DataAdapterModal } from './components/DataAdapterModal';
import { MethodologyModal } from './components/MethodologyModal';

export default function App() {
  // Application Data Universe
  const [universe, setUniverse] = useState<Company[]>(INITIAL_COMPANIES);
  const [status, setStatus] = useState<DataSourceStatus | null>(null);
  const [selectedSector, setSelectedSector] = useState<string>('All Listed Companies');
  const [activeView, setActiveView] = useState<'dashboard' | 'clusters' | 'comparison' | 'anomalies'>('dashboard');

  // Strategy & Scoring Configuration
  const [pillars, setPillars] = useState<PillarWeights>(DEFAULT_PILLARS);
  const [subWeights, setSubWeights] = useState<SubMetricWeights>(DEFAULT_SUB_WEIGHTS);
  const [filters, setFilters] = useState<IScreeningFilters>(DEFAULT_FILTERS);
  const [activePresetId, setActivePresetId] = useState<string>('balanced');
  const [showOnlyPassing, setShowOnlyPassing] = useState<boolean>(false);

  // Interaction State
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [isAdapterModalOpen, setIsAdapterModalOpen] = useState<boolean>(false);
  const [isMethodologyModalOpen, setIsMethodologyModalOpen] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isSyncingPrices, setIsSyncingPrices] = useState<boolean>(false);

  // Available Sectors from current universe
  const availableSectors = useMemo(() => {
    const sectors = Array.from(new Set(universe.map((c) => c.sector))).sort();
    return ['All Listed Companies', ...sectors];
  }, [universe]);

  // Filter companies by sector
  const scopedCompanies = useMemo(() => {
    if (selectedSector === 'All Listed Companies') {
      return universe;
    }
    return universe.filter((c) => c.sector.toLowerCase() === selectedSector.toLowerCase());
  }, [universe, selectedSector]);

  // LIVE DYNAMIC SCORING ENGINE (Zero-latency client-side calculation)
  const { evaluatedCompanies, clusters, anomalies, totalUniverse, passingCount } = useMemo(() => {
    if (scopedCompanies.length === 0) {
      return {
        evaluatedCompanies: [],
        clusters: [],
        anomalies: [],
        totalUniverse: 0,
        passingCount: 0,
      };
    }

    // 1. Calculate Min-Max normalized composite scores for each company based on active weights
    const scoreMap = ScoringEngine.calculateScores(scopedCompanies, pillars, subWeights);

    // 2. Run ML Clustering across financial dimensions
    const { clusters: mlClusters, companyClusterMap } = MLEngine.runClustering(scopedCompanies, 4);

    // 3. Run accounting & financial anomaly detection
    const anomalyList = MLEngine.detectAnomalies(scopedCompanies);

    // Group anomalies by company
    const anomalyMap = new Map<string, AnomalyRecord[]>();
    anomalyList.forEach((a) => {
      const existing = anomalyMap.get(a.companyId) || [];
      existing.push(a);
      anomalyMap.set(a.companyId, existing);
    });

    // 4. Build evaluated company objects with filter evaluation
    let evaluatedList: EvaluatedCompany[] = scopedCompanies.map((company) => {
      const scores = scoreMap.get(company.id) || {
        overallScore: 50,
        quality: { score: 50, weight: 25, contribution: 12.5 },
        growth: { score: 50, weight: 25, contribution: 12.5 },
        risk: { score: 50, weight: 25, contribution: 12.5 },
        valuation: { score: 50, weight: 25, contribution: 12.5 },
        normalizedSubMetrics: {} as any,
      };

      const filterResult = ScoringEngine.evaluateFilter(company, filters);
      const companyCluster = companyClusterMap.get(company.id) || mlClusters[0];
      const companyAnomalies = anomalyMap.get(company.id) || [];

      return {
        company,
        scores,
        cluster: companyCluster,
        anomalies: companyAnomalies,
        passesFilter: filterResult.passes,
        filterRejections: filterResult.rejectionReasons,
        rank: 1, // Will be set after sorting
        researchPriority: 'Medium', // Will be set based on overall score
      };
    });

    // 5. Sort by Composite Research Score in descending order
    evaluatedList.sort((a, b) => b.scores.overallScore - a.scores.overallScore);

    // 6. Assign ranks and research priority thresholds
    const totalCount = evaluatedList.length;
    evaluatedList = evaluatedList.map((item, idx) => {
      const rank = idx + 1;
      let researchPriority: 'High' | 'Medium' | 'Low' = 'Low';
      const percentile = rank / totalCount;

      if (percentile <= 0.25 || item.scores.overallScore >= 70) {
        researchPriority = 'High';
      } else if (percentile <= 0.65 || item.scores.overallScore >= 45) {
        researchPriority = 'Medium';
      }

      return {
        ...item,
        rank,
        researchPriority,
      };
    });

    const passing = evaluatedList.filter((c) => c.passesFilter).length;

    return {
      evaluatedCompanies: evaluatedList,
      clusters: mlClusters,
      anomalies: anomalyList,
      totalUniverse: totalCount,
      passingCount: passing,
    };
  }, [scopedCompanies, pillars, subWeights, filters]);

  // Selected company object resolved dynamically
  const selectedCompany = useMemo(() => {
    if (!selectedCompanyId) return null;
    return evaluatedCompanies.find((c) => c.company.id === selectedCompanyId) || null;
  }, [evaluatedCompanies, selectedCompanyId]);

  // Fetch Data Source Status
  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/data/status');
      if (res.ok) {
        const data: DataSourceStatus = await res.json();
        setStatus(data);
      }
    } catch (err) {
      console.error('Failed to fetch data source status:', err);
    }
  }, []);

  // Fetch Full Universe from Server
  const fetchUniverse = useCallback(async () => {
    try {
      const res = await fetch('/api/data/companies');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.companies) && data.companies.length > 0) {
          setUniverse(data.companies);
        }
      }
    } catch (err) {
      console.warn('Backend offline or initializing, running on client dataset:', err);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchStatus();
    fetchUniverse();
  }, [fetchStatus, fetchUniverse]);

  // Trigger Refresh Connector
  const handleRefreshData = async () => {
    try {
      setIsRefreshing(true);
      const res = await fetch('/api/data/refresh', { method: 'POST' });
      if (res.ok) {
        await fetchStatus();
        await fetchUniverse();
      }
    } catch (err) {
      console.error('Refresh failed:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Sync Dynamic Stock Prices & Tickers
  const handleSyncDynamicPrices = async () => {
    try {
      setIsSyncingPrices(true);
      const res = await fetch('/api/prices/sync-dynamic', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        if (data.companies && Array.isArray(data.companies)) {
          setUniverse(data.companies);
        }
      }
    } catch (err) {
      console.error('Failed to sync dynamic prices:', err);
    } finally {
      setIsSyncingPrices(false);
    }
  };

  // Toggle Demo / Live Mode
  const handleSwitchMode = async (demo: boolean) => {
    try {
      setIsRefreshing(true);
      const res = await fetch('/api/data/mode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ demo }),
      });
      if (res.ok) {
        const newStatus = await res.json();
        setStatus(newStatus);
        await fetchUniverse();
      }
    } catch (err) {
      console.error('Mode switch failed:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Import custom Screener CSV
  const handleImportCsv = async (csvContent: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/data/import-csv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ csvContent }),
      });
      if (res.ok) {
        await fetchStatus();
        await fetchUniverse();
        return true;
      }
      return false;
    } catch (err) {
      console.error('CSV import error:', err);
      return false;
    }
  };

  // Preset Strategy Application
  const handleApplyPreset = (preset: StrategyProfile) => {
    setActivePresetId(preset.id);
    setPillars(preset.pillars);
    setSubWeights(preset.subWeights);
  };

  const handlePillarChange = (newPillars: PillarWeights) => {
    setPillars(newPillars);
    setActivePresetId('custom');
  };

  const handleSubWeightsChange = (newSub: SubMetricWeights) => {
    setSubWeights(newSub);
    setActivePresetId('custom');
  };

  const activeStrategyName =
    STRATEGY_PRESETS.find((p) => p.id === activePresetId)?.name || 'Custom Analyst Weights';

  const highPriorityCount = evaluatedCompanies.filter((c) => c.researchPriority === 'High').length;

  return (
    <div id="finvest-ai-root" className="min-h-screen bg-[#0F1115] text-[#E0E0E0] flex flex-col font-sans selection:bg-[#D4AF37] selection:text-[#0F1115]">
      {/* Institutional Header with Status Bar */}
      <Header
        status={status}
        selectedSector={selectedSector}
        availableSectors={availableSectors}
        onSelectSector={(sec) => setSelectedSector(sec)}
        onRefreshData={handleRefreshData}
        onSyncDynamicPrices={handleSyncDynamicPrices}
        isSyncingPrices={isSyncingPrices}
        onOpenAdapterModal={() => setIsAdapterModalOpen(true)}
        onOpenMethodologyModal={() => setIsMethodologyModalOpen(true)}
        isRefreshing={isRefreshing}
        activeView={activeView}
        onChangeView={(v) => setActiveView(v)}
        anomalyCount={anomalies.length}
      />

      {/* Academic Positioning & Anti-Advice Guardrail Banner */}
      <AcademicBanner />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-5">
        {/* KPI Strip */}
        <KpiSummary
          totalUniverse={totalUniverse}
          passingCount={passingCount}
          highPriorityCount={highPriorityCount}
          anomalyCount={anomalies.length}
          activeStrategyName={activeStrategyName}
          pillars={pillars}
        />

        {/* VIEW 1: RESEARCH MATRIX & STRATEGY (DASHBOARD) */}
        {activeView === 'dashboard' && (
          <div className="space-y-4">
            {/* Strategy Builder (4 Pillar Sliders + Presets + Sub-metrics) */}
            <StrategyBuilder
              pillars={pillars}
              subWeights={subWeights}
              onChangePillars={handlePillarChange}
              onChangeSubWeights={handleSubWeightsChange}
              onApplyPreset={handleApplyPreset}
              activePresetId={activePresetId}
            />

            {/* Screening Filters Panel */}
            <ScreeningFilters
              filters={filters}
              onChangeFilters={(f) => setFilters(f)}
              totalCount={totalUniverse}
              passingCount={passingCount}
              showOnlyPassing={showOnlyPassing}
              onToggleShowOnlyPassing={(val) => setShowOnlyPassing(val)}
            />

            {/* Prioritization Ranking Table */}
            <RankedTable
              companies={evaluatedCompanies}
              onSelectCompany={(c) => setSelectedCompanyId(c.company.id)}
              showOnlyPassing={showOnlyPassing}
            />
          </div>
        )}

        {/* VIEW 2: STRATEGY SENSITIVITY COMPARISON MATRIX */}
        {activeView === 'comparison' && (
          <StrategyComparisonView
            currentEvaluated={evaluatedCompanies}
            onSelectCompany={(c) => setSelectedCompanyId(c.company.id)}
            activeStrategyName={activeStrategyName}
          />
        )}

        {/* VIEW 3: ML K-MEANS CLUSTERING & ANOMALIES */}
        {(activeView === 'clusters' || activeView === 'anomalies') && (
          <MLAnalysisView
            clusters={clusters}
            anomalies={anomalies}
            evaluatedCompanies={evaluatedCompanies}
            onSelectCompany={(c) => setSelectedCompanyId(c.company.id)}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#2D333B] bg-[#1A1D23] py-3 text-xs text-[#8E9299] text-center px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2 text-[11px]">
          <span className="text-[#8E9299]">FINVEST AI Terminal • Institutional Equity Research Platform (MBA Working With AI)</span>
          <div className="flex items-center gap-4">
            <span>Screener.in Permitted Connector</span>
            <span className="text-[#D4AF37] uppercase font-semibold">Decision-Support Architecture</span>
          </div>
        </div>
      </footer>

      {/* MODAL 1: Company Detail & AI Brief Modal */}
      <CompanyDetailModal
        item={selectedCompany}
        onClose={() => setSelectedCompanyId(null)}
        pillars={pillars}
        totalUniverse={totalUniverse}
      />

      {/* MODAL 2: Data Adapter & CSV Import Modal */}
      <DataAdapterModal
        isOpen={isAdapterModalOpen}
        onClose={() => setIsAdapterModalOpen(false)}
        status={status}
        onRefreshData={handleRefreshData}
        isRefreshing={isRefreshing}
        onSwitchMode={handleSwitchMode}
        onImportCsv={handleImportCsv}
      />

      {/* MODAL 3: Academic Methodology & Mathematical Guide Modal */}
      <MethodologyModal
        isOpen={isMethodologyModalOpen}
        onClose={() => setIsMethodologyModalOpen(false)}
      />
    </div>
  );
}
