# LittleGenius LAB Commerce Platform

Full-stack eCommerce system for **LittleGenius LAB**, built with:

- `Next.js 16` + `Tailwind CSS 4`
- `.NET 8` minimal API + `EF Core`
- `SQL Server` for data persistence
- `JWT` authentication
- `Razorpay` payment scaffolding
- `Shiprocket` logistics integration
- `Azure Blob Storage` for media

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
- Order management and status updates (with Shiprocket AWB)
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

## Database Schema

Main entities:

- `AppUser`: identity, role, phone, created timestamp
- `Address`: user-linked saved address
- `ProductCategory`: category name, slug, theme color, hero image
- `Product`: catalogue, stock, publishing, pricing, merchandising flags
- `ProductReview`: approved review content for product detail pages
- `Order`: customer snapshot, shipping snapshot, status, payment status
- `OrderItem`: line items for an order
- `PaymentTransaction`: Razorpay or other payment records
- `CustomOrderRequest`: uploaded photo, notes, quote, admin notes, lifecycle status
- `InventoryAdjustment`: stock change history

## Payment Integration

The Razorpay flow is scaffolded end-to-end:

1. Customer places an order through `/api/store/orders`
2. Frontend requests a Razorpay order from `/api/store/payments/razorpay/order`
3. Razorpay Checkout opens on the frontend
4. Frontend posts the payment payload to `/api/store/payments/razorpay/verify`
5. Backend marks `PaymentTransaction` and `Order` as paid/printing

## Logistics Integration

Shiprocket is integrated for automatic AWB generation:

1. Admin marks an order as `Packed`
2. Backend triggers `ShiprocketService`
3. Order is created in Shiprocket and AWB is fetched
4. Tracking number is automatically saved to the order

## SQL Server Configuration

The project exclusively uses SQL Server. Configure your connection in `appsettings.json`:

```json
"ConnectionStrings": {
  "SqlServer": "Server=...;Database=LittleGeniusDB;..."
}
```

## Local Run

### Backend

```powershell
cd "backend"
dotnet run
```

Default URLs:
- API root: `http://localhost:5252`
- Swagger: `http://localhost:5252/swagger`

### Frontend

```powershell
cd "frontend"
npm install
npm run dev
```

Default URL:
- App: `http://localhost:3000`
