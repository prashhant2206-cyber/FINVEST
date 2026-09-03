import React, { useState } from 'react';
import { PillarWeights, SubMetricWeights, StrategyProfile } from '../types';
import { STRATEGY_PRESETS } from '../data/presets';
import { Sliders, ChevronDown, ChevronUp, Sparkles, RefreshCcw, Save, Check } from 'lucide-react';

interface StrategyBuilderProps {
  pillars: PillarWeights;
  subWeights: SubMetricWeights;
  onChangePillars: (pillars: PillarWeights) => void;
  onChangeSubWeights: (subWeights: SubMetricWeights) => void;
  onApplyPreset: (preset: StrategyProfile) => void;
  activePresetId: string;
}

export const StrategyBuilder: React.FC<StrategyBuilderProps> = ({
  pillars,
  subWeights,
  onChangePillars,
  onChangeSubWeights,
  onApplyPreset,
  activePresetId,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [activeSubTab, setActiveSubTab] = useState<'quality' | 'growth' | 'risk' | 'valuation'>('quality');
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  const totalWeight =
    pillars.businessQuality +
    pillars.growth +
    pillars.financialRisk +
    pillars.valuation;

  const is100 = totalWeight === 100;

  const handlePillarChange = (key: keyof PillarWeights, value: number) => {
    const clamped = Math.max(0, Math.min(100, Math.round(value)));
    onChangePillars({
      ...pillars,
      [key]: clamped,
    });
  };

  const handleNormalizePillars = () => {
    if (totalWeight === 0) {
      onChangePillars({ businessQuality: 25, growth: 25, financialRisk: 25, valuation: 25 });
      return;
    }
    const factor = 100 / totalWeight;
    const q = Math.round(pillars.businessQuality * factor);
    const g = Math.round(pillars.growth * factor);
    const r = Math.round(pillars.financialRisk * factor);
    const v = 100 - (q + g + r);
    onChangePillars({ businessQuality: q, growth: g, financialRisk: r, valuation: Math.max(0, v) });
  };

  const handleSubWeightChange = (category: 'quality' | 'growth' | 'risk' | 'valuation', subKey: string, val: number) => {
    const categoryObj = { ...subWeights[category], [subKey]: Math.max(0, Math.min(100, Math.round(val))) };
    onChangeSubWeights({
      ...subWeights,
      [category]: categoryObj,
    });
  };

  const handleNormalizeSubWeights = (category: 'quality' | 'growth' | 'risk' | 'valuation') => {
    const current = subWeights[category] as Record<string, number>;
    const sum = Object.values(current).reduce((a, b) => a + b, 0);
    if (sum === 0) return;
    const factor = 100 / sum;
    const keys = Object.keys(current);
    const updated: Record<string, number> = {};
    let running = 0;
    for (let i = 0; i < keys.length - 1; i++) {
      const k = keys[i];
      updated[k] = Math.round(current[k] * factor);
      running += updated[k];
    }
    updated[keys[keys.length - 1]] = Math.max(0, 100 - running);
    onChangeSubWeights({
      ...subWeights,
      [category]: updated,
    });
  };

  const getSubWeightTotal = (category: 'quality' | 'growth' | 'risk' | 'valuation') => {
    return Object.values(subWeights[category] as Record<string, number>).reduce((a, b) => a + b, 0);
  };

  return (
    <div id="strategy-builder-panel" className="bg-[#15181E] border border-[#2D333B] rounded p-4 mb-4 text-[#E0E0E0]">
      {/* Header & Presets */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3 pb-3 border-b border-[#2D333B]">
        <div>
          <div className="flex items-center gap-2">
            <Sliders size={16} className="text-[#D4AF37]" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Build Your Research Strategy
            </h2>
            <span className="bg-[#1A1D23] border border-[#2D333B] text-[#D4AF37] text-[10px] px-2 py-0.5 rounded font-mono font-bold">
              Dynamic Weighting Engine
            </span>
          </div>
          <p className="text-[11px] text-[#8E9299] mt-0.5">
            Assign weights to dictate what matters. Scores and company rankings recalculate instantly.
          </p>
        </div>

        {/* Total Weight Badge & Balance Helper */}
        <div className="flex items-center gap-2">
          <div
            className={`px-3 py-1 rounded text-xs font-mono font-bold flex items-center gap-1.5 border ${
              is100
                ? 'bg-[#10B981]/15 text-[#10B981] border-[#10B981]/30'
                : 'bg-[#EF4444]/15 text-[#EF4444] border-[#EF4444]/30 animate-pulse'
            }`}
          >
            <span>TOTAL: {totalWeight}%</span>
            {is100 ? (
              <Check size={13} />
            ) : (
              <span className="text-[10px]">({100 - totalWeight > 0 ? `+${100 - totalWeight}% needed` : `${100 - totalWeight}%`})</span>
            )}
          </div>

          {!is100 && (
            <button
              id="normalize-weights-btn"
              onClick={handleNormalizePillars}
              className="bg-[#D4AF37] hover:bg-[#c49f27] text-[#0F1115] text-xs px-2.5 py-1 rounded font-bold transition-colors flex items-center gap-1"
              title="Automatically rescale current weights to 100%"
            >
              <RefreshCcw size={12} />
              Balance to 100%
            </button>
          )}
        </div>
      </div>

      {/* Preset Strategy Chips */}
      <div className="mb-4">
        <div className="text-[11px] font-semibold uppercase text-[#8E9299] mb-2 flex items-center gap-1.5">
          <Sparkles size={12} className="text-[#D4AF37]" />
          <span>Select Strategy Archetype:</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {STRATEGY_PRESETS.map((preset) => {
            const isSelected = activePresetId === preset.id;
            return (
              <button
                key={preset.id}
                id={`preset-strategy-${preset.id}`}
                onClick={() => onApplyPreset(preset)}
                className={`px-3 py-1.5 rounded text-xs transition-all text-left flex items-center gap-1.5 border ${
                  isSelected
                    ? 'bg-[#D4AF37] text-[#0F1115] border-[#D4AF37] font-bold shadow-sm'
                    : 'bg-[#1A1D23] text-[#8E9299] hover:text-[#E0E0E0] hover:bg-[#20242C] border-[#2D333B]'
                }`}
                title={preset.description}
              >
                <span>{preset.name}</span>
                {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-[#0F1115] ml-0.5" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4 Pillars Interactive Sliders */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
        {/* 1. Business Quality */}
        <div className="bg-[#1A1D23] border border-[#2D333B] rounded p-3 relative">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold text-[#10B981]">Business Quality</span>
            <div className="flex items-center gap-1">
              <input
                id="slider-input-quality"
                type="number"
                min="0"
                max="100"
                value={pillars.businessQuality}
                onChange={(e) => handlePillarChange('businessQuality', Number(e.target.value))}
                className="w-12 bg-[#0F1115] border border-[#2D333B] text-white text-xs font-mono text-center rounded py-0.5 focus:border-[#10B981] focus:outline-none"
              />
              <span className="text-xs text-[#8E9299]">%</span>
            </div>
          </div>
          <input
            id="slider-quality"
            type="range"
            min="0"
            max="100"
            value={pillars.businessQuality}
            onChange={(e) => handlePillarChange('businessQuality', Number(e.target.value))}
            className="w-full h-1.5 bg-[#2D333B] rounded-lg appearance-none cursor-pointer accent-[#10B981]"
          />
          <div className="text-[10px] text-[#8E9299] mt-1 flex justify-between">
            <span>ROCE, ROE, Margin, FCF</span>
            <span className="font-mono text-white font-bold">{pillars.businessQuality}%</span>
          </div>
        </div>

        {/* 2. Growth */}
        <div className="bg-[#1A1D23] border border-[#2D333B] rounded p-3 relative">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold text-[#D4AF37]">Growth Momentum</span>
            <div className="flex items-center gap-1">
              <input
                id="slider-input-growth"
                type="number"
                min="0"
                max="100"
                value={pillars.growth}
                onChange={(e) => handlePillarChange('growth', Number(e.target.value))}
                className="w-12 bg-[#0F1115] border border-[#2D333B] text-white text-xs font-mono text-center rounded py-0.5 focus:border-[#D4AF37] focus:outline-none"
              />
              <span className="text-xs text-[#8E9299]">%</span>
            </div>
          </div>
          <input
            id="slider-growth"
            type="range"
            min="0"
            max="100"
            value={pillars.growth}
            onChange={(e) => handlePillarChange('growth', Number(e.target.value))}
            className="w-full h-1.5 bg-[#2D333B] rounded-lg appearance-none cursor-pointer accent-[#D4AF37]"
          />
          <div className="text-[10px] text-[#8E9299] mt-1 flex justify-between">
            <span>Sales & PAT CAGR, EPS</span>
            <span className="font-mono text-white font-bold">{pillars.growth}%</span>
          </div>
        </div>

        {/* 3. Financial Risk */}
        <div className="bg-[#1A1D23] border border-[#2D333B] rounded p-3 relative">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold text-[#EF4444]">Financial Risk</span>
            <div className="flex items-center gap-1">
              <input
                id="slider-input-risk"
                type="number"
                min="0"
                max="100"
                value={pillars.financialRisk}
                onChange={(e) => handlePillarChange('financialRisk', Number(e.target.value))}
                className="w-12 bg-[#0F1115] border border-[#2D333B] text-white text-xs font-mono text-center rounded py-0.5 focus:border-[#EF4444] focus:outline-none"
              />
              <span className="text-xs text-[#8E9299]">%</span>
            </div>
          </div>
          <input
            id="slider-risk"
            type="range"
            min="0"
            max="100"
            value={pillars.financialRisk}
            onChange={(e) => handlePillarChange('financialRisk', Number(e.target.value))}
            className="w-full h-1.5 bg-[#2D333B] rounded-lg appearance-none cursor-pointer accent-[#EF4444]"
          />
          <div className="text-[10px] text-[#8E9299] mt-1 flex justify-between">
            <span>Debt/Equity, Cov, WC Days</span>
            <span className="font-mono text-white font-bold">{pillars.financialRisk}%</span>
          </div>
        </div>

        {/* 4. Valuation */}
        <div className="bg-[#1A1D23] border border-[#2D333B] rounded p-3 relative">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold text-[#D4AF37]">Valuation Multiple</span>
            <div className="flex items-center gap-1">
              <input
                id="slider-input-valuation"
                type="number"
                min="0"
                max="100"
                value={pillars.valuation}
                onChange={(e) => handlePillarChange('valuation', Number(e.target.value))}
                className="w-12 bg-[#0F1115] border border-[#2D333B] text-white text-xs font-mono text-center rounded py-0.5 focus:border-[#D4AF37] focus:outline-none"
              />
              <span className="text-xs text-[#8E9299]">%</span>
            </div>
          </div>
          <input
            id="slider-valuation"
            type="range"
            min="0"
            max="100"
            value={pillars.valuation}
            onChange={(e) => handlePillarChange('valuation', Number(e.target.value))}
            className="w-full h-1.5 bg-[#2D333B] rounded-lg appearance-none cursor-pointer accent-[#D4AF37]"
          />
          <div className="text-[10px] text-[#8E9299] mt-1 flex justify-between">
            <span>P/E, EV/EBITDA, FCF Yield</span>
            <span className="font-mono text-white font-bold">{pillars.valuation}%</span>
          </div>
        </div>
      </div>

      {/* Sub-Metric Weights Accordion Trigger */}
      <div className="pt-2 border-t border-[#2D333B] flex items-center justify-between">
        <button
          id="toggle-sub-weights-btn"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-xs text-[#D4AF37] hover:underline flex items-center gap-1.5 font-medium transition-colors"
        >
          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          <span>{isExpanded ? 'Hide' : 'Configure'} Detailed Sub-Metric Internal Weights</span>
        </button>

        <div className="text-[11px] text-[#8E9299]">
          Normalized using cross-universe percentile ranking
        </div>
      </div>

      {/* Sub-Metric Weights Panel */}
      {isExpanded && (
        <div id="sub-metric-weights-drawer" className="mt-3 pt-3 border-t border-[#2D333B] bg-[#101216] p-3 rounded">
          {/* Sub-Metric Category Tabs */}
          <div className="flex items-center gap-2 mb-3 border-b border-[#2D333B] pb-2">
            {(['quality', 'growth', 'risk', 'valuation'] as const).map((cat) => {
              const catTotal = getSubWeightTotal(cat);
              const isCat100 = catTotal === 100;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveSubTab(cat)}
                  className={`px-3 py-1 text-xs rounded font-semibold capitalize flex items-center gap-1.5 transition-colors ${
                    activeSubTab === cat
                      ? 'bg-[#D4AF37] text-[#0F1115] font-bold'
                      : 'text-[#8E9299] hover:text-[#E0E0E0] hover:bg-[#1A1D23]'
                  }`}
                >
                  <span>{cat}</span>
                  <span
                    className={`text-[10px] font-mono px-1 rounded ${
                      isCat100 ? 'bg-black/20 text-white' : 'bg-red-500/20 text-red-400'
                    }`}
                  >
                    {catTotal}%
                  </span>
                </button>
              );
            })}
          </div>

          {/* Sub-Metric Sliders for Active Category */}
          <div className="space-y-3">
            {activeSubTab === 'quality' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {[
                  { key: 'roce', label: 'ROCE % (Return on Capital)', desc: 'Higher is better' },
                  { key: 'roe', label: 'ROE % (Return on Equity)', desc: 'Higher is better' },
                  { key: 'operatingMargin', label: 'Operating Margin % (OPM)', desc: 'Higher is better' },
                  { key: 'fcfConversion', label: 'FCF Conversion %', desc: 'Higher is better' },
                  { key: 'interestCoverage', label: 'Interest Coverage', desc: 'Higher is better' },
                ].map((item) => (
                  <div key={item.key} className="bg-[#1A1D23] p-2.5 rounded border border-[#2D333B]">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-white font-medium">{item.label}</span>
                      <span className="font-mono text-[#10B981] font-bold">
                        {(subWeights.quality as any)[item.key]}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={(subWeights.quality as any)[item.key]}
                      onChange={(e) => handleSubWeightChange('quality', item.key, Number(e.target.value))}
                      className="w-full h-1.5 bg-[#2D333B] rounded appearance-none cursor-pointer accent-[#10B981]"
                    />
                    <span className="text-[10px] text-[#8E9299]">{item.desc}</span>
                  </div>
                ))}
              </div>
            )}

            {activeSubTab === 'growth' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  { key: 'revenueCagr', label: 'Revenue CAGR 3Y', desc: 'Higher is better' },
                  { key: 'profitCagr', label: 'Net Profit CAGR 3Y', desc: 'Higher is better' },
                  { key: 'epsCagr', label: 'EPS CAGR 3Y', desc: 'Higher is better' },
                  { key: 'ebitdaGrowth', label: 'EBITDA Growth', desc: 'Higher is better' },
                ].map((item) => (
                  <div key={item.key} className="bg-[#1A1D23] p-2.5 rounded border border-[#2D333B]">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-white font-medium">{item.label}</span>
                      <span className="font-mono text-[#D4AF37] font-bold">
                        {(subWeights.growth as any)[item.key]}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={(subWeights.growth as any)[item.key]}
                      onChange={(e) => handleSubWeightChange('growth', item.key, Number(e.target.value))}
                      className="w-full h-1.5 bg-[#2D333B] rounded appearance-none cursor-pointer accent-[#D4AF37]"
                    />
                    <span className="text-[10px] text-[#8E9299]">{item.desc}</span>
                  </div>
                ))}
              </div>
            )}

            {activeSubTab === 'risk' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {[
                  { key: 'debtToEquity', label: 'Debt to Equity', desc: 'Lower is better' },
                  { key: 'interestCoverage', label: 'Interest Coverage', desc: 'Higher is better' },
                  { key: 'earningsVolatility', label: 'Earnings Volatility', desc: 'Lower is better' },
                  { key: 'cashFlowStability', label: 'Cash Flow Stability', desc: 'Higher is better' },
                  { key: 'workingCapitalDays', label: 'Working Capital Days', desc: 'Lower is better' },
                ].map((item) => (
                  <div key={item.key} className="bg-[#1A1D23] p-2.5 rounded border border-[#2D333B]">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-white font-medium">{item.label}</span>
                      <span className="font-mono text-[#EF4444] font-bold">
                        {(subWeights.risk as any)[item.key]}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={(subWeights.risk as any)[item.key]}
                      onChange={(e) => handleSubWeightChange('risk', item.key, Number(e.target.value))}
                      className="w-full h-1.5 bg-[#2D333B] rounded appearance-none cursor-pointer accent-[#EF4444]"
                    />
                    <span className="text-[10px] text-[#8E9299]">{item.desc}</span>
                  </div>
                ))}
              </div>
            )}

            {activeSubTab === 'valuation' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  { key: 'peRatio', label: 'P/E Ratio', desc: 'Lower is better' },
                  { key: 'evEbitda', label: 'EV/EBITDA', desc: 'Lower is better' },
                  { key: 'pbRatio', label: 'P/B Ratio', desc: 'Lower is better' },
                  { key: 'fcfYield', label: 'FCF Yield %', desc: 'Higher is better' },
                ].map((item) => (
                  <div key={item.key} className="bg-[#1A1D23] p-2.5 rounded border border-[#2D333B]">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-white font-medium">{item.label}</span>
                      <span className="font-mono text-[#D4AF37] font-bold">
                        {(subWeights.valuation as any)[item.key]}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={(subWeights.valuation as any)[item.key]}
                      onChange={(e) => handleSubWeightChange('valuation', item.key, Number(e.target.value))}
                      className="w-full h-1.5 bg-[#2D333B] rounded appearance-none cursor-pointer accent-[#D4AF37]"
                    />
                    <span className="text-[10px] text-[#8E9299]">{item.desc}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Rebalance Active Sub-Category */}
            <div className="flex justify-end pt-2">
              <button
                onClick={() => handleNormalizeSubWeights(activeSubTab)}
                className="text-xs bg-[#1A1D23] hover:bg-[#20242C] text-[#E0E0E0] px-2.5 py-1 rounded border border-[#2D333B] flex items-center gap-1.5"
              >
                <RefreshCcw size={12} className="text-[#D4AF37]" />
                Balance {activeSubTab} sub-weights to 100%
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
