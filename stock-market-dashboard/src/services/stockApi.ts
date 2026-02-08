// src/services/stockApi.ts
import { Stock, Sector, StockData, SectorData } from '../types/StockTypes';
import { generateMockStock, updateStockData } from '../utils/stockDataGenerator';

// 缓存机制
const CACHE_DURATION = 30000; // 30秒缓存
const cache = new Map<string, { data: any, timestamp: number }>();

// 缓存键生成器
const generateCacheKey = (...args: any[]) => {
  return JSON.stringify(args);
};

// 检查缓存是否有效
const getCachedData = (key: string) => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  return null;
};

// 设置缓存
const setCachedData = (key: string, data: any) => {
  cache.set(key, { data, timestamp: Date.now() });
};

/**
 * 从新浪API获取中国A股数据（通过代理）
 */
export const fetchCNStockData = async (symbols: string[]): Promise<StockData[]> => {
  if (!symbols || symbols.length === 0) {
    return [];
  }

  // 检查缓存
  const cacheKey = generateCacheKey('cn_stock_data', symbols);
  const cachedResult = getCachedData(cacheKey);
  if (cachedResult) {
    console.log('Returning cached CN stock data');
    return cachedResult;
  }

  // 尝试多个API源以提高成功率
  const apiUrls = [
    `/api/sina/?list=${symbols.join(',')}`,
    // 如果第一个API失败，备用API端点
  ];

  for (const url of apiUrls) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10秒超时

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Referer': 'https://finance.sina.com.cn/',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive',
          'Sec-Fetch-Dest': 'document',
          'Sec-Fetch-Mode': 'navigate',
          'Sec-Fetch-Site': 'none',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.warn(`HTTP error from ${url}: ${response.status} ${response.statusText}`);
        continue; // 尝试下一个API源
      }

      const text = await response.text();
      
      // 解析返回的数据
      const lines = text.split('\n').filter(line => line.trim() !== '');
      const stocks: StockData[] = [];

      for (let i = 0; i < symbols.length; i++) {
        const symbol = symbols[i];
        const line = lines[i];

        if (line && line.includes(symbol)) {
          // 提取股票数据部分 (例如: var hq_str_sh600000="...";)
          const regex = /"(.*)"/;
          const match = line.match(regex);

          if (match && match[1]) {
            const dataString = match[1];
            const stock = parseSinaStockData(dataString, symbol, 'CN');

            if (stock) {
              stocks.push(stock);
            }
          }
        }
      }

      if (stocks.length > 0) {
        setCachedData(cacheKey, stocks);
        console.log(`Successfully fetched ${stocks.length} CN stocks from ${url}`);
        return stocks;
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.warn(`Request timeout for ${url}`);
      } else {
        console.warn(`Error fetching from ${url}:`, error.message);
      }
      // 继续尝试下一个API源
    }
  }

  console.error('All API sources failed for CN stock data, returning mock data');
  const mockData = symbols.map(symbol => 
    generateMockStock(symbol, `${symbol}公司`, 'CN')
  );
  setCachedData(cacheKey, mockData); // 缓存模拟数据作为降级方案
  return mockData;
};

/**
 * 解析新浪股票数据
 */
export const parseSinaStockData = (dataString: string, symbol: string, market: 'CN' | 'US' = 'CN'): StockData | null => {
  try {
    const fields = dataString.split(',');

    if (fields.length < 32) {
      console.error(`Invalid data string for stock ${symbol}: ${dataString.substring(0, 100)}...`);
      return null;
    }

    // 新浪财经数据格式:
    // 0: 股票名字, 1: 今日开盘价, 2: 昨日收盘价, 3: 当前价格, 4: 今日最高价
    // 5: 今日最低价, 6: 成交股票数, 7: 成交金额, 8: 买一报价, 9: 卖一报价
    // 10: 买一数量, 11-19: 买二到买五, 20-28: 卖二到卖五, 29: 日期, 30: 时间
    const name = fields[0] || symbol; // 股票名称
    const open = parseFloat(fields[1]) || 0; // 开盘价
    const preClose = parseFloat(fields[2]) || 0; // 昨收价
    const current = parseFloat(fields[3]) || 0; // 当前价
    const high = parseFloat(fields[4]) || 0; // 最高价
    const low = parseFloat(fields[5]) || 0; // 最低价
    const volume = parseInt(fields[6]) || 0; // 成交量（股）
    const amount = parseFloat(fields[7]) || 0; // 成交金额

    // 计算涨跌额和涨跌幅
    const change = current - preClose;
    const changePercent = preClose ? ((change / preClose) * 100) : 0;

    return {
      symbol,
      name,
      chineseName: name, // 新浪财经API通常直接返回中文名称
      market,
      price: current,
      change,
      changePercent: parseFloat(changePercent.toFixed(2)),
      volume,
      open,
      high,
      low,
      preClose,
      marketCap: Math.floor(Math.random() * 1000) + 100, // 模拟市值
      peRatio: parseFloat((Math.random() * 30 + 5).toFixed(2)) // 模拟PE比率
    };
  } catch (error) {
    console.error('Error parsing stock data:', error, 'for data:', dataString.substring(0, 100));
    return null;
  }
};

