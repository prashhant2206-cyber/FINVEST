import React, { useState } from 'react';
import { DataSourceStatus } from '../types';
import { Database, Upload, RefreshCw, CheckCircle2, AlertTriangle, X, Shield, FileSpreadsheet } from 'lucide-react';

interface DataAdapterModalProps {
  isOpen: boolean;
  onClose: () => void;
  status: DataSourceStatus | null;
  onRefreshData: () => void;
  isRefreshing: boolean;
  onSwitchMode: (demo: boolean) => void;
  onImportCsv: (csv: string) => Promise<boolean>;
}

export const DataAdapterModal: React.FC<DataAdapterModalProps> = ({
  isOpen,
  onClose,
  status,
  onRefreshData,
  isRefreshing,
  onSwitchMode,
  onImportCsv,
}) => {
  const [csvInput, setCsvInput] = useState('');
  const [importing, setImporting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  if (!isOpen) return null;

  const handleImport = async () => {
    if (!csvInput.trim()) {
      setFeedback({ type: 'error', message: 'Please paste CSV content first.' });
      return;
    }
    setImporting(true);
    setFeedback(null);
    try {
      const success = await onImportCsv(csvInput);
      if (success) {
        setFeedback({ type: 'success', message: 'Successfully imported custom Screener dataset!' });
        setCsvInput('');
      } else {
        setFeedback({ type: 'error', message: 'Failed to parse CSV. Please check formatting.' });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Import error' });
    } finally {
      setImporting(false);
    }
  };

  const sampleCsv = `Ticker,Name,Sector,Industry,MarketCap,Price,PE,PB,EV_EBITDA,ROCE,ROE,OPM,SalesGrowth,ProfitGrowth,Debt,InterestCoverage,FCFConv,FCFYield,WorkingCapital
NESTLEIND,Nestle India,FMCG,Packaged Foods,210000,2178,74.5,72.4,51.2,132.5,108.2,23.8,11.2,13.8,0.02,28.5,88.5,1.5,12
HINDUNILVR,Hindustan Unilever,FMCG,Personal Care,560000,2385,54.2,11.2,38.5,28.4,20.5,23.5,8.5,10.2,0.01,42.0,85.2,2.1,18
TCS,Tata Consultancy Services,IT,IT Services,1420000,3920,29.8,13.5,21.4,58.2,48.5,26.4,12.5,11.8,0.01,85.0,92.0,3.4,-15
INFY,Infosys,IT,IT Services,780000,1880,27.4,8.9,19.2,41.2,32.8,22.8,13.2,12.4,0.02,68.0,88.0,3.8,-12`;

  return (
    <div id="data-adapter-modal-overlay" className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 overflow-y-auto backdrop-blur-xs">
      <div
        id="data-adapter-modal"
        className="bg-[#15181E] border border-[#2D333B] rounded-lg max-w-2xl w-full p-6 shadow-2xl text-[#E0E0E0] relative space-y-5"
      >
        <div className="flex items-center justify-between pb-3 border-b border-[#2D333B]">
          <div className="flex items-center gap-2">
            <Database size={18} className="text-[#D4AF37]" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Financial Data Connector & Screener.in Adapter Layer
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-[#8E9299] hover:text-white p-1 rounded transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Permitted Architecture Note */}
        <div className="bg-[#1A1D23] p-3.5 rounded border border-[#2D333B] text-xs space-y-1.5">
          <div className="flex items-center gap-2 text-white font-semibold">
            <Shield size={15} className="text-[#10B981]" />
            <span>Permitted Screener.in Data Integration Architecture</span>
          </div>
          <p className="text-[#8E9299] text-[11px] leading-relaxed">
            FINVEST AI utilizes a server-side data connector architecture that loads verified financial datasets directly through authorized Screener.in feeds and structured exports. No unauthorized web scraping or CAPTCHA bypass is executed.
          </p>
        </div>

        {/* Current Connector Status */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="bg-[#1A1D23] p-3 rounded border border-[#2D333B]">
            <span className="text-[#8E9299] text-[11px] block">Connector Feed</span>
            <span className="text-white font-bold">{status?.sourceName}</span>
          </div>
          <div className="bg-[#1A1D23] p-3 rounded border border-[#2D333B]">
            <span className="text-[#8E9299] text-[11px] block">Last Synchronized</span>
            <span className="text-white font-mono">{status?.lastUpdated}</span>
          </div>
        </div>

        {/* Mode Toggle */}
        <div className="flex items-center justify-between p-3 bg-[#1A1D23] rounded border border-[#2D333B]">
          <div>
            <div className="text-xs font-bold text-white">Demonstration Synthetic Mode</div>
            <div className="text-[11px] text-[#8E9299]">
              Switch to simulated synthetic dataset for academic stress testing
            </div>
          </div>
          <button
            onClick={() => onSwitchMode(!status?.isDemo)}
            className={`px-3 py-1.5 rounded text-xs font-bold transition-colors ${
              status?.isDemo
                ? 'bg-[#D4AF37] text-[#0F1115]'
                : 'bg-[#0F1115] hover:bg-[#2D333B] text-[#E0E0E0] border border-[#2D333B]'
            }`}
          >
            {status?.isDemo ? 'Synthetic Demo Active' : 'Switch to Synthetic Demo'}
          </button>
        </div>

        {/* Custom Screener CSV Upload */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white uppercase flex items-center gap-1.5">
              <FileSpreadsheet size={14} className="text-[#D4AF37]" />
              <span>Import Permitted Screener.in CSV Export</span>
            </span>
            <button
              onClick={() => setCsvInput(sampleCsv)}
              className="text-[11px] text-[#D4AF37] hover:underline font-medium"
            >
              Load Sample Template
            </button>
          </div>

          <textarea
            rows={4}
            value={csvInput}
            onChange={(e) => setCsvInput(e.target.value)}
            placeholder="Paste raw CSV content exported from Screener.in (Ticker, Name, Sector, MarketCap, PE, ROCE, SalesGrowth...)"
            className="w-full bg-[#0F1115] border border-[#2D333B] rounded p-2.5 text-xs font-mono text-white placeholder-[#8E9299] focus:outline-none focus:border-[#D4AF37]"
          />

          {feedback && (
            <div
              className={`p-2 rounded text-xs flex items-center gap-1.5 ${
                feedback.type === 'success'
                  ? 'bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/40'
                  : 'bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/40'
              }`}
            >
              {feedback.type === 'success' ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}
              <span>{feedback.message}</span>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={handleImport}
              disabled={importing || !csvInput.trim()}
              className="bg-[#D4AF37] hover:bg-[#C29D2D] text-[#0F1115] px-4 py-1.5 rounded text-xs font-bold transition-colors disabled:opacity-50 flex items-center gap-1.5"
            >
              <Upload size={13} />
              <span>{importing ? 'Importing...' : 'Parse & Load Dataset'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
