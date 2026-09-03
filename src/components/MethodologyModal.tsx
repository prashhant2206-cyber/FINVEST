import React from 'react';
import { BookOpen, X, Calculator, Activity, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface MethodologyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MethodologyModal: React.FC<MethodologyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div id="methodology-modal-overlay" className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 overflow-y-auto backdrop-blur-xs">
      <div
        id="methodology-modal"
        className="bg-[#15181E] border border-[#2D333B] rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl text-[#E0E0E0] relative space-y-6"
      >
        <div className="flex items-center justify-between pb-3 border-b border-[#2D333B]">
          <div className="flex items-center gap-2">
            <BookOpen size={20} className="text-[#D4AF37]" />
            <div>
              <h3 className="text-base font-bold text-white uppercase tracking-wider">
                FINVEST AI — Mathematical Methodology & Architecture
              </h3>
              <p className="text-xs text-[#8E9299]">MBA Working With AI Project Framework (Finance Domain)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#8E9299] hover:text-white p-1 rounded transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Section 1: Core Philosophy */}
        <div className="bg-[#1A1D23] p-4 rounded border border-[#2D333B] space-y-2">
          <div className="flex items-center gap-2 text-white font-bold text-sm">
            <ShieldCheck size={16} className="text-[#10B981]" />
            <span>1. Decision Support vs. Autonomous Prediction</span>
          </div>
          <p className="text-xs text-[#8E9299] leading-relaxed">
            FINVEST AI is built on a clear institutional premise: <strong>No single stock ranking algorithm fits every investor.</strong> Instead of issuing autonomous &ldquo;BUY&rdquo; or &ldquo;SELL&rdquo; recommendations, the platform empowers equity research analysts to define what matters (Quality, Growth, Risk, Valuation). The platform normalizes the empirical financial dataset and prioritizes the universe accordingly.
          </p>
          <div className="bg-[#0F1115] p-2.5 rounded font-mono text-[11px] text-[#D4AF37] border border-[#2D333B]">
            &ldquo;THE USER DECIDES WHAT MATTERS. FINVEST AI ANALYSES THE FINANCIAL DATA ACCORDINGLY.&rdquo;
          </div>
        </div>

        {/* Section 2: Mathematical Normalization */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-white font-bold text-sm">
            <Calculator size={16} className="text-[#D4AF37]" />
            <span>2. Cross-Universe Percentile Ranking & Normalization</span>
          </div>
          <p className="text-xs text-[#8E9299] leading-relaxed">
            Raw accounting metrics (e.g. P/E of 65x vs ROCE of 45%) cannot be directly summed due to scale differences. FINVEST AI utilizes empirical cross-universe percentile ranking to map every metric to a continuous 0–100 scale:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
            <div className="bg-[#1A1D23] p-3 rounded border border-[#2D333B]">
              <span className="text-[#10B981] font-bold block mb-1">Higher is Better (e.g. ROCE, Growth, FCF):</span>
              <div className="bg-[#0F1115] p-2 rounded text-white text-[11px] border border-[#2D333B]">
                Score = (Count_below + 0.5 * Count_equal) / N * 100
              </div>
            </div>
            <div className="bg-[#1A1D23] p-3 rounded border border-[#2D333B]">
              <span className="text-[#EF4444] font-bold block mb-1">Lower is Better (e.g. P/E, Debt/Equity):</span>
              <div className="bg-[#0F1115] p-2 rounded text-white text-[11px] border border-[#2D333B]">
                Score = (1 - Percentile) * 100
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Composite Score Formula */}
        <div className="space-y-2">
          <div className="text-white font-bold text-sm">3. Dynamic Composite Research Score</div>
          <div className="bg-[#1A1D23] p-3 rounded border border-[#2D333B] font-mono text-xs text-white space-y-1">
            <div>Composite Score = (W_Quality * Score_Quality) + (W_Growth * Score_Growth) + (W_Risk * Score_Risk) + (W_Valuation * Score_Valuation)</div>
            <div className="text-[#8E9299] text-[11px]">Where W_Quality + W_Growth + W_Risk + W_Valuation = 100%</div>
          </div>
        </div>

        {/* Section 4: Machine Learning Clustering */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-white font-bold text-sm">
            <Activity size={16} className="text-[#D4AF37]" />
            <span>4. Unsupervised K-Means Multi-Dimensional Clustering</span>
          </div>
          <p className="text-xs text-[#8E9299] leading-relaxed">
            The system applies multi-dimensional K-Means clustering across 7 key financial dimensions (ROCE, Revenue CAGR, Profit CAGR, Debt/Equity, Operating Margin, FCF Yield, and P/E Ratio). Centroids are calculated iteratively using Euclidean distance on normalized vectors, discovering natural company peer groups without human classification bias.
          </p>
        </div>

        {/* Section 5: Financial Anomaly Detection */}
        <div className="space-y-2">
          <div className="text-white font-bold text-sm">5. Accounting & Financial Anomaly Detection</div>
          <p className="text-xs text-[#8E9299] leading-relaxed">
            Flags discrepancies between accounting profit and real cash flow generation:
          </p>
          <ul className="text-xs text-[#E0E0E0] space-y-1 list-disc list-inside">
            <li><strong>CFO to PAT Divergence:</strong> CFO / PAT &lt; 0.65 (indicates profit without cash realization).</li>
            <li><strong>Ballooning Working Capital:</strong> Working Capital Days &gt; 120 days.</li>
            <li><strong>High Leverage & Low Interest Coverage:</strong> Debt/Equity &gt; 0.8x with Interest Coverage &lt; 10x.</li>
            <li><strong>PEG Disconnect:</strong> P/E &gt; 65x with single-digit historical revenue CAGR.</li>
          </ul>
        </div>

        <div className="pt-3 border-t border-[#2D333B] flex justify-end">
          <button
            onClick={onClose}
            className="bg-[#D4AF37] hover:bg-[#C29D2D] text-[#0F1115] px-4 py-1.5 rounded text-xs font-bold transition-colors"
          >
            Close Methodology
          </button>
        </div>
      </div>
    </div>
  );
};
