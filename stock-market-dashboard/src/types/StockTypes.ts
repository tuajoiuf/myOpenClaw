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
  // 额外属性（API返回）
  open?: number;
  high?: number;
  low?: number;
  preClose?: number;
}

export interface Sector {
  name: string;
  market: 'CN' | 'US'; // 市场标识
  performance: number;
  topStocks: Stock[];
}

export interface SectorPerformance {
  sector: string;
  changePercent: number;
  topStocks: Stock[];
}

// 为API服务定义类型别名
export type StockData = Stock;
export type SectorData = Sector;