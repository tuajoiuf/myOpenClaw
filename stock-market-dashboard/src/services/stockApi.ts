// src/services/stockApi.ts
// 从腾讯财经API获取实时股票数据

export interface StockData {
  symbol: string;
  name: string;
  chineseName?: string; // 中文名称
  market: 'CN' | 'US'; // 市场标识：CN为中国A股，US为美股
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  open?: number;
  high?: number;
  low?: number;
  preClose?: number;
  marketCap?: number;
  peRatio?: number;
}

export interface SectorData {
  name: string;
  market: 'CN' | 'US'; // 市场标识
  stocks: StockData[];
}

// 模拟板块和股票代码映射 - 分为中国市场和美国市场
const CN_SECTOR_STOCKS: Record<string, string[]> = {
  '科技': ['sz300750', 'sz300014', 'sz300498', 'sz300033', 'sh688008', 'sh688111'],
  '金融': ['sh601318', 'sh601328', 'sh601398', 'sh601939', 'sh601288', 'sh601818'],
  '医疗保健': ['sz000538', 'sz002422', 'sh600276', 'sh600519', 'sh603259', 'sh600196'],
  '消费': ['sz000858', 'sh600519', 'sh600887', 'sh600298', 'sh600600', 'sh600885'],
  '工业': ['sh601688', 'sh601100', 'sh601766', 'sh600170', 'sh601899', 'sh601186'],
  '能源': ['sh601857', 'sh601238', 'sh601808', 'sh600028', 'sh601088', 'sh600348'],
  '房地产': ['sh600048', 'sh600383', 'sh600208', 'sh600376', 'sh600675', 'sh600585'],
  '公用事业': ['sh600027', 'sh600900', 'sh600011', 'sh600167', 'sh600350', 'sh600116'],
  '材料': ['sh600585', 'sh600196', 'sh600362', 'sh600516', 'sh601600', 'sh600392'],
  '通信服务': ['sh600030', 'sh600050', 'sh600718', 'sh600941', 'sz000063', 'sz000034']
};

const US_SECTOR_STOCKS: Record<string, string[]> = {
  'Technology': ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'TSLA', 'META', 'AVGO'],
  'Financials': ['JPM', 'BAC', 'WFC', 'C', 'GS', 'MS', 'AXP', 'BLK'],
  'Healthcare': ['JNJ', 'PFE', 'MRK', 'ABT', 'ABBV', 'UNH', 'CVS', 'MDT'],
  'Consumer Cyclical': ['AMZN', 'TSLA', 'HD', 'MCD', 'NKE', 'DIS', 'SBUX', 'TGT'],
  'Industrials': ['BA', 'CAT', 'HON', 'MMM', 'GD', 'LMT', 'RTX', 'UPS'],
  'Energy': ['XOM', 'CVX', 'RDS-A', 'RDS-B', 'PTR', 'BHP', 'LIN', 'NEE'],
  'Real Estate': ['AMT', 'PLD', 'CCI', 'EQIX', 'PSA', 'DLR', 'O', 'SBAC'],
  'Utilities': ['NEE', 'DUK', 'SO', 'D', 'EXC', 'PCG', 'XEL', 'SRE'],
  'Materials': ['LIN', 'SHW', 'ECL', 'DOW', 'NEM', 'APD', 'PPG', 'VMC'],
  'Communication Services': ['GOOGL', 'META', 'AMZN', 'DIS', 'CMCSA', 'T', 'VZ', 'CHTR']
};

/**
 * 将腾讯财经返回的数据解析为StockData对象
 */
export const parseStockData = (dataString: string, market: 'CN' | 'US' = 'CN'): StockData | null => {
  try {
    const fields = dataString.split(',');
    
    if (fields.length < 32) {
      console.error(`Invalid data string for stock: ${dataString}`);
      return null;
    }
    
    const name = fields[0]; // 股票名称（通常是中文名）
    const open = parseFloat(fields[1]); // 开盘价
    const preClose = parseFloat(fields[2]); // 昨收价
    const current = parseFloat(fields[3]); // 当前价
    const high = parseFloat(fields[4]); // 最高价
    const low = parseFloat(fields[5]); // 最低价
    const volume = parseInt(fields[6]) || 0; // 成交量
    const amount = parseFloat(fields[7]) || 0; // 成交额
    const date = fields[30]; // 日期
    const time = fields[31]; // 时间
    
    // 计算涨跌额和涨跌幅
    const change = current - preClose;
    const changePercent = preClose ? ((change / preClose) * 100) : 0;
    
    return {
      symbol: '', // 股票代码会在调用处补充
      name,
      chineseName: name, // 腾讯财经API通常直接返回中文名称
      market,
      price: current,
      change,
      changePercent: parseFloat(changePercent.toFixed(2)),
      volume,
      open,
      high,
      low,
      preClose
    };
  } catch (error) {
    console.error('Error parsing stock data:', error);
    return null;
  }
};

