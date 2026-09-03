import React, { useState } from 'react';
import { ScreeningFilters as IScreeningFilters } from '../types';
import { DEFAULT_FILTERS } from '../data/presets';
import { Filter, RotateCcw, ChevronDown, ChevronUp, CheckCircle, AlertCircle } from 'lucide-react';

interface ScreeningFiltersProps {
  filters: IScreeningFilters;
  onChangeFilters: (filters: IScreeningFilters) => void;
  totalCount: number;
  passingCount: number;
  showOnlyPassing: boolean;
  onToggleShowOnlyPassing: (val: boolean) => void;
}

export const ScreeningFilters: React.FC<ScreeningFiltersProps> = ({
  filters,
  onChangeFilters,
  totalCount,
  passingCount,
  showOnlyPassing,
  onToggleShowOnlyPassing,
}) => {
  const [isOpen, setIsOpen] = useState(true);

  const handleFilterChange = (key: keyof IScreeningFilters, value: number) => {
    onChangeFilters({
      ...filters,
      [key]: value,
    });
  };

  const handleReset = () => {
    onChangeFilters(DEFAULT_FILTERS);
  };

  return (
    <div id="screening-filters-panel" className="bg-[#15181E] border border-[#2D333B] rounded p-4 mb-4 text-[#E0E0E0]">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-[#D4AF37]" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Screening Filters (Pass / Fail Criteria)
          </h3>
          <span className="text-[11px] text-[#8E9299] hidden sm:inline">
            Filters exclude ineligible companies before final priority ranking
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Dynamic Pass/Fail Counter */}
          <div className="bg-[#1A1D23] border border-[#2D333B] px-3 py-1 rounded text-xs font-mono flex items-center gap-2">
            <span className="text-[#8E9299]">Universe: <strong className="text-white">{totalCount}</strong></span>
            <span className="text-[#2D333B]">|</span>
            <span className="text-[#10B981]">Passing: <strong>{passingCount}</strong></span>
          </div>

          <button
            id="reset-filters-btn"
            onClick={handleReset}
            className="text-xs text-[#8E9299] hover:text-white hover:bg-[#1A1D23] p-1.5 rounded transition-colors flex items-center gap-1 border border-transparent hover:border-[#2D333B]"
            title="Reset filters to standard institutional defaults"
          >
            <RotateCcw size={13} />
            <span className="hidden sm:inline">Reset</span>
          </button>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-[#8E9299] hover:text-white p-1"
          >
            {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="mt-4 pt-3 border-t border-[#2D333B]">
          {/* Filter Controls Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
            {/* Min ROCE */}
            <div className="bg-[#1A1D23] p-2.5 rounded border border-[#2D333B]">
              <div className="text-[11px] text-[#8E9299] font-semibold mb-1">Min ROCE</div>
              <div className="flex items-center gap-1">
                <input
                  id="filter-min-roce"
                  type="number"
                  value={filters.minRoce}
                  onChange={(e) => handleFilterChange('minRoce', Number(e.target.value))}
                  className="w-full bg-[#0F1115] border border-[#2D333B] text-white text-xs font-mono px-2 py-1 rounded focus:border-[#D4AF37] focus:outline-none"
                />
                <span className="text-xs text-[#8E9299]">%</span>
              </div>
            </div>

            {/* Min Revenue CAGR */}
            <div className="bg-[#1A1D23] p-2.5 rounded border border-[#2D333B]">
              <div className="text-[11px] text-[#8E9299] font-semibold mb-1">Min Rev CAGR (3Y)</div>
              <div className="flex items-center gap-1">
                <input
                  id="filter-min-rev-cagr"
                  type="number"
                  value={filters.minRevenueCagr}
                  onChange={(e) => handleFilterChange('minRevenueCagr', Number(e.target.value))}
                  className="w-full bg-[#0F1115] border border-[#2D333B] text-white text-xs font-mono px-2 py-1 rounded focus:border-[#D4AF37] focus:outline-none"
                />
                <span className="text-xs text-[#8E9299]">%</span>
              </div>
            </div>

            {/* Min Profit CAGR */}
            <div className="bg-[#1A1D23] p-2.5 rounded border border-[#2D333B]">
              <div className="text-[11px] text-[#8E9299] font-semibold mb-1">Min PAT CAGR (3Y)</div>
              <div className="flex items-center gap-1">
                <input
                  id="filter-min-pat-cagr"
                  type="number"
                  value={filters.minProfitCagr}
                  onChange={(e) => handleFilterChange('minProfitCagr', Number(e.target.value))}
                  className="w-full bg-[#0F1115] border border-[#2D333B] text-white text-xs font-mono px-2 py-1 rounded focus:border-[#D4AF37] focus:outline-none"
                />
                <span className="text-xs text-[#8E9299]">%</span>
              </div>
            </div>

            {/* Max Debt/Equity */}
            <div className="bg-[#1A1D23] p-2.5 rounded border border-[#2D333B]">
              <div className="text-[11px] text-[#8E9299] font-semibold mb-1">Max Debt/Equity</div>
              <div className="flex items-center gap-1">
                <input
                  id="filter-max-de"
                  type="number"
                  step="0.05"
                  value={filters.maxDebtToEquity}
                  onChange={(e) => handleFilterChange('maxDebtToEquity', Number(e.target.value))}
                  className="w-full bg-[#0F1115] border border-[#2D333B] text-white text-xs font-mono px-2 py-1 rounded focus:border-[#D4AF37] focus:outline-none"
                />
                <span className="text-xs text-[#8E9299]">x</span>
              </div>
            </div>

            {/* Max P/E */}
            <div className="bg-[#1A1D23] p-2.5 rounded border border-[#2D333B]">
              <div className="text-[11px] text-[#8E9299] font-semibold mb-1">Max P/E Ratio</div>
              <div className="flex items-center gap-1">
                <input
                  id="filter-max-pe"
                  type="number"
                  value={filters.maxPeRatio}
                  onChange={(e) => handleFilterChange('maxPeRatio', Number(e.target.value))}
                  className="w-full bg-[#0F1115] border border-[#2D333B] text-white text-xs font-mono px-2 py-1 rounded focus:border-[#D4AF37] focus:outline-none"
                />
                <span className="text-xs text-[#8E9299]">x</span>
              </div>
            </div>

            {/* Min Operating Margin */}
            <div className="bg-[#1A1D23] p-2.5 rounded border border-[#2D333B]">
              <div className="text-[11px] text-[#8E9299] font-semibold mb-1">Min OPM %</div>
              <div className="flex items-center gap-1">
                <input
                  id="filter-min-opm"
                  type="number"
                  value={filters.minOperatingMargin}
                  onChange={(e) => handleFilterChange('minOperatingMargin', Number(e.target.value))}
                  className="w-full bg-[#0F1115] border border-[#2D333B] text-white text-xs font-mono px-2 py-1 rounded focus:border-[#D4AF37] focus:outline-none"
                />
                <span className="text-xs text-[#8E9299]">%</span>
              </div>
            </div>

            {/* Min FCF Yield */}
            <div className="bg-[#1A1D23] p-2.5 rounded border border-[#2D333B]">
              <div className="text-[11px] text-[#8E9299] font-semibold mb-1">Min FCF Yield</div>
              <div className="flex items-center gap-1">
                <input
                  id="filter-min-fcf-yield"
                  type="number"
                  step="0.5"
                  value={filters.minFcfYield}
                  onChange={(e) => handleFilterChange('minFcfYield', Number(e.target.value))}
                  className="w-full bg-[#0F1115] border border-[#2D333B] text-white text-xs font-mono px-2 py-1 rounded focus:border-[#D4AF37] focus:outline-none"
                />
                <span className="text-xs text-[#8E9299]">%</span>
              </div>
            </div>
          </div>

          {/* Table Display Toggle */}
          <div className="mt-3 flex items-center justify-between text-xs pt-2 border-t border-[#2D333B]">
            <label className="flex items-center gap-2 cursor-pointer text-[#E0E0E0]">
              <input
                id="toggle-filter-passing-only"
                type="checkbox"
                checked={showOnlyPassing}
                onChange={(e) => onToggleShowOnlyPassing(e.target.checked)}
                className="w-4 h-4 rounded bg-[#0F1115] border-[#2D333B] accent-[#D4AF37] cursor-pointer"
              />
              <span>Display only companies passing active filters in ranking table</span>
            </label>

            <span className="text-[11px] text-[#8E9299]">
              Note: Screening filters filter the universe; scoring weights rank the survivors.
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
