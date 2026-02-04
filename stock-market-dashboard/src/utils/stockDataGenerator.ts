// src/utils/stockDataGenerator.ts

import { Sector, Stock } from '../types/StockTypes';
import { fetchSectorData, StockData } from '../services/stockApi';

// 将API返回的数据转换为应用内部类型
const mapApiToInternal = (apiStock: StockData): Stock => {
  return {
    symbol: apiStock.symbol,
    name: apiStock.name,
    chineseName: apiStock.chineseName,
    price: apiStock.price,
    change: apiStock.change,
    changePercent: apiStock.changePercent,
    volume: apiStock.volume,
    marketCap: apiStock.marketCap || 0,
    peRatio: apiStock.peRatio || 0
  };
};

// 从真实API获取股票数据生成器
export const generateMockStock = (symbol: string, name: string): Stock => {
  // 这个函数现在主要用于兼容现有代码，实际数据来自API
  const basePrice = 10 + Math.random() * 100;
  const changePercent = (Math.random() - 0.5) * 0.2; // ±10%的变动
  const change = basePrice * changePercent;

  return {
    symbol,
    name,
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
    const apiSectors = await fetchSectorData();
    
    return apiSectors.map(apiSector => {
      // 按涨跌幅排序，取前3只股票
      const sortedStocks = [...apiSector.stocks]
        .sort((a, b) => b.changePercent - a.changePercent)
        .slice(0, 3)
        .map(mapApiToInternal);
      
      // 计算板块整体表现（前3只股票的平均涨跌幅）
      const avgChange = sortedStocks.reduce((sum, stock) => sum + stock.changePercent, 0) / sortedStocks.length;
      
      return {
        name: apiSector.name,
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
    { name: '科技', stocks: ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'TSLA', 'META', 'NFLX'] },
    { name: '金融', stocks: ['JPM', 'BAC', 'WFC', 'C', 'GS', 'MS', 'AXP', 'BK'] },
    { name: '医疗保健', stocks: ['JNJ', 'PFE', 'MRK', 'ABT', 'ABBV', 'UNH', 'CVS', 'MDT'] },
    { name: '消费品', stocks: ['KO', 'PEP', 'PG', 'CL', 'UL', 'ELF', 'TGT', 'WMT'] },
    { name: '工业', stocks: ['BA', 'CAT', 'HON', 'MMM', 'GD', 'LMT', 'RTX', 'UPS'] },
    { name: '能源', stocks: ['XOM', 'CVX', 'RDS-A', 'RDS-B', 'PTR', 'BHP', 'LIN', 'NEE'] },
    { name: '房地产', stocks: ['AMT', 'PLD', 'CCI', 'EQIX', 'PSA', 'DLR', 'O', 'SBAC'] },
    { name: '公用事业', stocks: ['NEE', 'DUK', 'SO', 'D', 'EXC', 'PCG', 'XEL', 'SRE'] },
    { name: '材料', stocks: ['LIN', 'SHW', 'ECL', 'DOW', 'NEM', 'APD', 'PPG', 'VMC'] },
    { name: '通信服务', stocks: ['GOOGL', 'META', 'AMZN', 'DIS', 'CMCSA', 'T', 'VZ', 'CHTR'] }
  ];

  return sectors.map(sector => {
    const stocks = sector.stocks.map((symbol, index) => 
      generateMockStock(symbol, `${sector.name}公司${index + 1}`)
    );
    
    // 计算板块表现（取前3只股票的平均变化）
    const top3 = stocks.sort((a, b) => b.changePercent - a.changePercent).slice(0, 3);
    const avgChange = top3.reduce((sum, stock) => sum + stock.changePercent, 0) / 3;
    
    return {
      name: sector.name,
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