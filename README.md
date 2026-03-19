## akgarments – Men’s Clothing E‑Commerce (MERN)

Premium men’s clothing store built with the MERN stack for the brand **akgarments**. Includes customer + admin flows, OTP auth, cart/checkout (COD-style), orders, PDF invoices, and an admin dashboard.

### Tech stack

- **Backend**: Node.js, Express, MongoDB (Mongoose), JWT, bcryptjs, express-validator, PDFKit, Nodemailer
- **Frontend**: React 18, Vite, React Router v6, Tailwind CSS, Framer Motion, Axios, React Hot Toast

### Project structure

- `backend/` – API server, models, routes, controllers, utils, invoices
- `frontend/` – React SPA with routing, contexts, pages, and UI components
- `package.json` (root) – helper scripts to install and run both apps

### Setup

1. **Clone and install**

```bash
cd akgarments   # c:\Users\has84\consultancy_hd
npm run install:all
```

2. **Configure backend env**

Copy `backend/.env.example` to `backend/.env` and set:

- `MONGODB_URI` – Mongo connection string
- `JWT_SECRET` – strong random string
- `SMTP_*` – SMTP credentials for OTP / emails
- `FRONTEND_URL` – usually `http://localhost:5173`
- `PORT` – backend port (default 5000)
- `BACKEND_PUBLIC_URL` – e.g. `http://localhost:5000` (for invoice URLs)

3. **Configure frontend env**

Copy `frontend/.env.example` to `frontend/.env` and set:

- `VITE_API_URL` – e.g. `http://localhost:5000/api`

### Running in development

- **Both servers together** (recommended):

```bash
npm run dev
```

This runs:

- Backend on `http://localhost:5000`
- Frontend on `http://localhost:5173`

- **Individually**:

```bash
cd backend && npm run dev
cd frontend && npm run dev
```

### Backend overview

- Entry: `backend/server.js`
  - Connects to MongoDB using `MONGODB_URI`
  - Enables CORS for `FRONTEND_URL`
  - Parses JSON, logs requests, handles errors
  - Serves `/api/*` routes and `/api/health`
  - Serves invoice PDFs from `/invoices`

- Models:
  - `User` – name, email, password, phone, role, verification flags, addresses, OTP + reset fields
  - `Product` – menswear products with category, sizes, colors, fit, price, tags, soft delete
  - `Cart` – per-user cart with items (size/color/qty, price snapshots)
  - `Order` – order items, totals, status, payment fields, shipping snapshot, invoice path

- Key routes:
  - `/api/auth` – register (sends OTP), login, verify OTP, request/reset password
  - `/api/users` – profile + address management (requires JWT)
  - `/api/products` – catalog listing + filters (public), admin CRUD
  - `/api/cart` – cart CRUD (requires JWT)
  - `/api/orders` – create order (COD-style, immediate invoicing), list own orders, get by id, admin list + status update

- Utilities:
  - `utils/tokenUtils.js` – JWT + OTP helpers
  - `utils/emailService.js` – Nodemailer wrapper for OTP, reset, and order emails
  - `utils/invoiceGenerator.js` – PDFKit invoice generator saved under `backend/invoices/<orderId>.pdf`

### Frontend overview

- Entry: `frontend/src/main.jsx`
  - Wraps app with `BrowserRouter`, `AuthProvider`, `CartProvider`, and `react-hot-toast`

- Global layout:
  - `Navbar` – akgarments brand, navigation, cart icon with count, auth actions
  - `Footer` – simple footer with links
  - `ProtectedRoute` – guards authenticated and admin-only routes

- Routes:
  - `/` – Home (hero, category cards, featured products)
  - `/products` – catalog with filters (category, size, fit, price) and sorting
  - `/products/:slug` – product detail, size/color selection, add to cart
  - `/cart` – cart view, quantity edit, remove
  - `/checkout` – address form, order summary, COD-style order placement
  - `/orders` – user’s orders list
  - `/orders/:id` – order details + invoice download link
  - `/profile` – profile and basic info management
  - `/login`, `/register`, `/verify-otp` – auth flows
  - `/admin/dashboard`, `/admin/products`, `/admin/orders` – admin views

- Contexts:
  - `AuthContext` – auth state, user info, token persistence, login/register/verify OTP
  - `CartContext` – cart state, add/update/remove/clear, totals, backend sync

### Checkout flow

- Checkout calculates totals (subtotal, tax, shipping) on the frontend.
- Frontend posts to `/api/orders` with the shipping address and totals.
- Backend creates an order, decrements stock, marks payment as successful (COD style), generates an invoice PDF, emails the customer, and clears the cart.

### Invoices

- Generated via `utils/invoiceGenerator.js` using PDFKit.
- Saved under `backend/invoices/<orderId>.pdf`.
- Exposed via static route `/invoices`, so `/invoices/<orderId>.pdf` is downloadable.

### Seeding products from Fashion Product Images (men’s wear + images)

Product data can be seeded from the **Fashion Product Images (Small)** dataset (same as [Kaggle](https://www.kaggle.com/datasets/paramaggarwal/fashion-product-images-small)) so the store uses real men’s wear names and images instead of placeholders.

**Option A – From Kaggle (recommended)**  
1. Download the dataset from the link above (or `kaggle datasets download -d paramaggarwal/fashion-product-images-small`).  
2. Unzip and put **styles.csv** at `backend/data/fashion-product-images-small/styles.csv`.  
3. Run:

```bash
cd backend && npm run seed:products:kaggle
```

**Option B – From Hugging Face API**  
Runs against the same dataset via Hugging Face (may be rate-limited). From backend:

```bash
SEED_MAX_ROWS=2000 node scripts/seedFromFashionDataset.js
```

Both scripts filter **Men’s Apparel** only and map article types to store categories (Shirts, T-Shirts, Jeans, Inners, Shorts, Lycra Pants, Ethnic). Image URLs from the dataset are stored in `Product.images`.

### Notes

- Seed products using the admin products page (`/admin/products`) after creating an admin user directly in the database or by updating a user’s `role` to `admin`.
- This codebase is structured for extension (e.g., adding image upload, promo codes, more advanced analytics) while remaining functional and testable with test keys and local MongoDB.

