// src/components/SectorDetail.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { generateMockSectors } from '../utils/stockDataGenerator';
import { fetchAllSectors } from '../services/stockApi';
import { Sector } from '../types/StockTypes';
import StockCard from './StockCard';
import '../styles/SectorDetail.css';

const SectorDetail: React.FC = () => {
  const { sectorName } = useParams<{ sectorName: string }>();
  const [searchParams] = useSearchParams();
  const [sector, setSector] = useState<Sector | undefined>(undefined);
  const [allSectors, setAllSectors] = useState<Sector[]>([]);
  
  // 从URL参数获取市场类型，默认为CN
  const marketFromUrl = searchParams.get('market') as 'CN' | 'US' || 'CN';

  const fetchData = useCallback(async () => {
    const sectorsData = await fetchAllSectors();
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
    
    setAllSectors(formattedSectors);
    
    // 查找匹配名称和市场的板块
    const foundSector = formattedSectors.find(s => 
      s.name === decodeURIComponent(sectorName || '') && 
      s.market === marketFromUrl
    );
    setSector(foundSector);
  }, [sectorName, marketFromUrl]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (!sector) {
    return <div className="loading">加载板块数据中...</div>;
  }

  return (
    <div className="sector-detail">
      <div className="sector-header">
        <h1>{sector.name} 板块详情 <span className={`market-tag ${sector.market.toLowerCase()}`}>
          {sector.market === 'CN' ? 'A股' : '美股'}
        </span></h1>
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
            .find(s => s.name === decodeURIComponent(sectorName || '') && s.market === marketFromUrl)?.topStocks
            .map((stock, index) => (
              <div key={index} className="mini-stock-card">
                <span className="symbol">{stock.chineseName || stock.name || stock.symbol}</span>
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

export default React.memo(SectorDetail);