import { Company, MLCluster, AnomalyRecord } from '../types';

export class MLEngine {
  public static runClustering(companies: Company[], k: number = 4): { clusters: MLCluster[]; companyClusterMap: Map<string, MLCluster> } {
    if (companies.length === 0) {
      return { clusters: [], companyClusterMap: new Map() };
    }

    const featureKeys: (keyof Company['metrics'])[] = [
      'rocePct',
      'revenueCagr3yPct',
      'profitCagr3yPct',
      'debtToEquity',
      'opmPct',
      'fcfYieldPct',
      'peRatio',
    ];

    const minMax: Record<string, { min: number; max: number }> = {};
    featureKeys.forEach((key) => {
      const vals = companies.map((c) => Number(c.metrics[key]) || 0);
      minMax[key] = {
        min: Math.min(...vals),
        max: Math.max(...vals) || 1,
      };
    });

    const vectors = companies.map((c) => {
      return featureKeys.map((key) => {
        const val = Number(c.metrics[key]) || 0;
        const range = minMax[key].max - minMax[key].min || 1;
        return (val - minMax[key].min) / range;
      });
    });

    const actualK = Math.min(k, companies.length);
    let centroids: number[][] = [];
    const step = Math.floor(companies.length / actualK);
    for (let i = 0; i < actualK; i++) {
      centroids.push([...vectors[Math.min(i * step, companies.length - 1)]]);
    }

    let assignments: number[] = new Array(companies.length).fill(0);
    const maxIterations = 20;

    for (let iter = 0; iter < maxIterations; iter++) {
      let changed = false;

      for (let i = 0; i < companies.length; i++) {
        let bestCluster = 0;
        let bestDist = Infinity;
        for (let c = 0; c < actualK; c++) {
          let dist = 0;
          for (let d = 0; d < featureKeys.length; d++) {
            const diff = vectors[i][d] - centroids[c][d];
            dist += diff * diff;
          }
          if (dist < bestDist) {
            bestDist = dist;
            bestCluster = c;
          }
        }
        if (assignments[i] !== bestCluster) {
          assignments[i] = bestCluster;
          changed = true;
        }
      }

      if (!changed) break;

      for (let c = 0; c < actualK; c++) {
        const clusterMembers = vectors.filter((_, idx) => assignments[idx] === c);
        if (clusterMembers.length > 0) {
          for (let d = 0; d < featureKeys.length; d++) {
            const sum = clusterMembers.reduce((acc, v) => acc + v[d], 0);
            centroids[c][d] = sum / clusterMembers.length;
          }
        }
      }
    }

    const clusters: MLCluster[] = [];
    const colors = ['#10B981', '#3B82F6', '#F59E0B', '#8B5CF6'];

    for (let c = 0; c < actualK; c++) {
      const memberIndices = assignments
        .map((clusterId, idx) => (clusterId === c ? idx : -1))
        .filter((idx) => idx !== -1);

      const memberCompanies = memberIndices.map((idx) => companies[idx]);
      const companyIds = memberCompanies.map((comp) => comp.id);

      const rawCentroid = {
        rocePct: 0,
        revenueCagr3yPct: 0,
        profitCagr3yPct: 0,
        debtToEquity: 0,
        opmPct: 0,
        fcfYieldPct: 0,
        peRatio: 0,
      };

      if (memberCompanies.length > 0) {
        memberCompanies.forEach((comp) => {
          rawCentroid.rocePct += comp.metrics.rocePct;
          rawCentroid.revenueCagr3yPct += comp.metrics.revenueCagr3yPct;
          rawCentroid.profitCagr3yPct += comp.metrics.profitCagr3yPct;
          rawCentroid.debtToEquity += comp.metrics.debtToEquity;
          rawCentroid.opmPct += comp.metrics.opmPct;
          rawCentroid.fcfYieldPct += comp.metrics.fcfYieldPct;
          rawCentroid.peRatio += comp.metrics.peRatio;
        });

        const count = memberCompanies.length;
        rawCentroid.rocePct = Math.round((rawCentroid.rocePct / count) * 10) / 10;
        rawCentroid.revenueCagr3yPct = Math.round((rawCentroid.revenueCagr3yPct / count) * 10) / 10;
        rawCentroid.profitCagr3yPct = Math.round((rawCentroid.profitCagr3yPct / count) * 10) / 10;
        rawCentroid.debtToEquity = Math.round((rawCentroid.debtToEquity / count) * 100) / 100;
        rawCentroid.opmPct = Math.round((rawCentroid.opmPct / count) * 10) / 10;
        rawCentroid.fcfYieldPct = Math.round((rawCentroid.fcfYieldPct / count) * 10) / 10;
        rawCentroid.peRatio = Math.round((rawCentroid.peRatio / count) * 10) / 10;
      }

      let label = 'Balanced / Core Equities';
      let desc = 'Balanced profile with moderate growth, solid margins, and stable balance sheet.';
      let color = colors[c % colors.length];

      if (rawCentroid.rocePct > 35 && rawCentroid.debtToEquity < 0.2) {
        label = 'High Quality / Low Leverage';
        desc = 'Elite capital efficiency, superior ROCE/ROE, negligible debt, and robust pricing power.';
        color = '#10B981';
      } else if (rawCentroid.revenueCagr3yPct > 18 || rawCentroid.profitCagr3yPct > 25) {
        label = 'High Growth / Premium Valuation';
        desc = 'Rapid top-line and earnings expansion, commanding higher valuation multiples and reinvestment rate.';
        color = '#3B82F6';
      } else if (rawCentroid.peRatio < 25 && rawCentroid.fcfYieldPct > 3.0) {
        label = 'Value / High Cash Generation';
        desc = 'Attractive valuation metrics, strong free cash flow yield, and dependable shareholder returns.';
        color = '#F59E0B';
      } else if (rawCentroid.debtToEquity > 0.6 || rawCentroid.rocePct < 15) {
        label = 'Moderate Quality / Capital Intensive';
        desc = 'Moderate return ratios or leveraged capital structure requiring closer scrutiny on interest coverage.';
        color = '#8B5CF6';
      }

      clusters.push({
        id: c + 1,
        name: `Cluster ${c + 1}`,
        label,
        description: desc,
        color,
        centroid: rawCentroid,
        companyIds,
      });
    }

    const companyClusterMap = new Map<string, MLCluster>();
    companies.forEach((comp, idx) => {
      const clusterIdx = assignments[idx];
      if (clusters[clusterIdx]) {
        companyClusterMap.set(comp.id, clusters[clusterIdx]);
      }
    });

    return { clusters, companyClusterMap };
  }

