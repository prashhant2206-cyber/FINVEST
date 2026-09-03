import React from 'react';
import { DataSourceStatus } from '../types';
import { Activity, Database, RefreshCw, Sliders, BookOpen, Layers, AlertTriangle, TrendingUp } from 'lucide-react';

interface HeaderProps {
  status: DataSourceStatus | null;
  selectedSector: string;
  availableSectors: string[];
  onSelectSector: (sector: string) => void;
  onRefreshData: () => void;
  onSyncDynamicPrices?: () => void;
  isSyncingPrices?: boolean;
  onOpenAdapterModal: () => void;
  onOpenMethodologyModal: () => void;
  isRefreshing: boolean;
  activeView: 'dashboard' | 'clusters' | 'comparison' | 'anomalies';
  onChangeView: (view: 'dashboard' | 'clusters' | 'comparison' | 'anomalies') => void;
  anomalyCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  status,
  selectedSector,
  availableSectors,
  onSelectSector,
  onRefreshData,
  onSyncDynamicPrices,
  isSyncingPrices,
  onOpenAdapterModal,
  onOpenMethodologyModal,
  isRefreshing,
  activeView,
  onChangeView,
  anomalyCount,
}) => {
  return (
    <header id="main-app-header" className="bg-[#1A1D23] border-b border-[#2D333B] text-[#E0E0E0] sticky top-0 z-40">
      {/* Top Brand & Status Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs border-b border-[#2D333B]">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded bg-[#D4AF37] text-[#0F1115] font-bold text-lg flex items-center justify-center tracking-wider shadow-sm">
              F
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-[#D4AF37] tracking-tight text-base">FINVEST AI</span>
                <span className="bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30 text-[9px] px-1.5 py-0.2 rounded font-bold uppercase tracking-wider hidden sm:inline">
                  Terminal
                </span>
              </div>
              <p className="text-[10px] uppercase tracking-widest text-[#8E9299]">Institutional Equity Research Terminal</p>
            </div>
          </div>

          <div className="h-4 w-[1px] bg-[#2D333B] hidden sm:block" />

          {/* Live Data Connector Status */}
          <div className="flex items-center gap-2 bg-[#15181E] px-2.5 py-1 rounded border border-[#2D333B]">
            <span className="text-[#8E9299] text-[10px] uppercase font-semibold">DATA SOURCE:</span>
            <span className="font-medium text-white truncate max-w-[200px]">
              {status?.sourceName || 'Screener / Permitted Feed'}
            </span>
          </div>

          <div className="flex items-center gap-2 bg-[#15181E] px-2.5 py-1 rounded border border-[#2D333B] hidden md:flex">
            <span className="text-[#8E9299] text-[10px] uppercase font-semibold">LAST SYNC:</span>
            <span className="text-[#E0E0E0] font-mono text-[11px]">{status?.lastUpdated || '23 Aug 2026, 12:30 PM'}</span>
          </div>

          <div className="flex items-center gap-1.5 bg-[#15181E] px-2.5 py-1 rounded border border-[#2D333B]">
            <span
              className={`w-2 h-2 rounded-full ${
                status?.isDemo
                  ? 'bg-amber-400 animate-pulse'
                  : 'bg-[#10B981] animate-pulse'
              }`}
            />
            <span className="font-semibold text-white text-[11px]">
              {status?.isDemo ? 'DEMO DATA' : 'Connected'}
            </span>
          </div>
        </div>

        {/* Global Controls */}
        <div className="flex items-center gap-2">
          {onSyncDynamicPrices && (
            <button
              id="header-live-prices-btn"
              onClick={onSyncDynamicPrices}
              disabled={isSyncingPrices}
              className="flex items-center gap-1.5 bg-[#15181E] hover:bg-[#2D333B] text-[#10B981] hover:text-emerald-300 px-2.5 py-1 rounded border border-[#10B981]/30 hover:border-[#10B981]/60 transition-colors disabled:opacity-50 text-xs font-medium"
              title="Fetch dynamic live quotes and recompute market caps & P/E ratios"
            >
              <TrendingUp size={13} className={isSyncingPrices ? 'animate-bounce text-[#10B981]' : 'text-[#10B981]'} />
              <span className="hidden sm:inline">{isSyncingPrices ? 'Fetching Ticks...' : 'Live Quotes'}</span>
            </button>
          )}

          <button
            id="header-refresh-btn"
            onClick={onRefreshData}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 bg-[#15181E] hover:bg-[#2D333B] text-[#E0E0E0] hover:text-white px-2.5 py-1 rounded border border-[#2D333B] transition-colors disabled:opacity-50 text-xs"
            title="Refresh connection with permitted data source"
          >
            <RefreshCw size={13} className={isRefreshing ? 'animate-spin text-[#D4AF37]' : 'text-[#8E9299]'} />
            <span className="hidden sm:inline">{isRefreshing ? 'Syncing...' : 'Sync Feed'}</span>
          </button>

          <button
            id="header-adapter-btn"
            onClick={onOpenAdapterModal}
            className="flex items-center gap-1.5 bg-[#15181E] hover:bg-[#2D333B] text-[#E0E0E0] hover:text-white px-2.5 py-1 rounded border border-[#2D333B] transition-colors text-xs"
          >
            <Database size={13} className="text-[#D4AF37]" />
            <span className="hidden sm:inline">Data Adapter</span>
          </button>

          <button
            id="header-methodology-btn"
            onClick={onOpenMethodologyModal}
            className="flex items-center gap-1.5 bg-[#15181E] hover:bg-[#2D333B] text-[#E0E0E0] hover:text-white px-2.5 py-1 rounded border border-[#2D333B] transition-colors text-xs"
          >
            <BookOpen size={13} className="text-[#D4AF37]" />
            <span className="hidden sm:inline">Methodology</span>
          </button>
        </div>
      </div>

      {/* Navigation Sub-Bar & Universe Selector */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 flex flex-wrap items-center justify-between gap-3">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <button
            id="nav-tab-dashboard"
            onClick={() => onChangeView('dashboard')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-semibold transition-all ${
              activeView === 'dashboard'
                ? 'bg-[#D4AF37] text-[#0F1115] font-bold shadow-sm'
                : 'text-[#8E9299] hover:text-[#E0E0E0] hover:bg-[#15181E]'
            }`}
          >
            <Sliders size={14} />
            Research Matrix & Strategy
          </button>

          <button
            id="nav-tab-comparison"
            onClick={() => onChangeView('comparison')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-semibold transition-all ${
              activeView === 'comparison'
                ? 'bg-[#D4AF37] text-[#0F1115] font-bold shadow-sm'
                : 'text-[#8E9299] hover:text-[#E0E0E0] hover:bg-[#15181E]'
            }`}
          >
            <Layers size={14} />
            Strategy Comparison
          </button>

          <button
            id="nav-tab-clusters"
            onClick={() => onChangeView('clusters')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-semibold transition-all ${
              activeView === 'clusters'
                ? 'bg-[#D4AF37] text-[#0F1115] font-bold shadow-sm'
                : 'text-[#8E9299] hover:text-[#E0E0E0] hover:bg-[#15181E]'
            }`}
          >
            <Activity size={14} />
            ML K-Means Clustering
          </button>

          <button
            id="nav-tab-anomalies"
            onClick={() => onChangeView('anomalies')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-semibold transition-all ${
              activeView === 'anomalies'
                ? 'bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/40 font-bold'
                : 'text-[#8E9299] hover:text-[#E0E0E0] hover:bg-[#15181E]'
            }`}
          >
            <AlertTriangle size={14} className="text-[#EF4444]" />
            Anomaly Center
            {anomalyCount > 0 && (
              <span className="bg-[#EF4444] text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                {anomalyCount}
              </span>
            )}
          </button>
        </div>

        {/* Sector Universe Selector */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-[#8E9299] uppercase font-semibold">Universe:</span>
          <select
            id="sector-universe-select"
            value={selectedSector}
            onChange={(e) => onSelectSector(e.target.value)}
            className="bg-[#15181E] border border-[#2D333B] text-white text-xs rounded px-3 py-1.5 focus:outline-none focus:border-[#D4AF37] cursor-pointer"
          >
            {availableSectors.map((sector) => (
              <option key={sector} value={sector}>
                {sector} {sector === 'FMCG' ? '(Default Demo)' : ''}
              </option>
            ))}
          </select>
        </div>
      </div>
    </header>
  );
};
