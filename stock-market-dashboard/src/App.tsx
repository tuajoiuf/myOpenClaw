// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import SectorDetail from './components/SectorDetail';
import Favorites from './components/Favorites';
import './styles/App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="sectors" element={<Dashboard />} />
            <Route path="sectors/:sectorName" element={<SectorDetail />} />
            <Route path="favorites" element={<Favorites />} />
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;