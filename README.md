## 🛍 Next.js Contentful E-commerce site

This is a sample E‑commerce application built with Next.js, Contentful and Stripe. It uses TailwindCSS and SASS for styling.

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

Build & run (production local)
```powershell
npm run build
npm run start
```

Related product add-ons
----------------------

This project supports product add-ons via a WooCommerce product meta key `_related_options`.

- `_related_options` should be an array of product database IDs (e.g. `[301,302]`).
- Store it on the base product (visible in WP admin via a meta box or programmatically).
- Add-on products should be set to hidden from shop/search and can be simple or variable products.

Frontend behaviour
 - When a product page loads, the app reads `_related_options` and fetches those products from WPGraphQL.
 - Simple add-ons render as checkboxes, variable add-ons render as radios for variations, group-types render as grouped checkboxes.
 - Selected add-ons are dispatched to the existing cart reducer along with the base product when added.

Admin workflow
 - Edit base product and add the `_related_options` meta (multi-select of product IDs). A small admin meta box can be implemented in WP to save IDs.
 - For add-on products set visibility to hidden and configure price/SKU/variations as needed.