  public static detectAnomalies(companies: Company[]): AnomalyRecord[] {
    const anomalies: AnomalyRecord[] = [];

    companies.forEach((comp) => {
      const m = comp.metrics;
      const h = comp.history;

      if (m.cfoToPatRatio < 0.65) {
        anomalies.push({
          id: `${comp.id}_cfo_pat_divergence`,
          companyId: comp.id,
          companyName: comp.name,
          ticker: comp.ticker,
          metric: 'CFO / PAT Conversion Ratio',
          observedValue: `${(m.cfoToPatRatio * 100).toFixed(0)}%`,
          expectedRange: '> 80% for high-quality earnings',
          severity: 'high',
          explanation: `Net profit is not translating into operating cash flows. 3Y profit growth is outpacing cash collection, indicating potential aggressive revenue recognition or channel inventory buildup.`,
          suggestedAction: 'Investigate quality of earnings, debtor aging schedules, and cash flow statement reconciliations.',
        });
      }

      if (m.workingCapitalDays > 120 && comp.sector !== 'Banking') {
        anomalies.push({
          id: `${comp.id}_wc_ballooning`,
          companyId: comp.id,
          companyName: comp.name,
          ticker: comp.ticker,
          metric: 'Working Capital Days',
          observedValue: `${m.workingCapitalDays} days`,
          expectedRange: '< 60 days industry benchmark',
          severity: 'medium',
          explanation: `Exceptionally long working capital cycle. Significant capital is locked in inventory and receivables, increasing working capital finance costs and liquidity risks.`,
          suggestedAction: 'Scrutinize inventory turnover days and receivables collection cycle in notes to accounts.',
        });
      }

      if (m.debtToEquity > 0.8 && m.interestCoverage < 10 && comp.sector !== 'Banking') {
        anomalies.push({
          id: `${comp.id}_debt_coverage_stress`,
          companyId: comp.id,
          companyName: comp.name,
          ticker: comp.ticker,
          metric: 'Debt/Equity & Interest Coverage',
          observedValue: `D/E: ${m.debtToEquity.toFixed(2)}x, Cov: ${m.interestCoverage.toFixed(1)}x`,
          expectedRange: 'D/E < 0.50x, Interest Cov > 15x',
          severity: 'high',
          explanation: `Elevated debt load relative to operating cash flows. Any macroeconomic margin compression could significantly erode interest coverage and debt servicing comfort.`,
          suggestedAction: 'Analyze debt maturity profile, cost of borrowing, and refinancing headroom.',
        });
      }

      if (m.peRatio > 65 && m.revenueCagr3yPct < 10 && m.profitCagr3yPct < 12) {
        anomalies.push({
          id: `${comp.id}_valuation_growth_mismatch`,
          companyId: comp.id,
          companyName: comp.name,
          ticker: comp.ticker,
          metric: 'P/E vs Growth Mismatch (PEG Disconnect)',
          observedValue: `P/E: ${m.peRatio.toFixed(1)}x vs 3Y Sales CAGR: ${m.revenueCagr3yPct.toFixed(1)}%`,
          expectedRange: 'P/E < 40x for single-digit sales growth',
          severity: 'medium',
          explanation: `Valuation multiple reflects extreme optimism while historical top-line growth is in single digits. Multiple derating risk exists if growth does not accelerate.`,
          suggestedAction: 'Verify consensus volume growth forecasts and assess pricing power sustainability.',
        });
      }

      if (h && h.length >= 3) {
        const lastYearOpm = (h[h.length - 1].operatingProfit / h[h.length - 1].revenue) * 100;
        const prevYearOpm = (h[0].operatingProfit / h[0].revenue) * 100;
        const opmSwing = lastYearOpm - prevYearOpm;
        if (opmSwing < -5.0) {
          anomalies.push({
            id: `${comp.id}_margin_erosion`,
            companyId: comp.id,
            companyName: comp.name,
            ticker: comp.ticker,
            metric: 'Operating Margin Compression',
            observedValue: `${opmSwing.toFixed(1)}% change over 3 years`,
            expectedRange: 'Stable or expanding operating margin',
            severity: 'medium',
            explanation: `Noticeable contraction in operating profit margin over the 3-year historical window, indicating input cost inflation or intensifying competitive pressure.`,
            suggestedAction: 'Examine gross margin vs employee cost breakdown and promotional intensity.',
          });
        }
      }
    });

    return anomalies;
  }
}
