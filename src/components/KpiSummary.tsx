import React from 'react';
import { PillarWeights } from '../types';
import { Target, CheckCircle2, AlertTriangle, ShieldCheck, PieChart } from 'lucide-react';

interface KpiSummaryProps {
  totalUniverse: number;
  passingCount: number;
  highPriorityCount: number;
  anomalyCount: number;
  activeStrategyName: string;
  pillars: PillarWeights;
}

export const KpiSummary: React.FC<KpiSummaryProps> = ({
  totalUniverse,
  passingCount,
  highPriorityCount,
  anomalyCount,
  activeStrategyName,
  pillars,
}) => {
  return (
    <div id="kpi-summary-strip" className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
      {/* Total Screened */}
      <div className="bg-[#1A1D23] border border-[#2D333B] rounded p-3 text-[#E0E0E0]">
        <div className="flex items-center justify-between text-[#8E9299] text-xs mb-1">
          <span className="font-semibold uppercase tracking-wider text-[10px]">Universe Count</span>
          <Target size={14} className="text-[#D4AF37]" />
        </div>
        <div className="text-2xl font-bold text-white font-mono">{totalUniverse}</div>
        <div className="text-[11px] text-[#8E9299] mt-0.5">Companies evaluated</div>
      </div>

      {/* Passing Filters */}
      <div className="bg-[#1A1D23] border border-[#2D333B] rounded p-3 text-[#E0E0E0]">
        <div className="flex items-center justify-between text-[#8E9299] text-xs mb-1">
          <span className="font-semibold uppercase tracking-wider text-[10px]">Filter Qualified</span>
          <CheckCircle2 size={14} className="text-[#10B981]" />
        </div>
        <div className="text-2xl font-bold text-[#10B981] font-mono">
          {passingCount} <span className="text-xs text-[#8E9299] font-normal">/ {totalUniverse}</span>
        </div>
        <div className="text-[11px] text-[#8E9299] mt-0.5">
          {totalUniverse > 0 ? `${Math.round((passingCount / totalUniverse) * 100)}% pass rate` : '0%'}
        </div>
      </div>

      {/* High Research Priority */}
      <div className="bg-[#1A1D23] border border-[#2D333B] rounded p-3 text-[#E0E0E0]">
        <div className="flex items-center justify-between text-[#8E9299] text-xs mb-1">
          <span className="font-semibold uppercase tracking-wider text-[10px]">High Priority</span>
          <ShieldCheck size={14} className="text-[#D4AF37]" />
        </div>
        <div className="text-2xl font-bold text-[#D4AF37] font-mono">{highPriorityCount}</div>
        <div className="text-[11px] text-[#8E9299] mt-0.5">Score ≥ 70 / 100</div>
      </div>

      {/* Anomalies Flagged */}
      <div className="bg-[#1A1D23] border border-[#2D333B] rounded p-3 text-[#E0E0E0]">
        <div className="flex items-center justify-between text-[#8E9299] text-xs mb-1">
          <span className="font-semibold uppercase tracking-wider text-[10px] text-[#EF4444]">Anomalies Flagged</span>
          <AlertTriangle size={14} className="text-[#EF4444]" />
        </div>
        <div className="text-2xl font-bold text-[#EF4444] font-mono">{anomalyCount}</div>
        <div className="text-[11px] text-[#8E9299] mt-0.5">Require due diligence</div>
      </div>

      {/* Active Strategy Weights */}
      <div className="bg-[#1A1D23] border border-[#2D333B] rounded p-3 text-[#E0E0E0] col-span-2 md:col-span-1">
        <div className="flex items-center justify-between text-[#8E9299] text-xs mb-1">
          <span className="font-semibold uppercase tracking-wider text-[10px] text-[#D4AF37]">Active Mandate</span>
          <PieChart size={14} className="text-[#D4AF37]" />
        </div>
        <div className="text-sm font-bold text-white truncate" title={activeStrategyName}>
          {activeStrategyName}
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-[#8E9299] mt-1 font-mono">
          <span title="Quality" className="text-white">Q:{pillars.businessQuality}%</span>
          <span>•</span>
          <span title="Growth" className="text-white">G:{pillars.growth}%</span>
          <span>•</span>
          <span title="Risk" className="text-white">R:{pillars.financialRisk}%</span>
          <span>•</span>
          <span title="Valuation" className="text-white">V:{pillars.valuation}%</span>
        </div>
      </div>
    </div>
  );
};
