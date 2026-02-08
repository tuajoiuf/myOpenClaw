// src/App.tsx
import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './styles/App.css';

// 懒加载组件以优化初始加载性能
const Layout = lazy(() => import('./components/Layout'));
const Dashboard = lazy(() => import('./components/Dashboard'));
const SectorDetail = lazy(() => import('./components/SectorDetail'));
const Favorites = lazy(() => import('./components/Favorites'));

// 加载组件时的占位符
const LoadingSpinner = () => (
  <div className="loading">加载中...</div>
);

function App() {
  return (
    <Router>
      <div className="App">
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            <Route path="/" element={
              <Layout />
            }>
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