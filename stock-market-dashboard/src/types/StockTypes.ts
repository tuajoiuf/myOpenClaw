export interface Stock {
  symbol: string;
  name: string;
  chineseName?: string; // 中文名称
  market: 'CN' | 'US'; // 市场标识：CN为中国A股，US为美股
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap?: number;
  peRatio?: number;
}

export interface Sector {
  name: string;
  market: 'CN' | 'US'; // 市场标识
  performance: number;
  topStocks: Stock[];
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