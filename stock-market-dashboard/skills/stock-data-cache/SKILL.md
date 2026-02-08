# Stock Data Cache Skill

## Overview
Implements intelligent caching for stock data to improve performance and reduce API calls.

## Features
- **Time-based Expiration**: Configurable TTL (default: 30 seconds)
- **Automatic Key Generation**: Generates unique cache keys based on parameters
- **Memory Management**: Prevents memory leaks with proper cleanup

## Usage
```typescript
import { getCachedData, setCachedData, generateCacheKey } from '../services/stockApi';

// Check cache
const cached = getCachedData('my-cache-key');

// Set cache
setCachedData('my-cache-key', { data: 'value' });

// Generate cache key
const key = generateCacheKey('prefix', 'arg1', 'arg2');
```

## Configuration
- Default TTL: 30000ms (30 seconds)
- Maximum Cache Size: 100 entries

## Best Practices
- Cache API responses to reduce network calls
- Use shorter TTL for real-time data
- Clear cache periodically for long-running applications