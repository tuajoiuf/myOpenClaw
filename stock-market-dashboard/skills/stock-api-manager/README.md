# Stock API Manager Skill

## Overview
Handles stock data fetching from multiple sources with intelligent caching, error handling, and automatic fallback mechanisms.

## Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                    Stock API Manager                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                    API Sources                        │   │
│  │  ┌──────────┐  ┌──────────────┐  ┌──────────────┐ │   │
│  │  │   Sina   │  │  East Money   │  │    Mock      │ │   │
│  │  │ Finance  │  │    API        │  │    Data      │ │   │
│  │  └────┬─────┘  └───────┬──────┘  └──────┬───────┘ │   │
│  │       │                │                │         │   │
│  └───────┼────────────────┼────────────────┼─────────┘   │
│          │                │                │              │
│          └────────────────┼────────────────┘              │
│                           │                               │
│                           ▼                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Load Balancer & Failover               │   │
│  │  • Priority-based source selection                   │   │
│  │  • Automatic failover on failure                    │   │
│  │  • Request timeout management                      │   │
│  └──────────────────────────┬──────────────────────────┘   │
│                             │                               │
│                             ▼                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                    Cache Layer                       │   │
│  │  • 30-second TTL                                   │   │
│  │  • LRU eviction                                    │   │
│  │  • Metrics collection                              │   │
│  └──────────────────────────┬──────────────────────────┘   │
│                             │                               │
│                             ▼                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                   Error Handler                      │   │
│  │  • Categorize errors                               │   │
│  │  • Log errors                                      │   │
│  │  • Execute fallback                                │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Features

### 1. Multi-Source API Support
```typescript
interface APIConfig {
  id: string;
  url: string;
  priority: number;
  timeout: number;
  headers?: Record<string, string>;
}

const API_SOURCES: APIConfig[] = [
  {
    id: 'sina',
    url: 'https://hq.sinajs.cn',
    priority: 1,
    timeout: 10000
  },
  {
    id: 'eastmoney',
    url: 'https://push2.eastmoney.com',
    priority: 2,
    timeout: 10000
  }
];
```

### 2. Intelligent Caching
```typescript
class DataCache {
  private store = new Map<string, CacheEntry>();
  private readonly TTL = 30000; // 30 seconds
  private readonly MAX_SIZE = 100;

  get<T>(key: string): T | null {
    const entry = this.store.get(key);
    if (!entry || Date.now() > entry.expires) {
      this.store.delete(key);
      return null;
    }
    return entry.value as T;
  }

  set<T>(key: string, value: T): void {
    // LRU eviction
    if (this.store.size >= this.MAX_SIZE) {
      const firstKey = this.store.keys().next().value;
      this.store.delete(firstKey);
    }
    
    this.store.set(key, {
      value,
      expires: Date.now() + this.TTL
    });
  }
}
```

### 3. Error Handling
```typescript
async function fetchWithFailover<T>(
  fetchFn: () => Promise<T>,
  fallbackFn: () => T
): Promise<T> {
  for (const source of API_SOURCES) {
    try {
      return await this.callWithTimeout(fetchFn, source.timeout);
    } catch (error) {
      this.errorHandler.log(source.id, error);
      continue;
    }
  }
  
  // All sources failed, use fallback
  return fallbackFn();
}
```

## Usage
```typescript
import { StockAPIManager } from '../services/stockApi';

const apiManager = new StockAPIManager({
  sources: API_SOURCES,
  cache: new DataCache(),
  errorHandler: new ErrorHandler()
});

// Fetch Chinese stocks
const cnStocks = await apiManager.fetchCNStockData(['sh600519', 'sz000858']);

// Fetch all sectors
const sectors = await apiManager.fetchAllSectors();

// Clear cache
apiManager.clearCache();

// Health check
const isHealthy = await apiManager.healthCheck();
```

## Configuration
```json
{
  "apiSources": {
    "sina": {
      "url": "https://hq.sinajs.cn",
      "priority": 1,
      "timeout": 10000
    },
    "eastmoney": {
      "url": "https://push2.eastmoney.com",
      "priority": 2,
      "timeout": 10000
    }
  },
  "cache": {
    "ttl": 30000,
    "maxSize": 100
  },
  "retry": {
    "maxAttempts": 3,
    "backoffMs": 1000
  }
}
```

## Metrics
- `api_requests_total`: Total API requests by source
- `api_latency_seconds`: API request latency histogram
- `cache_hit_total`: Cache hits
- `cache_miss_total`: Cache misses
- `error_total`: Errors by type and source

## Error Handling
| Error Type | Strategy | User Message |
|------------|----------|--------------|
| 403 Forbidden | Fallback to mock | 正在使用模拟数据 |
| 500 Server Error | Retry with backoff | 正在重试... |
| Timeout | Retry twice | 请求超时 |
| Network Error | Use cached data | 网络连接不稳定 |

## Dependencies
- `stock-data-cache`: For caching responses
- `stock-error-handler`: For error categorization

## Version
- **Version**: 1.0.0
- **Last Updated**: 2026-02-08
- **Status**: Production Ready