# Stock Error Handler Skill

## Overview
Provides comprehensive error handling with graceful degradation to mock data when APIs are unavailable.

## Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                   Error Handler Architecture                 │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                   Error Receiver                    │   │
│  │  • Catch errors from API calls                     │   │
│  │  • Capture error context                          │   │
│  │  • Categorize errors                              │   │
│  └─────────────────────────────────────────────────────┘   │
│                             │                               │
│                             ▼                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                Error Categorizer                     │   │
│  │                                                 │   │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐    │   │   │
│  │  │   API     │  │Network   │  │  Parse   │    │   │   │
│  │  │ Forbidden │  │  Error   │  │  Error   │    │   │   │
│  │  └────┬─────┘  └────┬─────┘  └────┬─────┘    │   │   │
│  │       │             │             │           │   │   │
│  │       ▼             ▼             ▼           │   │   │
│  │  ┌──────────────────────────────────────┐     │   │   │
│  │  │      Strategy Selection              │     │   │   │
│  │  └──────────────────────────────────────┘     │   │   │
│  └───────────────────────────────────────────────┼──┘   │
│                                                  │        │
│                                                  ▼        │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                Strategy Executor                     │   │
│  │                                                 │   │   │
│  │  • Retry with backoff                           │   │   │
│  │  • Fallback to mock data                        │   │   │
│  │  • Use cached data                              │   │   │
│  │  • Return error to user                         │   │   │
│  │                                                 │   │   │
│  └─────────────────────────────────────────────────────┘   │
│                             │                               │
│                             ▼                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                   Error Logger                       │   │
│  │  • Structured logging                              │   │
│  │  • Metrics collection                             │   │
│  │  • Alert triggering                               │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Features

### 1. Error Categorization
```typescript
enum ErrorCategory {
  API_FORBIDDEN = 'API_FORBIDDEN',    // HTTP 403
  API_NOT_FOUND = 'API_NOT_FOUND',    // HTTP 404
  SERVER_ERROR = 'SERVER_ERROR',      // HTTP 5xx
  TIMEOUT = 'TIMEOUT',                // Request timeout
  NETWORK_ERROR = 'NETWORK_ERROR',  // Network failure
  PARSE_ERROR = 'PARSE_ERROR',        // JSON parse error
  TYPE_ERROR = 'TYPE_ERROR',          // TypeScript error
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'     // Unknown error
}

interface CategorizedError {
  category: ErrorCategory;
  originalError: Error;
  message: string;
  timestamp: Date;
  context?: Record<string, any>;
}

class ErrorCategorizer {
  categorize(error: Error, statusCode?: number): ErrorCategory {
    if (statusCode) {
      if (statusCode === 403) return ErrorCategory.API_FORBIDDEN;
      if (statusCode === 404) return ErrorCategory.API_NOT_FOUND;
      if (statusCode >= 500) return ErrorCategory.SERVER_ERROR;
    }

    if (error.message.includes('timeout')) return ErrorCategory.TIMEOUT;
    if (error.message.includes('network')) return ErrorCategory.NETWORK_ERROR;
    if (error.message.includes('JSON')) return ErrorCategory.PARSE_ERROR;

    return ErrorCategory.UNKNOWN_ERROR;
  }
}
```

### 2. Strategy Selection
```typescript
const ERROR_STRATEGIES: Record<ErrorCategory, ErrorStrategy> = {
  [ErrorCategory.API_FORBIDDEN]: {
    action: 'FALLBACK_TO_MOCK',
    retryable: false,
    userMessage: 'API访问受限，正在使用模拟数据',
    logLevel: 'warn'
  },

  [ErrorCategory.TIMEOUT]: {
    action: 'RETRY_WITH_BACKOFF',
    retryable: true,
    maxRetries: 3,
    backoffMs: 2000,
    userMessage: '请求超时，正在重试...',
    logLevel: 'info'
  },

  [ErrorCategory.NETWORK_ERROR]: {
    action: 'USE_CACHED_DATA',
    retryable: true,
    maxRetries: 2,
    userMessage: '网络连接不稳定',
    logLevel: 'error'
  },

  [ErrorCategory.PARSE_ERROR]: {
    action: 'FALLBACK_TO_MOCK',
    retryable: false,
    userMessage: '数据格式异常',
    logLevel: 'error'
  }
};
```

