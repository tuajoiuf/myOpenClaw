// src/components/Favorites.tsx
import React, { useState, useEffect } from 'react';
import { Stock } from '../types/StockTypes';
import { generateMockStock } from '../utils/stockDataGenerator';
import StockCard from './StockCard';
import '../styles/Favorites.css';

const Favorites: React.FC = () => {
  const [favorites, setFavorites] = useState<Stock[]>([]);

  useEffect(() => {
    // 初始化一些模拟的自选股票
    const mockFavorites = [
      generateMockStock('AAPL', '苹果公司'),
      generateMockStock('TSLA', '特斯拉'),
      generateMockStock('NVDA', '英伟达'),
      generateMockStock('MSFT', '微软')
    ];
    setFavorites(mockFavorites);
  }, []);

  const addToFavorites = (stock: Stock) => {
    if (!favorites.some(fav => fav.symbol === stock.symbol)) {
      setFavorites([...favorites, stock]);
    }
  };

  const removeFromFavorites = (symbol: string) => {
    setFavorites(favorites.filter(stock => stock.symbol !== symbol));
  };

  return (
    <div className="favorites-page">
      <div className="page-header">
        <h1>⭐ 自选股</h1>
        <p>您关注的股票列表</p>
      </div>

      {favorites.length === 0 ? (
        <div className="empty-favorites">
          <h3>暂无自选股票</h3>
          <p>您可以从板块详情页添加感兴趣的股票到自选列表</p>
        </div>
      ) : (
        <div className="favorites-grid">
          {favorites.map((stock, index) => (
            <div key={index} className="favorite-item">
              <StockCard stock={stock} />
              <button 
                className="remove-btn" 
                onClick={() => removeFromFavorites(stock.symbol)}
              >
                移除
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Favorites;