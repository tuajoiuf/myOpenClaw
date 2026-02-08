// src/components/Dashboard.tsx
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Sector } from '../types/StockTypes';
import { generateMockSectors, updateStockData } from '../utils/stockDataGenerator';
import { fetchAllSectors, clearCache } from '../services/stockApi';
import SectorCard from './SectorCard';
import MarketSelector from './MarketSelector';
import { Link } from 'react-router-dom';
import '../styles/LuxuryTheme.css';

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

  // 数据获取函数
  const fetchData = useCallback(async (showLoading = true) => {
    if (showLoading) {
      setIsLoading(true);
    }
    setError(null);

    try {
      const sectorsData = await fetchAllSectors();
      const formattedSectors = sectorsData.map(apiSector => {
        const sortedStocks = [...apiSector.topStocks]
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
      const fallbackSectors = await generateMockSectors();
      setSectors(fallbackSectors);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // 实时更新函数
  const updateSectors = useCallback(() => {
    setSectors(prevSectors => {
      return prevSectors.map(sector => {
        const updatedTopStocks = sector.topStocks.map(stock => updateStockData(stock));
        const avgChange = updatedTopStocks.reduce((sum, stock) => sum + stock.changePercent, 0) / updatedTopStocks.length;
        
        return {
          ...sector,
          performance: parseFloat(avgChange.toFixed(2)),
          topStocks: updatedTopStocks
            .sort((a, b) => b.changePercent - a.changePercent)
            .slice(0, 3)
        };
      });
    });
    
    setLastUpdated(new Date());
  }, []);

  // 初始化数据
  useEffect(() => {
    fetchData();

    intervalRef.current = setInterval(updateSectors, 10000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchData, updateSectors]);

  // 过滤和排序
  const processedSectors = useMemo(() => {
    let result = sectors;

    if (selectedMarket !== 'ALL') {
      result = result.filter(sector => sector.market === selectedMarket);
    }

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
    clearCache();
    await fetchData(false);
    intervalRef.current = setInterval(updateSectors, 10000);
  };

  const handleRetry = async () => {
    setError(null);
    await fetchData();
  };

  // 加载状态
  if (isLoading && sectors.length === 0) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'var(--color-dark-gradient)'
      }}>
        <div className="luxury-card" style={{ textAlign: 'center', padding: '60px' }}>
          <div className="animate-shimmer" style={{ 
            width: '60px', 
            height: '60px', 
            borderRadius: '50%', 
            background: 'var(--color-gold-gradient)',
            margin: '0 auto 24px'
          }}></div>
          <p style={{ color: 'var(--color-text-secondary)' }}>加载市场数据中...</p>
        </div>
      </div>
    );
  }

  // 错误状态
  if (error && sectors.length === 0) {
    return (
      <div className="container" style={{ padding: '120px 20px 40px' }}>
        <div className="luxury-card" style={{ textAlign: 'center', padding: '60px' }}>
          <div style={{ fontSize: '48px', marginBottom: '24px' }}>⚠️</div>
          <h3 style={{ 
            fontFamily: 'var(--font-display)', 
            fontSize: '1.5rem',
            marginBottom: '16px'
          }}>数据获取出现问题</h3>
          <p style={{ color: 'var(--color-danger)', marginBottom: '24px' }}>{error}</p>
          <button className="luxury-btn" onClick={handleRetry}>
            重试连接
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard" style={{ 
      minHeight: '100vh',
      background: 'var(--color-dark-gradient)',
      padding: '40px 0'
    }}>
      <div className="container" style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 24px' }}>
        
        {/* 标题区域 */}
        <header style={{ 
          textAlign: 'center', 
          marginBottom: '48px',
          animation: 'fadeInUp 0.6s ease-out'
        }}>
          <h1 className="luxury-title" style={{ 
            fontSize: '2.5rem',
            marginBottom: '12px',
            fontFamily: 'var(--font-display)'
          }}>
            股票板块行情实时看板
          </h1>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            gap: '12px',
            color: 'var(--color-text-secondary)'
          }}>
            <span>最后更新: {lastUpdated.toLocaleTimeString()}</span>
            <span className="animate-pulseGold" style={{ 
              display: 'inline-block',
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: 'var(--color-success)'
            }}></span>
          </div>
        </header>
        
        {/* 控制区域 */}
        <div className="luxury-card" style={{ 
          marginBottom: '48px',
          animation: 'fadeInUp 0.6s ease-out 0.1s both'
        }}>
          <div style={{ 
            display: 'flex', 
            flexWrap: 'wrap',
            gap: '20px', 
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            
            {/* 搜索框 */}
            <div style={{ position: 'relative', flex: '1', maxWidth: '400px', minWidth: '250px' }}>
              <input
                type="text"
                placeholder="搜索板块或股票..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '16px 24px 16px 48px',
                  borderRadius: '16px',
                  border: '1px solid rgba(201, 162, 39, 0.2)',
                  background: 'rgba(255, 255, 255, 0.03)',
                  color: 'white',
                  fontSize: '1rem',
                  outline: 'none',
                  transition: 'var(--transition-smooth)'
                }}
              />
              <span style={{ 
                position: 'absolute', 
                left: '16px', 
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--color-text-muted)'
              }}>🔍</span>
            </div>
            
            {/* 排序选择 */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'performance' | 'name')}
              style={{
                padding: '16px 24px',
                borderRadius: '16px',
                border: '1px solid rgba(201, 162, 39, 0.2)',
                background: 'rgba(255, 255, 255, 0.03)',
                color: 'white',
                fontSize: '1rem',
                cursor: 'pointer',
                outline: 'none'
              }}
            >
              <option value="performance" style={{ background: 'var(--color-primary)' }}>按涨幅排序</option>
              <option value="name" style={{ background: 'var(--color-primary)' }}>按名称排序</option>
            </select>
            
            {/* 排序方向 */}
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
              style={{
                padding: '16px 24px',
                borderRadius: '16px',
                border: '1px solid rgba(201, 162, 39, 0.2)',
                background: 'rgba(255, 255, 255, 0.03)',
                color: 'white',
                fontSize: '1rem',
                cursor: 'pointer',
                outline: 'none'
              }}
            >
              <option value="desc" style={{ background: 'var(--color-primary)' }}>⬇️ 降序</option>
              <option value="asc" style={{ background: 'var(--color-primary)' }}>⬆️ 升序</option>
            </select>
            
            {/* 市场选择 */}
            <div className="market-switcher">
              <button 
                className={`market-btn ${selectedMarket === 'ALL' ? 'active' : ''}`}
                onClick={() => setSelectedMarket('ALL')}
              >
                🌏 全部
              </button>
              <button 
                className={`market-btn ${selectedMarket === 'CN' ? 'active' : ''}`}
                onClick={() => setSelectedMarket('CN')}
              >
                🇨🇳 A股
              </button>
              <button 
                className={`market-btn ${selectedMarket === 'US' ? 'active' : ''}`}
                onClick={() => setSelectedMarket('US')}
              >
                🇺🇸 美股
              </button>
            </div>
            
            {/* 刷新按钮 */}
            <button 
              className="luxury-btn"
              onClick={handleRefresh}
              disabled={isRefreshing}
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              {isRefreshing ? '🔄 刷新中...' : '🔄 刷新'}
            </button>
          </div>
        </div>
        
        {/* 板块卡片网格 */}
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
          gap: '32px'
        }}>
          {processedSectors.map((sector, index) => (
            <Link 
              to={`/sectors/${encodeURIComponent(sector.name)}?market=${sector.market}`} 
              key={`${sector.name}-${sector.market}-${index}`}
              style={{ textDecoration: 'none' }}
            >
              <div 
                className="luxury-card animate-fadeInUp"
                style={{ 
                  animationDelay: `${0.15 + index * 0.05}s`,
                  cursor: 'pointer'
                }}
              >
                {/* 板块标题 */}
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  marginBottom: '24px',
                  paddingBottom: '16px',
                  borderBottom: '1px solid rgba(201, 162, 39, 0.1)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <h2 style={{ 
                      fontFamily: 'var(--font-display)',
                      fontSize: '1.4rem',
                      fontWeight: '600',
                      color: 'var(--color-text-primary)',
                      margin: 0
                    }}>
                      {sector.name}
                    </h2>
                    <span className={`luxury-badge ${sector.market === 'CN' ? '' : 'gold'}`}>
                      {sector.market === 'CN' ? '🇨🇳 A股' : '🇺🇸 美股'}
                    </span>
                  </div>
                  <div style={{ 
                    fontSize: '1.5rem',
                    fontWeight: '700',
                    fontFamily: 'var(--font-display)',
                    color: sector.performance >= 0 ? 'var(--color-success)' : 'var(--color-danger)'
                  }}>
                    {sector.performance >= 0 ? '+' : ''}{sector.performance}%
                  </div>
                </div>
                
                {/* 股票列表 */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {sector.topStocks.map((stock, stockIndex) => (
                    <div 
                      key={stockIndex}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '16px',
                        background: 'rgba(255, 255, 255, 0.02)',
                        borderRadius: '12px',
                        transition: 'var(--transition-fast)'
                      }}
                    >
                      <div>
                        <div style={{ 
                          fontWeight: '600', 
                          fontSize: '1.1rem',
                          color: 'var(--color-text-primary)'
                        }}>
                          {stock.chineseName || stock.name}
                        </div>
                        <div style={{ 
                          fontSize: '0.85rem', 
                          color: 'var(--color-text-muted)',
                          marginTop: '4px'
                        }}>
                          {stock.symbol}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ 
                          fontSize: '1.2rem', 
                          fontWeight: '600',
                          fontFamily: 'var(--font-display)'
                        }}>
                          ${stock.price.toFixed(2)}
                        </div>
                        <div style={{ 
                          fontSize: '0.9rem', 
                          fontWeight: '500',
                          color: stock.changePercent >= 0 ? 'var(--color-success)' : 'var(--color-danger)',
                          marginTop: '4px'
                        }}>
                          {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>
        
        {/* 空状态 */}
        {processedSectors.length === 0 && (
          <div className="luxury-card" style={{ textAlign: 'center', padding: '60px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
            <h3 style={{ 
              fontFamily: 'var(--font-display)',
              marginBottom: '12px'
            }}>未找到匹配的板块</h3>
            <p style={{ color: 'var(--color-text-secondary)' }}>
              请尝试调整搜索条件或选择不同的市场
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(Dashboard);