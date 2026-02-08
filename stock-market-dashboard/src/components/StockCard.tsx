// src/components/StockCard.tsx
import React, { memo } from 'react';
import { Stock } from '../types/StockTypes';
import '../styles/StockCard.css';

interface StockCardProps {
  stock: Stock;
}

const StockCard: React.FC<StockCardProps> = memo(({ stock }) => {
  const isPositive = stock.change >= 0;
  
  return (
    <div className={`stock-card ${isPositive ? 'positive' : 'negative'}`}>
      <div className="stock-header">
        <h3 className="stock-symbol">{stock.symbol}</h3>
        <p className="stock-name">{stock.chineseName || stock.name}</p>
        <div className={`market-tag ${stock.market.toLowerCase()}`}>
          {stock.market === 'CN' ? 'A股' : '美股'}
        </div>
      </div>
      
      <div className="stock-price-info">
        <div className="price">${stock.price.toFixed(2)}</div>
        <div className={`change ${isPositive ? 'positive' : 'negative'}`}>
          {isPositive ? '+' : ''}{stock.change.toFixed(2)} ({isPositive ? '+' : ''}{stock.changePercent}%)
        </div>
      </div>
      
      <div className="stock-details">
        <div className="volume">成交量: {(stock.volume / 1000000).toFixed(2)}M</div>
        {stock.marketCap && <div className="market-cap">市值: ${stock.marketCap}B</div>}
        {stock.peRatio && <div className="pe-ratio">P/E: {stock.peRatio}</div>}
      </div>
    </div>
  );
});

export default StockCard;