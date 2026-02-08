# UI Responsive Adapter Skill

## Overview
Handles responsive design for both H5 (mobile) and PC platforms with adaptive layouts and touch-friendly interactions.

## Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                UI Responsive Adapter Architecture          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                   Breakpoint Detector               │   │
│  │                                                 │   │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐     │   │   │
│  │  │  Mobile  │  │  Tablet  │  │ Desktop  │     │   │   │
│  │  │  ≤480px  │  │ ≤768px   │  │ ≤1200px  │     │   │   │
│  │  └────┬─────┘  └────┬─────┘  └────┬─────┘     │   │   │
│  │       │            │            │            │   │   │
│  │       └────────────┼────────────┘            │   │   │
│  │                    │                         │   │   │
│  │                    ▼                         │   │   │
│  │              ┌─────────────┐                 │   │   │
│  │              │ Breakpoint  │                 │   │   │
│  │              │   Current   │                 │   │   │
│  │              └─────────────┘                 │   │   │
│  └──────────────────────────────────────────────┼──┘   │
│                                                 │        │
│                                                 ▼        │
│  ┌─────────────────────────────────────────────────────┐   │
│  │               Layout Adapter                          │   │
│  │                                                 │   │   │
│  │  • Grid column count                              │   │   │
│  │  • Flex direction                                │   │   │
│  │  • Padding/margin                               │   │   │
│  │  • Font sizes                                   │   │   │
│  │                                                 │   │   │
│  └─────────────────────────────────────────────────────┘   │
│                             │                               │
│                             ▼                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │               Touch Optimizer                       │   │
│  │                                                 │   │   │
│  │  • Touch target size                             │   │   │
│  │  • Gesture support                              │   │   │
│  │  • Swipe detection                             │   │   │
│  │                                                 │   │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Features

### 1. Breakpoint Detection
```typescript
type Breakpoint = 'mobile' | 'tablet' | 'desktop' | 'wide';

interface BreakpointConfig {
  mobile: number;   // ≤480px
  tablet: number;   // ≤768px
  desktop: number;  // ≤1200px
  wide: number;     // >1200px
}

const DEFAULT_BREAKPOINTS: BreakpointConfig = {
  mobile: 480,
  tablet: 768,
  desktop: 1200,
  wide: Infinity
};

class BreakpointDetector {
  private current: Breakpoint;
  private listeners: ((bp: Breakpoint) => void)[] = [];

  constructor(private config: BreakpointConfig = DEFAULT_BREAKPOINTS) {
    this.current = this.detect();
    this.setupListener();
  }

  private detect(): Breakpoint {
    const width = window.innerWidth;
    
    if (width <= this.config.mobile) return 'mobile';
    if (width <= this.config.tablet) return 'tablet';
    if (width <= this.config.desktop) return 'desktop';
    return 'wide';
  }

  private setupListener() {
    window.addEventListener('resize', () => {
      const newBreakpoint = this.detect();
      if (newBreakpoint !== this.current) {
        this.current = newBreakpoint;
        this.listeners.forEach(cb => cb(newBreakpoint));
      }
    });
  }

  getCurrent(): Breakpoint {
    return this.current;
  }

  isMobile(): boolean {
    return this.current === 'mobile';
  }

  isTablet(): boolean {
    return this.current === 'tablet';
  }

  isDesktop(): boolean {
    return this.current === 'desktop' || this.current === 'wide';
  }

  onChange(callback: (bp: Breakpoint) => void): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }
}
```

### 2. Touch Optimization
```typescript
interface TouchConfig {
  minTouchTarget: number;  // 44px minimum
  swipeThreshold: number;  // 50px
  longPressDuration: number; // 500ms
}

class TouchOptimizer {
  constructor(private config: TouchConfig = {
    minTouchTarget: 44,
    swipeThreshold: 50,
    longPressDuration: 500
  }) {}

  // Ensure touch targets meet minimum size
  enforceMinTouchSize(element: HTMLElement): void {
    const observer = new ResizeObserver(() => {
      const rect = element.getBoundingClientRect();
      if (rect.width < this.config.minTouchTarget) {
        element.style.minWidth = `${this.config.minTouchTarget}px`;
      }
      if (rect.height < this.config.minTouchTarget) {
        element.style.minHeight = `${this.config.minTouchTarget}px`;
      }
    });
    observer.observe(element);
  }

  // Detect swipe gestures
  detectSwipe(
    element: HTMLElement,
    onSwipeLeft?: () => void,
    onSwipeRight?: () => void
  ): () => void {
    let startX = 0;
    let startY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;
      
      const diffX = endX - startX;
      const diffY = endY - startY;
      
      // Check if horizontal swipe
      if (Math.abs(diffX) > Math.abs(diffY) && 
          Math.abs(diffX) > this.config.swipeThreshold) {
        if (diffX > 0 && onSwipeRight) onSwipeRight();
        else if (diffX < 0 && onSwipeLeft) onSwipeLeft();
      }
    };

    element.addEventListener('touchstart', handleTouchStart);
    element.addEventListener('touchend', handleTouchEnd);

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }
}
```

