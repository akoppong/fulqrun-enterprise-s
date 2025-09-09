# Responsive Layout System

This application includes a comprehensive responsive design system that automatically adapts to all screen sizes from mobile phones to large desktop displays.

## Breakpoints

The system uses these standard breakpoints:
- `xs`: 0px (mobile phones)
- `sm`: 640px (large phones)
- `md`: 768px (tablets) 
- `lg`: 1024px (small desktops)
- `xl`: 1280px (large desktops)
- `2xl`: 1536px (extra large displays)

## Key Features

### 1. Automatic Grid Adaptation
All grid layouts automatically reduce columns on smaller screens:
- 6+ columns → 4 columns → 2 columns → 1 column
- Tab lists adapt from horizontal grids to vertical stacks
- Card grids reorganize based on available space

### 2. Responsive Sidebar
- Desktop: Fixed sidebar with full navigation
- Mobile: Collapsible drawer with hamburger menu
- Automatic spacing adjustments for content

### 3. Responsive Typography
- Headings scale down appropriately on mobile
- Text sizing adapts to screen real estate
- Line heights optimize for readability

### 4. Touch-Friendly Interface
- Minimum 44px touch targets on mobile
- Proper spacing between interactive elements
- Scroll indicators for overflowing content

### 5. Form Optimization
- Input fields stack vertically on mobile
- Dropdown menus adapt to screen width
- Dialog boxes use full-screen on small devices

## Using Responsive Components

### ResponsiveLayout Component
```tsx
import { ResponsiveLayout } from '@/components/layout/ResponsiveLayout';

<ResponsiveLayout maxWidth="xl" padding="md">
  <YourContent />
</ResponsiveLayout>
```

### ResponsiveGrid Component
```tsx
import { ResponsiveGrid } from '@/components/layout/ResponsiveLayout';

<ResponsiveGrid 
  cols={{ default: 1, sm: 2, lg: 3 }}
  gap="md"
>
  <Card>Item 1</Card>
  <Card>Item 2</Card>
  <Card>Item 3</Card>
</ResponsiveGrid>
```

### useBreakpoint Hook
```tsx
import { useBreakpoint } from '@/hooks/useBreakpoint';

function MyComponent() {
  const { isMobile, isDesktop, currentBreakpoint } = useBreakpoint();
  
  return (
    <div>
      {isMobile ? <MobileLayout /> : <DesktopLayout />}
    </div>
  );
}
```

## CSS Classes

### Utility Classes
- `.mobile-only` / `.desktop-only` - Show/hide based on screen size
- `.responsive-container` - Proper padding and max-width
- `.responsive-title` - Scales font size appropriately
- `.responsive-flex` - Adapts flex direction and alignment

### Grid Overrides
The CSS automatically handles grid responsiveness:
- Grid columns reduce automatically on smaller screens
- Maintains proper spacing and alignment
- Prevents horizontal scrolling

## Testing Responsiveness

1. Use browser developer tools to test different screen sizes
2. Test on actual devices when possible
3. Verify touch targets are appropriate size
4. Check that content doesn't overflow horizontally
5. Ensure all interactive elements remain accessible

## Best Practices

1. **Mobile First**: Start with mobile layout, enhance for larger screens
2. **Touch Targets**: Ensure buttons/links are minimum 44px tap target
3. **Content Priority**: Show most important content first on mobile
4. **Performance**: Responsive images and efficient CSS
5. **Accessibility**: Maintain keyboard navigation across all screen sizes

The system automatically handles most responsive needs, but you can use the provided hooks and components for custom responsive behavior.