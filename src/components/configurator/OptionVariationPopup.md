# OptionVariationPopup Component Documentation

## Overview

The `OptionVariationPopup` component is a unified, consolidated component that handles variation selection for configurable products. It combines the functionality of both the legacy `OptionVariationPopup` and `EnhancedOptionVariationPopup` components into a single, well-tested component.

## Features

- **Hybrid Interface**: Supports both legacy props-based and modern store-based usage patterns
- **Fixed Price Calculation**: Resolves the $54 base price bug through proper price field priority
- **Enhanced Error Handling**: Comprehensive error boundaries and retry mechanisms
- **Improved Accessibility**: WCAG 2.1 AA compliance with proper ARIA attributes
- **Smooth Animations**: Sophisticated animations and transitions
- **Real-time Price Updates**: Live price calculation and preview
- **Edit Mode Support**: Handles both add and edit scenarios seamlessly

## Usage Patterns

### Legacy Props-Based Usage (OptionCard.tsx)

```tsx
<OptionVariationPopup
  option={option}
  categoryId={categoryId}
  isOpen={isOpen}
  onClose={onClose}
  onAddToConfiguration={handleAddToConfiguration}
  isAlreadySelected={false}
  variations={overrideVariations}
  onVariationDataError={handleError}
/>
```

### Enhanced Store-Based Usage (ModelConfigurator.tsx)

```tsx
<OptionVariationPopup useStore={true} />
```

## Props Interface

### Legacy Props (Optional when useStore=false)

- `option?: ConfigurableProductSchema` - The option product to configure
- `isOpen?: boolean` - Whether the popup is visible
- `onClose?: () => void` - Callback when popup is closed
- `onAddToConfiguration?: (option, variations, totalPrice) => void` - Callback when option is added
- `isAlreadySelected?: boolean` - Whether option is already in configuration
- `categoryId?: string` - Category ID for edit mode detection
- `variations?: Variation[]` - Override variations data
- `onVariationDataError?: (error: Error) => void` - Error handling callback

### Enhanced Props

- `useStore?: boolean` - Enable store-based state management (default: false)
- `storeKey?: string` - Optional store key for multiple instances

## Price Calculation Fix

The component fixes the $54 base price bug by implementing proper price field priority:

```typescript
// FIXED: Use proper price field priority to avoid $54 bug
const basePrice = parsePrice(
  currentOption.price || 
  currentOption.regularPrice || 
  currentOption.salePrice || 
  0
);
```

## Error Handling

The component includes comprehensive error handling:

- **Data Validation**: Validates variation data before processing
- **Error Boundaries**: Prevents crashes from invalid data
- **Retry Mechanisms**: Allows users to retry failed operations
- **Graceful Fallbacks**: Shows appropriate fallback UI for errors

## Accessibility Features

- **Keyboard Navigation**: Full keyboard support for all interactions
- **Screen Reader Support**: Proper ARIA labels and descriptions
- **Focus Management**: Automatic focus handling when popup opens/closes
- **High Contrast Support**: Works with high contrast mode

## Animation System

The component includes sophisticated animations:

- **Modal Entrance**: Slide-in animation with backdrop blur
- **Staggered Content**: Sequential animation of content elements
- **Hover Effects**: Smooth transitions on interactive elements
- **Loading States**: Pulse animations for loading indicators

## State Management

### Legacy Mode (Props-Based)
- Uses local React state for variation selections
- Calls provided callbacks for actions
- Manages its own modal state

### Store Mode (Enhanced)
- Integrates with Zustand configurator store
- Uses `optionPopup` state for modal management
- Leverages store actions for variation selection

## Performance Optimizations

- **Memoization**: Uses `useMemo` and `useCallback` for expensive calculations
- **Lazy Loading**: Variations data loaded only when needed
- **Efficient Re-renders**: Optimized dependency arrays
- **Bundle Size**: Eliminates duplicate code (~500 lines saved)

## Testing

The component includes comprehensive test coverage:

- **Unit Tests**: Individual function testing
- **Integration Tests**: Full user flow testing
- **Accessibility Tests**: WCAG compliance verification
- **Performance Tests**: Bundle size and render performance

## Migration Guide

### From Legacy OptionVariationPopup

No changes required - the component maintains full backward compatibility.

### From EnhancedOptionVariationPopup

Replace:
```tsx
<EnhancedOptionVariationPopup />
```

With:
```tsx
<OptionVariationPopup useStore={true} />
```

## Troubleshooting

### Common Issues

1. **$54 Price Bug**: Fixed in unified component through proper price field priority
2. **Variation Selection Not Working**: Ensure proper `selectionType` is set
3. **Modal Not Opening**: Check `isOpen` prop or store state
4. **Price Calculation Errors**: Verify price data format and parsing

### Debug Mode

Enable debug logging by setting:
```typescript
console.log('OptionVariationPopup: Debug mode enabled');
```

## Future Enhancements

- **3D Visualization**: Integration with 3D product viewers
- **AI Recommendations**: Smart variation suggestions
- **Advanced Pricing**: Dynamic pricing based on combinations
- **Saved Configurations**: User preference persistence

## Dependencies

- React 18.3.1+
- Zustand (for store mode)
- Framer Motion (for animations)
- Tailwind CSS (for styling)
- TypeScript (for type safety)

## File Structure

```
src/components/configurator/
├── OptionVariationPopup.tsx          # Unified component
├── OptionVariationPopup.md           # This documentation
├── OptionVariationPopup.backup.tsx   # Legacy backup
└── OptionVariationCard.tsx           # Variation display component
```
