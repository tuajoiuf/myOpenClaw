# Stock API Manager Skill

## Overview
Handles stock data fetching from multiple sources with intelligent caching, error handling, and automatic fallback mechanisms.

## Features
- **Multi-source API Support**: Sina Finance, East Money, and Yahoo Finance
- **Automatic Fallback**: Switches to mock data when APIs fail
- **Request Optimization**: Configurable timeouts and retry logic
- **Header Management**: Automatically sets appropriate request headers

## Usage
```typescript
import { fetchCNStockData, fetchUSStockData, fetchAllSectors, clearCache } from '../services/stockApi';

// Fetch Chinese stocks
const cnStocks = await fetchCNStockData(['sh600519', 'sz000858']);

// Fetch all sectors
const sectors = await fetchAllSectors();

// Clear cache when needed
clearCache();
```

## Configuration
- Cache Duration: 30 seconds
- Request Timeout: 10 seconds
- Retry Attempts: 3

## Error Handling
- Automatically falls back to mock data on API failure
- Logs errors for debugging
- Provides user-friendly error messages