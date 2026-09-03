import { GoogleGenAI, Type } from '@google/genai';
import { Company, NormalizedScoreBreakdown, MLCluster, AnomalyRecord, AIResearchBrief, PillarWeights } from '../../src/types';

export class GeminiService {
  private static getClient(): GoogleGenAI | null {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('GEMINI_API_KEY environment variable is not configured. Falling back to rule-based structured analysis.');
      return null;
    }
    return new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }

  public static async generateResearchBrief(
    company: Company,
    scores: NormalizedScoreBreakdown,
    weights: PillarWeights,
    cluster: MLCluster,
    anomalies: AnomalyRecord[],
    rank: number,
    totalCompanies: number
  ): Promise<AIResearchBrief> {
    const ai = this.getClient();
    const priority: 'HIGH' | 'MEDIUM' | 'LOW' =
      scores.overallScore >= 70 ? 'HIGH' : scores.overallScore >= 45 ? 'MEDIUM' : 'LOW';

    if (!ai) {
      // Structured fallback when key is not set
      return this.generateDeterministicBrief(company, scores, weights, cluster, anomalies, rank, totalCompanies, priority);
    }

    try {
      const prompt = `
You are an institutional equity research director assisting an equity research analyst in prioritizing companies for in-depth fundamental due diligence.

IMPORTANT MANDATES:
1. This is a DECISION SUPPORT research prioritization tool, NOT an autonomous stock picking or prediction tool.
2. DO NOT output "BUY", "SELL", "HOLD", "OVERWEIGHT", or price targets.
3. Your goal is to explain WHY this company ranks #${rank} out of ${totalCompanies} based on the user's specific weighted research priorities:
   - User Priorities: Business Quality (${weights.businessQuality}%), Growth (${weights.growth}%), Financial Risk (${weights.financialRisk}%), Valuation (${weights.valuation}%).

COMPANY CONTEXT:
- Ticker: ${company.ticker} (${company.name})
- Sector: ${company.sector} | Industry: ${company.industry}
- Market Cap: ₹${company.metrics.marketCapCr.toLocaleString()} Cr | CMP: ₹${company.metrics.currentPrice}
- Composite Research Score: ${scores.overallScore.toFixed(1)} / 100 (Rank ${rank} of ${totalCompanies})
- Pillar Decomposition:
  * Business Quality: ${scores.quality.score}/100 (Contribution: +${scores.quality.contribution} pts)
  * Growth: ${scores.growth.score}/100 (Contribution: +${scores.growth.contribution} pts)
  * Financial Risk: ${scores.risk.score}/100 (Contribution: +${scores.risk.contribution} pts)
  * Valuation: ${scores.valuation.score}/100 (Contribution: +${scores.valuation.contribution} pts)

FINANCIAL DATA:
- ROCE: ${company.metrics.rocePct}% | ROE: ${company.metrics.roePct}% | OPM: ${company.metrics.opmPct}%
- 3Y Sales CAGR: ${company.metrics.revenueCagr3yPct}% | 3Y PAT CAGR: ${company.metrics.profitCagr3yPct}%
- P/E: ${company.metrics.peRatio}x | EV/EBITDA: ${company.metrics.evEbitda}x | P/B: ${company.metrics.pbRatio}x | FCF Yield: ${company.metrics.fcfYieldPct}%
- Debt to Equity: ${company.metrics.debtToEquity} | Interest Coverage: ${company.metrics.interestCoverage}x | Working Capital: ${company.metrics.workingCapitalDays} days
- CFO / PAT Ratio: ${(company.metrics.cfoToPatRatio * 100).toFixed(0)}%

MACHINE LEARNING & ANOMALIES:
- ML Cluster: "${cluster.label}" (${cluster.description})
- Detected Anomalies (${anomalies.length}):
${anomalies.map((a) => `  * [${a.severity.toUpperCase()}] ${a.metric}: Observed ${a.observedValue} (vs expected ${a.expectedRange}). Explanation: ${a.explanation}`).join('\n') || '  * None detected.'}

Generate a concise, institutional-grade JSON research brief that directly helps the analyst decide what to investigate further.
`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: prompt,
        config: {
          systemInstruction: 'You are an institutional financial analyst. Output concise, objective, high-conviction research prioritization summaries in strict JSON format without any promotional jargon or autonomous trading advice.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              researchPriority: {
                type: Type.STRING,
                description: 'Must be HIGH, MEDIUM, or LOW',
              },
              priorityRationale: {
                type: Type.STRING,
                description: '2-3 sentences explaining why it received this research priority under the user-selected weights.',
              },
              keyStrengths: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: '3 bullet points highlighting financial strengths matching high user weights.',
              },
              keyConcerns: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: '3 bullet points highlighting vulnerabilities, risks, or valuation hurdles.',
              },
              anomalyNotes: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Specific notes on detected anomalies and why they warrant due diligence.',
              },
              analystFollowUpQuestions: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: '3 high-value questions the analyst should ask management or investigate in annual reports.',
              },
              mlClusterContext: {
                type: Type.STRING,
                description: 'Brief commentary on how its ML cluster classification compares with peers.',
              },
              dataSummary: {
                type: Type.STRING,
                description: 'One sentence summarizing data integrity and Screener verification status.',
              },
            },
            required: [
              'researchPriority',
              'priorityRationale',
              'keyStrengths',
              'keyConcerns',
              'analystFollowUpQuestions',
              'mlClusterContext',
              'dataSummary',
            ],
          },
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      return {
        companyId: company.id,
        ticker: company.ticker,
        companyName: company.name,
        generatedAt: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        researchPriority: (parsed.researchPriority?.toUpperCase() as any) || priority,
        priorityRationale: parsed.priorityRationale || `${company.name} scores ${scores.overallScore.toFixed(1)}/100, ranking #${rank} given active research weights.`,
        keyStrengths: parsed.keyStrengths || [`Strong capital efficiency with ${company.metrics.rocePct}% ROCE`, `Robust cash conversion (${company.metrics.fcfConversionPct}% FCF)`],
        keyConcerns: parsed.keyConcerns || [`Valuation multiple P/E at ${company.metrics.peRatio}x`, `Historical 3Y Sales CAGR at ${company.metrics.revenueCagr3yPct}%`],
        anomalyNotes: parsed.anomalyNotes || anomalies.map((a) => `${a.metric}: ${a.explanation}`),
        analystFollowUpQuestions: parsed.analystFollowUpQuestions || [
          `Assess whether current operating margin (${company.metrics.opmPct}%) is sustainable in light of peer expansion.`,
          `Verify working capital cycle trend in the latest annual report notes.`,
          `Evaluate if the reinvestment rate justifies the current valuation multiple.`,
        ],
        mlClusterContext: parsed.mlClusterContext || `Belongs to ML Cluster "${cluster.label}". ${cluster.description}`,
        dataSummary: parsed.dataSummary || `Data source: Screener.in permitted connector. All metrics normalized across ${totalCompanies} peer companies.`,
      };
    } catch (error) {
      console.error('Error generating AI Research Brief via Gemini API:', error);
      return this.generateDeterministicBrief(company, scores, weights, cluster, anomalies, rank, totalCompanies, priority);
    }
  }

  private static generateDeterministicBrief(
    company: Company,
    scores: NormalizedScoreBreakdown,
    weights: PillarWeights,
    cluster: MLCluster,
    anomalies: AnomalyRecord[],
    rank: number,
    totalCompanies: number,
    priority: 'HIGH' | 'MEDIUM' | 'LOW'
  ): AIResearchBrief {
    const strengths: string[] = [];
    const concerns: string[] = [];

    if (company.metrics.rocePct >= 25) strengths.push(`Exceptional capital productivity with ROCE of ${company.metrics.rocePct}%.`);
    if (company.metrics.debtToEquity <= 0.1) strengths.push(`Pristine balance sheet with virtually zero net debt (D/E ${company.metrics.debtToEquity}).`);
    if (company.metrics.revenueCagr3yPct >= 15) strengths.push(`Superior top-line growth with 3-year Sales CAGR of ${company.metrics.revenueCagr3yPct}%.`);
    if (company.metrics.fcfYieldPct >= 2.5) strengths.push(`Attractive cash generation yield with ${company.metrics.fcfYieldPct}% FCF yield.`);
    if (strengths.length < 2) strengths.push(`Stable market position in ${company.industry}.`, `Established operational track record.`);

    if (company.metrics.peRatio >= 50) concerns.push(`Elevated valuation multiple (P/E ${company.metrics.peRatio}x) leaves little margin of safety.`);
    if (company.metrics.workingCapitalDays >= 60 && company.sector !== 'Banking') concerns.push(`Elongated working capital requirement (${company.metrics.workingCapitalDays} days).`);
    if (company.metrics.revenueCagr3yPct < 10) concerns.push(`Moderate top-line expansion (3Y Sales CAGR ${company.metrics.revenueCagr3yPct}%).`);
    if (concerns.length < 2) concerns.push(`Competitive dynamics across ${company.sector} peers.`, `Input cost sensitivity on gross margins.`);

    return {
      companyId: company.id,
      ticker: company.ticker,
      companyName: company.name,
      generatedAt: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      researchPriority: priority,
      priorityRationale: `${company.name} ranks #${rank} out of ${totalCompanies} companies with a composite score of ${scores.overallScore.toFixed(1)}/100, driven primarily by strong performance in ${
        scores.quality.contribution > scores.growth.contribution ? 'Business Quality' : 'Growth'
      } (${scores.quality.score}/100) under your assigned weight configuration.`,
      keyStrengths: strengths.slice(0, 3),
      keyConcerns: concerns.slice(0, 3),
      anomalyNotes: anomalies.map((a) => `${a.metric}: ${a.explanation}`),
      analystFollowUpQuestions: [
        `Evaluate whether the company's operating margin (${company.metrics.opmPct}%) can be defended against competitive capacity additions.`,
        `Investigate cash flow conversion trends and verify whether working capital days can be compressed.`,
        `Analyze if the long-term addressable market supports the consensus growth implied by the ${company.metrics.peRatio}x P/E multiple.`,
      ],
      mlClusterContext: `Grouped into ML Cluster "${cluster.label}" (${cluster.description}) alongside ${cluster.companyIds.length - 1} peers.`,
      dataSummary: `Synthesized from verified Screener.in financial dataset covering latest audited balance sheet and TTM filings.`,
    };
  }
}
