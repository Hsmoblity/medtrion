# Deprecation Fix: fetchRelatedProductsByIds → fetchProductsByIds

## 🔧 **Issue Resolved**
Fixed deprecation warnings for `fetchRelatedProductsByIds` function by migrating all usage to the newer `fetchProductsByIds` function with appropriate options.

## 📊 **Changes Made**

### 1. **Core Library Update (`src/lib/woocommerce.ts`)**
**Before**:
```typescript
const relatedProducts = await fetchRelatedProductsByIds(allRelatedIds as Array<number | string>);
```

**After**:
```typescript
const relatedProducts = await fetchProductsByIds(allRelatedIds as Array<number | string>, { format: 'display' });
```

### 2. **Component Updates**

#### ProductItem Component (`src/components/ProductList/ProductItem.tsx`)
**Before**:
```typescript
import { fetchProductsByDatabaseIds, fetchRelatedProductsByIds } from 'lib/woocommerce';
// ...
const fetched = await fetchRelatedProductsByIds(product._related_options || []);
```

**After**:
```typescript
import { fetchProductsByDatabaseIds, fetchProductsByIds } from 'lib/woocommerce';
// ...
const fetched = await fetchProductsByIds(product._related_options || [], { format: 'display' });
```

#### Cart Item Component (`src/components/PageLayout/Cart/Item.tsx`)
**Before**:
```typescript
import { fetchRelatedProductsByIds } from 'lib/woocommerce';
// ...
const related = await fetchRelatedProductsByIds(relatedIds);
```

**After**:
```typescript
import { fetchProductsByIds } from 'lib/woocommerce';
// ...
const related = await fetchProductsByIds(relatedIds, { format: 'display' });
```

#### Options Page (`src/pages/product/[slug]/options.tsx`)
**Before**:
```typescript
const { fetchRelatedProductsByIds } = await import('lib/woocommerce');
const related = await fetchRelatedProductsByIds(relatedIds);
```

**After**:
```typescript
const { fetchProductsByIds } = await import('lib/woocommerce');
const related = await fetchProductsByIds(relatedIds, { format: 'display' });
```

#### Debug API (`src/pages/api/debug/related-products.ts`)
**Before**:
```typescript
import { fetchRelatedProductsByIds } from 'lib/woocommerce';
const products = await fetchRelatedProductsByIds(ids);
```

**After**:
```typescript
import { fetchProductsByIds } from 'lib/woocommerce';
const products = await fetchProductsByIds(ids, { format: 'display' });
```

### 3. **Documentation Update (`src/lib/relatedProductsExample.md`)**
Updated examples to use the new function signature with proper format specification.

### 4. **Mock File Update (`src/lib/__mocks__/woocommerce.ts`)**
Added deprecation warning to mock function to maintain consistency.

## 🎯 **Migration Strategy**

### Function Mapping:
- **Old**: `fetchRelatedProductsByIds(ids)`
- **New**: `fetchProductsByIds(ids, { format: 'display' })`

### Format Options:
- `{ format: 'display' }` - Lightweight format for UI display (replaces fetchRelatedProductsByIds)
- `{ format: 'configurator' }` - Comprehensive format for configurator functionality

## ✅ **Verification**

### Terminal Output Confirms Success:
```
fetchProductsByIds: Fetching 46 products in display format
fetchProductsByIds: Successfully mapped 10 products in display format
```

### No More Deprecation Warnings:
The deprecation warning "fetchRelatedProductsByIds is deprecated. Use fetchProductsByIds(ids, { format: 'display' }) instead." has been eliminated.

### TypeScript Compilation:
All updated files compile without errors related to the function changes.

## 📁 **Files Modified**

1. **`src/lib/woocommerce.ts`** - Updated core usage
2. **`src/components/ProductList/ProductItem.tsx`** - Component migration
3. **`src/components/PageLayout/Cart/Item.tsx`** - Component migration  
4. **`src/pages/product/[slug]/options.tsx`** - Page-level migration
5. **`src/pages/api/debug/related-products.ts`** - API endpoint migration
6. **`src/lib/relatedProductsExample.md`** - Documentation update
7. **`src/lib/__mocks__/woocommerce.ts`** - Mock consistency

## 🔄 **Backward Compatibility**

The deprecated `fetchRelatedProductsByIds` function remains in the codebase with a deprecation warning, ensuring no breaking changes while encouraging migration to the new API.

## 📈 **Benefits**

1. **Unified API**: Single function (`fetchProductsByIds`) handles both display and configurator use cases
2. **Better Performance**: Format-specific optimizations  
3. **Cleaner Architecture**: Consolidated data fetching logic
4. **Future-Proof**: Aligned with current codebase patterns

---

**STATUS**: ✅ **COMPLETED**  
**IMPACT**: **LOW RISK** - Non-breaking change with improved architecture  
**VERIFICATION**: **CONFIRMED** - No deprecation warnings in terminal output