### 3. Adaptive Layout
```typescript
interface LayoutConfig {
  columns: Record<Breakpoint, number>;
  gap: Record<Breakpoint, number>;
  padding: Record<Breakpoint, number>;
}

const DEFAULT_LAYOUT: LayoutConfig = {
  columns: { mobile: 1, tablet: 2, desktop: 3, wide: 4 },
  gap: { mobile: 10, tablet: 15, desktop: 20, wide: 25 },
  padding: { mobile: 10, tablet: 15, desktop: 20, wide: 30 }
};

class LayoutAdapter {
  constructor(
    private container: HTMLElement,
    private config: LayoutConfig = DEFAULT_LAYOUT
  ) {
    this.applyLayout();
    
    // Re-apply on breakpoint change
    const detector = new BreakpointDetector();
    detector.onChange(() => this.applyLayout());
  }

  private applyLayout(): void {
    const breakpoint = new BreakpointDetector().getCurrent();
    const { columns, gap, padding } = this.config;

    // Apply CSS custom properties
    this.container.style.setProperty('--grid-columns', columns[breakpoint].toString());
    this.container.style.setProperty('--grid-gap', `${gap[breakpoint]}px`);
    this.container.style.setProperty('--container-padding', `${padding[breakpoint]}px`);
  }
}
```

## Usage
```typescript
import { 
  BreakpointDetector,
  TouchOptimizer, 
  LayoutAdapter 
} from '../utils/responsive';

// Initialize responsive features
const detector = new BreakpointDetector();
const touchOptimizer = new TouchOptimizer();

// Apply responsive layout
const gridContainer = document.querySelector('.grid-container');
const layoutAdapter = new LayoutAdapter(gridContainer as HTMLElement);

// Check current breakpoint
if (detector.isMobile()) {
  // Mobile-specific logic
  console.log('Mobile view');
} else if (detector.isTablet()) {
  // Tablet-specific logic
  console.log('Tablet view');
} else {
  // Desktop-specific logic
  console.log('Desktop view');
}

// Handle breakpoint changes
detector.onChange((bp) => {
  console.log('Breakpoint changed to:', bp);
  // Update UI accordingly
});

// Optimize touch targets
const buttons = document.querySelectorAll('button');
buttons.forEach(btn => {
  touchOptimizer.enforceMinTouchSize(btn as HTMLElement);
});
```

## CSS Integration
```css
/* Mobile-first responsive styles */
:root {
  --grid-columns: 1;
  --grid-gap: 10px;
  --container-padding: 10px;
  --font-size-base: 14px;
  --font-size-heading: 1.2rem;
}

/* Tablet */
@media (min-width: 481px) {
  :root {
    --grid-columns: 2;
    --grid-gap: 15px;
    --container-padding: 15px;
    --font-size-base: 15px;
    --font-size-heading: 1.4rem;
  }
}

/* Desktop */
@media (min-width: 769px) {
  :root {
    --grid-columns: 3;
    --grid-gap: 20px;
    --container-padding: 20px;
    --font-size-base: 16px;
    --font-size-heading: 1.6rem;
  }
}

/* Wide */
@media (min-width: 1201px) {
  :root {
    --grid-columns: 4;
    --grid-gap: 25px;
    --container-padding: 30px;
    --font-size-base: 16px;
    --font-size-heading: 1.8rem;
  }
}

/* Apply variables */
.grid-container {
  display: grid;
  grid-template-columns: repeat(var(--grid-columns), 1fr);
  gap: var(--grid-gap);
  padding: var(--container-padding);
}

body {
  font-size: var(--font-size-base);
}

h1 {
  font-size: var(--font-size-heading);
}
```

## Configuration
```json
{
  "responsive": {
    "breakpoints": {
      "mobile": 480,
      "tablet": 768,
      "desktop": 1200
    },
    "touch": {
      "minTouchTarget": 44,
      "swipeThreshold": 50,
      "longPressDuration": 500
    },
    "layout": {
      "columns": {
        "mobile": 1,
        "tablet": 2,
        "desktop": 3,
        "wide": 4
      },
      "gap": {
        "mobile": 10,
        "tablet": 15,
        "desktop": 20
      }
    }
  }
}
```

## Metrics
- `responsive_breakpoint_changes`: Breakpoint change count
- `responsive_touch_events`: Touch event count
- `responsive_swipe_gestures`: Swipe gesture count

## Best Practices

### 1. Mobile-First Approach
```css
/* Write mobile styles first */
.card {
  padding: 10px;
  font-size: 14px;
}

/* Then enhance for larger screens */
@media (min-width: 768px) {
  .card {
    padding: 20px;
    font-size: 16px;
  }
}
```

### 2. Touch-Friendly Interactions
```css
/* Ensure minimum touch target */
button,
[role="button"] {
  min-height: 44px;
  min-width: 44px;
}

/* Add visual feedback */
button:active {
  transform: scale(0.95);
  opacity: 0.8;
}

/* Prevent text selection on touch */
.touch-friendly {
  -webkit-user-select: none;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}
```

### 3. Performance Optimization
```css
/* Use content-visibility for long lists */
.long-list {
  content-visibility: auto;
  contain-intrinsic-size: 1000px;
}

/* Optimize animations for reduced motion preference */
@media (prefers-reduced-motion: reduce) {
  * {
    animation: none !important;
    transition: none !important;
  }
}
```

## Version
- **Version**: 1.0.0
- **Last Updated**: 2026-02-08
- **Status**: Production Ready