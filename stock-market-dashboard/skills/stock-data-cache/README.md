# Stock Data Cache Skill

## Overview
Implements intelligent caching for stock data to improve performance and reduce API calls.

## Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                    Data Cache Architecture                    │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                    Cache Interface                   │   │
│  │  • get<T>(key: string): T | null                   │   │
│  │  • set<T>(key: string, value: T, ttl?: number):    │   │
│  │  • has(key: string): boolean                        │   │
│  │  • delete(key: string): void                       │   │
│  │  • clear(): void                                   │   │
│  │  • getStats(): CacheStats                          │   │
│  └─────────────────────────────────────────────────────┘   │
│                             │                               │
│                             ▼                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                  Cache Store                         │   │
│  │  ┌─────────────────────────────────────────────┐   │   │
│  │  │ Map<String, CacheEntry>                      │   │   │
│  │  │                                              │   │   │
│  │  │  Key: "cn:sh600519,sz000858"                 │   │   │
│  │  │  Value: { value, expires }                   │   │   │
│  │  │                                              │   │   │
│  │  └─────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────┘   │
│                             │                               │
│                             ▼                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                  Eviction Policy                      │   │
│  │  • LRU (Least Recently Used)                       │   │
│  │  • TTL-based expiration                           │   │
│  │  • Manual deletion                                │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Features

### 1. Time-Based Expiration
```typescript
interface CacheEntry<T> {
  value: T;
  expires: number; // Unix timestamp
}

class Cache {
  private readonly TTL = 30000; // 30 seconds default

  get<T>(key: string): T | null {
    const entry = this.store.get(key);
    
    if (!entry) {
      return null; // Cache miss
    }
    
    if (Date.now() > entry.expires) {
      this.store.delete(key);
      return null; // Entry expired
    }
    
    return entry.value; // Cache hit
  }

  set<T>(key: string, value: T, ttl?: number): void {
    this.store.set(key, {
      value,
      expires: Date.now() + (ttl || this.TTL)
    });
  }
}
```

### 2. LRU Eviction
```typescript
class LRUCache<T> {
  private store = new Map<string, CacheEntry<T>>();
  private readonly maxSize: number;

  constructor(maxSize: number = 100) {
    this.maxSize = maxSize;
  }

  set<T>(key: string, value: T): void {
    // LRU: Delete oldest entry when at capacity
    if (this.store.size >= this.maxSize) {
      const firstKey = this.store.keys().next().value;
      this.store.delete(firstKey);
    }

    this.store.set(key, {
      value,
      expires: Date.now() + 30000
    });
  }
}
```

### 3. Metrics Collection
```typescript
interface CacheStats {
  size: number;
  hits: number;
  misses: number;
  hitRate: number;
  evictions: number;
}

class InstrumentedCache {
  private hits = 0;
  private misses = 0;
  private evictions = 0;

  get<T>(key: string): T | null {
    const value = this.cache.get(key);
    
    if (value) {
      this.hits++;
    } else {
      this.misses++;
    }
    
    return value;
  }

  getStats(): CacheStats {
    const total = this.hits + this.misses;
    return {
      size: this.cache.size,
      hits: this.hits,
      misses: this.misses,
      hitRate: total > 0 ? this.hits / total : 0,
      evictions: this.evictions
    };
  }
}
```

## Usage
```typescript
import { DataCache } from '../utils/cache';

const cache = new DataCache({
  ttl: 30000,
  maxSize: 100
});

// Check cache
const cached = cache.get<Stock[]>('cn-stocks');
if (cached) {
  console.log('Cache hit!', cached);
  return cached;
}

// Set cache
cache.set('cn-stocks', stocks);

// Check if exists
if (cache.has('cn-stocks')) {
  // Use cached data
}

// Clear cache
cache.clear();

// Get stats
const stats = cache.getStats();
console.log('Hit rate:', stats.hitRate);
```

## Configuration
```json
{
  "cache": {
    "defaultTTL": 30000,
    "maxSize": 100,
    "evictionPolicy": "LRU"
  },
  "metrics": {
    "enabled": true,
    "logLevel": "info"
  }
}
```

## Performance Characteristics
| Operation | Time Complexity | Space Complexity |
|-----------|-----------------|------------------|
| get() | O(1) average | O(1) |
| set() | O(1) average | O(1) |
| has() | O(1) average | O(1) |
| clear() | O(n) | O(0) |

## Metrics
- `stock_cache_size`: Current cache size
- `stock_cache_hits_total`: Total cache hits
- `stock_cache_misses_total`: Total cache misses
- `stock_cache_evictions_total`: Total cache evictions
- `stock_cache_hit_rate`: Cache hit rate ratio

## Version
- **Version**: 1.0.0
- **Last Updated**: 2026-02-08
- **Status**: Production Ready