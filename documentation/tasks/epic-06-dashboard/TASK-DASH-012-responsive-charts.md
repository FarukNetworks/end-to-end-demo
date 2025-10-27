# TASK-DASH-012 - Implement Responsive Chart Layouts (Mobile/Tablet/Desktop)

## Context & Goal

**Business Value:** Ensure charts readable on all devices (UX-014, UX-016)  
**Epic:** EPIC-06 Dashboard & Reporting  
**PRD Reference:** UX-014 (Responsive layout), UX-016 (Min-height 300px)

## Scope Definition

**✅ In Scope:**

- Responsive chart containers
- Breakpoints: mobile (<768px), tablet (768-1023px), desktop (≥1024px)
- Chart aspect ratios
- Min-height 300px on mobile
- Legend positioning (right on desktop, bottom on mobile)

**⛔ Out of Scope:**

- Chart zoom/pan (V1.1)

## Technical Specifications

```typescript
// Update chart components with responsive config

// For donut chart
<ResponsiveContainer width="100%" height={300} minHeight={300}>
  <PieChart>
    <Legend
      verticalAlign={isMobile ? 'bottom' : 'right'}
      align={isMobile ? 'center' : 'right'}
      layout={isMobile ? 'horizontal' : 'vertical'}
    />
  </PieChart>
</ResponsiveContainer>

// For line chart
<ResponsiveContainer width="100%" height={300} minHeight={300}>
  <LineChart margin={{ top: 5, right: isMobile ? 10 : 30, left: isMobile ? 10 : 20, bottom: 5 }}>
    {/* ... */}
  </LineChart>
</ResponsiveContainer>

// Create responsive hook
// /hooks/use-media-query.ts
import { useState, useEffect } from 'react';

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    setMatches(media.matches);

    const listener = () => setMatches(media.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [query]);

  return matches;
}
```

## Acceptance Criteria

1. **Given** mobile viewport (<768px)
   **When** rendering charts
   **Then** legend positioned at bottom

2. **Given** desktop viewport
   **When** rendering charts
   **Then** legend positioned to right

3. **Given** chart container
   **When** on mobile
   **Then** min-height 300px maintained

4. **Given** responsive container
   **When** resizing window
   **Then** charts re-render smoothly

## Definition of Done

- [ ] Responsive chart containers
- [ ] Mobile/tablet/desktop breakpoints
- [ ] Legend positioning responsive
- [ ] Min-height 300px enforced
- [ ] useMediaQuery hook created
- [ ] Charts tested on all viewports

## Dependencies

**Upstream:** TASK-DASH-006, TASK-DASH-007  
**Effort:** 3 SP  
**Priority:** P0

## Assignment

**Primary Owner:** TBD (Frontend Engineer)
