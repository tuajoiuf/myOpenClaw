// src/services/stockApi.ts
// 从腾讯财经API获取实时股票数据

export interface StockData {
  symbol: string;
  name: string;
  chineseName?: string; // 中文名称
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
  stocks: StockData[];
}

// 模拟板块和股票代码映射
const SECTOR_STOCKS: Record<string, string[]> = {
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

/**
 * 将腾讯财经返回的数据解析为StockData对象
 */
export const parseStockData = (dataString: string): StockData | null => {
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
 * 从腾讯财经API获取股票数据（通过代理）
 */
export const fetchStockData = async (symbols: string[]): Promise<StockData[]> => {
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
          const stock = parseStockData(dataString);
          
          if (stock) {
            stock.symbol = symbol; // 补充股票代码
            stocks.push(stock);
          }
        }
      }
    }
    
    return stocks;
  } catch (error) {
    console.error('Error fetching stock data:', error);
    // 如果API调用失败，返回模拟数据
    return getMockStockData(symbols);
  }
};

/**
 * 获取板块数据
 */
export const fetchSectorData = async (): Promise<SectorData[]> => {
  const sectors: SectorData[] = [];
  
  for (const [sectorName, stockSymbols] of Object.entries(SECTOR_STOCKS)) {
    const stocks = await fetchStockData(stockSymbols);
    
    sectors.push({
      name: sectorName,
      stocks
    });
  }
  
  return sectors;
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
      const stocks = data.data.diff.map((item: any) => {
        return {
          symbol: item.f12 || '',
          name: item.f14 || '',
          price: parseFloat(item.f2) || 0,
          change: parseFloat(item.f4) || 0,
          changePercent: parseFloat(item.f3) || 0,
          volume: parseInt(item.f5) || 0,
          marketCap: parseFloat(item.f20) || 0,
          peRatio: parseFloat(item.f9) || 0
        };
      });

      // 按行业分组
      const sectorsMap: Record<string, StockData[]> = {};
      
      // 这里可以根据行业字段进行分组，如果没有行业字段则使用默认分类
      // 简化处理：将所有股票放在一个"沪深A股"板块中
      sectorsMap['沪深A股'] = stocks.slice(0, 10); // 取前10只股票
      
      return Object.entries(sectorsMap).map(([name, stocks]) => ({
        name,
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
const getMockStockData = (symbols: string[]): StockData[] => {
  return symbols.map((symbol, index) => {
    const basePrice = 10 + Math.random() * 100;
    const changePercent = (Math.random() - 0.5) * 0.2; // ±10%的变动
    const change = basePrice * changePercent;
    
    return {
      symbol,
      name: `股票${index + 1}`,
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