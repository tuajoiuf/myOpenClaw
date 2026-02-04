// src/utils/stockDataGenerator.ts

import { Sector, Stock } from '../types/StockTypes';

// 模拟股票数据生成器
export const generateMockStock = (symbol: string, name: string): Stock => {
  const basePrice = Math.random() * 200 + 50; // 价格范围 50-250
  const changePercent = (Math.random() - 0.5) * 0.2; // 变化范围 ±10%
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

// 模拟板块数据生成器
export const generateMockSectors = (): Sector[] => {
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