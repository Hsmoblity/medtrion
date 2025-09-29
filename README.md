## 🛍 Next.js Contentful E-commerce site

This is a sample E‑commerce application built with Next.js, Contentful and Stripe. It uses TailwindCSS and SASS for styling.

**📊 Project Status**: [View Dashboard](docs/PROJECT_STATUS_DASHBOARD.md) | [Detailed Summary](docs/PROJECT_STATUS_SUMMARY.md)  
**📋 Data Analysis**: [Data Model Analysis](docs/DATA_MODEL_ANALYSIS.md) | [Quick Reference](docs/DATA_MODEL_QUICK_REFERENCE.md)

Purpose: This README explains how to set up the development environment, create the environment file, and run the app on Windows (PowerShell).

Prerequisites
- Node.js >= 16 (or match `engines` in `package.json`)
- npm (or yarn)
- Contentful account (Space ID + Delivery API token) if you use Contentful
- Stripe account if you use payments / webhooks

Environment configuration
- Copy `./.env.example` to `./.env.local` and fill in real values. DO NOT commit `.env.local` containing secrets.

Quick example (PowerShell):
```powershell
cd basecode
cp .env.example .env.local
# Open .env.local in your editor and set real values
code .env.local
```

Main environment variables you may need to set in `.env.local`:
- `NEXT_PUBLIC_SITE_URL` — site URL (e.g. `http://localhost:3000`)
- `CONTENTFUL_SPACE_ID` — Contentful Space ID
- `CONTENTFUL_ENVIRONMENT` — Contentful environment, typically `master`
- `CONTENTFUL_ACCESS_TOKEN` — Contentful Delivery API token
- `WC_API_URL`, `WC_CONSUMER_KEY`, `WC_CONSUMER_SECRET` — (optional) WooCommerce API credentials
- `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET` — Stripe keys and webhook secret
- `GOOGLE_ANALYTICS_ID` — (optional) Google Analytics ID

Install & run (development)
1. Open PowerShell and change to the `basecode` folder:
```powershell
cd D:\Works\hsmobility.ca\basecode
```
2. Install dependencies:
```powershell
npm install
```
3. Start the dev server:
```powershell
npm run dev
```
4. Open your browser at `http://localhost:3000`

## 🛒 Cart Experience & Configuration Flow

### Overview
The application features a comprehensive cart experience with product configuration and edit capabilities:

#### Cart Provider Integration
- **Unified State Management**: CartProvider bridges React Context with Zustand store for consistent cart state
- **Persistent Storage**: Cart items persist across sessions using cookies and localStorage
- **Real-time Updates**: Cart state updates automatically across all components

#### Edit Configuration Flow
1. **Start Edit Session**: Click "Edit configuration" on any cart item
2. **Session Management**: Edit sessions are tracked with expiration and cross-tab synchronization
3. **Live Configuration**: Use ModelConfigurator to modify product options and pricing
4. **Save Changes**: Updated configuration automatically saves back to cart with new totals

#### Key Features
- ✅ **Add-to-cart** works from any product page or configurator
- ✅ **Edit flow persistence** maintains option changes and recalculates pricing
- ✅ **Navigation anchors** work correctly from cart/payment pages to homepage sections  
- ✅ **Price calculations** include base price + selected options with real-time updates
- ✅ **Session management** handles edit sessions with proper cleanup and expiration

### Usage Examples

#### Adding Product with Options
```typescript
// In ProductOptions component
const addSelectedToCart = () => {
  const selectedPayloads = createSelectedPayloads();
  const totalPrice = calculateCurrentTotal();
  
  dispatch({ type: Types.addToCart, payload: {
    ...productData,
    options: selectedPayloads,
    price: totalPrice
  }});
};
```

#### Edit Configuration Flow
```typescript
// Start edit session from cart
const editSession = await startEditSession(cartItemId, productSlug, originalOptions);
router.push(`/product/${productSlug}/configure?edit=true&cartItemId=${cartItemId}&sessionId=${editSession.id}`);

// Save changes back to cart
await handleConfigurationSave(updatedConfig);
```

