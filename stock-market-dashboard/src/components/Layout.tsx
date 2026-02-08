// src/components/Layout.tsx
import React, { useState, useEffect, useCallback, ReactNode } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import '../styles/LuxuryTheme.css';

interface LayoutProps {
  children?: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('dashboard');
  const location = useLocation();
  const navigate = useNavigate();
  
  // 监听滚动事件
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // 根据URL更新活动状态
  useEffect(() => {
    const path = location.pathname;
    if (path === '/' || path === '/sectors') {
      setActiveSection('dashboard');
    } else if (path.includes('/sectors/')) {
      setActiveSection('sectors');
    } else if (path === '/favorites') {
      setActiveSection('favorites');
    }
  }, [location.pathname]);
  
  // 获取当前市场参数
  const currentMarket = new URLSearchParams(location.search).get('market') || 'CN';
  
  // 切换市场函数
  const switchMarket = useCallback((market: 'CN' | 'US') => {
    const params = new URLSearchParams(location.search);
    params.set('market', market);
    
    let newPath = location.pathname;
    if (location.pathname === '/' || location.pathname.startsWith('/sectors') || location.pathname === '/favorites') {
      newPath = `${location.pathname}?${params.toString()}`;
    }
    
    navigate(newPath, { replace: true });
  }, [location, navigate]);

  // 导航到指定页面
  const navigateTo = useCallback((section: string) => {
    setActiveSection(section);
    const params = new URLSearchParams(location.search);
    params.set('market', currentMarket);
    navigate(`/${section === 'dashboard' ? '' : section}?${params.toString()}`, { replace: true });
  }, [location, currentMarket, navigate]);

  return (
    <div className="layout">
      <nav className={`luxury-navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="container" style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          width: '100%',
          maxWidth: '1400px',
          margin: '0 auto'
        }}>
          {/* 品牌标识 */}
          <div className="nav-brand">
            <div className="nav-brand-logo">📈</div>
            <span className="nav-brand-text">StockMarket</span>
          </div>
          
          {/* 导航链接 */}
          <div className="nav-links-container">
            <div className="nav-link-item">
              <button 
                className={`nav-link ${activeSection === 'dashboard' ? 'active' : ''}`}
                onClick={() => navigateTo('dashboard')}
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <span className="nav-link-icon">🏠</span>
                <span>仪表盘</span>
              </button>
            </div>
            
            <div className="nav-link-item">
              <button 
                className={`nav-link ${activeSection === 'sectors' ? 'active' : ''}`}
                onClick={() => navigateTo('sectors')}
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <span className="nav-link-icon">📊</span>
                <span>板块</span>
              </button>
            </div>
            
            <div className="nav-link-item">
              <button 
                className={`nav-link ${activeSection === 'favorites' ? 'active' : ''}`}
                onClick={() => navigateTo('favorites')}
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <span className="nav-link-icon">⭐</span>
                <span>自选</span>
              </button>
            </div>
          </div>
          
          {/* 市场切换 */}
          <div className="market-switcher">
            <button 
              className={`market-btn ${currentMarket === 'CN' ? 'active' : ''}`}
              onClick={() => switchMarket('CN')}
            >
              <span>🇨🇳 A股</span>
            </button>
            <button 
              className={`market-btn ${currentMarket === 'US' ? 'active' : ''}`}
              onClick={() => switchMarket('US')}
            >
              <span>🇺🇸 美股</span>
            </button>
          </div>
        </div>
      </nav>
      
      <main className="main-content" style={{ 
        paddingTop: '100px', 
        minHeight: 'calc(100vh - 80px)',
        background: 'var(--color-dark-gradient)'
      }}>
        {children || <Outlet />}
      </main>
      
      <footer className="footer" style={{
        background: 'rgba(15, 15, 26, 0.95)',
        borderTop: '1px solid rgba(201, 162, 39, 0.1)',
        padding: '32px',
        textAlign: 'center'
      }}>
        <p style={{ 
          color: 'var(--color-text-muted)',
          fontSize: '0.9rem'
        }}>
          <span style={{ 
            background: 'var(--color-gold-gradient)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            StockMarket
          </span> 
          © {new Date().getFullYear()} | 实时股票行情看板
        </p>
      </footer>
    </div>
  );
};

export default Layout;