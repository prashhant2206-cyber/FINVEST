import {
  Company,
  PillarWeights,
  SubMetricWeights,
  NormalizedScoreBreakdown,
  ScreeningFilters,
  ScorePillarBreakdown,
} from '../types';

export class ScoringEngine {
  private static normalizeMetric(
    values: number[],
    higherIsBetter: boolean
  ): number[] {
    if (values.length === 0) return [];
    if (values.length === 1) return [50];

    const cleanValues = values.map((v) => (isNaN(v) || !isFinite(v) ? 0 : v));
    const sorted = [...cleanValues].sort((a, b) => a - b);

    return cleanValues.map((val) => {
      let countBelow = 0;
      let countEqual = 0;
      for (let s of sorted) {
        if (s < val) countBelow++;
        else if (s === val) countEqual++;
      }
      const percentile = (countBelow + 0.5 * countEqual) / sorted.length;
      const score = higherIsBetter ? percentile * 100 : (1 - percentile) * 100;
      return Math.round(score * 10) / 10;
    });
  }

  public static evaluateFilter(
    company: Company,
    filters: ScreeningFilters
  ): { passes: boolean; rejectionReasons: string[] } {
    const reasons: string[] = [];
    const m = company.metrics;

    if (m.rocePct < filters.minRoce) {
      reasons.push(`ROCE (${m.rocePct.toFixed(1)}%) < min ${filters.minRoce}%`);
    }
    if (m.revenueCagr3yPct < filters.minRevenueCagr) {
      reasons.push(`Revenue CAGR (${m.revenueCagr3yPct.toFixed(1)}%) < min ${filters.minRevenueCagr}%`);
    }
    if (m.profitCagr3yPct < filters.minProfitCagr) {
      reasons.push(`Profit CAGR (${m.profitCagr3yPct.toFixed(1)}%) < min ${filters.minProfitCagr}%`);
    }
    if (m.debtToEquity > filters.maxDebtToEquity) {
      reasons.push(`Debt/Equity (${m.debtToEquity.toFixed(2)}) > max ${filters.maxDebtToEquity}`);
    }
    if (m.peRatio > filters.maxPeRatio) {
      reasons.push(`P/E (${m.peRatio.toFixed(1)}x) > max ${filters.maxPeRatio}x`);
    }
    if (m.opmPct < filters.minOperatingMargin) {
      reasons.push(`Operating Margin (${m.opmPct.toFixed(1)}%) < min ${filters.minOperatingMargin}%`);
    }
    if (m.fcfYieldPct < filters.minFcfYield) {
      reasons.push(`FCF Yield (${m.fcfYieldPct.toFixed(1)}%) < min ${filters.minFcfYield}%`);
    }

    return {
      passes: reasons.length === 0,
      rejectionReasons: reasons,
    };
  }

