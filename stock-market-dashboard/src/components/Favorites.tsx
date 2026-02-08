// src/components/Favorites.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { Stock } from '../types/StockTypes';
import { generateMockStock } from '../utils/stockDataGenerator';
import StockCard from './StockCard';
import '../styles/LuxuryTheme.css';

const Favorites: React.FC = () => {
  const [favorites, setFavorites] = useState<Stock[]>([]);

  useEffect(() => {
    const savedFavorites = localStorage.getItem('stock-favorites');
    if (savedFavorites) {
      try {
        setFavorites(JSON.parse(savedFavorites));
      } catch (e) {
        const mockFavorites = [
          generateMockStock('AAPL', '苹果公司', 'US'),
          generateMockStock('MSFT', '微软', 'US'),
          generateMockStock('NVDA', '英伟达', 'US'),
          generateMockStock('000001', '平安银行', 'CN'),
          generateMockStock('600519', '贵州茅台', 'CN')
        ];
        setFavorites(mockFavorites);
        localStorage.setItem('stock-favorites', JSON.stringify(mockFavorites));
      }
    } else {
      const mockFavorites = [
        generateMockStock('AAPL', '苹果公司', 'US'),
        generateMockStock('MSFT', '微软', 'US'),
        generateMockStock('NVDA', '英伟达', 'US'),
        generateMockStock('000001', '平安银行', 'CN'),
        generateMockStock('600519', '贵州茅台', 'CN')
      ];
      setFavorites(mockFavorites);
      localStorage.setItem('stock-favorites', JSON.stringify(mockFavorites));
    }
  }, []);

  const removeFromFavorites = useCallback((symbol: string) => {
    setFavorites(prevFavorites => {
      const newFavorites = prevFavorites.filter(stock => stock.symbol !== symbol);
      localStorage.setItem('stock-favorites', JSON.stringify(newFavorites));
      return newFavorites;
    });
  }, []);

  const clearAllFavorites = useCallback(() => {
    setFavorites([]);
    localStorage.removeItem('stock-favorites');
  }, []);

  return (
    <div className="favorites-page" style={{ 
      minHeight: '100vh',
      background: 'var(--color-dark-gradient)',
      padding: '60px 0 40px'
    }}>
      <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
        
        {/* 标题 */}
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
            ⭐ 自选股票
          </h1>
          <p style={{ color: 'var(--color-text-secondary)' }}>
            您关注的股票列表
          </p>
        </header>
        
        {/* 控制按钮 */}
        {favorites.length > 0 && (
          <div style={{ textAlign: 'right', marginBottom: '32px' }}>
            <button 
              className="luxury-btn"
              onClick={clearAllFavorites}
              style={{ 
                padding: '12px 24px',
                fontSize: '0.9rem',
                background: 'rgba(239, 68, 68, 0.1)',
                color: 'var(--color-danger)',
                border: '1px solid rgba(239, 68, 68, 0.3)'
              }}
            >
              清空全部
            </button>
          </div>
        )}
        
        {/* 股票网格 */}
        {favorites.length === 0 ? (
          <div className="luxury-card" style={{ textAlign: 'center', padding: '80px 40px' }}>
            <div style={{ fontSize: '64px', marginBottom: '24px' }}>⭐</div>
            <h3 style={{ 
              fontFamily: 'var(--font-display)',
              fontSize: '1.5rem',
              marginBottom: '12px'
            }}>暂无自选股票</h3>
            <p style={{ color: 'var(--color-text-secondary)' }}>
              您可以从板块详情页添加感兴趣的股票到自选列表
            </p>
          </div>
        ) : (
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
            gap: '24px'
          }}>
            {favorites.map((stock, index) => (
              <div 
                key={`${stock.symbol}-${index}`}
                className="luxury-card animate-fadeInUp"
                style={{ animationDelay: `${0.1 + index * 0.05}s` }}
              >
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '20px'
                }}>
                  <div>
                    <h3 style={{ 
                      fontSize: '1.3rem', 
                      fontWeight: '600',
                      fontFamily: 'var(--font-display)',
                      margin: 0
                    }}>
                      {stock.chineseName || stock.name}
                    </h3>
                    <p style={{ 
                      color: 'var(--color-text-muted)',
                      marginTop: '4px'
                    }}>
                      {stock.symbol}
                    </p>
                  </div>
                  <button 
                    onClick={() => removeFromFavorites(stock.symbol)}
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      background: 'rgba(239, 68, 68, 0.1)',
                      color: 'var(--color-danger)',
                      cursor: 'pointer',
                      fontSize: '1.2rem',
                      transition: 'var(--transition-fast)'
                    }}
                  >
                    ×
                  </button>
                </div>
                
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'flex-end'
                }}>
                  <div>
                    <div className="luxury-price">${stock.price.toFixed(2)}</div>
                    <div style={{ 
                      marginTop: '8px',
                      fontSize: '1rem',
                      fontWeight: '500',
                      color: stock.changePercent >= 0 ? 'var(--color-success)' : 'var(--color-danger)'
                    }}>
                      {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent}%
                    </div>
                  </div>
                  <span className={`luxury-badge ${stock.market === 'CN' ? '' : 'gold'}`}>
                    {stock.market === 'CN' ? '🇨🇳 A股' : '🇺🇸 美股'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(Favorites);