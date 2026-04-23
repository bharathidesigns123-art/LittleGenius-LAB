# LittleGenius LAB Commerce Platform

Full-stack eCommerce system for **LittleGenius LAB**, built with:

- `Next.js 16` + `Tailwind CSS 4`
- `.NET 8` minimal API + `EF Core`
- `SQLite` by default, with `SQL Server` support ready through configuration
- `JWT` authentication
- `Razorpay` payment scaffolding
- local file upload support under `/uploads`

## What’s Included

### Customer storefront

- Homepage with branded content sections
- Category browsing and product listing
- Product detail pages with reviews
- Cart stored client-side for guest and logged-in users
- Checkout flow with COD and Razorpay path
- Guest order tracking
- Login, signup, logout
- Account page with profile and order history
- Custom order page with image upload and request submission

### Admin dashboard

- Admin login
- Dashboard metrics
- Category management
- Product management
- Inventory adjustments
- Order management and status updates
- Custom order review queue
- User list

## Project Structure

```text
frontend/
  src/app/
    page.tsx
    shop/
    products/[slug]/
    cart/
    checkout/
    custom-order/
    account/
    admin/
  src/components/
    admin/
    providers/
    site/
    store/
    ui/
  src/lib/
    api.ts
    browser-api.ts
    asset-url.ts
    fallback-data.ts
    types.ts

backend/
  Configuration/
  Data/
  Endpoints/
  Helpers/
  Models/
  Services/
  Program.cs
  appsettings.json
```

## Seeded Credentials

### Admin

- Email: `admin@littlegeniuslab.in`
- Password: `Admin@12345`

### Customer

- Email: `priya@example.com`
- Password: `Customer@123`

## Core API Design

### Auth

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`

### Storefront

- `GET /api/store/home`
- `GET /api/store/categories`
- `GET /api/store/products`
- `GET /api/store/products/{slug}`
- `POST /api/store/uploads/image`
- `POST /api/store/custom-orders`
- `POST /api/store/orders`
- `GET /api/store/orders/track/{orderCode}?phone=...`
- `POST /api/store/payments/razorpay/order`
- `POST /api/store/payments/razorpay/verify`

### Account

- `GET /api/account/profile`
- `PUT /api/account/profile`
- `GET /api/account/orders`

### Admin

- `GET /api/admin/dashboard`
- `GET/POST/PUT/DELETE /api/admin/categories`
- `GET/POST/PUT/DELETE /api/admin/products`
- `POST /api/admin/inventory/adjust`
- `GET /api/admin/orders`
- `PUT /api/admin/orders/{id}/status`
- `GET /api/admin/custom-orders`
- `PUT /api/admin/custom-orders/{id}`
- `GET /api/admin/users`

## Database Schema

Main entities:

- `AppUser`
  - identity, role, phone, created timestamp
- `Address`
  - user-linked saved address
- `ProductCategory`
  - category name, slug, theme color, hero image
- `Product`
  - catalogue, stock, publishing, pricing, merchandising flags
- `ProductReview`
  - approved review content for product detail pages
- `Order`
  - customer snapshot, shipping snapshot, status, payment status
- `OrderItem`
  - line items for an order
- `PaymentTransaction`
  - Razorpay or other payment records
- `CustomOrderRequest`
  - uploaded photo, notes, quote, admin notes, lifecycle status
- `InventoryAdjustment`
  - stock change history

## Key UI Components

- [Storefront shell](C:/Workspace/LittleGenius%20LAB/frontend/src/components/site/storefront-shell.tsx)
- [Site header](C:/Workspace/LittleGenius%20LAB/frontend/src/components/site/site-header.tsx)
- [Product card](C:/Workspace/LittleGenius%20LAB/frontend/src/components/store/product-card.tsx)
- [Cart provider](C:/Workspace/LittleGenius%20LAB/frontend/src/components/providers/cart-provider.tsx)
- [Auth provider](C:/Workspace/LittleGenius%20LAB/frontend/src/components/providers/auth-provider.tsx)
- [Admin shell](C:/Workspace/LittleGenius%20LAB/frontend/src/components/admin/admin-shell.tsx)

## Payment Integration Notes

The Razorpay flow is scaffolded end-to-end:

1. Customer places an order through `/api/store/orders`
2. Frontend requests a Razorpay order from `/api/store/payments/razorpay/order`
3. Razorpay Checkout opens on the frontend
4. Frontend posts the payment payload to `/api/store/payments/razorpay/verify`
5. Backend marks `PaymentTransaction` and `Order` as paid/printing

To enable live Razorpay:

1. Open [backend/appsettings.json](C:/Workspace/LittleGenius%20LAB/backend/appsettings.json)
2. Fill `Razorpay:KeyId`
3. Fill `Razorpay:KeySecret`
4. Set `Razorpay:CallbackUrl` to your deployed frontend checkout URL
5. Restart the backend

Without keys, the code uses a mock-safe local flow so the checkout path can still be tested.

## SQL Server Support

The backend defaults to SQLite for easy local development. To switch to SQL Server:

1. Open [backend/appsettings.json](C:/Workspace/LittleGenius%20LAB/backend/appsettings.json)
2. Set `ConnectionStrings:SqlServer`
3. Leave `Sqlite` in place as fallback or ignore it
4. Restart the backend

The application automatically prefers SQL Server when that connection string is present.

## Local Run

### Backend

```powershell
cd "C:\Workspace\LittleGenius LAB\backend"
dotnet run
```

Default URLs:

- API root: `http://localhost:5252`
- Swagger: `http://localhost:5252/swagger`

### Frontend

```powershell
cd "C:\Workspace\LittleGenius LAB\frontend"
npm install
npm run dev
```

Default URL:

- App: `http://localhost:3000`

Optional frontend env file:

- [frontend/.env.local.example](C:/Workspace/LittleGenius%20LAB/frontend/.env.local.example)

## Verification Performed

- `dotnet build`
- `npm run build`
- `npm run lint`

## Next Recommended Steps

- Replace local upload storage with Cloudinary if you want managed media
- Move from SQLite to SQL Server before production launch
- Add email or WhatsApp automation hooks for order and custom-order events
- Add richer validation and image moderation rules for uploads
- Add migrations if you want formal schema evolution instead of `EnsureCreated`
