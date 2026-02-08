// src/components/Layout.tsx
import React, { useState, useEffect, ReactNode } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import '../styles/Layout.css';

interface LayoutProps {
  children?: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  
  // 监听滚动事件以添加滚动效果
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // 获取当前市场参数
  const currentMarket = new URLSearchParams(location.search).get('market') || 'CN';
  
  // 切换市场函数
  const switchMarket = (market: 'CN' | 'US') => {
    const params = new URLSearchParams(location.search);
    params.set('market', market);
    
    // 更新当前路径并保留市场参数
    let newPath = location.pathname;
    if (location.pathname === '/' || location.pathname.startsWith('/sectors') || location.pathname === '/favorites') {
      newPath = `${location.pathname}?${params.toString()}`;
    }
    
    navigate(newPath, { replace: true });
  };

  return (
    <div className="layout">
      <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="nav-brand">
          <Link to="/">📈 股票板块行情</Link>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          {/* 市场切换按钮 */}
          <div className="market-switcher" style={{ display: 'flex', gap: '5px' }}>
            <button 
              onClick={() => switchMarket('CN')}
              className={`market-btn ${currentMarket === 'CN' ? 'active' : ''}`}
              style={{
                backgroundColor: currentMarket === 'CN' ? 'rgba(37, 99, 235, 0.2)' : 'rgba(31, 41, 55, 0.5)',
                color: currentMarket === 'CN' ? '#e2e8f0' : '#94a3b8',
                border: '1px solid rgba(79, 70, 229, 0.3)',
                borderRadius: '8px',
                padding: '8px 16px',
                fontSize: '0.9em',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                fontFamily: "'Inter', sans-serif"
              }}
            >
              A股
            </button>
            <button 
              onClick={() => switchMarket('US')}
              className={`market-btn ${currentMarket === 'US' ? 'active' : ''}`}
              style={{
                backgroundColor: currentMarket === 'US' ? 'rgba(37, 99, 235, 0.2)' : 'rgba(31, 41, 55, 0.5)',
                color: currentMarket === 'US' ? '#e2e8f0' : '#94a3b8',
                border: '1px solid rgba(79, 70, 229, 0.3)',
                borderRadius: '8px',
                padding: '8px 16px',
                fontSize: '0.9em',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                fontFamily: "'Inter', sans-serif"
              }}
            >
              美股
            </button>
          </div>
          
          <div className="nav-links-container">
          <ul className="nav-links">
            <li><Link to={`/?market=${currentMarket}`}>首页</Link></li>
            <li><Link to={`/sectors?market=${currentMarket}`}>板块详情</Link></li>
            <li><Link to={`/favorites?market=${currentMarket}`}>自选股票</Link></li>
          </ul>
        </div>
        </div>
      </nav>
      
      <main className="main-content">
        {children || <Outlet />}
      </main>
      
      <footer className="footer">
        <p>实时股票行情看板 © {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
};

export default Layout;