/**
 * 解析美股数据（从Alpha Vantage或其他API获取的数据格式）
 */
export const parseUSStockData = (data: any): StockData | null => {
  try {
    // 这里是一个示例，实际实现可能需要根据具体API格式调整
    const symbol = data['01. symbol'] || data.symbol || '';
    const price = parseFloat(data['05. price'] || data.price || data.close || 0);
    const previousClose = parseFloat(data['08. previous close'] || data.previousClose || 0);
    
    const change = price - previousClose;
    const changePercent = previousClose ? ((change / previousClose) * 100) : 0;
    
    return {
      symbol,
      name: data.name || data['02. name'] || symbol,
      market: 'US',
      price,
      change,
      changePercent: parseFloat(changePercent.toFixed(2)),
      volume: parseInt(data['06. volume'] || data.volume || 0),
      preClose: previousClose,
      open: parseFloat(data['02. open'] || data.open || 0),
      high: parseFloat(data['03. high'] || data.high || 0),
      low: parseFloat(data['04. low'] || data.low || 0)
    };
  } catch (error) {
    console.error('Error parsing US stock data:', error);
    return null;
  }
};

/**
 * 从腾讯财经API获取中国A股数据（通过代理）
 */
export const fetchCNStockData = async (symbols: string[]): Promise<StockData[]> => {
  if (!symbols || symbols.length === 0) {
    return [];
  }
  
  try {
    // 构建API请求URL
    const symbolsParam = symbols.join(',');
    const response = await fetch(`/api/stock/list=${symbolsParam}`, {
      headers: {
        'Referer': 'https://finance.sina.com.cn/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const text = await response.text();
    const lines = text.split('\n');
    
    const stocks: StockData[] = [];
    
    for (let i = 0; i < symbols.length; i++) {
      const symbol = symbols[i];
      const line = lines[i];
      
      if (line && line.includes('var hq_str_')) {
        // 提取股票数据部分
        const startIndex = line.indexOf('"') + 1;
        const endIndex = line.lastIndexOf('"');
        
        if (startIndex > 0 && endIndex > startIndex) {
          const dataString = line.substring(startIndex, endIndex);
          const stock = parseStockData(dataString, 'CN'); // 指定为中国市场
        
          if (stock) {
            stock.symbol = symbol; // 补充股票代码
            stocks.push(stock);
          }
        }
      }
    }
    
    return stocks;
  } catch (error) {
    console.error('Error fetching CN stock data:', error);
    // 如果API调用失败，返回模拟数据
    return getMockStockData(symbols, 'CN');
  }
};

/**
 * 获取美股数据（模拟实现，实际应用中需要连接美股API）
 */
export const fetchUSStockData = async (symbols: string[]): Promise<StockData[]> => {
  if (!symbols || symbols.length === 0) {
    return [];
  }
  
  try {
    // 这里是模拟实现，实际应用中应连接美股API如Alpha Vantage, IEX Cloud等
    // 为了演示目的，我们将创建模拟数据
    const stocks: StockData[] = [];
    
    for (const symbol of symbols) {
      // 模拟从美股API获取数据
      const mockData = {
        '01. symbol': symbol,
        '02. name': `${symbol} Company`,
        '05. price': (Math.random() * 300 + 50).toFixed(2), // 随机价格在50-350之间
        '08. previous close': (Math.random() * 300 + 50).toFixed(2),
        '06. volume': Math.floor(Math.random() * 10000000).toString(),
        '02. open': (Math.random() * 300 + 50).toFixed(2),
        '03. high': (Math.random() * 300 + 50).toFixed(2),
        '04. low': (Math.random() * 300 + 50).toFixed(2)
      };
      
      const stock = parseUSStockData(mockData);
      if (stock) {
        stocks.push(stock);
      }
    }
    
    return stocks;
  } catch (error) {
    console.error('Error fetching US stock data:', error);
    // 如果API调用失败，返回模拟数据
    return getMockStockData(symbols, 'US');
  }
};

/**
 * 获取指定市场的股票数据
 */
export const fetchStockData = async (symbols: string[], market: 'CN' | 'US' = 'CN'): Promise<StockData[]> => {
  if (market === 'CN') {
    return fetchCNStockData(symbols);
  } else {
    return fetchUSStockData(symbols);
  }
};

/**
 * 获取中国A股板块数据
 */
export const fetchCNSectorData = async (): Promise<SectorData[]> => {
  const sectors: SectorData[] = [];
  
  for (const [sectorName, stockSymbols] of Object.entries(CN_SECTOR_STOCKS)) {
    const stocks = await fetchCNStockData(stockSymbols);
    
    sectors.push({
      name: sectorName,
      market: 'CN',
      stocks
    });
  }
  
  return sectors;
};

/**
 * 获取美股板块数据
 */
export const fetchUSSectorData = async (): Promise<SectorData[]> => {
  const sectors: SectorData[] = [];
  
  for (const [sectorName, stockSymbols] of Object.entries(US_SECTOR_STOCKS)) {
    const stocks = await fetchUSStockData(stockSymbols);
    
    sectors.push({
      name: sectorName,
      market: 'US',
      stocks
    });
  }
  
  return sectors;
};

/**
 * 获取所有市场的板块数据
 */
export const fetchSectorData = async (): Promise<SectorData[]> => {
  const cnSectors = await fetchCNSectorData();
  const usSectors = await fetchUSSectorData();
  
  return [...cnSectors, ...usSectors];
};

/**
 * 从东方财富API获取板块数据（备用方案）
 */
export const fetchEastMoneySectorData = async (): Promise<SectorData[]> => {
  try {
    const response = await fetch('/api/eastmoney/api/qt/clist/get?pn=1&pz=20&po=1&np=1&ut=bd1d5aa0508bd783860fc2ca3a68d469&fltt=2&invt=2&fid=f3&fs=m:90+t:2+f:0', {
      headers: {
        'Referer': 'https://quote.eastmoney.com/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data && data.data && data.data.diff) {
      const stocks = data.data.diff.map((item: any) => ({
        symbol: item.f12 || '',
        name: item.f14 || '',
        market: 'CN',
        price: parseFloat(item.f2) || 0,
        change: parseFloat(item.f4) || 0,
        changePercent: parseFloat(item.f3) || 0,
        volume: parseInt(item.f5) || 0,
        marketCap: parseFloat(item.f20) || 0,
        peRatio: parseFloat(item.f9) || 0
      }));

      // 按行业分组
      const sectorsMap: Record<string, StockData[]> = {};
      
      // 这里可以根据行业字段进行分组，如果没有行业字段则使用默认分类
      // 简化处理：将所有股票放在一个"沪深A股"板块中
      sectorsMap['沪深A股'] = stocks.slice(0, 10); // 取前10只股票
      
      return Object.entries(sectorsMap).map(([name, stocks]) => ({
        name,
        market: 'CN',
        stocks
      }));
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching East Money sector data:', error);
    return [];
  }
};

/**
 * 获取模拟数据（当真实API不可用时使用）
 */
const getMockStockData = (symbols: string[], market: 'CN' | 'US'): StockData[] => {
  return symbols.map((symbol, index) => {
    const basePrice = market === 'CN' ? (10 + Math.random() * 100) : (20 + Math.random() * 300);
    const changePercent = (Math.random() - 0.5) * 0.1; // ±5%的变动
    const change = basePrice * changePercent;
    
    return {
      symbol,
      name: market === 'CN' ? `股票${index + 1}` : `Stock${index + 1}`,
      chineseName: market === 'CN' ? `股票${index + 1}` : undefined,
      market,
      price: parseFloat(basePrice.toFixed(2)),
      change: parseFloat(change.toFixed(2)),
      changePercent: parseFloat((changePercent * 100).toFixed(2)),
      volume: Math.floor(Math.random() * 10000000) + 1000000,
      open: parseFloat((basePrice - change/2).toFixed(2)),
      high: parseFloat((basePrice + Math.abs(change)).toFixed(2)),
      low: parseFloat((basePrice - Math.abs(change)).toFixed(2)),
      preClose: parseFloat((basePrice - change).toFixed(2))
    };
  });
};

// 为了向后兼容，导出原来的函数名
export { fetchSectorData as fetchSectorDataOld };