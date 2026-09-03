import React, { useMemo } from 'react';
import { EvaluatedCompany, StrategyProfile } from '../types';
import { STRATEGY_PRESETS } from '../data/presets';
import { ScoringEngine } from '../../server/services/scoringEngine';
import { Layers, ArrowUpRight, ArrowDownRight, Minus, ChevronRight, HelpCircle } from 'lucide-react';

interface StrategyComparisonViewProps {
  currentEvaluated: EvaluatedCompany[];
  onSelectCompany: (company: EvaluatedCompany) => void;
  activeStrategyName: string;
}

export const StrategyComparisonView: React.FC<StrategyComparisonViewProps> = ({
  currentEvaluated,
  onSelectCompany,
  activeStrategyName,
}) => {
  // Compute rankings under alternative preset strategies
  const comparisonData = useMemo(() => {
    const rawCompanies = currentEvaluated.map((c) => c.company);
    if (rawCompanies.length === 0) return [];

    const qualityGrowthPreset = STRATEGY_PRESETS.find((p) => p.id === 'quality_growth')!;
    const deepValuePreset = STRATEGY_PRESETS.find((p) => p.id === 'deep_value')!;
    const conservativePreset = STRATEGY_PRESETS.find((p) => p.id === 'conservative')!;

    const qgScores = ScoringEngine.calculateScores(rawCompanies, qualityGrowthPreset.pillars, qualityGrowthPreset.subWeights);
    const dvScores = ScoringEngine.calculateScores(rawCompanies, deepValuePreset.pillars, deepValuePreset.subWeights);
    const consScores = ScoringEngine.calculateScores(rawCompanies, conservativePreset.pillars, conservativePreset.subWeights);

    // Sort to determine ranks in each strategy
    const getRankMap = (scoreMap: Map<string, any>) => {
      const sorted = [...rawCompanies].sort((a, b) => {
        return (scoreMap.get(b.id)?.overallScore || 0) - (scoreMap.get(a.id)?.overallScore || 0);
      });
      const map = new Map<string, number>();
      sorted.forEach((comp, idx) => map.set(comp.id, idx + 1));
      return map;
    };

    const qgRankMap = getRankMap(qgScores);
    const dvRankMap = getRankMap(dvScores);
    const consRankMap = getRankMap(consScores);

    return currentEvaluated.map((c) => {
      const qgRank = qgRankMap.get(c.company.id) || 1;
      const dvRank = dvRankMap.get(c.company.id) || 1;
      const consRank = consRankMap.get(c.company.id) || 1;

      // Explain primary variance driver
      let explanation = '';
      if (dvRank < qgRank) {
        explanation = `Outperforms under Deep Value (Rank #${dvRank}) due to lower valuation multiples (P/E ${c.company.metrics.peRatio}x, FCF Yield ${c.company.metrics.fcfYieldPct}%).`;
      } else {
        explanation = `Favored under Quality Growth (Rank #${qgRank}) due to superior ROCE (${c.company.metrics.rocePct}%) and 3Y Sales CAGR (${c.company.metrics.revenueCagr3yPct}%).`;
      }

      return {
        ...c,
        qgRank,
        dvRank,
        consRank,
        explanation,
      };
    });
  }, [currentEvaluated]);

  return (
    <div id="strategy-comparison-matrix" className="space-y-4 text-[#E0E0E0]">
      <div className="bg-[#15181E] border border-[#2D333B] rounded p-4">
        <div className="flex items-center gap-2">
          <Layers size={18} className="text-[#D4AF37]" />
          <h2 className="text-base font-bold text-white uppercase tracking-wider">
            Multi-Strategy Sensitivity Matrix
          </h2>
        </div>
        <p className="text-xs text-[#8E9299] mt-1 max-w-3xl leading-relaxed">
          Reveals how company prioritization shifts dynamically across differing investment mandates: Quality Growth vs Deep Value vs Conservative Balance Sheet vs Your Active Strategy.
        </p>
      </div>

      <div className="bg-[#15181E] border border-[#2D333B] rounded overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#1A1D23] text-[#8E9299] border-b border-[#2D333B] uppercase font-semibold text-[10px] tracking-wider">
                <th className="py-3 px-3">Company & Ticker</th>
                <th className="py-3 px-3 bg-[#D4AF37]/10 text-white border-x border-[#2D333B]">
                  Active Strategy (Rank)
                </th>
                <th className="py-3 px-3">Quality Growth</th>
                <th className="py-3 px-3">Deep Value</th>
                <th className="py-3 px-3">Conservative</th>
                <th className="py-3 px-3">Rank Sensitivity & Analytical Reason</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2D333B]">
              {comparisonData.map((item) => {
                const diffQG = item.rank - item.qgRank;
                const diffDV = item.rank - item.dvRank;

                return (
                  <tr
                    key={item.company.id}
                    onClick={() => onSelectCompany(item)}
                    className="hover:bg-[#1A1D23] cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-3">
                      <div className="font-bold text-white">{item.company.name}</div>
                      <div className="text-[10px] text-[#8E9299] font-mono">
                        {item.company.ticker} • {item.company.sector}
                      </div>
                    </td>

                    {/* Active Strategy Rank */}
                    <td className="py-3 px-3 bg-[#D4AF37]/5 border-x border-[#2D333B] font-mono">
                      <span className="font-bold text-sm text-[#D4AF37]">#{item.rank}</span>
                      <span className="text-[10px] text-[#8E9299] ml-2">
                        ({item.scores.overallScore.toFixed(1)}/100)
                      </span>
                    </td>

                    {/* Quality Growth */}
                    <td className="py-3 px-3 font-mono">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-white">#{item.qgRank}</span>
                        {diffQG !== 0 && (
                          <span
                            className={`text-[10px] flex items-center ${
                              diffQG > 0 ? 'text-[#10B981]' : 'text-[#EF4444]'
                            }`}
                          >
                            {diffQG > 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                            {Math.abs(diffQG)}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Deep Value */}
                    <td className="py-3 px-3 font-mono">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-white">#{item.dvRank}</span>
                        {diffDV !== 0 && (
                          <span
                            className={`text-[10px] flex items-center ${
                              diffDV > 0 ? 'text-[#10B981]' : 'text-[#EF4444]'
                            }`}
                          >
                            {diffDV > 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                            {Math.abs(diffDV)}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Conservative */}
                    <td className="py-3 px-3 font-mono">
                      <span className="font-semibold text-white">#{item.consRank}</span>
                    </td>

                    {/* Sensitivity Reason */}
                    <td className="py-3 px-3 text-[11px] text-[#E0E0E0] max-w-xs leading-snug">
                      {item.explanation}
                    </td>

                    {/* Action */}
                    <td className="py-3 px-3 text-right">
                      <button className="bg-[#1A1D23] hover:bg-[#D4AF37] hover:text-[#0F1115] text-[#D4AF37] border border-[#2D333B] px-2.5 py-1 rounded text-xs font-bold transition-colors inline-flex items-center gap-1">
                        <span>Inspect</span>
                        <ChevronRight size={13} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
