// src/components/Dashboard.tsx
import React, { useState, useEffect } from 'react';
import { Sector } from '../types/StockTypes';
import { generateMockSectors, updateStockData } from '../utils/stockDataGenerator';
import SectorCard from './SectorCard';
import '../styles/Dashboard.css';

const Dashboard: React.FC = () => {
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // 初始化数据
  useEffect(() => {
    setSectors(generateMockSectors());
    setIsLoading(false);

    // 设置定时器模拟实时数据更新
    const interval = setInterval(() => {
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
    }, 5000); // 每5秒更新一次

    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return <div className="loading">加载市场数据中...</div>;
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>股票板块行情实时看板</h1>
        <div className="last-updated">
          最后更新: {lastUpdated.toLocaleTimeString()}
          <span className="refresh-indicator">🔄</span>
        </div>
      </header>
      
      <div className="sectors-container">
        {sectors.map((sector, index) => (
          <SectorCard key={index} sector={sector} />
        ))}
      </div>
    </div>
  );
};

export default Dashboard;