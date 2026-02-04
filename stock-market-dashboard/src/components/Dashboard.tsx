// src/components/Dashboard.tsx
import React, { useState, useEffect } from 'react';
import { Sector } from '../types/StockTypes';
import { generateMockSectors, updateStockData } from '../utils/stockDataGenerator';
import SectorCard from './SectorCard';
import { Link } from 'react-router-dom';
import '../styles/Dashboard.css';

const Dashboard: React.FC = () => {
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [error, setError] = useState<string | null>(null);

  // 初始化数据
  useEffect(() => {
    const fetchData = async () => {
      try {
        const sectorsData = await generateMockSectors(); // 这个函数现在会从API获取真实数据
        setSectors(sectorsData);
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching sector data:', err);
        setError('获取数据失败，正在使用模拟数据...');
        // 即使出错也尝试加载回退数据
        const fallbackSectors = await generateMockSectors();
        setSectors(fallbackSectors);
        setIsLoading(false);
      }
    };

    fetchData();

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

  if (error) {
    return <div className="error">错误: {error}</div>;
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
          <Link to={`/sectors/${encodeURIComponent(sector.name)}`} key={index} className="sector-link">
            <SectorCard key={index} sector={sector} />
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;