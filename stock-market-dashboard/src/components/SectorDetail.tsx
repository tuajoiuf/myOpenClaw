// src/components/SectorDetail.tsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { generateMockSectors } from '../utils/stockDataGenerator';
import { Sector } from '../types/StockTypes';
import StockCard from './StockCard';
import '../styles/SectorDetail.css';

const SectorDetail: React.FC = () => {
  const { sectorName } = useParams<{ sectorName: string }>();
  const [sector, setSector] = useState<Sector | undefined>(undefined);
  const [allSectors, setAllSectors] = useState<Sector[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const sectors = await generateMockSectors();
      setAllSectors(sectors);
      
      const foundSector = sectors.find(s => s.name === decodeURIComponent(sectorName || ''));
      setSector(foundSector);
    };

    fetchData();
  }, [sectorName]);

  if (!sector) {
    return <div className="loading">加载板块数据中...</div>;
  }

  return (
    <div className="sector-detail">
      <div className="sector-header">
        <h1>{sector.name} 板块详情</h1>
        <div className={`sector-performance ${sector.performance >= 0 ? 'positive' : 'negative'}`}>
          {sector.performance >= 0 ? '+' : ''}{sector.performance}%
        </div>
      </div>
      
      <div className="sector-stats">
        <div className="stat-card">
          <h3>板块成分股</h3>
          <p>{sector.topStocks.length} 只</p>
        </div>
        <div className="stat-card">
          <h3>平均涨幅</h3>
          <p>{sector.performance >= 0 ? '+' : ''}{sector.performance}%</p>
        </div>
        <div className="stat-card">
          <h3>龙头股</h3>
          <p>排名前三</p>
        </div>
      </div>
      
      <div className="top-stocks-section">
        <h2>龙头股排行</h2>
        <div className="stocks-grid">
          {sector.topStocks.map((stock, index) => (
            <StockCard key={index} stock={stock} />
          ))}
        </div>
      </div>
      
      <div className="all-stocks-section">
        <h2>全部成分股</h2>
        <div className="all-stocks-grid">
          {allSectors
            .find(s => s.name === decodeURIComponent(sectorName || ''))?.topStocks
            .map((stock, index) => (
              <div key={index} className="mini-stock-card">
                <span className="symbol">{stock.symbol}</span>
                <span className="price">${stock.price.toFixed(2)}</span>
                <span className={`change ${stock.change >= 0 ? 'positive' : 'negative'}`}>
                  {stock.change >= 0 ? '+' : ''}{stock.changePercent}%
                </span>
              </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SectorDetail;