// src/components/Dashboard.tsx
import React, { useState, useEffect } from 'react';
import { Sector } from '../types/StockTypes';
import { generateMockSectors, updateStockData } from '../utils/stockDataGenerator';
import { fetchAllSectors } from '../services/stockApi';
import SectorCard from './SectorCard';
import MarketSelector from './MarketSelector';
import { Link } from 'react-router-dom';
import '../styles/Dashboard.css';

const Dashboard: React.FC = () => {
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [filteredSectors, setFilteredSectors] = useState<Sector[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [error, setError] = useState<string | null>(null);
  const [selectedMarket, setSelectedMarket] = useState<'ALL' | 'CN' | 'US'>('ALL');

  // 初始化数据
  useEffect(() => {
    const fetchData = async () => {
      try {
        const sectorsData = await fetchAllSectors(); // 获取中美两国市场数据
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
        
        setSectors(formattedSectors);
        setFilteredSectors(formattedSectors); // 初始时显示所有板块
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching sector data:', err);
        setError('获取数据失败，正在使用模拟数据...');
        // 即使出错也尝试加载回退数据
        const fallbackSectors = await generateMockSectors();
        setSectors(fallbackSectors);
        setFilteredSectors(fallbackSectors);
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

  // 当市场选择改变时过滤板块
  useEffect(() => {
    if (selectedMarket === 'ALL') {
      setFilteredSectors(sectors);
    } else {
      setFilteredSectors(sectors.filter(sector => sector.market === selectedMarket));
    }
  }, [selectedMarket, sectors]);

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
      
      <MarketSelector 
        selectedMarket={selectedMarket} 
        onSelectMarket={setSelectedMarket} 
      />
      
      <div className="sectors-container">
        {filteredSectors.map((sector, index) => (
          <Link 
            to={`/sectors/${encodeURIComponent(sector.name)}?market=${sector.market}`} 
            key={`${sector.name}-${sector.market}-${index}`} 
            className="sector-link"
          >
            <div className="sector-wrapper">
              <SectorCard sector={sector} />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;