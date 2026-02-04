export interface Stock {
  symbol: string;
  name: string;
  chineseName?: string; // 中文名称
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap?: number;
  peRatio?: number;
}

export interface Sector {
  name: string;
  performance: number;
  topStocks: Stock[];
}

export interface SectorPerformance {
  sector: string;
  changePercent: number;
  topStocks: Stock[];
}