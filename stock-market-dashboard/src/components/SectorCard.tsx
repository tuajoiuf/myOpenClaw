// src/components/SectorCard.tsx
import React from 'react';
import { Sector } from '../types/StockTypes';
import StockCard from './StockCard';
import '../styles/SectorCard.css';

interface SectorCardProps {
  sector: Sector;
}

const SectorCard: React.FC<SectorCardProps> = ({ sector }) => {
  const isPositive = sector.performance >= 0;
  
  return (
    <div className="sector-card">
      <div className="sector-header">
        <h2 className="sector-name">{sector.name}</h2>
        <div className={`sector-performance ${isPositive ? 'positive' : 'negative'}`}>
          {isPositive ? '+' : ''}{sector.performance}%
        </div>
        <div className={`market-tag ${sector.market.toLowerCase()}`}>
          {sector.market === 'CN' ? 'A股' : '美股'}
        </div>
      </div>
      
      <div className="top-stocks">
        <h3>板块龙头股</h3>
        <div className="stocks-grid">
          {sector.topStocks.map((stock, index) => (
            <StockCard key={index} stock={stock} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default SectorCard;