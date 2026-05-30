# QuickCart

QuickCart is a full-stack ecommerce web application that allows users to browse products, add items to cart, place orders, and manage their profile. It also includes an admin dashboard for managing products, users, orders, and audit logs.

The project is built with React, Express, Prisma, and PostgreSQL.

## Project Overview

QuickCart provides a simple ecommerce experience for normal users and a management dashboard for admin users.

Users can browse the catalog, view product details, add products to cart, checkout, view order history, and update their profile. Admin users can manage products, view orders, manage users, and monitor system activity.

## Tech Stack

### Frontend

* React
* TypeScript
* Vite
* Tailwind CSS
* Axios
* React Router

### Backend

* Node.js
* Express.js
* Prisma ORM
* PostgreSQL
* bcrypt
* JWT / cookie-based authentication
* Helmet
* CORS
* Multer

## Main Features

### User Features

* User registration
* Login and logout
* Browse products
* View product details
* Add products to cart
* Place orders
* View order history
* Manage user profile
* Upload profile image

### Admin Features

* Admin dashboard
* Product management
* Add, edit, and deactivate products
* View and manage orders
* Manage users
* View audit logs

### Application Features

* Product categories
* Product image upload
* Cart and checkout flow
* Order tracking
* User profile image support
* Responsive layout for desktop and mobile
* API documentation using Swagger

## Project Structure

```text
QuickCart
├── backend
│   ├── prisma
│   │   ├── migrations
│   │   ├── schema.prisma
│   │   └── seed.js
│   ├── src
│   │   ├── config
│   │   ├── middleware
│   │   ├── modules
│   │   ├── utils
│   │   ├── app.js
│   │   └── server.js
│   ├── uploads
│   │   ├── products
│   │   └── profiles
│   ├── .env.example
│   └── package.json
│
├── frontend
│   ├── src
│   │   ├── app
│   │   ├── components
│   │   ├── features
│   │   ├── layouts
│   │   ├── routes
│   │   ├── services
│   │   └── utils
│   ├── .env.example
│   └── package.json
│
└── README.md
```

## Requirements

Before running this project, make sure you have installed:

* Node.js
* npm
* PostgreSQL
* Git

Recommended versions:

```text
Node.js: 18 or above
PostgreSQL: 14 or above
```

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/mdsykr8894/quickcart.git
cd quickcart
```

Replace `YOUR_USERNAME` with your GitHub username.

## Backend Setup

Go to the backend folder:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Create a `.env` file:

```bash
cp .env.example .env
```

Example backend `.env`:

```env
PORT=5001
NODE_ENV=development

DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/quickcart_db?schema=public"

JWT_SECRET="replace-this-with-a-strong-secret"
JWT_EXPIRES_IN="1d"

COOKIE_NAME="quickcart_token"
COOKIE_SAME_SITE="lax"

CLIENT_ORIGINS="http://localhost:5173,http://127.0.0.1:5173"
```

Create the PostgreSQL database manually if it does not exist:

```sql
CREATE DATABASE quickcart_db;
```

Run Prisma migration:

```bash
npx prisma migrate dev
```

Run database seed:

```bash
npx prisma db seed
```

If the seed command is not configured, run:

```bash
node prisma/seed.js
```

Start the backend server:

```bash
npm run dev
```

Backend will run at:

```text
http://localhost:5001
```

Swagger API documentation is available at:

```text
http://localhost:5001/api/docs
```

## Frontend Setup

Open a new terminal and go to the frontend folder:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Create a `.env` file:

```bash
cp .env.example .env
```

Example frontend `.env` for normal localhost testing:

```env
VITE_API_BASE_URL=http://localhost:5001/api
```

Start the frontend:

```bash
npm run dev
```

Frontend will run at:

```text
http://localhost:5173
```

## Default Admin Account

After running the seed file, use this account to login as admin:

```text
Username: admin
Email: admin@quickcart.test
Password: Admin@12345
Role: ADMIN
```

Normal users can be created through the Register page.

## Reset Database and Run Seed Again

Use this command if you want to clear the database, apply migrations again, and run the seed file:

```bash
cd backend
npx prisma migrate reset --force
```

If the seed does not run automatically, run:

```bash
npx prisma db seed
```

or:

```bash
node prisma/seed.js
```

## LAN / Mobile Testing

If you want to open the website on your phone using your laptop IP address, update the frontend `.env`:

```env
VITE_API_BASE_URL=http://YOUR_IP_ADDRESS:5001/api
```

Then start the frontend with host access:

```bash
npm run dev -- --host 0.0.0.0
```

Open the website on your phone:

```text
http://YOUR_IP_ADDRESS:5173
```

Make sure the backend `.env` includes your LAN frontend URL:

```env
CLIENT_ORIGINS="http://localhost:5173,http://127.0.0.1:5173,http://YOUR_IP_ADDRESS:5173"
```

After changing `.env`, restart both frontend and backend servers.

## Useful Commands

### Backend

```bash
cd backend
npm install
npm run dev
npx prisma migrate dev
npx prisma migrate reset --force
npx prisma db seed
npx prisma studio
```

### Frontend

```bash
cd frontend
npm install
npm run dev
npm run dev -- --host 0.0.0.0
npx tsc --noEmit
```

## Upload Folders

Uploaded product images are stored in:

```text
backend/uploads/products
```

Uploaded profile images are stored in:

```text
backend/uploads/profiles
```

The backend serves uploaded files through:

```text
/uploads/products
/uploads/profiles
```

## Environment File Notes

Do not commit real `.env` files to GitHub.

Only commit `.env.example` files.

Make sure `.gitignore` includes:

```gitignore
.env
backend/.env
frontend/.env
node_modules
backend/node_modules
frontend/node_modules
.DS_Store
```

## Troubleshooting

### Frontend cannot connect to backend

Check the following:

1. Backend is running on port `5001`.
2. Frontend `.env` uses the correct `VITE_API_BASE_URL`.
3. Backend `.env` includes the correct `CLIENT_ORIGINS`.
4. Restart both frontend and backend after editing `.env`.

### Login works on localhost but not on mobile/LAN IP

Use the LAN IP in frontend `.env`:

```env
VITE_API_BASE_URL=http://YOUR_IP_ADDRESS:5001/api
```

Add the LAN frontend origin to backend `.env`:

```env
CLIENT_ORIGINS="http://localhost:5173,http://127.0.0.1:5173,http://YOUR_IP_ADDRESS:5173"
```

Start Vite with:

```bash
npm run dev -- --host 0.0.0.0
```

Then restart both servers.

## Notes

This project includes common web application protection such as password hashing, role-based access control, input validation, CSRF protection, secure cookies, upload validation, and audit logging. These are implemented to support safer ecommerce operations.

## Author

QuickCart was developed as a full-stack ecommerce web application project.
