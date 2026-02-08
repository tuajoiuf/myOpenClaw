// src/components/Layout.tsx
import React, { useState, useEffect, ReactNode } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import '../styles/Layout.css';

interface LayoutProps {
  children?: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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

  // 切换移动菜单
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <div className="layout">
      <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="nav-brand">
              <Link to="/">📈 股票板块行情</Link>
            </div>
            
            {/* 移动端菜单按钮 */}
            <div className="mobile-menu-toggle" style={{ display: 'none', cursor: 'pointer' }}>
              <button 
                onClick={toggleMobileMenu}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'white',
                  fontSize: '1.5rem',
                  padding: '5px 10px'
                }}
              >
                ☰
              </button>
            </div>
            
            <div className="nav-content" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              {/* 市场切换按钮 */}
              <div className="market-switcher">
                <button 
                  onClick={() => switchMarket('CN')}
                  className={`market-btn ${currentMarket === 'CN' ? 'active' : ''}`}
                >
                  A股
                </button>
                <button 
                  onClick={() => switchMarket('US')}
                  className={`market-btn ${currentMarket === 'US' ? 'active' : ''}`}
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
          </div>
        </div>
      </nav>
      
      <main className="main-content">
        {children || <Outlet />}
      </main>
      
      <footer className="footer">
        <div className="container">
          <p>实时股票行情看板 © {new Date().getFullYear()} | 数据每5秒自动更新</p>
        </div>
      </footer>
      
      {/* 移动端菜单覆盖层 */}
      {mobileMenuOpen && (
        <div 
          className="mobile-menu-overlay"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.95)',
            zIndex: 999,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
          onClick={() => setMobileMenuOpen(false)}
        >
          <div 
            className="mobile-menu-content"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '20px',
              padding: '20px'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="market-switcher" style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
              <button 
                onClick={() => {
                  switchMarket('CN');
                  setMobileMenuOpen(false);
                }}
                className={`market-btn ${currentMarket === 'CN' ? 'active' : ''}`}
              >
                A股
              </button>
              <button 
                onClick={() => {
                  switchMarket('US');
                  setMobileMenuOpen(false);
                }}
                className={`market-btn ${currentMarket === 'US' ? 'active' : ''}`}
              >
                美股
              </button>
            </div>
            
            <ul className="nav-links" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
              <li><Link to={`/?market=${currentMarket}`} onClick={() => setMobileMenuOpen(false)}>首页</Link></li>
              <li><Link to={`/sectors?market=${currentMarket}`} onClick={() => setMobileMenuOpen(false)}>板块详情</Link></li>
              <li><Link to={`/favorites?market=${currentMarket}`} onClick={() => setMobileMenuOpen(false)}>自选股票</Link></li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default Layout;