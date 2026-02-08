// src/App.tsx
import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './styles/App.css';
import './styles/LuxuryTheme.css';

// 懒加载组件
const Layout = lazy(() => import('./components/Layout'));
const Dashboard = lazy(() => import('./components/Dashboard'));
const SectorDetail = lazy(() => import('./components/SectorDetail'));
const Favorites = lazy(() => import('./components/Favorites'));

// 加载占位符
const LoadingSpinner = () => (
  <div style={{ 
    minHeight: '100vh', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center',
    background: 'var(--color-dark-gradient)'
  }}>
    <div className="luxury-card" style={{ textAlign: 'center', padding: '60px' }}>
      <div className="animate-shimmer" style={{ 
        width: '60px', 
        height: '60px', 
        borderRadius: '50%', 
        background: 'var(--color-gold-gradient)',
        margin: '0 auto 24px'
      }}></div>
      <p style={{ color: 'var(--color-text-secondary)' }}>加载中...</p>
    </div>
  </div>
);

function App() {
  return (
    <Router>
      <div className="App">
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={
                <Suspense fallback={<LoadingSpinner />}>
                  <Dashboard />
                </Suspense>
              } />
              <Route path="sectors" element={
                <Suspense fallback={<LoadingSpinner />}>
                  <Dashboard />
                </Suspense>
              } />
              <Route path="sectors/:sectorName" element={
                <Suspense fallback={<LoadingSpinner />}>
                  <SectorDetail />
                </Suspense>
              } />
              <Route path="favorites" element={
                <Suspense fallback={<LoadingSpinner />}>
                  <Favorites />
                </Suspense>
              } />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </div>
    </Router>
  );
}

export default App;