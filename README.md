# Mini SaaS Dashboard

A modern, full-stack project management dashboard built with **Next.js 14**, **Tailwind CSS**, **PostgreSQL**, and **Prisma**.

![Dashboard Preview](https://via.placeholder.com/800x450/1e293b/6366f1?text=Mini+SaaS+Dashboard)

##  Features

- ** JWT Authentication** - Secure login and registration
- ** Project Management** - Full CRUD operations for projects
- ** Search & Filter** - Search by name/team member, filter by status
- ** Responsive Design** - Works on desktop, tablet, and mobile
- ** Dark Mode** - Beautiful dark theme with glassmorphism effects
- ** Real-time Updates** - Instant feedback with toast notifications
- ** Pagination** - Optimized data loading with 10 projects per page

##  Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14 (App Router), React 18, TypeScript |
| Styling | Tailwind CSS, Custom animations |
| Backend | Next.js API Routes |
| Database | PostgreSQL |
| ORM | Prisma |
| Auth | JWT (jsonwebtoken, bcryptjs) |
| Validation | Zod |
| Icons | Lucide React |

##  Project Structure

```
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── seed.ts            # Sample data seeder
├── src/
│   ├── app/
│   │   ├── api/           # API routes
│   │   │   ├── auth/      # Login, register, profile
│   │   │   └── projects/  # CRUD endpoints
│   │   ├── login/         # Login page
│   │   ├── register/      # Registration page
│   │   └── page.tsx       # Dashboard (home)
│   ├── components/
│   │   ├── Dashboard.tsx  # Main dashboard
│   │   ├── ProjectTable.tsx
│   │   └── ProjectModal.tsx
│   ├── lib/
│   │   ├── auth.ts        # JWT utilities
│   │   ├── prisma.ts      # Prisma client
│   │   └── validations.ts # Zod schemas
│   └── types/
│       └── index.ts       # TypeScript interfaces
```

##  Quick Start

### Prerequisites

- **Node.js** 18+ 
- **pnpm** (recommended) or npm
- **PostgreSQL** installed and running

### 1. Clone & Install

```bash
# Clone the repository
git clone <your-repo-url>
cd TECHNICAL-TASK

# Install dependencies
pnpm install
```

### 2. Configure Database

Create a PostgreSQL database:

```sql
CREATE DATABASE saas_dashboard;
```

Update `.env` with your database credentials:

```env
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/saas_dashboard"
JWT_SECRET="your-super-secret-key-change-in-production"
JWT_EXPIRES_IN="7d"
```

### 3. Set Up Database

```bash
# Generate Prisma client
pnpm db:generate

# Push schema to database
pnpm db:push

# Seed with sample data
pnpm db:seed
```

### 4. Run Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| User | demo@example.com | password123 |
| Admin | admin@example.com | password123 |

##  API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login with email/password |
| POST | `/api/auth/register` | Create new account |
| GET | `/api/auth/me` | Get current user profile |

### Projects

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projects` | List all projects (with filtering) |
| POST | `/api/projects` | Create new project |
| GET | `/api/projects/[id]` | Get single project |
| PUT | `/api/projects/[id]` | Update project |
| DELETE | `/api/projects/[id]` | Delete project |

**Query Parameters for GET /api/projects:**
- `status` - Filter by status (ACTIVE, ON_HOLD, COMPLETED)
- `search` - Search by name or team member
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)

##  UI Features

- **Glassmorphism** - Modern glass-like UI effects
- **Micro-animations** - Smooth transitions and hover effects
- **Loading States** - Skeleton loaders for better UX
- **Toast Notifications** - Success/error feedback
- **Responsive Tables** - Horizontal scroll on mobile
- **Form Validation** - Client-side validation with error messages

##  Available Scripts

```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint
pnpm db:generate  # Generate Prisma client
pnpm db:push      # Push schema to database
pnpm db:migrate   # Run migrations
pnpm db:seed      # Seed database
pnpm db:studio    # Open Prisma Studio
```

##  Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Required |
| `JWT_SECRET` | Secret key for JWT signing | Required |
| `JWT_EXPIRES_IN` | Token expiration time | `7d` |

##  Testing the API

Using curl:

```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@example.com","password":"password123"}'

# Get projects (replace TOKEN with actual token)
curl http://localhost:3000/api/projects \
  -H "Authorization: Bearer TOKEN"

# Create project
curl -X POST http://localhost:3000/api/projects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"name":"New Project","status":"ACTIVE","deadline":"2025-06-30","teamMember":"John Doe","budget":50000}'
```
