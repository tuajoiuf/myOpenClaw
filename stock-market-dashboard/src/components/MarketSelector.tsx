// src/components/MarketSelector.tsx
import React, { memo } from 'react';
import '../styles/MarketSelector.css';

interface MarketSelectorProps {
  selectedMarket: 'ALL' | 'CN' | 'US';
  onSelectMarket: (market: 'ALL' | 'CN' | 'US') => void;
}

const MarketSelector: React.FC<MarketSelectorProps> = memo(({ selectedMarket, onSelectMarket }) => {
  return (
    <div className="market-selector">
      <button 
        className={`market-btn ${selectedMarket === 'ALL' ? 'active' : ''}`}
        onClick={() => onSelectMarket('ALL')}
      >
        全部市场
      </button>
      <button 
        className={`market-btn ${selectedMarket === 'CN' ? 'active' : ''}`}
        onClick={() => onSelectMarket('CN')}
      >
        A股市场
      </button>
      <button 
        className={`market-btn ${selectedMarket === 'US' ? 'active' : ''}`}
        onClick={() => onSelectMarket('US')}
      >
        美股市场
      </button>
    </div>
  );
});

export default MarketSelector;