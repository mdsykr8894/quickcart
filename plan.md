You already have the QuickCart master project brief. Now start Phase 1 only.

IMPORTANT:
Do not continue to Phase 2.
Do not implement authentication yet.
Do not implement Prisma schema yet.
Do not implement product CRUD yet.
Do not implement cart, orders, admin dashboard, or full frontend pages yet.
This phase is only for clean project setup and basic running structure.

Project name: QuickCart
Project type: Secure Ecommerce Web Application for a university Secure Software Development assignment.

Main goal of this phase:
Create a clean, readable, not over-complicated project foundation for a full-stack QuickCart ecommerce app.

Tech stack:
Backend:
- Node.js
- Express.js
- Helmet.js
- Prisma ORM
- PostgreSQL
- Zod
- bcrypt
- jsonwebtoken
- cookie-parser
- cors
- multer
- express-rate-limit
- swagger-ui-express
- swagger-jsdoc
- dotenv

Frontend:
- React
- Vite
- TypeScript
- Tailwind CSS
- React Router
- Axios

Database:
- PostgreSQL using Docker Compose only

Ports:
- Backend must use port 5001
- Frontend must use port 5173
- PostgreSQL must use port 5432

Please create the project using this structure:

QuickCart/
├── backend/
│   ├── prisma/
│   ├── src/
│   │   ├── config/
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   ├── users/
│   │   │   ├── products/
│   │   │   ├── cart/
│   │   │   ├── orders/
│   │   │   ├── audit/
│   │   │   └── settings/
│   │   ├── middleware/
│   │   ├── utils/
│   │   ├── app.js
│   │   └── server.js
│   ├── uploads/
│   │   └── products/
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   ├── features/
│   │   │   ├── auth/
│   │   │   ├── public/
│   │   │   ├── shop/
│   │   │   ├── cart/
│   │   │   ├── orders/
│   │   │   ├── profile/
│   │   │   ├── admin/
│   │   │   └── audit/
│   │   ├── layouts/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── types/
│   │   ├── main.tsx
│   │   └── index.css
│   ├── .env.example
│   └── package.json
├── docs/
│   ├── screenshots/
│   ├── testing/
│   │   ├── static-analysis/
│   │   ├── sca/
│   │   ├── zap-results/
│   │   └── manual-review/
│   ├── diagrams/
│   └── report-assets/
├── docker-compose.yml
├── README.md
├── .gitignore
└── plan.md

Backend setup requirements:
1. Create a basic Express backend.
2. Backend must run on port 5001.
3. Create `src/app.js` for Express app setup.
4. Create `src/server.js` for starting the server.
5. Add one basic health route:
   GET /api/health
6. The health route should return a consistent JSON response like:
   {
     "success": true,
     "message": "QuickCart API is running.",
     "data": {
       "service": "QuickCart Backend",
       "status": "healthy"
     }
   }
7. Do not add full security middleware yet except basic Express setup if needed.
8. Do not connect Prisma yet in this phase.
9. Do not create database models yet in this phase.

Frontend setup requirements:
1. Create a React Vite TypeScript frontend.
2. Frontend must run on port 5173.
3. Create a very simple temporary landing page only.
4. The temporary page should show:
   - QuickCart
   - Secure Ecommerce Web Application
   - A short message saying the frontend setup is ready.
5. Use a simple clean layout. No full ecommerce UI yet.
6. Do not implement routing yet.
7. Do not implement auth pages yet.

Docker requirements:
1. Create `docker-compose.yml` for PostgreSQL only.
2. Use PostgreSQL 16.
3. Container name should be `quickcart_db`.
4. Database name: `quickcart_db`
5. Database user: `quickcart_user`
6. Database password: `quickcart_password`
7. Expose PostgreSQL on port 5432.
8. Use a named Docker volume.

Environment files:
Create root or backend/frontend env examples as appropriate.

backend/.env.example should include:
NODE_ENV=development
PORT=5001
DATABASE_URL=postgresql://quickcart_user:quickcart_password@localhost:5432/quickcart_db
JWT_SECRET=replace-this-with-a-long-random-secret
JWT_EXPIRES_IN=1h
CLIENT_URL=http://localhost:5173
COOKIE_NAME=quickcart_token
COOKIE_HTTP_ONLY=true
COOKIE_SECURE=false
COOKIE_SAME_SITE=lax
UPLOAD_MAX_SIZE_MB=2
SWAGGER_ENABLED=true

frontend/.env.example should include:
VITE_API_BASE_URL=http://localhost:5001/api

Root README.md:
Create a simple README skeleton with:
1. Project title: QuickCart
2. Short project description
3. Tech stack
4. Folder structure summary
5. Basic setup instructions
6. How to run PostgreSQL
7. How to run backend
8. How to run frontend
9. Security features planned
10. Note that this is a university Secure Software Development project

.gitignore:
Include common ignores for:
- node_modules
- .env
- uploads content except folder placeholder if needed
- dist
- build
- logs
- OS files
- Prisma generated/cache if relevant

Docs folder:
Create docs folders for future report/testing evidence:
- docs/screenshots
- docs/testing/static-analysis
- docs/testing/sca
- docs/testing/zap-results
- docs/testing/manual-review
- docs/diagrams
- docs/report-assets

Use `.gitkeep` files if needed to keep empty folders.

Package requirements:
Backend package should include useful scripts:
- dev
- start

Frontend package should include standard Vite scripts:
- dev
- build
- preview

After implementation:
1. Run install commands if needed.
2. Run or verify backend if possible.
3. Run or verify frontend if possible.
4. Do not proceed to Phase 2.
5. Provide a clear summary with:
   - Files created
   - Files modified
   - Commands I need to run manually
   - Backend URL
   - Frontend URL
   - PostgreSQL Docker command
   - Any errors or warnings

Important style rules:
- Keep everything clean and readable.
- Do not over-engineer.
- Do not add unnecessary packages beyond the planned stack.
- Do not create complex abstractions yet.
- Keep this phase as setup only.