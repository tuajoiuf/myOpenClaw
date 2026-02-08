# UI Responsive Adapter Skill

## Overview
Handles responsive design for both H5 (mobile) and PC platforms with adaptive layouts and touch-friendly interactions.

## Features
- **Breakpoint System**: Mobile, Tablet, Desktop breakpoints
- **Adaptive Layouts**: Fluid grids and flexible components
- **Touch Optimization**: Touch-friendly buttons and interactions
- **Performance Optimization**: Reduced animations on mobile

## Usage
```typescript
// Responsive classes are applied automatically through CSS
<div className="dashboard">
  {/* Mobile: Single column */}
  {/* Tablet: 2 columns */}
  {/* Desktop: 3+ columns */}
</div>

// Media queries in CSS
@media (max-width: 768px) {
  /* Mobile styles */
}
```

## Breakpoints
- **Mobile**: max-width: 480px
- **Tablet**: max-width: 768px
- **Desktop**: max-width: 1200px

## Best Practices
- Mobile-first design approach
- Touch targets minimum 44x44px
- Reduced motion for accessibility
- Lazy loading for images