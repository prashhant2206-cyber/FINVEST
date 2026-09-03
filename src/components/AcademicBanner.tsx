import React, { useState } from 'react';
import { Info, ShieldAlert, Sparkles, ChevronRight, X } from 'lucide-react';

export const AcademicBanner: React.FC = () => {
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) return null;

  return (
    <div id="academic-positioning-banner" className="bg-[#15181E] border-b border-[#2D333B] text-[#E0E0E0] px-4 py-2.5 text-xs">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-[300px]">
          <div className="p-1.5 rounded bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30 shrink-0">
            <Sparkles size={16} />
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-[#D4AF37] tracking-wide uppercase text-[10px] bg-[#D4AF37]/15 border border-[#D4AF37]/30 px-2 py-0.5 rounded font-mono">
                MBA Project Framework
              </span>
              <span className="text-white font-medium text-xs">
                THE USER DECIDES WHAT MATTERS. FINVEST AI ANALYSES THE FINANCIAL DATA ACCORDINGLY.
              </span>
            </div>
            <p className="text-[#8E9299] text-[11px] leading-relaxed">
              FINVEST AI is an AI-assisted financial research decision-support system. It does not provide autonomous investment advice (Buy/Sell). Financial data & model outputs should be independently verified.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsDismissed(true)}
          className="text-[#8E9299] hover:text-white p-1 rounded hover:bg-[#2D333B] transition-colors"
          title="Dismiss banner"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
};
