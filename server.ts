import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { financialDataService } from './server/services/financialDataService';
import { ScoringEngine } from './server/services/scoringEngine';
import { MLEngine } from './server/services/mlEngine';
import { GeminiService } from './server/services/geminiService';
import { StockPriceService } from './server/services/stockPriceService';
import { EvaluatedCompany, ScreeningFilters, PillarWeights, SubMetricWeights, ResearchPriority } from './src/types';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // --- API ROUTES ---

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', service: 'FINVEST AI Backend Engine', timestamp: new Date().toISOString() });
  });

  // Data Source Status
  app.get('/api/data/status', (req, res) => {
    try {
      const status = financialDataService.getStatus();
      res.json(status);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to fetch status' });
    }
  });

  // Get raw companies list
  app.get('/api/data/companies', (req, res) => {
    try {
      const sector = req.query.sector as string;
      const query = req.query.q as string;
      const companies = financialDataService.getCompanies(sector, query);
      res.json({ count: companies.length, companies });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to fetch companies' });
    }
  });

  // Get single company detail
  app.get('/api/data/company/:id', (req, res) => {
    try {
      const company = financialDataService.getCompanyById(req.params.id);
      if (!company) {
        return res.status(404).json({ error: 'Company not found' });
      }
      res.json(company);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to fetch company' });
    }
  });

  // Dynamic Live Stock Price Quote (Alpha Vantage / Dynamic Feed)
  app.get('/api/price/:ticker', async (req, res) => {
    try {
      const ticker = req.params.ticker;
      const company = financialDataService.getCompanyById(ticker);
      const basePrice = company ? company.metrics.currentPrice : undefined;
      const quote = await StockPriceService.fetchDynamicQuote(ticker, basePrice);
      res.json(quote);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to fetch dynamic quote' });
    }
  });

  // Batch Dynamic Price Sync (Updates universe market prices in real-time)
  app.post('/api/prices/sync-dynamic', async (req, res) => {
    try {
      const currentCompanies = financialDataService.getCompanies();
      const { updatedCompanies, summary } = await StockPriceService.syncDynamicPrices(currentCompanies);
      financialDataService.updateCompanies(updatedCompanies);
      res.json({
        success: true,
        summary,
        companies: updatedCompanies,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to sync dynamic prices' });
    }
  });

  // Complete dynamic evaluation endpoint (Scoring + ML Clustering + Anomaly Detection + Ranking)
  app.post('/api/data/evaluate', (req, res) => {
    try {
      const {
        sector,
        query,
        filters,
        pillars,
        subWeights,
      }: {
        sector?: string;
        query?: string;
        filters: ScreeningFilters;
        pillars: PillarWeights;
        subWeights: SubMetricWeights;
      } = req.body;

      // 1. Fetch universe
      const companies = financialDataService.getCompanies(sector, query);

      if (companies.length === 0) {
        return res.json({
          totalUniverse: 0,
          passingCount: 0,
          clusters: [],
          anomalies: [],
          evaluatedCompanies: [],
        });
      }

      // 2. Compute dynamic normalized scores
      const scoreMap = ScoringEngine.calculateScores(companies, pillars, subWeights);

      // 3. Run ML K-Means clustering dynamically
      const { clusters, companyClusterMap } = MLEngine.runClustering(companies, 4);

      // 4. Run Anomaly detection
      const allAnomalies = MLEngine.detectAnomalies(companies);
      const companyAnomalyMap = new Map<string, typeof allAnomalies>();
      allAnomalies.forEach((a) => {
        const existing = companyAnomalyMap.get(a.companyId) || [];
        existing.push(a);
        companyAnomalyMap.set(a.companyId, existing);
      });

      // 5. Evaluate filters & assign ranks
      let evaluated: EvaluatedCompany[] = companies.map((c) => {
        const scores = scoreMap.get(c.id)!;
        const filterResult = ScoringEngine.evaluateFilter(c, filters);
        const cluster = companyClusterMap.get(c.id) || clusters[0];
        const anomalies = companyAnomalyMap.get(c.id) || [];

        let researchPriority: ResearchPriority = 'Low';
        if (scores.overallScore >= 70) {
          researchPriority = 'High';
        } else if (scores.overallScore >= 45) {
          researchPriority = 'Medium';
        }

        return {
          company: c,
          rank: 0, // Assigned after sorting
          passesFilter: filterResult.passes,
          filterRejectionReasons: filterResult.rejectionReasons,
          scores,
          cluster,
          anomalies,
          researchPriority,
        };
      });

      // Sort by overallScore descending
      evaluated.sort((a, b) => b.scores.overallScore - a.scores.overallScore);

      // Assign ranks (1-indexed)
      evaluated.forEach((item, index) => {
        item.rank = index + 1;
      });

      const passingCount = evaluated.filter((e) => e.passesFilter).length;

      res.json({
        totalUniverse: companies.length,
        passingCount,
        clusters,
        anomalies: allAnomalies,
        evaluatedCompanies: evaluated,
      });
    } catch (err: any) {
      console.error('Error during equity evaluation:', err);
      res.status(500).json({ error: err.message || 'Evaluation failed' });
    }
  });

  // Refresh data connector
  app.post('/api/data/refresh', (req, res) => {
    try {
      const result = financialDataService.refreshData();
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Refresh failed' });
    }
  });

  // Switch demo / live mode
  app.post('/api/data/mode', (req, res) => {
    try {
      const { demo } = req.body;
      const status = financialDataService.setDemoMode(Boolean(demo));
      res.json(status);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Mode switch failed' });
    }
  });

  // Import custom CSV dataset
  app.post('/api/data/import-csv', (req, res) => {
    try {
      const { csvContent } = req.body;
      if (!csvContent || typeof csvContent !== 'string') {
        return res.status(400).json({ error: 'csvContent string is required' });
      }
      const result = financialDataService.importCsv(csvContent);
      if (!result.success) {
        return res.status(400).json(result);
      }
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'CSV import failed' });
    }
  });

  // Generative AI Research Brief endpoint
  app.post('/api/ai/research-brief', async (req, res) => {
    try {
      const {
        companyId,
        scores,
        weights,
        cluster,
        anomalies,
        rank,
        totalCompanies,
      } = req.body;

      const company = financialDataService.getCompanyById(companyId);
      if (!company) {
        return res.status(404).json({ error: 'Company not found' });
      }

      const brief = await GeminiService.generateResearchBrief(
        company,
        scores,
        weights,
        cluster,
        anomalies || [],
        rank || 1,
        totalCompanies || 10
      );

      res.json(brief);
    } catch (err: any) {
      console.error('AI Research Brief error:', err);
      res.status(500).json({ error: err.message || 'Failed to generate AI brief' });
    }
  });

  // --- VITE MIDDLEWARE / STATIC ASSETS ---

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`FINVEST AI Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