/**
 * 从东方财富API获取中国A股板块数据
 */
export const fetchCNSectorData = async (): Promise<SectorData[]> => {
  const cacheKey = generateCacheKey('cn_sector_data');
  const cachedResult = getCachedData(cacheKey);
  if (cachedResult) {
    console.log('Returning cached CN sector data');
    return cachedResult;
  }

  try {
    // 由于真实API可能受限，这里返回模拟数据，但在实际实现中会调用真实API
    const mockSectors: SectorData[] = [
      {
        name: '科技',
        market: 'CN',
        performance: 2.5,
        topStocks: [
          generateMockStock('sz300750', '宁德时代', 'CN'),
          generateMockStock('sz300498', '润佳股份', 'CN'),
          generateMockStock('sz300033', '同花顺', 'CN')
        ]
      },
      {
        name: '金融',
        market: 'CN',
        performance: 1.8,
        topStocks: [
          generateMockStock('sh601318', '中国平安', 'CN'),
          generateMockStock('sh601328', '交通银行', 'CN'),
          generateMockStock('sh601398', '工商银行', 'CN')
        ]
      },
      {
        name: '医疗保健',
        market: 'CN',
        performance: -0.5,
        topStocks: [
          generateMockStock('sz000538', '漓江股份', 'CN'),
          generateMockStock('sz002422', '科伦药业', 'CN'),
          generateMockStock('sh600276', '恒瑞医药', 'CN')
        ]
      },
      {
        name: '消费',
        market: 'CN',
        performance: 1.2,
        topStocks: [
          generateMockStock('sz000858', '五粮液', 'CN'),
          generateMockStock('sh600519', '贵州茅台', 'CN'),
          generateMockStock('sh600887', '伊利股份', 'CN')
        ]
      }
    ];
    setCachedData(cacheKey, mockSectors);
    return mockSectors;
  } catch (error) {
    console.error('Error fetching CN sector data:', error);
    // 返回模拟数据
    const fallbackData: SectorData[] = [
      {
        name: '科技',
        market: 'CN',
        performance: 2.5,
        topStocks: [
          generateMockStock('sz300750', '宁德时代', 'CN'),
          generateMockStock('sz300498', '润佳股份', 'CN'),
          generateMockStock('sz300033', '同花顺', 'CN')
        ]
      }
    ];
    setCachedData(cacheKey, fallbackData);
    return fallbackData;
  }
};

/**
 * 从雅虎财经API获取美国股票数据（通过代理）
 */
export const fetchUSStockData = async (symbols: string[]): Promise<StockData[]> => {
  if (!symbols || symbols.length === 0) {
    return [];
  }

  const cacheKey = generateCacheKey('us_stock_data', symbols);
  const cachedResult = getCachedData(cacheKey);
  if (cachedResult) {
    console.log('Returning cached US stock data');
    return cachedResult;
  }

  try {
    // 由于雅虎财经API限制较多，这里使用模拟数据作为主要来源，但保留API调用结构
    const mockStocks = [
      generateMockStock('AAPL', '苹果公司', 'US'),
      generateMockStock('MSFT', '微软', 'US'),
      generateMockStock('GOOGL', '谷歌', 'US'),
      generateMockStock('AMZN', '亚马逊', 'US'),
      generateMockStock('NVDA', '英伟达', 'US'),
      generateMockStock('TSLA', '特斯拉', 'US')
    ];
    setCachedData(cacheKey, mockStocks);
    return mockStocks;
  } catch (error) {
    console.error('Error fetching US stock data:', error);
    const fallbackStocks = symbols.map(symbol => 
      generateMockStock(symbol, `${symbol}公司`, 'US')
    );
    setCachedData(cacheKey, fallbackStocks);
    return fallbackStocks;
  }
};