  public static calculateScores(
    companies: Company[],
    pillars: PillarWeights,
    subWeights: SubMetricWeights
  ): Map<string, NormalizedScoreBreakdown> {
    const results = new Map<string, NormalizedScoreBreakdown>();
    if (companies.length === 0) return results;

    const roceScores = this.normalizeMetric(companies.map((c) => c.metrics.rocePct), true);
    const roeScores = this.normalizeMetric(companies.map((c) => c.metrics.roePct), true);
    const opmScores = this.normalizeMetric(companies.map((c) => c.metrics.opmPct), true);
    const fcfConvScores = this.normalizeMetric(companies.map((c) => c.metrics.fcfConversionPct), true);
    const intCovScores = this.normalizeMetric(companies.map((c) => c.metrics.interestCoverage), true);

    const revCagrScores = this.normalizeMetric(companies.map((c) => c.metrics.revenueCagr3yPct), true);
    const patCagrScores = this.normalizeMetric(companies.map((c) => c.metrics.profitCagr3yPct), true);
    const epsCagrScores = this.normalizeMetric(companies.map((c) => c.metrics.epsCagr3yPct), true);
    const ebitdaGrowthScores = this.normalizeMetric(companies.map((c) => c.metrics.ebitdaGrowthPct), true);

    const deScores = this.normalizeMetric(companies.map((c) => c.metrics.debtToEquity), false);
    const earnVolScores = this.normalizeMetric(companies.map((c) => c.metrics.earningsVolatilityIndex), false);
    const cfStabScores = this.normalizeMetric(companies.map((c) => c.metrics.cashFlowStabilityScore), true);
    const wcDaysScores = this.normalizeMetric(companies.map((c) => c.metrics.workingCapitalDays), false);

    const peScores = this.normalizeMetric(companies.map((c) => c.metrics.peRatio), false);
    const evEbitdaScores = this.normalizeMetric(companies.map((c) => c.metrics.evEbitda), false);
    const pbScores = this.normalizeMetric(companies.map((c) => c.metrics.pbRatio), false);
    const fcfYieldScores = this.normalizeMetric(companies.map((c) => c.metrics.fcfYieldPct), true);

    const totalPillarWeight = pillars.businessQuality + pillars.growth + pillars.financialRisk + pillars.valuation || 100;
    const normPillars = {
      businessQuality: pillars.businessQuality / totalPillarWeight,
      growth: pillars.growth / totalPillarWeight,
      financialRisk: pillars.financialRisk / totalPillarWeight,
      valuation: pillars.valuation / totalPillarWeight,
    };

    const qSubTotal = subWeights.quality.roce + subWeights.quality.roe + subWeights.quality.operatingMargin + subWeights.quality.fcfConversion + subWeights.quality.interestCoverage || 100;
    const gSubTotal = subWeights.growth.revenueCagr + subWeights.growth.profitCagr + subWeights.growth.epsCagr + subWeights.growth.ebitdaGrowth || 100;
    const rSubTotal = subWeights.risk.debtToEquity + subWeights.risk.interestCoverage + subWeights.risk.earningsVolatility + subWeights.risk.cashFlowStability + subWeights.risk.workingCapitalDays || 100;
    const vSubTotal = subWeights.valuation.peRatio + subWeights.valuation.evEbitda + subWeights.valuation.pbRatio + subWeights.valuation.fcfYield || 100;

    for (let i = 0; i < companies.length; i++) {
      const c = companies[i];

      const qualityScore =
        (roceScores[i] * subWeights.quality.roce +
          roeScores[i] * subWeights.quality.roe +
          opmScores[i] * subWeights.quality.operatingMargin +
          fcfConvScores[i] * subWeights.quality.fcfConversion +
          intCovScores[i] * subWeights.quality.interestCoverage) /
        qSubTotal;

      const growthScore =
        (revCagrScores[i] * subWeights.growth.revenueCagr +
          patCagrScores[i] * subWeights.growth.profitCagr +
          epsCagrScores[i] * subWeights.growth.epsCagr +
          ebitdaGrowthScores[i] * subWeights.growth.ebitdaGrowth) /
        gSubTotal;

      const riskScore =
        (deScores[i] * subWeights.risk.debtToEquity +
          intCovScores[i] * subWeights.risk.interestCoverage +
          earnVolScores[i] * subWeights.risk.earningsVolatility +
          cfStabScores[i] * subWeights.risk.cashFlowStability +
          wcDaysScores[i] * subWeights.risk.workingCapitalDays) /
        rSubTotal;

      const valuationScore =
        (peScores[i] * subWeights.valuation.peRatio +
          evEbitdaScores[i] * subWeights.valuation.evEbitda +
          pbScores[i] * subWeights.valuation.pbRatio +
          fcfYieldScores[i] * subWeights.valuation.fcfYield) /
        vSubTotal;

      const qContribution = qualityScore * normPillars.businessQuality;
      const gContribution = growthScore * normPillars.growth;
      const rContribution = riskScore * normPillars.financialRisk;
      const vContribution = valuationScore * normPillars.valuation;

      const overall = qContribution + gContribution + rContribution + vContribution;

      const qualityPillar: ScorePillarBreakdown = {
        score: Math.round(qualityScore * 10) / 10,
        weight: Math.round(normPillars.businessQuality * 100),
        contribution: Math.round(qContribution * 10) / 10,
      };

      const growthPillar: ScorePillarBreakdown = {
        score: Math.round(growthScore * 10) / 10,
        weight: Math.round(normPillars.growth * 100),
        contribution: Math.round(gContribution * 10) / 10,
      };

      const riskPillar: ScorePillarBreakdown = {
        score: Math.round(riskScore * 10) / 10,
        weight: Math.round(normPillars.financialRisk * 100),
        contribution: Math.round(rContribution * 10) / 10,
      };

      const valuationPillar: ScorePillarBreakdown = {
        score: Math.round(valuationScore * 10) / 10,
        weight: Math.round(normPillars.valuation * 100),
        contribution: Math.round(vContribution * 10) / 10,
      };

      results.set(c.id, {
        overallScore: Math.round(overall * 10) / 10,
        quality: qualityPillar,
        growth: growthPillar,
        risk: riskPillar,
        valuation: valuationPillar,
        normalizedSubMetrics: {
          roce: roceScores[i],
          roe: roeScores[i],
          opm: opmScores[i],
          fcfConversion: fcfConvScores[i],
          interestCoverageQuality: intCovScores[i],
          revenueCagr: revCagrScores[i],
          profitCagr: patCagrScores[i],
          epsCagr: epsCagrScores[i],
          ebitdaGrowth: ebitdaGrowthScores[i],
          debtToEquity: deScores[i],
          earningsVolatility: earnVolScores[i],
          cashFlowStability: cfStabScores[i],
          workingCapitalDays: wcDaysScores[i],
          peRatio: peScores[i],
          evEbitda: evEbitdaScores[i],
          pbRatio: pbScores[i],
          fcfYield: fcfYieldScores[i],
        },
      });
    }

    return results;
  }
}
