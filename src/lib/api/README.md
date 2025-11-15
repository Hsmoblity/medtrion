# API Manager - Centralized CMS API Repository

## Overview

The API Manager is a centralized repository/controller pattern implementation for all WordPress REST API calls in the frontend. It provides a single source of truth for API interactions, ensuring consistency, error handling, and maintainability.

## Architecture

```
src/lib/api/
├── api-manager.ts          # Core API manager (repository)
├── hooks/
│   ├── useForms.ts        # React hook for forms API
│   ├── useStripeApi.ts    # React hook for Stripe API
│   └── useFormUrl.ts      # React hook for single form URL
├── index.ts                # Central exports
└── README.md              # This file
```

## Consolidated API Structure

The API Manager organizes calls by namespace:

### 1. `hsm/v1` - General HSM API
- **Forms**: `getConsultFormUrl()`, `getContactFormUrl()`, `submitConsultation()`
- **System**: `healthCheck()`, `getSystemStatus()`

### 2. `hsm-stripe/v1` - Stripe Payment Operations
- **Config**: `getConfig()`
- **Tax**: `calculateTax()`
- **Payment**: `createPaymentIntent()`
- **Orders**: `updateOrderStatus()`

### 3. `hsm-graphql/v1` - GraphQL Operations
- Not used directly via API manager
- Handled by `src/lib/woocommerce.ts` and `src/lib/graphql/configurator.ts`

## Usage

### Direct API Manager Usage

```typescript
import { apiManager } from '@/lib/api/api-manager';

// Get consultation form URL
const formUrl = await apiManager.forms.getConsultFormUrl();

// Submit consultation
await apiManager.forms.submitConsultation({
  name: 'John Doe',
  email: 'john@example.com',
  phone: '123-456-7890',
  message: 'Consultation request',
});

// Get Stripe config
const config = await apiManager.stripe.getConfig('live');

// Calculate tax
const tax = await apiManager.stripe.calculateTax({
  country: 'CA',
  state: 'ON',
  items: [{ amount: 10000, quantity: 1 }],
});
```

### React Hooks Usage

#### useForms Hook

```typescript
import { useForms } from '@/lib/api';

function MyComponent() {
  const { consultFormUrl, contactFormUrl, loading, error, submitConsultation } = useForms();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <a href={consultFormUrl}>Consultation Form</a>
      <a href={contactFormUrl}>Contact Form</a>
    </div>
  );
}
```

#### useStripeApi Hook

```typescript
import { useStripeApi } from '@/lib/api';

function PaymentComponent() {
  const { config, loading, createPaymentIntent } = useStripeApi('live');

  const handlePayment = async () => {
    const result = await createPaymentIntent({
      amount: 10000,
      currency: 'cad',
    });
    // Use result.client_secret with Stripe Elements
  };

  return <button onClick={handlePayment}>Pay</button>;
}
```

#### useFormUrl Hook

```typescript
import { useFormUrl } from '@/lib/api';

function FormComponent() {
  const { url, loading, error } = useFormUrl({
    apiPath: '/wp-json/hsm/v1/consult-form-url',
  });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!url) return <div>Form not available</div>;

  return <iframe src={url} />;
}
```

## Error Handling

All API methods throw `ApiError` exceptions:

```typescript
import { apiManager, ApiError } from '@/lib/api/api-manager';

try {
  const url = await apiManager.forms.getConsultFormUrl();
} catch (error) {
  if (error instanceof ApiError) {
    console.error('API Error:', error.message);
    console.error('Status:', error.status);
    console.error('Response:', error.response);
  }
}
```

## API Proxy

Client-side calls automatically use the Next.js API proxy (`/api/wp-rest-proxy`) to avoid CORS issues. Server-side calls use direct WordPress URLs.

## Migration Guide

### Before (Direct Fetch)

```typescript
// ❌ Old way - direct fetch
const response = await fetch('/wp-json/hsm/v1/consult-form-url');
const data = await response.json();
const url = data.url;
```

### After (API Manager)

```typescript
// ✅ New way - API manager
import { apiManager } from '@/lib/api/api-manager';
const url = await apiManager.forms.getConsultFormUrl();
```

### Before (Hook with Direct Fetch)

```typescript
// ❌ Old way - custom hook with direct fetch
const [url, setUrl] = useState(null);
useEffect(() => {
  fetch('/wp-json/hsm/v1/consult-form-url')
    .then(res => res.json())
    .then(data => setUrl(data.url));
}, []);
```

### After (API Manager Hook)

```typescript
// ✅ New way - API manager hook
import { useFormUrl } from '@/lib/api';
const { url, loading, error } = useFormUrl({
  apiPath: '/wp-json/hsm/v1/consult-form-url',
});
```

## API Endpoints Reference

### Forms API (`hsm/v1`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `getConsultFormUrl()` | `GET /wp-json/hsm/v1/consult-form-url` | Get consultation form URL |
| `getContactFormUrl()` | `GET /wp-json/hsm/v1/contact-form-url` | Get contact form URL |
| `submitConsultation()` | `POST /api/submit-consultation` | Submit consultation form |

### Stripe API (`hsm-stripe/v1`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `getConfig()` | `GET /wp-json/hsm-stripe/v1/stripe/config` | Get Stripe configuration |
| `calculateTax()` | `GET /wp-json/hsm-stripe/v1/tax/calculate` | Calculate tax |
| `createPaymentIntent()` | `POST /api/payment/create-intent` | Create payment intent |
| `updateOrderStatus()` | `POST /api/payment/update-status` | Update order status |

### System API (`hsm/v1`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `healthCheck()` | `GET /wp-json/hsm/v1/health` | Health check |
| `getSystemStatus()` | `GET /wp-json/hsm/v1/system-status` | Get system status |

## Environment Variables

Required environment variables:

- `WP_API_URL` - WordPress API base URL (server-side)
- `NEXT_PUBLIC_WP_API_URL` - WordPress API base URL (client-side fallback)

## Best Practices

1. **Always use API Manager**: Never make direct fetch calls to WordPress REST API endpoints
2. **Use Hooks**: Prefer React hooks (`useForms`, `useStripeApi`, `useFormUrl`) over direct API manager calls in components
3. **Error Handling**: Always wrap API calls in try-catch blocks
4. **Loading States**: Use hook loading states for better UX
5. **Type Safety**: Use TypeScript types exported from API manager

## Future Enhancements

- [ ] Add request caching
- [ ] Add retry logic for failed requests
- [ ] Add request/response interceptors
- [ ] Add request cancellation support
- [ ] Add request deduplication
- [ ] Add offline support

## Agent Signature

**160125 - Fullstack - API_Manager_Creation**