#### Navigation from Cart/Payment
All navigation menu items use `handleAnchorNavigation` which properly handles:
- Cross-page navigation (e.g., `/cart` → `/#shop`)
- Smooth scrolling to target sections
- Fallback handling for missing elements

### Testing
Enhanced test coverage includes:
- Cart add/remove/update operations
- Edit session lifecycle management  
- Price calculation validation
- Analytics event tracking
- Cross-component integration

Run tests with:
```bash
npm run test
```

Build & run (production local)
```powershell
npm run build
npm run start
```

Cart Provider Usage
-------------------

The cart system uses a unified provider pattern that bridges React Context with Zustand store:

```tsx
// App-level setup (already configured in _app.tsx)
<CartProvider>
  <CartVisibilityProvider>
    <YourApp />
  </CartVisibilityProvider>
</CartProvider>
```

**Adding items to cart:**
```tsx
import { useContext } from 'react';
import CartContext from 'contexts/cartItemsContext';
import Types from 'reducers/cart/types';

const { dispatch } = useContext(CartContext);

// Add product to cart
dispatch({
  type: Types.addToCart,
  payload: {
    cartItemId: 'ci_' + Math.random().toString(36).slice(2, 9),
    productId: 'product-123',
    title: 'Product Name',
    price: 299.99,
    quantity: 1,
    options: [] // Product add-ons/configurations
  }
});
```

**Using Zustand store directly:**
```tsx
import { useCartStore } from 'stores/cartStore';

const { addToCart, cart, getCartTotal } = useCartStore();

// Modern approach with Zustand
addToCart({
  slug: 'product-slug',
  title: 'Product Name',
  price: 299.99,
  quantity: 1,
  // ... other required fields
});
```

Navigation Between Pages
------------------------

Cross-page anchor navigation is handled via utility functions:

```tsx
import { handleAnchorNavigation } from 'lib/utils/navigation';
import { useRouter } from 'next/router';

const router = useRouter();

// Navigate from any page to homepage sections
await handleAnchorNavigation('/#shop', router);
await handleAnchorNavigation('/#contact-us', router);
```

This ensures proper navigation from `/cart`, `/payment`, or any other page back to homepage sections with smooth scrolling.

Related Product Add-ons
-----------------------

This project supports product add-ons via a WooCommerce product meta key `_related_options`.

- `_related_options` should be an array of product database IDs (e.g. `[301,302]`).
- Store it on the base product (visible in WP admin via a meta box or programmatically).
- Add-on products should be set to hidden from shop/search and can be simple or variable products.

**Frontend behaviour:**
 - When a product page loads, the app reads `_related_options` and fetches those products from WPGraphQL.
 - Simple add-ons render as checkboxes, variable add-ons render as radios for variations, group-types render as grouped checkboxes.
 - Selected add-ons are dispatched to the existing cart reducer along with the base product when added.

**Edit Configuration Flow:**
 - Cart items with options show "Edit configuration" buttons
 - Clicking navigates to `/product/[slug]/options?cartItemId=xyz&editSessionId=abc`
 - Changes are saved back to cart with real-time pricing updates

**Admin workflow:**
 - Edit base product and add the `_related_options` meta (multi-select of product IDs). A small admin meta box can be implemented in WP to save IDs.
 - For add-on products set visibility to hidden and configure price/SKU/variations as needed.

## Data Architecture

This application uses **WooCommerce GraphQL as the single source of truth** for all product data. This architecture eliminates data inconsistencies and reduces maintenance overhead.

### Key Components

- **WooCommerce GraphQL Client** (`lib/woocommerce.ts`) - Primary data source
- **Data Normalization** (`mapWooToProductSchema`) - Consistent data transformation
- **Dynamic Category Generation** - Configuration categories generated from related products
- **Environment Validation** - Ensures proper configuration in production

### Data Flow
```
WooCommerce GraphQL → Data Normalization → Application Components
```

### Environment Variables
```bash
# Required: WooCommerce GraphQL endpoint
WP_GRAPHQL_URL=https://your-site.com/graphql

# Optional: Configurator-specific endpoint
CONFIGURATOR_GRAPHQL_URL=https://your-site.com/configurator-graphql
```

For detailed information, see [Data Architecture Documentation](docs/DATA_ARCHITECTURE_SINGLE_SOURCE.md).
