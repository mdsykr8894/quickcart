# QuickCart

QuickCart is a full-stack ecommerce web application built with React, Express, Prisma, and PostgreSQL. It provides a complete shopping flow for users and an admin dashboard for managing products, users, orders, and audit logs.

## Features

### Customer Features

* Register and login
* Browse products
* View product details
* Add products to cart
* Place orders
* View order history
* Manage profile
* Upload profile image

### Admin Features

* Admin dashboard
* Product management
* Add, update, and deactivate products
* Manage users
* View and manage orders
* View audit logs

### Application Features

* Product categories
* Product image upload
* Cart and checkout flow
* Responsive layout for desktop and mobile
* API documentation with Swagger
* Cookie-based authentication
* Role-based access control
* Input validation
* Audit logging

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
* JWT
* Helmet
* CORS
* Multer

### Database

* PostgreSQL
* Docker Compose support for local database setup

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
├── docker-compose.yml
└── README.md
```

## Requirements

Make sure the following tools are installed:

* Node.js 18 or above
* npm
* Docker Desktop
* Git

PostgreSQL can be installed manually, but the recommended setup is using Docker Compose.

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/mdsykr8894/quickcart.git
cd quickcart
```

## Database Setup with Docker

This project includes a Docker Compose file for running PostgreSQL locally.

Start the database container:

```bash
docker compose up -d
```

This will start a PostgreSQL database using the following default configuration:

```text
Database: quickcart_db
Username: quickcart_user
Password: quickcart_password
Port: 5432
```

To stop the database container:

```bash
docker compose down
```

To stop the database and remove the stored database volume:

```bash
docker compose down -v
```

Use `docker compose down -v` only if you want to completely remove the database data.

## Backend Setup

Go to the backend folder:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Create a `.env` file from the example file:

```bash
cp .env.example .env
```

Example backend `.env`:

```env
NODE_ENV=development
PORT=5001

DATABASE_URL=postgresql://quickcart_user:quickcart_password@localhost:5432/quickcart_db

JWT_SECRET=replace-this-with-a-long-random-secret
JWT_EXPIRES_IN=1h

CLIENT_URL=http://localhost:5173
CLIENT_ORIGINS=http://localhost:5173,http://127.0.0.1:5173

COOKIE_NAME=quickcart_token
COOKIE_HTTP_ONLY=true
COOKIE_SECURE=false
COOKIE_SAME_SITE=lax

UPLOAD_MAX_SIZE_MB=2

SWAGGER_ENABLED=true
```

Run Prisma migrations:

```bash
npx prisma migrate dev
```

Seed the database:

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

The backend will run at:

```text
http://localhost:5001
```

Swagger API documentation is available at:

```text
http://localhost:5001/api/docs
```

## Frontend Setup

Open a new terminal from the project root and go to the frontend folder:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Create a `.env` file from the example file:

```bash
cp .env.example .env
```

Example frontend `.env`:

```env
VITE_API_BASE_URL=http://localhost:5001/api
```

Start the frontend development server:

```bash
npm run dev
```

The frontend will run at:

```text
http://localhost:5173
```

## Default Admin Account

After running the seed file, use this account to access the admin dashboard:

```text
Username: admin
Email: admin@quickcart.test
Password: Admin@12345
Role: ADMIN
```

Normal customer accounts can be created through the Register page.

## Reset Database and Run Seed Again

To clear the database, re-run migrations, and seed the database again:

```bash
cd backend
npx prisma migrate reset --force
```

If the seed does not run automatically:

```bash
npx prisma db seed
```

or:

```bash
node prisma/seed.js
```

## Useful Commands

### Docker

```bash
docker compose up -d
docker compose down
docker compose down -v
```

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

## Troubleshooting

### Frontend cannot connect to backend

Check the following:

1. The backend server is running on port `5001`.
2. The frontend `.env` contains the correct `VITE_API_BASE_URL`.
3. The backend `.env` contains the correct `CLIENT_ORIGINS`.
4. Both frontend and backend servers have been restarted after editing `.env`.

### Database connection error

Make sure the PostgreSQL Docker container is running:

```bash
docker compose ps
```

If it is not running, start it:

```bash
docker compose up -d
```

### Prisma migration error

Make sure the database container is running, then run:

```bash
cd backend
npx prisma migrate dev
```

### Login does not work after changing host or IP

Clear the browser site data and restart both servers. Then check that the frontend API URL and backend allowed origins are using the same host setup.

## Notes

QuickCart includes common ecommerce application protections such as password hashing, role-based access control, input validation, CSRF protection, secure cookies, upload validation, and audit logging.

## Author

Developed by Muhammad Syakir.
