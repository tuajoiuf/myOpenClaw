// src/components/Dashboard.tsx
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Sector } from '../types/StockTypes';
import { generateMockSectors, updateStockData } from '../utils/stockDataGenerator';
import { fetchAllSectors, clearCache } from '../services/stockApi';
import SectorCard from './SectorCard';
import MarketSelector from './MarketSelector';
import { Link } from 'react-router-dom';
import '../styles/Dashboard.css';

const Dashboard: React.FC = () => {
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [error, setError] = useState<string | null>(null);
  const [selectedMarket, setSelectedMarket] = useState<'ALL' | 'CN' | 'US'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'performance' | 'name'>('performance');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // 使用useCallback优化数据获取函数
  const fetchData = useCallback(async (showLoading = true) => {
    if (showLoading) {
      setIsLoading(true);
    }
    setError(null);

    try {
      const sectorsData = await fetchAllSectors(); // 获取中美两国市场数据
      // 转换数据格式
      const formattedSectors = sectorsData.map(apiSector => {
        // 按涨跌幅排序，取前3只股票
        const sortedStocks = [...apiSector.stocks]
          .sort((a, b) => b.changePercent - a.changePercent)
          .slice(0, 3)
          .map(stock => ({
            symbol: stock.symbol,
            name: stock.name,
            chineseName: stock.chineseName,
            market: stock.market,
            price: stock.price,
            change: stock.change,
            changePercent: stock.changePercent,
            volume: stock.volume,
            marketCap: stock.marketCap,
            peRatio: stock.peRatio
          }));
        
        // 计算板块整体表现（前3只股票的平均涨跌幅）
        const avgChange = sortedStocks.reduce((sum, stock) => sum + stock.changePercent, 0) / sortedStocks.length;
        
        return {
          name: apiSector.name,
          market: apiSector.market,
          performance: parseFloat(avgChange.toFixed(2)),
          topStocks: sortedStocks
        };
      });
      
      setSectors(formattedSectors);
    } catch (err) {
      console.error('Error fetching sector data:', err);
      setError('获取数据失败，正在使用模拟数据...');
      // 即使出错也尝试加载回退数据
      const fallbackSectors = await generateMockSectors();
      setSectors(fallbackSectors);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // 使用useCallback优化实时更新逻辑
  const updateSectors = useCallback(() => {
    setSectors(prevSectors => {
      return prevSectors.map(sector => {
        // 更新板块内股票的数据
        const updatedTopStocks = sector.topStocks.map(stock => updateStockData(stock));
        
        // 重新计算板块表现
        const avgChange = updatedTopStocks.reduce((sum, stock) => sum + stock.changePercent, 0) / updatedTopStocks.length;
        
        return {
          ...sector,
          performance: parseFloat(avgChange.toFixed(2)),
          topStocks: updatedTopStocks
            .sort((a, b) => b.changePercent - a.changePercent)
            .slice(0, 3) // 保持前3只股票
        };
      });
    });
    
    setLastUpdated(new Date());
  }, []);

  // 初始化数据
  useEffect(() => {
    fetchData();

    // 设置定时器模拟实时数据更新（降低频率以减少API压力）
    intervalRef.current = setInterval(updateSectors, 10000); // 每10秒更新一次

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchData, updateSectors]);

  // 使用useMemo优化过滤和排序逻辑
  const processedSectors = useMemo(() => {
    let result = sectors;

    // 按市场过滤
    if (selectedMarket !== 'ALL') {
      result = result.filter(sector => sector.market === selectedMarket);
    }

    // 按搜索词过滤
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(sector => 
        sector.name.toLowerCase().includes(term) ||
        sector.topStocks.some(stock => 
          stock.name.toLowerCase().includes(term) || 
          stock.chineseName?.toLowerCase().includes(term) ||
          stock.symbol.toLowerCase().includes(term)
        )
      );
    }

    // 按排序方式排序
    result = [...result].sort((a, b) => {
      let comparison = 0;
      
      if (sortBy === 'performance') {
        comparison = a.performance - b.performance;
      } else if (sortBy === 'name') {
        comparison = a.name.localeCompare(b.name);
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [sectors, selectedMarket, searchTerm, sortBy, sortOrder]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    // 清除缓存以获取最新数据
    clearCache();
    await fetchData(false);
    intervalRef.current = setInterval(updateSectors, 10000);
  };

  // 添加重新尝试获取数据的功能
  const handleRetry = async () => {
    setError(null);
    await fetchData();
  };

  if (isLoading && sectors.length === 0) {
    return (
      <div className="dashboard">
        <div className="container">
          <div className="loading">
            <div className="spinner"></div>
            <span>加载市场数据中...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error && sectors.length === 0) {
    return (
      <div className="dashboard">
        <div className="container">
          <div className="error card" style={{ padding: '40px', textAlign: 'center' }}>
            <h3>⚠️ 数据获取出现问题</h3>
            <p style={{ margin: '15px 0', color: '#f56565' }}>{error}</p>
            <div style={{ marginTop: '20px' }}>
              <button className="btn btn-primary" onClick={handleRetry} style={{ marginRight: '10px' }}>
                重试连接
              </button>
              <button className="btn btn-secondary" onClick={() => clearCache()}>
                清除缓存
              </button>
            </div>
            <p style={{ marginTop: '20px', fontSize: '0.9rem', color: '#a0aec0' }}>
              正在使用模拟数据以保证应用正常运行
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="container">
        <header className="dashboard-header">
          <h1>股票板块行情实时看板</h1>
          <div className="last-updated">
            最后更新: {lastUpdated.toLocaleTimeString()}
            <span className="refresh-indicator">🔄</span>
          </div>
        </header>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '30px' }}>
          <MarketSelector 
            selectedMarket={selectedMarket} 
            onSelectMarket={setSelectedMarket} 
          />
          
          <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <input
              type="text"
              placeholder="搜索板块或股票..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                padding: '12px 20px',
                borderRadius: '50px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                background: 'rgba(255, 255, 255, 0.05)',
                color: 'white',
                fontSize: '1rem',
                minWidth: '250px',
                maxWidth: '400px'
              }}
            />
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'performance' | 'name')}
              style={{
                padding: '12px 20px',
                borderRadius: '50px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                background: 'rgba(255, 255, 255, 0.05)',
                color: 'white',
                fontSize: '1rem'
              }}
            >
              <option value="performance">按涨幅排序</option>
              <option value="name">按名称排序</option>
            </select>
            
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
              style={{
                padding: '12px 20px',
                borderRadius: '50px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                background: 'rgba(255, 255, 255, 0.05)',
                color: 'white',
                fontSize: '1rem'
              }}
            >
              <option value="desc">降序</option>
              <option value="asc">升序</option>
            </select>
            
            <button 
              className="btn btn-secondary" 
              onClick={handleRefresh}
              title="手动刷新数据"
              disabled={isRefreshing}
            >
              {isRefreshing ? '🔄 刷新中...' : '🔄 刷新'}
            </button>
          </div>
        </div>
        
        <div className="sectors-container">
          {processedSectors.map((sector, index) => (
            <Link 
              to={`/sectors/${encodeURIComponent(sector.name)}?market=${sector.market}`} 
              key={`${sector.name}-${sector.market}-${index}`} 
              className="sector-link"
            >
              <div className="sector-wrapper">
                <SectorCard sector={sector} />
              </div>
            </Link>
          ))}
        </div>
        
        {processedSectors.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px', color: '#a0aec0' }}>
            <h3>未找到匹配的板块</h3>
            <p>请尝试调整搜索条件或选择不同的市场</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(Dashboard);