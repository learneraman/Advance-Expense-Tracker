# Finance Data Processing and Access Control Backend

This repository contains the backend implementation for the "Finance Dashboard System" assignment. 

> **Note to Evaluator:** As permitted in the assignment guidelines, this project is an expanded and refined version of an existing Node.js "Expense Tracker" backend I previously constructed. It has been strictly adapted to meet 100% of the assignment's Core Requirements, specifically including Role-Based Access Control, User Management, and aggregated Analytics APIs.

---

## 🏗️ Architecture & Design

This project strictly adheres to the **Service-Repository Pattern** to ensure excellent separation of concerns, testability, and a highly maintainable codebase:
- **Routes & Middlewares:** Handle incoming HTTP traffic, validate request shapes using Zod schemas, and authenticate user roles.
- **Controllers:** The traffic directors. They take incoming requests and pass data to the Service layer without retaining heavy business logic.
- **Services (Business Logic):** The "brain" of the application where logic like permission validation, role management, and analytical calculations occur.
- **Repositories (Data Access):** The dedicated database layer using Prisma ORM to interact precisely with underlying PostgreSQL tables.

## 🎯 Assignment Requirements Mapping

### 1. User & Role Management & 4. Access Control Logic
Implemented in `prisma/schema.prisma` using modern enums (`Role` and `UserStatus`), managed through custom middleware (`src/middleware/authMiddleware.ts` -> `authorizeRoles` & `authenticate`).
- **Viewer (`VIEWER`):** Can access aggregated Dashboard analytics and view financial records. Blocked from `POST`/`PUT`/`DELETE` operations.
- **Analyst (`ANALYST`):** Inherits Viewer permissions. Can access advanced summaries and reports but cannot create or mutate core records.
- **Admin (`ADMIN`):** Unrestricted access. Full administrative capabilities over Users (can promote users, suspend users) and financial records.
*Endpoints:* `GET /api/users`, `PUT /api/users/:id/role`, `PUT /api/users/:id/status`

### 2. Financial Records Management
Managed via the `Category` and `Expense` controllers. Entries record amount, tags (categories), description (notes), type (Income/Expense natively mapped via DB enums), and date. 
Features full CRUD (guarded by RBAC rules) and robust filtering natively handled through database indexing.

### 3. Dashboard Summary APIs
Located in `dashboardController.ts`. Designed specifically to feed front-end analytics widgets.
Returns aggregate data including: Total Income, Total Expenses, Net Balance, Category-wise totals, and recent transactional activity.

### 5. Validation and Error Handling
- Robust request validation catching invalid Input parameters.
- Standardized HTTP status codes (e.g., `403 Forbidden` for role restriction violations, `404 Not Found`, etc.) handled synchronously in controller try-catch blocks.

### 6. Data Persistence
- **Database:** PostgreSQL (Relational)
- **ORM:** Prisma Client

---

## ⚖️ Assumptions & Tradeoffs

1. **Authentication Token Storage:** Assumed standard Bearer token integration rather than complex session cookie storage for straightforward decoupled API communication.
2. **Simplified Categories:** Combined `Income` and `Expense` flows within a consolidated relational entity pattern, favoring aggregation speed over extreme table normalization.
3. **Database Selection:** Used Prisma with PostgreSQL (rather than SQLite/MongoDB) as it offers the best environment for complex analytical dashboard aggregations using standard SQL groupings.

---

## 🔧 Installation & Local Setup

### Prerequisites
- Node.js (v18 or higher recommended)
- PostgreSQL Database

### Steps

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up Environment Variables:**
   Create a `.env` file referencing your Postgres DB and JWT Secret:
   ```env
   PORT=4000
   DATABASE_URL="postgres://user:password@localhost:5432/finance_db"
   JWT_SECRET="your_highly_secure_super_secret_key_here"
   ```

3. **Initialize Database:**
   Generate the Prisma Client and migrate your database:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

4. **Seed the Database (Important for Evaluation):**
   To immediately test features like the Dashboard, run the seed script to populate Dummy Users, Categories, and Expenses.
   ```bash
   npx ts-node-dev prisma/seed.ts
   ```
   **Test Credentials Provided by Seed:**
   - **Admin Access:** Email: `admin@finance.com` | Password: `password123`
   - **Viewer Access:** Email: `viewer@finance.com` | Password: `password123`

5. **Start the Development Server:**
   ```bash
   npm run dev
   ```
   The API will listen at `http://localhost:4000`.

---

## 🔗 API Documentation & Testing

This project includes fully automated interactive API documentation via **Swagger UI**. To easily view and test the API:

1. Follow the local setup to start the dev server (`npm run dev`).
2. Open your web browser and navigate to:
   **`http://localhost:4000/api-docs`**

This interactive page provides a visual overview of all routes, schemas, required parameters, and allows you to test JWT authentication directly from the UI.

## 🛡️ License
Licensed under the **ISC License**.