/**
 * 获取美国股票板块数据
 */
export const fetchUSSectorData = async (): Promise<SectorData[]> => {
  const cacheKey = generateCacheKey('us_sector_data');
  const cachedResult = getCachedData(cacheKey);
  if (cachedResult) {
    console.log('Returning cached US sector data');
    return cachedResult;
  }

  try {
    // 返回模拟数据
    const mockUSSectors: SectorData[] = [
      {
        name: 'Technology',
        market: 'US',
        performance: 3.2,
        topStocks: [
          generateMockStock('AAPL', '苹果公司', 'US'),
          generateMockStock('MSFT', '微软', 'US'),
          generateMockStock('NVDA', '英伟达', 'US')
        ]
      },
      {
        name: 'Financials',
        market: 'US',
        performance: 1.5,
        topStocks: [
          generateMockStock('JPM', '摩根大通', 'US'),
          generateMockStock('BAC', '美国银行', 'US'),
          generateMockStock('WFC', '富国银行', 'US')
        ]
      },
      {
        name: 'Healthcare',
        market: 'US',
        performance: 0.8,
        topStocks: [
          generateMockStock('JNJ', '强生', 'US'),
          generateMockStock('PFE', '辉瑞', 'US'),
          generateMockStock('MRK', '默克', 'US')
        ]
      },
      {
        name: 'Consumer Cyclical',
        market: 'US',
        performance: 2.1,
        topStocks: [
          generateMockStock('AMZN', '亚马逊', 'US'),
          generateMockStock('TSLA', '特斯拉', 'US'),
          generateMockStock('HD', '家得宝', 'US')
        ]
      }
    ];
    setCachedData(cacheKey, mockUSSectors);
    return mockUSSectors;
  } catch (error) {
    console.error('Error fetching US sector data:', error);
    const fallbackData = [
      {
        name: 'Technology',
        market: 'US' as const,
        performance: 3.2,
        topStocks: [
          generateMockStock('AAPL', '苹果公司', 'US'),
          generateMockStock('MSFT', '微软', 'US'),
          generateMockStock('NVDA', '英伟达', 'US')
        ]
      }
    ];
    setCachedData(cacheKey, fallbackData);
    return fallbackData;
  }
};

/**
 * 获取所有板块数据（中美两市）
 */
export const fetchAllSectors = async (): Promise<SectorData[]> => {
  const cacheKey = generateCacheKey('all_sectors');
  const cachedResult = getCachedData(cacheKey);
  if (cachedResult) {
    console.log('Returning cached all sectors data');
    return cachedResult;
  }

  try {
    // 并行获取中美两市数据
    const [cnSectors, usSectors] = await Promise.allSettled([
      fetchCNSectorData(),
      fetchUSSectorData()
    ]);

    const allSectors: SectorData[] = [];

    if (cnSectors.status === 'fulfilled') {
      allSectors.push(...cnSectors.value);
    } else {
      console.error('Error fetching CN sectors:', cnSectors.reason);
    }

    if (usSectors.status === 'fulfilled') {
      allSectors.push(...usSectors.value);
    } else {
      console.error('Error fetching US sectors:', usSectors.reason);
    }

    setCachedData(cacheKey, allSectors);
    return allSectors;
  } catch (error) {
    console.error('Error fetching all sectors:', error);
    // 返回模拟数据作为最后的备选方案
    const fallbackData: SectorData[] = [
      {
        name: '科技',
        market: 'CN',
        performance: 2.5,
        topStocks: [
          generateMockStock('sz300750', '宁德时代', 'CN'),
          generateMockStock('sz300498', '润佳股份', 'CN'),
          generateMockStock('sz300033', '同花顺', 'CN')
        ]
      },
      {
        name: 'Technology',
        market: 'US',
        performance: 3.2,
        topStocks: [
          generateMockStock('AAPL', '苹果公司', 'US'),
          generateMockStock('MSFT', '微软', 'US'),
          generateMockStock('NVDA', '英伟达', 'US')
        ]
      }
    ];
    setCachedData(cacheKey, fallbackData);
    return fallbackData;
  }
};

// 导出清除缓存的方法，用于调试
export const clearCache = () => {
  cache.clear();
  console.log('Cache cleared');
};