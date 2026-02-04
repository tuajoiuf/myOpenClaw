// src/components/Layout.tsx
import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import '../styles/Layout.css';

const Layout: React.FC = () => {
  return (
    <div className="layout">
      <nav className="navbar">
        <div className="nav-brand">
          <Link to="/">📈 股票板块行情</Link>
        </div>
        <ul className="nav-links">
          <li><Link to="/">首页</Link></li>
          <li><Link to="/sectors">板块详情</Link></li>
          <li><Link to="/favorites">自选股票</Link></li>
        </ul>
      </nav>
      
      <main className="main-content">
        <Outlet />
      </main>
      
      <footer className="footer">
        <p>实时股票行情看板 © {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
};

export default Layout;