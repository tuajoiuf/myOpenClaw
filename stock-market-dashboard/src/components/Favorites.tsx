// src/components/Favorites.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { Stock } from '../types/StockTypes';
import { generateMockStock } from '../utils/stockDataGenerator';
import StockCard from './StockCard';
import '../styles/Favorites.css';

const Favorites: React.FC = () => {
  const [favorites, setFavorites] = useState<Stock[]>([]);

  useEffect(() => {
    // 从localStorage加载自选股票
    const savedFavorites = localStorage.getItem('stock-favorites');
    if (savedFavorites) {
      try {
        setFavorites(JSON.parse(savedFavorites));
      } catch (e) {
        // 如果解析失败，使用默认值
        const mockFavorites = [
          generateMockStock('AAPL', '苹果公司', 'US'),
          generateMockStock('TSLA', '特斯拉', 'US'),
          generateMockStock('NVDA', '英伟达', 'US'),
          generateMockStock('000001', '平安银行', 'CN'),
          generateMockStock('600519', '贵州茅台', 'CN')
        ];
        setFavorites(mockFavorites);
      }
    } else {
      // 初始化一些模拟的自选股票
      const mockFavorites = [
        generateMockStock('AAPL', '苹果公司', 'US'),
        generateMockStock('TSLA', '特斯拉', 'US'),
        generateMockStock('NVDA', '英伟达', 'US'),
        generateMockStock('000001', '平安银行', 'CN'),
        generateMockStock('600519', '贵州茅台', 'CN')
      ];
      setFavorites(mockFavorites);
      localStorage.setItem('stock-favorites', JSON.stringify(mockFavorites));
    }
  }, []);

  const addToFavorites = useCallback((stock: Stock) => {
    setFavorites(prevFavorites => {
      if (!prevFavorites.some(fav => fav.symbol === stock.symbol)) {
        const newFavorites = [...prevFavorites, stock];
        localStorage.setItem('stock-favorites', JSON.stringify(newFavorites));
        return newFavorites;
      }
      return prevFavorites;
    });
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
    <div className="favorites-page">
      <div className="container">
        <div className="page-header">
          <h1>⭐ 自选股</h1>
          <p>您关注的股票列表</p>
        </div>

        {favorites.length > 0 && (
          <div style={{ textAlign: 'right', marginBottom: '20px' }}>
            <button 
              className="btn btn-secondary" 
              onClick={clearAllFavorites}
              style={{ padding: '8px 16px', fontSize: '0.9rem' }}
            >
              清空全部
            </button>
          </div>
        )}

        {favorites.length === 0 ? (
          <div className="empty-favorites">
            <h3>暂无自选股票</h3>
            <p>您可以从板块详情页添加感兴趣的股票到自选列表</p>
          </div>
        ) : (
          <div className="favorites-grid">
            {favorites.map((stock, index) => (
              <div key={`${stock.symbol}-${index}`} className="favorite-item">
                <StockCard stock={stock} />
                <button 
                  className="remove-btn" 
                  onClick={() => removeFromFavorites(stock.symbol)}
                  title="从自选中移除"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(Favorites);