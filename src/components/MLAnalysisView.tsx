import React, { useState } from 'react';
import { MLCluster, AnomalyRecord, EvaluatedCompany } from '../types';
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, Tooltip, Cell, ZAxis } from 'recharts';
import { Activity, AlertTriangle, ExternalLink, ShieldAlert, CheckCircle2, ChevronRight } from 'lucide-react';

interface MLAnalysisViewProps {
  clusters: MLCluster[];
  anomalies: AnomalyRecord[];
  evaluatedCompanies: EvaluatedCompany[];
  onSelectCompany: (company: EvaluatedCompany) => void;
}

export const MLAnalysisView: React.FC<MLAnalysisViewProps> = ({
  clusters,
  anomalies,
  evaluatedCompanies,
  onSelectCompany,
}) => {
  const [selectedClusterId, setSelectedClusterId] = useState<number | null>(null);

  // Format data for Scatter Chart (ROCE vs PE Ratio)
  const scatterData = evaluatedCompanies.map((c) => ({
    x: c.company.metrics.rocePct,
    y: Math.min(120, c.company.metrics.peRatio),
    z: c.company.metrics.marketCapCr,
    name: c.company.name,
    ticker: c.company.ticker,
    clusterId: c.cluster.id,
    clusterLabel: c.cluster.label,
    color: c.cluster.color,
    score: c.scores.overallScore,
    rawCompany: c,
  }));

  const filteredAnomalies = selectedClusterId
    ? anomalies.filter((a) => {
        const comp = evaluatedCompanies.find((c) => c.company.id === a.companyId);
        return comp && comp.cluster.id === selectedClusterId;
      })
    : anomalies;

  return (
    <div id="ml-analysis-view" className="space-y-6 text-[#E0E0E0]">
      {/* Top Banner */}
      <div className="bg-[#15181E] border border-[#2D333B] rounded p-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Activity size={18} className="text-[#D4AF37]" />
            <h2 className="text-base font-bold text-white uppercase tracking-wider">
              Machine Learning Clustering & Financial Anomaly Center
            </h2>
          </div>
          <p className="text-xs text-[#8E9299] mt-1 max-w-3xl leading-relaxed">
            Multi-dimensional K-Means groups companies across 7 financial dimensions (ROCE, CAGR, D/E, Margin, FCF, P/E) without human bias. Anomaly detection flags divergences between accounting profits and cash flows.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedClusterId(null)}
            className={`px-3 py-1.5 rounded text-xs font-bold border transition-all ${
              selectedClusterId === null
                ? 'bg-[#D4AF37] text-[#0F1115] border-[#D4AF37]'
                : 'bg-[#1A1D23] text-[#E0E0E0] hover:text-white border-[#2D333B]'
            }`}
          >
            All Clusters ({clusters.length})
          </button>
        </div>
      </div>

      {/* 4 K-Means Cluster Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {clusters.map((cluster) => {
          const isSelected = selectedClusterId === cluster.id;
          return (
            <div
              key={cluster.id}
              id={`cluster-card-${cluster.id}`}
              onClick={() => setSelectedClusterId(isSelected ? null : cluster.id)}
              className={`bg-[#15181E] rounded p-4 border transition-all cursor-pointer relative ${
                isSelected
                  ? 'border-[#D4AF37] ring-1 ring-[#D4AF37]'
                  : 'border-[#2D333B] hover:border-[#8E9299]'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span
                  className="px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider border"
                  style={{
                    backgroundColor: `${cluster.color}15`,
                    color: cluster.color,
                    borderColor: `${cluster.color}40`,
                  }}
                >
                  {cluster.name}
                </span>
                <span className="text-xs font-mono font-bold text-[#D4AF37] bg-[#1A1D23] px-2 py-0.5 rounded border border-[#2D333B]">
                  {cluster.companyIds.length} Equities
                </span>
              </div>

              <h4 className="text-sm font-bold text-white mb-1">{cluster.label}</h4>
              <p className="text-[11px] text-[#8E9299] leading-relaxed mb-3">
                {cluster.description}
              </p>

              {/* Centroid Profile */}
              <div className="bg-[#0F1115] p-2 rounded border border-[#2D333B] text-[10px] space-y-1 font-mono">
                <div className="text-[9px] uppercase font-bold text-[#8E9299] border-b border-[#2D333B] pb-1">
                  Centroid Averages:
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8E9299]">Avg ROCE:</span>
                  <span className="text-white font-bold">{cluster.centroid.rocePct}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8E9299]">Avg 3Y Rev CAGR:</span>
                  <span className="text-white font-bold">{cluster.centroid.revenueCagr3yPct}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8E9299]">Avg Debt/Equity:</span>
                  <span className="text-white font-bold">{cluster.centroid.debtToEquity}x</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8E9299]">Avg P/E Ratio:</span>
                  <span className="text-white font-bold">{cluster.centroid.peRatio}x</span>
                </div>
              </div>

              {/* Member Companies Preview */}
              <div className="mt-3 flex flex-wrap gap-1">
                {cluster.companyIds.slice(0, 4).map((cid) => {
                  const comp = evaluatedCompanies.find((c) => c.company.id === cid);
                  return (
                    <span
                      key={cid}
                      className="bg-[#1A1D23] text-[#E0E0E0] text-[10px] font-mono px-1.5 py-0.5 rounded border border-[#2D333B]"
                    >
                      {comp?.company.ticker || cid}
                    </span>
                  );
                })}
                {cluster.companyIds.length > 4 && (
                  <span className="text-[10px] text-[#8E9299] self-center">
                    +{cluster.companyIds.length - 4} more
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Cluster Scatter Chart (ROCE vs P/E) */}
      <div className="bg-[#15181E] border border-[#2D333B] rounded p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              2D Cluster Visualization: Capital Efficiency (ROCE) vs Valuation Multiple (P/E)
            </h3>
            <p className="text-[11px] text-[#8E9299] mt-0.5">
              Identifies valuation disconnects (e.g., high ROCE compounders trading at discount vs low ROCE assets at high multiples).
            </p>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 10 }}>
              <XAxis
                type="number"
                dataKey="x"
                name="ROCE"
                unit="%"
                stroke="#8E9299"
                tick={{ fill: '#8E9299', fontSize: 11 }}
                domain={[0, 'dataMax + 10']}
                label={{ value: 'Return on Capital Employed (ROCE %)', position: 'bottom', fill: '#8E9299', fontSize: 11, offset: 0 }}
              />
              <YAxis
                type="number"
                dataKey="y"
                name="P/E"
                unit="x"
                stroke="#8E9299"
                tick={{ fill: '#8E9299', fontSize: 11 }}
                domain={[0, 100]}
                label={{ value: 'P/E Multiple (x)', angle: -90, position: 'left', fill: '#8E9299', fontSize: 11 }}
              />
              <ZAxis type="number" dataKey="z" range={[60, 400]} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-[#15181E] border border-[#2D333B] p-2.5 rounded shadow-xl text-xs font-mono">
                        <div className="font-bold text-white text-sm mb-1">{data.name} ({data.ticker})</div>
                        <div className="text-[#8E9299]">ML Cluster: <span style={{ color: data.color }}>{data.clusterLabel}</span></div>
                        <div className="text-[#E0E0E0] mt-1">ROCE: <strong className="text-[#10B981]">{data.x}%</strong></div>
                        <div className="text-[#E0E0E0]">P/E: <strong className="text-[#D4AF37]">{data.y}x</strong></div>
                        <div className="text-[#E0E0E0]">Score: <strong className="text-white">{data.score.toFixed(1)}/100</strong></div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Scatter
                name="Companies"
                data={scatterData}
                onClick={(e: any) => {
                  if (e && e.rawCompany) onSelectCompany(e.rawCompany);
                }}
                className="cursor-pointer"
              >
                {scatterData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    opacity={selectedClusterId ? (entry.clusterId === selectedClusterId ? 1 : 0.2) : 0.85}
                  />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Financial Anomaly Alert Deck */}
      <div id="anomaly-audit-deck" className="bg-[#15181E] border border-[#2D333B] rounded p-4">
        <div className="flex items-center justify-between mb-3 pb-3 border-b border-[#2D333B]">
          <div className="flex items-center gap-2">
            <AlertTriangle size={18} className="text-[#EF4444]" />
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Financial Anomaly & Accounting Flags Deck ({filteredAnomalies.length} Flagged)
              </h3>
              <p className="text-[11px] text-[#8E9299]">
                Rule: Anomaly ≠ Fraud. Anomalies highlight unusual accounting patterns requiring rigorous due diligence before finalizing recommendations.
              </p>
            </div>
          </div>
        </div>

        {filteredAnomalies.length === 0 ? (
          <div className="p-6 text-center text-[#8E9299] bg-[#0F1115] rounded border border-[#2D333B]">
            <CheckCircle2 size={24} className="text-[#10B981] mx-auto mb-2" />
            <p className="font-semibold text-white">No active anomalies detected in selected subset.</p>
            <p className="text-xs text-[#8E9299]">All financial statements pass cash-flow reconciliation and leverage stability checks.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredAnomalies.map((anomaly) => {
              const comp = evaluatedCompanies.find((c) => c.company.id === anomaly.companyId);
              return (
                <div
                  key={anomaly.id}
                  className="bg-[#1A1D23] border border-[#2D333B] hover:border-[#EF4444]/60 rounded p-3 transition-colors text-xs"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{anomaly.companyName}</span>
                      <span className="text-[#8E9299] font-mono text-[10px]">({anomaly.ticker})</span>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                        anomaly.severity === 'high'
                          ? 'bg-[#EF4444]/15 text-[#EF4444] border-[#EF4444]/30'
                          : 'bg-amber-400/15 text-amber-400 border-amber-400/30'
                      }`}
                    >
                      {anomaly.severity} Severity
                    </span>
                  </div>

                  <div className="text-xs font-semibold text-[#D4AF37] mb-1">
                    {anomaly.metric}
                  </div>

                  <div className="bg-[#0F1115] p-2 rounded border border-[#2D333B] font-mono text-[11px] mb-2 space-y-0.5">
                    <div className="flex justify-between">
                      <span className="text-[#8E9299]">Observed:</span>
                      <span className="text-[#EF4444] font-bold">{anomaly.observedValue}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#8E9299]">Expected Benchmark:</span>
                      <span className="text-[#10B981]">{anomaly.expectedRange}</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-[#E0E0E0] leading-relaxed mb-2">
                    {anomaly.explanation}
                  </p>

                  <div className="bg-[#15181E] p-2 rounded border border-[#2D333B] text-[11px]">
                    <span className="font-semibold text-[#D4AF37] uppercase text-[10px]">Action for Analyst: </span>
                    <span className="text-[#E0E0E0]">{anomaly.suggestedAction}</span>
                  </div>

                  {comp && (
                    <div className="mt-2.5 flex justify-end">
                      <button
                        onClick={() => onSelectCompany(comp)}
                        className="text-xs text-[#D4AF37] hover:text-white font-bold flex items-center gap-1"
                      >
                        <span>Deep Dive {anomaly.ticker}</span>
                        <ChevronRight size={13} />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
