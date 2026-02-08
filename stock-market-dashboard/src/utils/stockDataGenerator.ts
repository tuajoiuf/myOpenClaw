// src/utils/stockDataGenerator.ts

import { Sector, Stock, SectorData } from '../types/StockTypes';
import { fetchCNSectorData, fetchUSSectorData } from '../services/stockApi';

// 将API返回的数据转换为应用内部类型
const mapApiToInternal = (apiStock: SectorData): Stock => {
  return {
    symbol: apiStock.topStocks[0]?.symbol || '',
    name: apiStock.topStocks[0]?.name || apiStock.name,
    chineseName: apiStock.topStocks[0]?.chineseName,
    market: apiStock.market,
    price: apiStock.topStocks[0]?.price || 0,
    change: apiStock.topStocks[0]?.change || 0,
    changePercent: apiStock.topStocks[0]?.changePercent || 0,
    volume: apiStock.topStocks[0]?.volume || 0,
    marketCap: apiStock.topStocks[0]?.marketCap || 0,
    peRatio: apiStock.topStocks[0]?.peRatio || 0
  };
};

// 从真实API获取股票数据生成器
export const generateMockStock = (symbol: string, name: string, market: 'CN' | 'US' = 'CN'): Stock => {
  // 这个函数现在主要用于兼容现有代码，实际数据来自API
  const basePrice = market === 'CN' ? (10 + Math.random() * 100) : (20 + Math.random() * 300);
  const changePercent = (Math.random() - 0.5) * 0.2; // ±10%的变动
  const change = basePrice * changePercent;

  return {
    symbol,
    name,
    market,
    price: parseFloat(basePrice.toFixed(2)),
    change: parseFloat(change.toFixed(2)),
    changePercent: parseFloat((changePercent * 100).toFixed(2)),
    volume: Math.floor(Math.random() * 10000000) + 1000000, // 1M-11M
    marketCap: parseFloat((Math.random() * 500 + 50).toFixed(2)), // 市值 50-550 billion
    peRatio: parseFloat((Math.random() * 30 + 5).toFixed(2)) // P/E比率 5-35
  };
};

// 从真实API获取板块数据生成器
export const generateMockSectors = async (): Promise<Sector[]> => {
  try {
    // 从API获取真实数据
    const cnSectors = await fetchCNSectorData();
    const usSectors = await fetchUSSectorData();
    const apiSectors = [...cnSectors, ...usSectors];
    
    return apiSectors.map(apiSector => {
      // 按涨跌幅排序，取前3只股票
      const sortedStocks = [...apiSector.topStocks]
        .sort((a, b) => b.changePercent - a.changePercent)
        .slice(0, 3);
      
      // 计算板块整体表现（前3只股票的平均涨跌幅）
      const avgChange = sortedStocks.reduce((sum, stock) => sum + stock.changePercent, 0) / sortedStocks.length;
      
      return {
        name: apiSector.name,
        market: apiSector.market,
        performance: parseFloat(avgChange.toFixed(2)),
        topStocks: sortedStocks
      };
    });
  } catch (error) {
    console.error('Error generating sectors from API:', error);
    // 如果API调用失败，回退到原始的模拟数据
    return generateFallbackSectors();
  }
};

// 回退到模拟数据的函数
const generateFallbackSectors = (): Sector[] => {
  const sectors = [
    // 中国A股板块
    { name: '科技', stocks: ['sz300750', 'sz300014', 'sz300498', 'sz300033', 'sh688008', 'sh688111'], market: 'CN' as const },
    { name: '金融', stocks: ['sh601318', 'sh601328', 'sh601398', 'sh601939', 'sh601288', 'sh601818'], market: 'CN' as const },
    { name: '医疗保健', stocks: ['sz000538', 'sz002422', 'sh600276', 'sh600519', 'sh603259', 'sh600196'], market: 'CN' as const },
    { name: '消费', stocks: ['sz000858', 'sh600519', 'sh600887', 'sh600298', 'sh600600', 'sh600885'], market: 'CN' as const },
    // 美股板块
    { name: 'Technology', stocks: ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'TSLA'], market: 'US' as const },
    { name: 'Financials', stocks: ['JPM', 'BAC', 'WFC', 'C', 'GS', 'MS'], market: 'US' as const },
    { name: 'Healthcare', stocks: ['JNJ', 'PFE', 'MRK', 'ABT', 'ABBV', 'UNH'], market: 'US' as const },
    { name: 'Consumer Cyclical', stocks: ['AMZN', 'TSLA', 'HD', 'MCD', 'NKE', 'DIS'], market: 'US' as const }
  ];

  return sectors.map(sector => {
    const stocks = sector.stocks.map((symbol, index) => 
      generateMockStock(symbol, `${sector.name}公司${index + 1}`, sector.market)
    );
    
    // 计算板块表现（取前3只股票的平均变化）
    const top3 = stocks.sort((a, b) => b.changePercent - a.changePercent).slice(0, 3);
    const avgChange = top3.reduce((sum, stock) => sum + stock.changePercent, 0) / 3;
    
    return {
      name: sector.name,
      market: sector.market,
      performance: parseFloat(avgChange.toFixed(2)),
      topStocks: top3
    };
  });
};

// 实时更新单个股票数据
export const updateStockData = (stock: Stock): Stock => {
  const changeAmount = (Math.random() - 0.5) * stock.price * 0.02; // 最大±1%的变化
  const newPrice = stock.price + changeAmount;
  
  return {
    ...stock,
    price: parseFloat(newPrice.toFixed(2)),
    change: parseFloat((newPrice - (stock.price - stock.change)).toFixed(2)),
    changePercent: parseFloat(((newPrice - (stock.price - stock.change)) / (stock.price - stock.change) * 100).toFixed(2))
  };
};