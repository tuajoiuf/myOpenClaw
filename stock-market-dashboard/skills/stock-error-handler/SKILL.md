# Stock Error Handler Skill

## Overview
Provides comprehensive error handling with graceful degradation to mock data when APIs are unavailable.

## Features
- **Multi-layer Error Handling**: Catches and handles errors at multiple levels
- **Automatic Mock Fallback**: Seamlessly switches to mock data
- **User Feedback**: Provides clear error messages to users
- **Logging**: Comprehensive error logging for debugging

## Usage
```typescript
import { handleAPIError, fallbackToMockData } from '../services/errorHandler';

// Handle API errors gracefully
try {
  const data = await fetchStockData();
} catch (error) {
  handleAPIError(error);
  const mockData = fallbackToMockData(symbols);
}
```

## Error Types Handled
- Network Errors
- HTTP 403 (Forbidden)
- HTTP 500 (Server Errors)
- Timeout Errors
- Parse Errors

## Best Practices
- Always provide fallback data
- Log errors for monitoring
- Show user-friendly messages
- Retry failed requests automatically