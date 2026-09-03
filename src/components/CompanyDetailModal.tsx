import React, { useState, useEffect } from 'react';
import { EvaluatedCompany, AIResearchBrief, PillarWeights } from '../types';
import {
  X,
  ExternalLink,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  FileText,
  Activity,
  RefreshCw,
  TrendingUp,
  DollarSign,
  PieChart,
  HelpCircle,
  Download,
  Layers,
} from 'lucide-react';

interface CompanyDetailModalProps {
  item: EvaluatedCompany | null;
  onClose: () => void;
  pillars: PillarWeights;
  totalUniverse: number;
}

export const CompanyDetailModal: React.FC<CompanyDetailModalProps> = ({
  item,
  onClose,
  pillars,
  totalUniverse,
}) => {
  const [brief, setBrief] = useState<AIResearchBrief | null>(null);
  const [loadingBrief, setLoadingBrief] = useState<boolean>(false);
  const [briefError, setBriefError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'brief' | 'financials' | 'history'>('overview');

  useEffect(() => {
    if (item) {
      setBrief(null);
      setBriefError(null);
      // Automatically generate AI research brief for the selected company
      handleGenerateBrief();
    }
  }, [item?.company.id]);

  if (!item) return null;

  const { company, scores, cluster, anomalies, rank, researchPriority } = item;
  const m = company.metrics;

  const handleGenerateBrief = async () => {
    try {
      setLoadingBrief(true);
      setBriefError(null);

      const res = await fetch('/api/ai/research-brief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId: company.id,
          scores,
          weights: pillars,
          cluster,
          anomalies,
          rank,
          totalCompanies: totalUniverse,
        }),
      });

      if (!res.ok) {
        throw new Error(`AI generation failed (${res.status})`);
      }

      const data: AIResearchBrief = await res.json();
      setBrief(data);
    } catch (err: any) {
      console.error('Failed to generate AI brief:', err);
      setBriefError('Could not connect to AI brief generator. Rule-based analysis loaded.');
    } finally {
      setLoadingBrief(false);
    }
  };

  const handleExportText = () => {
    if (!brief) return;
    const text = `
FINVEST AI RESEARCH BRIEF
Company: ${company.name} (${company.ticker})
Sector: ${company.sector} | Industry: ${company.industry}
Market Cap: ₹${m.marketCapCr.toLocaleString()} Cr | CMP: ₹${m.currentPrice}
Prioritization Rank: #${rank} of ${totalUniverse} (Score: ${scores.overallScore.toFixed(1)}/100)
Research Priority: ${brief.researchPriority}

RATIONALE:
${brief.priorityRationale}

KEY STRENGTHS:
${brief.keyStrengths.map((s) => `- ${s}`).join('\n')}

KEY CONCERNS:
${brief.keyConcerns.map((c) => `- ${c}`).join('\n')}

ANALYST DUE DILIGENCE QUESTIONS:
${brief.analystFollowUpQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n')}

ML CLUSTER:
${brief.mlClusterContext}

Data Source: Screener.in (Permitted Connector Feed)
Generated: ${brief.generatedAt}
Disclaimer: Academic decision-support tool. Not autonomous investment advice.
    `.trim();

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `FINVEST_${company.ticker}_Research_Brief.txt`;
    link.click();
  };

  return (
    <div id="company-detail-modal-overlay" className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 overflow-y-auto backdrop-blur-xs">
      <div
        id="company-detail-modal"
        className="bg-[#15181E] border border-[#2D333B] rounded-lg max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl text-[#E0E0E0] relative flex flex-col"
      >
        {/* Modal Top Header */}
        <div className="p-4 sm:p-6 border-b border-[#2D333B] bg-[#1A1D23] sticky top-0 z-10 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30 flex items-center justify-center font-bold font-mono text-sm">
              {company.ticker.slice(0, 3)}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-bold text-white">{company.name}</h2>
                <span className="font-mono text-xs font-bold text-[#D4AF37] bg-[#D4AF37]/15 px-2 py-0.5 rounded border border-[#D4AF37]/30">
                  {company.ticker}
                </span>
                <span className="text-xs text-[#8E9299]">• {company.sector} ({company.industry})</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-[#8E9299] mt-0.5 flex-wrap">
                <span>
                  CMP: <strong className="text-white font-mono">₹{m.currentPrice.toLocaleString('en-IN')}</strong>
                  {m.changePct !== undefined && (
                    <span
                      className={`ml-1.5 px-1.5 py-0.2 rounded text-[10px] font-bold ${
                        m.changePct >= 0 ? 'bg-[#10B981]/20 text-[#10B981]' : 'bg-[#EF4444]/20 text-[#EF4444]'
                      }`}
                    >
                      {m.changePct >= 0 ? '+' : ''}
                      {m.changePct.toFixed(1)}%
                    </span>
                  )}
                </span>
                <span>•</span>
                <span>Market Cap: <strong className="text-white font-mono">₹{(m.marketCapCr / 1000).toFixed(1)}k Cr</strong></span>
                <span>•</span>
                <span>P/E: <strong className="text-white font-mono">{m.peRatio.toFixed(1)}x</strong></span>
                {m.lastUpdatedPrice && (
                  <>
                    <span>•</span>
                    <span className="text-[10px] text-[#10B981] font-mono">Live Tick: {m.lastUpdatedPrice}</span>
                  </>
                )}
                <span>•</span>
                <a
                  href={company.screenerUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#D4AF37] hover:underline flex items-center gap-1 inline-flex"
                >
                  <span>Screener.in Page</span>
                  <ExternalLink size={11} />
                </a>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportText}
              disabled={!brief}
              className="bg-[#1A1D23] hover:bg-[#2D333B] text-[#E0E0E0] hover:text-white px-3 py-1.5 rounded text-xs border border-[#2D333B] transition-colors flex items-center gap-1.5 disabled:opacity-50"
              title="Export Research Brief"
            >
              <Download size={13} />
              <span className="hidden sm:inline">Export Brief</span>
            </button>

            <button
              onClick={onClose}
              className="text-[#8E9299] hover:text-white hover:bg-[#1A1D23] p-1.5 rounded transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="px-6 border-b border-[#2D333B] bg-[#1A1D23]/60 flex gap-2">
          {[
            { id: 'overview', label: 'Score Waterfall & Metrics', icon: PieChart },
            { id: 'brief', label: 'AI Research Brief', icon: Sparkles },
            { id: 'financials', label: 'Screener Fundamentals', icon: DollarSign },
            { id: 'history', label: '5-Year Audited Financials', icon: TrendingUp },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-3 px-3 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-colors ${
                  activeTab === tab.id
                    ? 'border-[#D4AF37] text-[#D4AF37]'
                    : 'border-transparent text-[#8E9299] hover:text-[#E0E0E0]'
                }`}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {/* TAB 1: OVERVIEW & SCORE WATERFALL */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Prioritization Score Banner */}
              <div className="bg-[#1A1D23] border border-[#2D333B] rounded-lg p-5 flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="text-xs uppercase font-bold text-[#8E9299] tracking-wider">
                    Composite Research Prioritization Score
                  </div>
                  <div className="flex items-baseline gap-3">
                    <span className="text-4xl font-extrabold text-white font-mono">
                      {scores.overallScore.toFixed(1)}
                    </span>
                    <span className="text-sm text-[#8E9299] font-mono">/ 100</span>
                    <span className="text-xs bg-[#D4AF37]/20 text-[#D4AF37] font-bold px-2 py-0.5 rounded border border-[#D4AF37]/40">
                      Universe Rank #{rank} of {totalUniverse}
                    </span>
                  </div>
                  <p className="text-xs text-[#8E9299] max-w-xl mt-1">
                    Based on active strategy weights (Quality: {pillars.businessQuality}%, Growth: {pillars.growth}%, Risk: {pillars.financialRisk}%, Valuation: {pillars.valuation}%).
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-[10px] text-[#8E9299] uppercase font-bold">Research Priority</div>
                    <span
                      className={`inline-block px-3 py-1 rounded text-xs font-bold uppercase tracking-wider mt-1 border ${
                        researchPriority === 'High'
                          ? 'bg-[#10B981]/15 text-[#10B981] border-[#10B981]/40'
                          : researchPriority === 'Medium'
                          ? 'bg-[#D4AF37]/15 text-[#D4AF37] border-[#D4AF37]/40'
                          : 'bg-[#8E9299]/15 text-[#8E9299] border-[#8E9299]/40'
                      }`}
                    >
                      {researchPriority} Priority
                    </span>
                  </div>
                </div>
              </div>

              {/* 4 Pillar Decomposition Cards */}
              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
                  Mathematical Pillar Contribution Decomposition
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {/* Quality */}
                  <div className="bg-[#1A1D23] p-3.5 rounded border border-[#2D333B]">
                    <div className="flex justify-between items-center text-xs mb-1">
                      <span className="font-bold text-[#10B981]">Business Quality</span>
                      <span className="text-[#8E9299] text-[11px]">Weight: {scores.quality.weight}%</span>
                    </div>
                    <div className="text-2xl font-bold text-white font-mono">
                      {scores.quality.score} <span className="text-xs text-[#8E9299]">/ 100</span>
                    </div>
                    <div className="text-xs text-[#10B981] font-mono mt-1 font-semibold">
                      +{scores.quality.contribution} pts contribution
                    </div>
                    <div className="text-[10px] text-[#8E9299] mt-2 border-t border-[#2D333B] pt-1">
                      ROCE {m.rocePct}% • ROE {m.roePct}% • OPM {m.opmPct}%
                    </div>
                  </div>

                  {/* Growth */}
                  <div className="bg-[#1A1D23] p-3.5 rounded border border-[#2D333B]">
                    <div className="flex justify-between items-center text-xs mb-1">
                      <span className="font-bold text-[#D4AF37]">Growth Momentum</span>
                      <span className="text-[#8E9299] text-[11px]">Weight: {scores.growth.weight}%</span>
                    </div>
                    <div className="text-2xl font-bold text-white font-mono">
                      {scores.growth.score} <span className="text-xs text-[#8E9299]">/ 100</span>
                    </div>
                    <div className="text-xs text-[#D4AF37] font-mono mt-1 font-semibold">
                      +{scores.growth.contribution} pts contribution
                    </div>
                    <div className="text-[10px] text-[#8E9299] mt-2 border-t border-[#2D333B] pt-1">
                      3Y Rev {m.revenueCagr3yPct}% • 3Y PAT {m.profitCagr3yPct}%
                    </div>
                  </div>

                  {/* Risk */}
                  <div className="bg-[#1A1D23] p-3.5 rounded border border-[#2D333B]">
                    <div className="flex justify-between items-center text-xs mb-1">
                      <span className="font-bold text-[#F59E0B]">Financial Risk</span>
                      <span className="text-[#8E9299] text-[11px]">Weight: {scores.risk.weight}%</span>
                    </div>
                    <div className="text-2xl font-bold text-white font-mono">
                      {scores.risk.score} <span className="text-xs text-[#8E9299]">/ 100</span>
                    </div>
                    <div className="text-xs text-[#F59E0B] font-mono mt-1 font-semibold">
                      +{scores.risk.contribution} pts contribution
                    </div>
                    <div className="text-[10px] text-[#8E9299] mt-2 border-t border-[#2D333B] pt-1">
                      D/E {m.debtToEquity} • Cov {m.interestCoverage}x • WC {m.workingCapitalDays}d
                    </div>
                  </div>

                  {/* Valuation */}
                  <div className="bg-[#1A1D23] p-3.5 rounded border border-[#2D333B]">
                    <div className="flex justify-between items-center text-xs mb-1">
                      <span className="font-bold text-[#8B5CF6]">Valuation Multiple</span>
                      <span className="text-[#8E9299] text-[11px]">Weight: {scores.valuation.weight}%</span>
                    </div>
                    <div className="text-2xl font-bold text-white font-mono">
                      {scores.valuation.score} <span className="text-xs text-[#8E9299]">/ 100</span>
                    </div>
                    <div className="text-xs text-[#8B5CF6] font-mono mt-1 font-semibold">
                      +{scores.valuation.contribution} pts contribution
                    </div>
                    <div className="text-[10px] text-[#8E9299] mt-2 border-t border-[#2D333B] pt-1">
                      P/E {m.peRatio}x • P/B {m.pbRatio}x • FCF {m.fcfYieldPct}%
                    </div>
                  </div>
                </div>
              </div>

              {/* Machine Learning & Anomalies Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[#1A1D23] p-4 rounded border border-[#2D333B]">
                  <div className="flex items-center gap-2 text-xs font-bold text-white uppercase mb-2">
                    <Activity size={15} className="text-[#D4AF37]" />
                    <span>ML K-Means Clustering</span>
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-2">
                      <span
                        className="px-2 py-0.5 rounded text-[11px] font-bold uppercase border"
                        style={{
                          backgroundColor: `${cluster.color}15`,
                          color: cluster.color,
                          borderColor: `${cluster.color}40`,
                        }}
                      >
                        {cluster.label}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#8E9299] leading-relaxed pt-1">
                      {cluster.description}
                    </p>
                  </div>
                </div>

                <div className="bg-[#1A1D23] p-4 rounded border border-[#2D333B]">
                  <div className="flex items-center gap-2 text-xs font-bold text-white uppercase mb-2">
                    <AlertTriangle size={15} className="text-[#EF4444]" />
                    <span>Detected Accounting & Financial Flags</span>
                  </div>
                  {anomalies.length === 0 ? (
                    <div className="text-xs text-[#10B981] flex items-center gap-1.5 py-1 font-semibold">
                      <ShieldCheck size={16} />
                      <span>Clean accounting statement profile. No anomalies flagged.</span>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {anomalies.map((a) => (
                        <div key={a.id} className="text-xs bg-[#0F1115] p-2 rounded border border-[#EF4444]/30">
                          <div className="font-semibold text-white flex justify-between">
                            <span>{a.metric}</span>
                            <span className="text-[#EF4444] font-mono font-bold text-[10px] uppercase">
                              {a.severity}
                            </span>
                          </div>
                          <div className="text-[11px] text-[#8E9299] mt-0.5">{a.explanation}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: AI RESEARCH BRIEF */}
          {activeTab === 'brief' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Sparkles size={16} className="text-[#D4AF37]" />
                    <span>AI-Assisted Equity Research Brief (Gemini 3.7 Flash)</span>
                  </h3>
                  <p className="text-xs text-[#8E9299] mt-0.5">
                    Objective analytical prioritization brief synthesized from verified financial metrics and ML clusters.
                  </p>
                </div>

                <button
                  onClick={handleGenerateBrief}
                  disabled={loadingBrief}
                  className="bg-[#D4AF37] hover:bg-[#C29D2D] text-[#0F1115] px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  <RefreshCw size={13} className={loadingBrief ? 'animate-spin' : ''} />
                  <span>{loadingBrief ? 'Synthesizing...' : 'Regenerate Brief'}</span>
                </button>
              </div>

              {loadingBrief ? (
                <div className="bg-[#1A1D23] border border-[#2D333B] rounded p-8 text-center space-y-3">
                  <RefreshCw size={28} className="animate-spin text-[#D4AF37] mx-auto" />
                  <p className="text-sm font-semibold text-white">Synthesizing Institutional Research Brief...</p>
                  <p className="text-xs text-[#8E9299] max-w-md mx-auto">
                    Analyzing ROCE ({m.rocePct}%), 3Y Sales CAGR ({m.revenueCagr3yPct}%), P/E ({m.peRatio}x), and {anomalies.length} anomaly triggers against user weights.
                  </p>
                </div>
              ) : brief ? (
                <div className="space-y-4">
                  {/* Brief Header Card */}
                  <div className="bg-[#1A1D23] border border-[#2D333B] rounded p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-mono text-[#8E9299]">
                        GENERATED: {brief.generatedAt} | SOURCE: SCREENER.IN
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded text-xs font-bold uppercase border ${
                          brief.researchPriority === 'HIGH'
                            ? 'bg-[#10B981]/15 text-[#10B981] border-[#10B981]/40'
                            : brief.researchPriority === 'MEDIUM'
                            ? 'bg-[#D4AF37]/15 text-[#D4AF37] border-[#D4AF37]/40'
                            : 'bg-[#8E9299]/15 text-[#8E9299] border-[#8E9299]/40'
                        }`}
                      >
                        {brief.researchPriority} RESEARCH PRIORITY
                      </span>
                    </div>

                    <div className="text-sm font-semibold text-white leading-relaxed">
                      {brief.priorityRationale}
                    </div>
                  </div>

                  {/* Strengths & Concerns Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-[#1A1D23] border border-[#2D333B] rounded p-4">
                      <div className="text-xs font-bold text-[#10B981] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <TrendingUp size={14} />
                        <span>Key Fundamental Strengths (Matching Priorities)</span>
                      </div>
                      <ul className="space-y-2 text-xs text-[#E0E0E0]">
                        {brief.keyStrengths.map((str, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] mt-1.5 shrink-0" />
                            <span className="leading-relaxed">{str}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-[#1A1D23] border border-[#2D333B] rounded p-4">
                      <div className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <AlertTriangle size={14} />
                        <span>Key Concerns & Valuation Hurdles</span>
                      </div>
                      <ul className="space-y-2 text-xs text-[#E0E0E0]">
                        {brief.keyConcerns.map((con, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] mt-1.5 shrink-0" />
                            <span className="leading-relaxed">{con}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Analyst Due Diligence Questions */}
                  <div className="bg-[#1A1D23] border border-[#2D333B] rounded p-4">
                    <div className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <HelpCircle size={14} />
                      <span>Suggested High-Impact Analyst Follow-Up Questions (Annual Report / Management Calls)</span>
                    </div>
                    <ol className="space-y-2 text-xs text-[#E0E0E0] list-decimal list-inside leading-relaxed">
                      {brief.analystFollowUpQuestions.map((q, idx) => (
                        <li key={idx} className="pl-1">
                          <span className="font-medium text-white">{q}</span>
                        </li>
                      ))}
                    </ol>
                  </div>

                  {/* ML Context & Data Verification */}
                  <div className="bg-[#0F1115] p-3 rounded text-[11px] text-[#8E9299] space-y-1 font-mono border border-[#2D333B]">
                    <div><strong>ML Cluster Context:</strong> {brief.mlClusterContext}</div>
                    <div><strong>Verification Summary:</strong> {brief.dataSummary}</div>
                  </div>
                </div>
              ) : null}
            </div>
          )}

          {/* TAB 3: SCREENER FUNDAMENTALS */}
          {activeTab === 'financials' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Verified Screener.in Financial Ratios & Fundamentals
                </h3>
                <a
                  href={company.screenerUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-[#D4AF37] hover:underline flex items-center gap-1 font-semibold"
                >
                  <span>View live on Screener.in</span>
                  <ExternalLink size={12} />
                </a>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 text-xs">
                {[
                  { label: 'Current Market Price', value: `₹${m.currentPrice.toLocaleString()}` },
                  { label: 'Market Capitalization', value: `₹${m.marketCapCr.toLocaleString()} Cr` },
                  { label: 'P/E Ratio', value: `${m.peRatio.toFixed(1)}x` },
                  { label: 'Price to Book (P/B)', value: `${m.pbRatio.toFixed(1)}x` },
                  { label: 'EV / EBITDA', value: `${m.evEbitda.toFixed(1)}x` },
                  { label: 'ROCE %', value: `${m.rocePct.toFixed(1)}%` },
                  { label: 'ROE %', value: `${m.roePct.toFixed(1)}%` },
                  { label: 'Operating Margin (OPM)', value: `${m.opmPct.toFixed(1)}%` },
                  { label: '3-Year Sales CAGR', value: `${m.revenueCagr3yPct.toFixed(1)}%` },
                  { label: '5-Year Sales CAGR', value: `${m.revenueCagr5yPct.toFixed(1)}%` },
                  { label: '3-Year Profit CAGR', value: `${m.profitCagr3yPct.toFixed(1)}%` },
                  { label: '5-Year Profit CAGR', value: `${m.profitCagr5yPct.toFixed(1)}%` },
                  { label: 'Debt to Equity', value: `${m.debtToEquity.toFixed(2)}x` },
                  { label: 'Interest Coverage', value: `${m.interestCoverage.toFixed(1)}x` },
                  { label: 'Working Capital Days', value: `${m.workingCapitalDays} days` },
                  { label: 'FCF Conversion Ratio', value: `${m.fcfConversionPct.toFixed(0)}%` },
                  { label: 'Free Cash Flow Yield', value: `${m.fcfYieldPct.toFixed(1)}%` },
                  { label: 'CFO / PAT Ratio', value: `${(m.cfoToPatRatio * 100).toFixed(0)}%` },
                  { label: 'Dividend Yield', value: `${m.dividendYieldPct.toFixed(1)}%` },
                ].map((stat, idx) => (
                  <div key={idx} className="bg-[#1A1D23] p-3 rounded border border-[#2D333B]">
                    <div className="text-[#8E9299] text-[11px] mb-1">{stat.label}</div>
                    <div className="text-white font-mono font-bold text-sm">{stat.value}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: 5-YEAR AUDITED FINANCIALS */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Audited Historical Financial Performance (₹ Crores)
              </h3>

              <div className="bg-[#1A1D23] border border-[#2D333B] rounded overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-[#2D333B] bg-[#0F1115] text-[#8E9299] text-[10px] uppercase font-semibold">
                      <th className="py-2.5 px-3">Metric</th>
                      {company.history.map((h) => (
                        <th key={h.year} className="py-2.5 px-3 text-right">FY{h.year}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#2D333B] font-mono">
                    <tr>
                      <td className="py-2.5 px-3 font-sans text-white font-medium">Revenue (Sales)</td>
                      {company.history.map((h) => (
                        <td key={h.year} className="py-2.5 px-3 text-right text-white font-bold">
                          ₹{h.revenue.toLocaleString()}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-sans text-white font-medium">Operating Profit (EBITDA)</td>
                      {company.history.map((h) => (
                        <td key={h.year} className="py-2.5 px-3 text-right text-[#10B981]">
                          ₹{h.operatingProfit.toLocaleString()}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-sans text-white font-medium">Net Profit (PAT)</td>
                      {company.history.map((h) => (
                        <td key={h.year} className="py-2.5 px-3 text-right text-white">
                          ₹{h.netProfit.toLocaleString()}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-sans text-white font-medium">Operating Cash Flow (CFO)</td>
                      {company.history.map((h) => (
                        <td key={h.year} className="py-2.5 px-3 text-right text-[#D4AF37]">
                          ₹{h.operatingCashFlow.toLocaleString()}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-sans text-white font-medium">Free Cash Flow (FCF)</td>
                      {company.history.map((h) => (
                        <td key={h.year} className="py-2.5 px-3 text-right text-[#10B981]">
                          ₹{h.freeCashFlow.toLocaleString()}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-sans text-white font-medium">Total Borrowings / Debt</td>
                      {company.history.map((h) => (
                        <td key={h.year} className="py-2.5 px-3 text-right text-[#F59E0B]">
                          ₹{h.debt.toLocaleString()}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-sans text-white font-medium">Working Capital Days</td>
                      {company.history.map((h) => (
                        <td key={h.year} className="py-2.5 px-3 text-right text-[#E0E0E0]">
                          {h.workingCapitalDays} days
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-[#1A1D23] border-t border-[#2D333B] text-xs text-[#8E9299] flex flex-wrap items-center justify-between gap-2 mt-auto">
          <span>Screener.in Connector verified • Decision Support System</span>
          <button
            onClick={onClose}
            className="bg-[#D4AF37] hover:bg-[#C29D2D] text-[#0F1115] px-4 py-1.5 rounded transition-colors text-xs font-bold"
          >
            Close Overview
          </button>
        </div>
      </div>
    </div>
  );
};