### 3. Graceful Fallback
```typescript
class FallbackManager {
  async executeFallback<T>(
    category: ErrorCategory,
    fallbackFn: () => T
  ): Promise<T> {
    const strategy = ERROR_STRATEGIES[category];
    
    // Log the error
    this.logger.warn(`Fallback triggered: ${category}`, {
      action: strategy.action,
      retryable: strategy.retryable
    });

    // Update metrics
    this.metrics.increment('fallback_usage', { category });

    // Execute fallback
    return fallbackFn();
  }

  generateMockData(symbols: string[], market: 'CN' | 'US'): Stock[] {
    return symbols.map(symbol => ({
      symbol,
      name: `${symbol}公司`,
      market,
      price: Math.random() * 100 + 10,
      change: (Math.random() - 0.5) * 10,
      changePercent: (Math.random() - 0.5) * 5,
      volume: Math.floor(Math.random() * 1000000)
    }));
  }
}
```

### 4. Error Logging
```typescript
interface ErrorLogEntry {
  id: string;
  timestamp: Date;
  category: ErrorCategory;
  message: string;
  stack?: string;
  context?: Record<string, any>;
}

class ErrorLogger {
  private logs: ErrorLogEntry[] = [];

  log(error: Error, context?: Record<string, any>): void {
    const entry: ErrorLogEntry = {
      id: generateUUID(),
      timestamp: new Date(),
      category: this.categorizer.categorize(error),
      message: error.message,
      stack: error.stack,
      context
    };

    this.logs.push(entry);
    
    // In production, send to logging service
    if (process.env.NODE_ENV === 'production') {
      this.sendToLoggingService(entry);
    }
  }

  getRecentErrors(limit: number = 10): ErrorLogEntry[] {
    return this.logs.slice(-limit);
  }

  getErrorStats(): ErrorStats {
    const stats = {
      total: this.logs.length,
      byCategory: {} as Record<string, number>
    };

    for (const log of this.logs) {
      stats.byCategory[log.category] = 
        (stats.byCategory[log.category] || 0) + 1;
    }

    return stats;
  }
}
```

## Usage
```typescript
import { ErrorHandler } from '../services/errorHandler';

const errorHandler = new ErrorHandler({
  fallbackEnabled: true,
  maxRetries: 3,
  retryDelay: 1000
});

// Wrap API call
async function safeFetch<T>(
  fn: () => Promise<T>,
  fallbackFn: () => T
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    return errorHandler.handle(error, fallbackFn);
  }
}

// Usage
const stocks = await safeFetch(
  () => fetchCNStockData(symbols),
  () => generateMockStockData(symbols, 'CN')
);

// Get error stats
const stats = errorHandler.getErrorStats();
console.log('Error stats:', stats);
```

## Configuration
```json
{
  "errorHandler": {
    "fallbackEnabled": true,
    "maxRetries": 3,
    "retryDelay": 1000,
    "strategies": {
      "API_FORBIDDEN": {
        "action": "FALLBACK_TO_MOCK",
        "retryable": false
      },
      "TIMEOUT": {
        "action": "RETRY_WITH_BACKOFF",
        "retryable": true,
        "maxRetries": 3,
        "backoffMs": 2000
      },
      "NETWORK_ERROR": {
        "action": "USE_CACHED_DATA",
        "retryable": true,
        "maxRetries": 2
      }
    }
  }
}
```

## Metrics
- `stock_errors_total`: Total errors by category
- `stock_fallbacks_total`: Total fallback executions
- `stock_retries_total`: Total retry attempts
- `stock_errors_by_category`: Error distribution

## User Messages
| Category | User Message | Action |
|----------|--------------|--------|
| API Forbidden | 正在使用模拟数据 | Fallback to mock |
| Timeout | 请求超时，正在重试... | Retry with backoff |
| Network Error | 网络连接不稳定 | Use cached data |
| Parse Error | 数据格式异常 | Fallback to mock |
| Server Error | 服务暂时不可用 | Retry with backoff |

## Version
- **Version**: 1.0.0
- **Last Updated**: 2026-02-08
- **Status**: Production Ready