# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

琉璃月图床 (Liuli Moon Image Hosting) is a full-stack image hosting application with a Vue 3 frontend and Go backend. The project supports both cloud deployment (Cloudflare Pages/Vercel) and self-hosted deployment with a complete authentication system and database integration.

## Development Commands

### Frontend (Vue 3)
- `pnpm dev` - Start development server with hot reload and auto-open browser (runs on localhost:5173)
- `pnpm build` - Build for production (runs type-check and build-only in parallel)
- `pnpm build-only` - Build application without type checking
- `pnpm type-check` - Run TypeScript type checking with vue-tsc
- `pnpm lint` - Run ESLint with auto-fix
- `pnpm format` - Format code with Prettier
- `pnpm preview` - Preview production build locally

### Backend (Go)
- `cd go-backend && go run main.go` - Start Go backend (default port 3001)
- `cd go-backend && PORT=3002 go run main.go` - Start backend on specific port
- `cd go-backend && go mod tidy` - Download and organize dependencies
- `cd go-backend && docker-compose up -d` - Start with Docker

### Development Workflow
1. Start backend: `cd go-backend && go run main.go`
2. Start frontend: `pnpm dev`
3. Access frontend: http://localhost:5173
4. Backend API: http://localhost:3001 (or 3002 if specified)

## Project Architecture

### Core Technologies
- **Frontend**: Vue 3 + TypeScript + Vite + Tailwind CSS + shadcn-vue
- **Backend**: Go + Gin framework + GORM ORM
- **Database**: MySQL (images metadata) + PostgreSQL (user authentication)
- **Authentication**: JWT tokens with bcrypt password hashing
- **Storage**: Local file system + optional cloud deployment

### Dual Architecture Design
This project operates as a **hybrid system** with two deployment modes:

1. **Cloud Mode**: Vue 3 frontend with Cloudflare Functions for Imgur API integration
2. **Self-hosted Mode**: Full-stack with Vue 3 frontend + Go backend + databases

### Project Structure
```
琉璃月图床/
├── src/                    # Vue 3 Frontend
│   ├── components/         # Reusable components
│   │   ├── Header/         # App header with auth UI
│   │   ├── Footer/         # App footer
│   │   ├── Upload/         # File upload component
│   │   ├── ResList/        # Results display
│   │   └── ui/             # shadcn-vue UI components
│   ├── views/              # Page components
│   │   └── Home/           # Main upload interface
│   ├── composables/        # Vue composables
│   │   └── useAuth.ts      # Authentication state management
│   ├── config/             # Configuration
│   │   └── api.ts          # Unified API URL management
│   ├── router/             # Vue Router setup
│   ├── utils/              # Utility functions
│   └── assets/             # Static assets
├── go-backend/             # Go Backend
│   ├── main.go             # Server entry point with CORS setup
│   ├── handlers/           # HTTP request handlers
│   │   └── auth.go         # Authentication endpoints
│   ├── models/             # Database models
│   │   └── user.go         # User model with permission levels
│   ├── middleware/         # HTTP middleware
│   ├── config/             # Database configuration
│   └── uploads/            # File storage directory
├── functions/              # Cloudflare Functions
└── public/                 # Static public assets
```

### Authentication System Architecture

**Backend (Go)**:
- JWT-based authentication with 24-hour expiration
- bcrypt password hashing (cost 14)
- PostgreSQL for user data storage
- Permission levels: 0 (highest/admin) to 3 (default for new users)
- First registered user automatically gets level 0

**Frontend (Vue 3)**:
- Global authentication state using Vue composables
- Automatic token persistence in localStorage
- Reactive user state management with proper initialization
- Login/register modal with form validation
- Header component displays user info and permission level

**API Endpoints**:
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `GET /auth/user` - Get current user (requires auth)

### Database Architecture

**MySQL** (via config/database.go):
- Image metadata storage
- GORM auto-migration for images table

**PostgreSQL** (via handlers/auth.go):
- User authentication data
- Auto-migration for users table with permission levels
- Connection details in GetPostgreSQLDB() function

### API Configuration System

The `src/config/api.ts` file provides centralized API URL management:
- `API_CONFIG.BASE_URL` - Backend base URL (currently localhost:3002)
- `AUTH_URLS` - Pre-configured authentication endpoints
- Easy modification for different environments

### Frontend State Management

**Authentication State** (src/composables/useAuth.ts):
- Global reactive state using Vue 3 Composition API
- Three-state initialization: uninitialized → loading → authenticated/unauthenticated
- Automatic token validation and user data fetching
- Vue proxy object handling for reliable data access

**Key Pattern**: The Header component uses a local `currentUser` computed property to destructure user data and avoid Vue proxy object issues in templates.

### Development Notes

**Frontend**:
- Uses path alias `@` for `./src` directory
- TypeScript strict mode enabled
- Pinia available but authentication uses composables pattern
- shadcn-vue design system with "new-york" style

**Backend**:
- CORS enabled for frontend integration
- Environment variable support via godotenv
- Dual database support (MySQL + PostgreSQL)
- File upload with UUID naming
- Auto-migration on startup

**Common Issues**:
- Vue proxy objects in templates: use computed properties to destructure data
- Port conflicts: backend can run on 3001 or 3002, update API_CONFIG.BASE_URL accordingly
- CORS errors: ensure backend CORS middleware is properly configured
- Database migrations: User model auto-migrates on first API call to PostgreSQL

### Deployment Configurations

**Cloud Deployment**:
- Cloudflare Pages: Uses `/functions/upload.js` for Imgur API proxy
- Vercel: Static site deployment
- Environment: `VITE_IMG_API_URL` for API endpoint

**Self-hosted Deployment**:
- Docker support via `go-backend/docker-compose.yml`
- Nginx reverse proxy configuration available in README.md
- Local file storage in `go-backend/uploads/`

### Development Patterns

**Authentication Flow**:
1. User registers/logs in via AuthModal component
2. Backend validates credentials and returns JWT + user data
3. Frontend stores token in localStorage and sets global state
4. Subsequent API calls include Authorization header
5. Header component displays user info reactively

**File Upload Flow**:
1. Frontend uploads via Upload component
2. Go backend processes and stores files locally
3. Returns file URL for access via `/v2/{filename}` endpoint
4. Metadata stored in MySQL database