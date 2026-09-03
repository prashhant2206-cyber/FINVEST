import { Company } from '../types';
import { FMCG_COMPANIES } from './companies/fmcg';
import { IT_COMPANIES } from './companies/it';
import { BANKING_COMPANIES } from './companies/banking';
import { AUTO_COMPANIES } from './companies/auto';
import { PHARMA_COMPANIES } from './companies/pharma';
import { ENERGY_METALS_COMPANIES } from './companies/energyMetals';

export const INITIAL_COMPANIES: Company[] = [
  ...FMCG_COMPANIES,
  ...IT_COMPANIES,
  ...BANKING_COMPANIES,
  ...AUTO_COMPANIES,
  ...PHARMA_COMPANIES,
  ...ENERGY_METALS_COMPANIES,
];
