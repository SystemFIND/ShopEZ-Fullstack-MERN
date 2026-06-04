# ShopEZ

A full-stack e-commerce web app built with the MERN stack for a university project. Includes product browsing, cart, checkout, order tracking, reviews, wishlists, image uploads, and an admin dashboard.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Demo Accounts](#demo-accounts)
- [API Overview](#api-overview)
- [Security](#security)
- [Deployment](#deployment)
- [Future Improvements](#future-improvements)
- [License](#license)

---

## Features

**Storefront**
- Browse, search, filter, and sort products
- Product detail page with image gallery, stock status, and ratings
- Category browsing and featured products section

**Auth**
- Register / login with email and password
- JWT stored in HttpOnly cookies with auto-refresh
- Forgot password / reset password flow
- Brute-force protection (lockout after 5 failed attempts)

**Shopping**
- Slide-out cart drawer — add, update, remove items
- Checkout with address + payment method (COD, bank transfer, e-wallet)
- Order history with status tracking and cancellation support
- Wishlist and user profile management

**Reviews**
- Star rating (1–5) with written comment per product
- One review per user per product; rating recalculates automatically

**Admin Dashboard** _(admin/seller only)_
- Stats: revenue, orders, products, customers, low stock
- Manage products, categories, orders, and users
- Image upload for products

---

## Tech Stack

**Frontend**
- React 19, React Router 7
- Tailwind CSS + shadcn/ui (Radix UI)
- Axios, TanStack Query, SWR
- React Hook Form + Zod
- Framer Motion, Recharts, Sonner
- Build: Create React App + CRACO

**Backend**
- Node.js, Express 4
- Mongoose 8 (MongoDB Atlas)
- JWT (`jsonwebtoken`) + `bcryptjs`
- `multer` (file uploads), `helmet`, `cors`, `express-validator`
- `nodemon` (dev)

---

## Project Structure

```
ShopEZ/
├── backend/
│   ├── config/db.js
│   ├── controllers/        # auth, products, cart, orders, reviews, wishlist, admin...
│   ├── middleware/         # authenticate.js, validate.js
│   ├── models/             # User, Product, Category, Cart, Order, Review, Wishlist...
│   ├── routes/
│   ├── uploads/            # local image storage
│   ├── utils/              # auth helpers, seed script
│   ├── app.js
│   ├── server.js
│   └── .env.example
│
└── frontend/
    ├── src/
    │   ├── components/     # Navbar, CartDrawer, ProductCard, WishlistButton...
    │   ├── context/        # AuthContext, CartContext, WishlistContext
    │   ├── pages/          # Home, Products, Checkout, Orders, Profile...
    │   │   └── admin/      # Dashboard, AdminProducts, AdminOrders, AdminUsers...
    │   └── lib/            # api.js (axios instance), utils.js
    ├── tailwind.config.js
    └── craco.config.js
```

---

## Getting Started

**Prerequisites:** Node.js 18+, a free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account

```bash
# 1. Clone
git clone https://github.com/your-username/shopez.git
cd shopez

# 2. Backend
cd backend
npm install
cp .env.example .env   # then fill in your values
npm run dev            # starts on http://localhost:8000

# 3. Frontend (new terminal)
cd frontend
npm install
cp .env.example .env
npm start              # starts on http://localhost:3000
```

The database seeds automatically on first server start (demo users + 12 products + 5 categories). To run the seed manually:

```bash
cd backend && npm run seed
```

---

## Environment Variables

**`backend/.env`**

```env
PORT=8000
MONGO_URI=mongodb://localhost:27017/ShopEZ-MERN
JWT_SECRET=your_secret_here
CORS_ORIGIN=http://localhost:3000

# Optional: override seed account credentials
ADMIN_EMAIL=admin@shopez.com
ADMIN_PASSWORD=admin123
SELLER_EMAIL=seller@shopez.com
SELLER_PASSWORD=seller123
CUSTOMER_EMAIL=customer@shopez.com
CUSTOMER_PASSWORD=customer123
```

> ⚠️ For MongoDB Atlas, include the database name in the URI before the `?`:
> `mongodb+srv://user:pass@cluster.mongodb.net/ShopEZ-MERN?retryWrites=true&w=majority`

**`frontend/.env`**

```env
REACT_APP_BACKEND_URL=http://localhost:8000
```

---

## Demo Accounts

| Role | Email | Password |
|---|---|---|
| Admin | admin@shopez.com | admin123 |
| Seller | seller@shopez.com | seller123 |
| Customer | customer@shopez.com | customer123 |

---

## API Overview

All endpoints are prefixed with `/api`.

| Group | Base path | Notes |
|---|---|---|
| Auth | `/api/auth` | register, login, logout, me, refresh, forgot/reset password |
| Products | `/api/products` | list, count, featured, detail, create, update, delete |
| Categories | `/api/categories` | CRUD — admin only for write operations |
| Cart | `/api/cart` | get, add item, update qty, remove item, clear |
| Orders | `/api/orders` | checkout, list, detail, cancel |
| Reviews | `/api/products/:id/reviews` | list, create/update, delete |
| Wishlist | `/api/wishlist` | get, add, remove |
| Users | `/api/users` | update profile |
| Admin | `/api/admin` | stats, all orders, order status, user management |
| Files | `/api/uploads/image` + `/api/files/*` | upload and serve images |

**Product list query params:** `search`, `category_id`, `sort` (`newest` / `price_asc` / `price_desc` / `popular`), `min_price`, `max_price`, `page`, `page_size`

**Order statuses:** `pending` → `processing` → `shipped` → `delivered` / `cancelled`
Cancellation is only possible from `pending` or `processing` and automatically restocks items.

**Roles:**
- `customer` — shop, cart, orders, reviews, wishlist
- `seller` — above + manage own products, view admin stats/orders
- `admin` — everything including user and category management

---

## Security

- Passwords hashed with `bcryptjs` (10 rounds)
- JWTs stored in HttpOnly cookies (not accessible via JS)
- Access token: 1 day · Refresh token: 7 days
- Login lockout after 5 failed attempts (15-minute cooldown)
- `helmet` for security headers, strict CORS origin, `express-validator` on all inputs

---

## Deployment

**Backend (Render / Railway):** set env variables in the dashboard, start command is `node server.js`. Note: `uploads/` is local disk — not persistent on free-tier hosts. Swap multer for S3/Cloudinary for production.

**Frontend (Vercel / Netlify):** set `REACT_APP_BACKEND_URL`, build command `npm run build`, output dir `build`. Add a redirect rule for SPA routing (`/* → /index.html`).

---

## Future Improvements

- Email delivery for password reset (currently returns token in response)
- Persistent image storage (S3 or Cloudinary)
- Coupon / discount system
- Order tracking timeline
- Unit and integration tests
- TypeScript migration

---

## License

[MIT](LICENSE)
