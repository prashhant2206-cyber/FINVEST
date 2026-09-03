import React, { useState, useMemo } from 'react';
import { EvaluatedCompany } from '../types';
import { Search, ArrowUpDown, ExternalLink, AlertTriangle, ShieldCheck, CheckCircle2, ChevronRight, XCircle } from 'lucide-react';

interface RankedTableProps {
  companies: EvaluatedCompany[];
  onSelectCompany: (company: EvaluatedCompany) => void;
  showOnlyPassing: boolean;
}

type SortField = 'rank' | 'score' | 'quality' | 'growth' | 'risk' | 'valuation' | 'marketCap' | 'pe' | 'roce';

export const RankedTable: React.FC<RankedTableProps> = ({
  companies,
  onSelectCompany,
  showOnlyPassing,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('rank');
  const [sortAsc, setSortAsc] = useState<boolean>(true);

  const filteredAndSorted = useMemo(() => {
    let list = [...companies];

    // Filter passing
    if (showOnlyPassing) {
      list = list.filter((c) => c.passesFilter);
    }

    // Filter search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (c) =>
          c.company.name.toLowerCase().includes(q) ||
          c.company.ticker.toLowerCase().includes(q) ||
          c.company.industry.toLowerCase().includes(q) ||
          c.company.sector.toLowerCase().includes(q)
      );
    }

    // Sort
    list.sort((a, b) => {
      let valA = 0;
      let valB = 0;

      switch (sortField) {
        case 'rank':
          valA = a.rank;
          valB = b.rank;
          break;
        case 'score':
          valA = a.scores.overallScore;
          valB = b.scores.overallScore;
          break;
        case 'quality':
          valA = a.scores.quality.score;
          valB = b.scores.quality.score;
          break;
        case 'growth':
          valA = a.scores.growth.score;
          valB = b.scores.growth.score;
          break;
        case 'risk':
          valA = a.scores.risk.score;
          valB = b.scores.risk.score;
          break;
        case 'valuation':
          valA = a.scores.valuation.score;
          valB = b.scores.valuation.score;
          break;
        case 'marketCap':
          valA = a.company.metrics.marketCapCr;
          valB = b.company.metrics.marketCapCr;
          break;
        case 'pe':
          valA = a.company.metrics.peRatio;
          valB = b.company.metrics.peRatio;
          break;
        case 'roce':
          valA = a.company.metrics.rocePct;
          valB = b.company.metrics.rocePct;
          break;
      }

      if (sortField === 'score' || sortField === 'quality' || sortField === 'growth' || sortField === 'risk' || sortField === 'valuation' || sortField === 'roce' || sortField === 'marketCap') {
        return sortAsc ? valA - valB : valB - valA;
      } else {
        return sortAsc ? valA - valB : valB - valA;
      }
    });

    return list;
  }, [companies, showOnlyPassing, searchQuery, sortField, sortAsc]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(field === 'rank' || field === 'pe'); // Rank & PE default asc
    }
  };

  return (
    <div id="ranked-prioritization-table-container" className="bg-[#15181E] border border-[#2D333B] rounded text-[#E0E0E0]">
      {/* Table Top Controls */}
      <div className="p-4 border-b border-[#2D333B] flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <span>Prioritized Research Universe</span>
            <span className="bg-[#1A1D23] text-[#D4AF37] text-xs px-2 py-0.5 rounded font-mono border border-[#2D333B]">
              {filteredAndSorted.length} Companies
            </span>
          </h3>
          <p className="text-[11px] text-[#8E9299] mt-0.5">
            Ranked dynamically by composite research score under current user weights.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-1 max-w-xs">
          <div className="relative w-full">
            <Search size={14} className="absolute left-2.5 top-2.5 text-[#8E9299]" />
            <input
              id="search-universe-input"
              type="text"
              placeholder="Search ticker, company, industry..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0F1115] border border-[#2D333B] text-white text-xs pl-8 pr-3 py-1.5 rounded focus:outline-none focus:border-[#D4AF37]"
            />
          </div>
        </div>
      </div>

      {/* Table Data Grid */}
      <div className="overflow-x-auto">
        <table id="equity-prioritization-table" className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-[#1A1D23] text-[#8E9299] border-b border-[#2D333B] uppercase font-semibold text-[10px] tracking-wider select-none">
              <th className="py-2.5 px-3 cursor-pointer hover:text-white" onClick={() => handleSort('rank')}>
                <div className="flex items-center gap-1">
                  <span>Rank</span>
                  <ArrowUpDown size={11} />
                </div>
              </th>
              <th className="py-2.5 px-3">Company & Ticker</th>
              <th className="py-2.5 px-3 cursor-pointer hover:text-white" onClick={() => handleSort('score')}>
                <div className="flex items-center gap-1">
                  <span>Composite Score</span>
                  <ArrowUpDown size={11} />
                </div>
              </th>
              <th className="py-2.5 px-3">Priority</th>
              <th className="py-2.5 px-3 cursor-pointer hover:text-white" onClick={() => handleSort('quality')}>
                <div className="flex items-center gap-1">
                  <span>Quality</span>
                  <ArrowUpDown size={11} />
                </div>
              </th>
              <th className="py-2.5 px-3 cursor-pointer hover:text-white" onClick={() => handleSort('growth')}>
                <div className="flex items-center gap-1">
                  <span>Growth</span>
                  <ArrowUpDown size={11} />
                </div>
              </th>
              <th className="py-2.5 px-3 cursor-pointer hover:text-white" onClick={() => handleSort('risk')}>
                <div className="flex items-center gap-1">
                  <span>Risk</span>
                  <ArrowUpDown size={11} />
                </div>
              </th>
              <th className="py-2.5 px-3 cursor-pointer hover:text-white" onClick={() => handleSort('valuation')}>
                <div className="flex items-center gap-1">
                  <span>Valuation</span>
                  <ArrowUpDown size={11} />
                </div>
              </th>
              <th className="py-2.5 px-3">ML Cluster</th>
              <th className="py-2.5 px-3">Anomalies</th>
              <th className="py-2.5 px-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2D333B]">
            {filteredAndSorted.length === 0 ? (
              <tr>
                <td colSpan={11} className="py-8 text-center text-[#8E9299]">
                  No companies found matching current filters or search query.
                </td>
              </tr>
            ) : (
              filteredAndSorted.map((item) => {
                const score = item.scores.overallScore;
                const isHigh = score >= 70;
                const isMedium = score >= 45 && score < 70;

                return (
                  <tr
                    key={item.company.id}
                    id={`company-row-${item.company.id}`}
                    onClick={() => onSelectCompany(item)}
                    className="hover:bg-[#1A1D23] cursor-pointer transition-colors group"
                  >
                    {/* Rank */}
                    <td className="py-3 px-3 font-mono font-bold text-white text-sm">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-6 h-6 rounded flex items-center justify-center text-xs ${
                          item.rank === 1
                            ? 'bg-[#D4AF37]/25 text-[#D4AF37] font-bold border border-[#D4AF37]/50'
                            : item.rank <= 3
                            ? 'bg-[#D4AF37]/15 text-[#D4AF37] font-bold border border-[#D4AF37]/30'
                            : 'text-[#8E9299]'
                        }`}>
                          #{item.rank}
                        </span>
                      </div>
                    </td>

                    {/* Company Name, Ticker, Sector */}
                    <td className="py-3 px-3">
                      <div className="font-semibold text-white group-hover:text-[#D4AF37] transition-colors flex items-center gap-1.5">
                        <span>{item.company.name}</span>
                        <a
                          href={item.company.screenerUrl}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-[#8E9299] hover:text-[#D4AF37] p-0.5"
                          title="Open verified Screener.in financial page"
                        >
                          <ExternalLink size={12} />
                        </a>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-[#8E9299] font-mono mt-0.5 flex-wrap">
                        <span className="font-bold text-[#E0E0E0]">{item.company.ticker}</span>
                        <span>•</span>
                        <span className="text-white font-medium">₹{item.company.metrics.currentPrice.toLocaleString('en-IN')}</span>
                        {item.company.metrics.changePct !== undefined && (
                          <span
                            className={`px-1 py-0.2 rounded text-[9px] font-bold ${
                              item.company.metrics.changePct >= 0
                                ? 'bg-[#10B981]/20 text-[#10B981]'
                                : 'bg-[#EF4444]/20 text-[#EF4444]'
                            }`}
                          >
                            {item.company.metrics.changePct >= 0 ? '+' : ''}
                            {item.company.metrics.changePct.toFixed(1)}%
                          </span>
                        )}
                        <span>•</span>
                        <span>{item.company.sector}</span>
                        <span>•</span>
                        <span>₹{(item.company.metrics.marketCapCr / 1000).toFixed(1)}k Cr MCap</span>
                      </div>
                    </td>

                    {/* Composite Score with Progress Bar */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm text-white min-w-[36px]">
                          {score.toFixed(1)}
                        </span>
                        <div className="w-16 h-2 bg-[#0F1115] rounded-full overflow-hidden border border-[#2D333B]">
                          <div
                            className={`h-full rounded-full ${
                              isHigh
                                ? 'bg-[#10B981]'
                                : isMedium
                                ? 'bg-[#D4AF37]'
                                : 'bg-[#8E9299]'
                            }`}
                            style={{ width: `${Math.min(100, score)}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Priority Badge */}
                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase border ${
                          item.researchPriority === 'High'
                            ? 'bg-[#10B981]/15 text-[#10B981] border-[#10B981]/30'
                            : item.researchPriority === 'Medium'
                            ? 'bg-[#D4AF37]/15 text-[#D4AF37] border-[#D4AF37]/30'
                            : 'bg-[#8E9299]/15 text-[#8E9299] border-[#8E9299]/30'
                        }`}
                      >
                        {item.researchPriority}
                      </span>
                    </td>

                    {/* Quality Score */}
                    <td className="py-3 px-3 font-mono text-[#E0E0E0]">
                      <div className="font-medium">{item.scores.quality.score}</div>
                      <div className="text-[10px] text-[#8E9299] font-normal">
                        +{item.scores.quality.contribution}
                      </div>
                    </td>

                    {/* Growth Score */}
                    <td className="py-3 px-3 font-mono text-[#E0E0E0]">
                      <div className="font-medium">{item.scores.growth.score}</div>
                      <div className="text-[10px] text-[#8E9299] font-normal">
                        +{item.scores.growth.contribution}
                      </div>
                    </td>

                    {/* Risk Score */}
                    <td className="py-3 px-3 font-mono text-[#E0E0E0]">
                      <div className="font-medium">{item.scores.risk.score}</div>
                      <div className="text-[10px] text-[#8E9299] font-normal">
                        +{item.scores.risk.contribution}
                      </div>
                    </td>

                    {/* Valuation Score */}
                    <td className="py-3 px-3 font-mono text-[#E0E0E0]">
                      <div className="font-medium">{item.scores.valuation.score}</div>
                      <div className="text-[10px] text-[#8E9299] font-normal">
                        +{item.scores.valuation.contribution}
                      </div>
                    </td>

                    {/* ML Cluster */}
                    <td className="py-3 px-3">
                      <span
                        className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold border truncate max-w-[140px]"
                        style={{
                          backgroundColor: `${item.cluster.color}15`,
                          color: item.cluster.color,
                          borderColor: `${item.cluster.color}40`,
                        }}
                        title={item.cluster.description}
                      >
                        {item.cluster.label}
                      </span>
                    </td>

                    {/* Anomalies Badge */}
                    <td className="py-3 px-3">
                      {item.anomalies.length > 0 ? (
                        <span
                          className="inline-flex items-center gap-1 bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/30 text-[10px] font-bold px-2 py-0.5 rounded"
                          title={item.anomalies.map((a) => a.metric).join(', ')}
                        >
                          <AlertTriangle size={11} />
                          {item.anomalies.length} Flagged
                        </span>
                      ) : (
                        <span className="text-[10px] text-[#8E9299] font-mono">Clean</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-3 text-right">
                      <button
                        className="bg-[#1A1D23] group-hover:bg-[#D4AF37] group-hover:text-[#0F1115] text-[#D4AF37] border border-[#2D333B] px-2.5 py-1 rounded text-xs font-bold transition-colors inline-flex items-center gap-1"
                      >
                        <span>Deep Dive</span>
                        <ChevronRight size={13} />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
