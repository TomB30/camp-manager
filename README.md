# Summer Camp Manager

A comprehensive web application for managing summer camp operations, including campers enrollment, staff member scheduling, room management, and event planning.

## 🏗️ Project Structure

This is a monorepo containing both frontend and backend applications:

```
camp-manager/
├── frontend/              # Vue 3 + TypeScript web application
├── backend/               # Go API server with PostgreSQL
├── api/                   # OpenAPI 3.0 specification (shared)
├── docs/                  # Documentation (shared)
└── README.md              # This file
```

## 🚀 Quick Start

### One-Command Setup (Recommended)

```bash
# Install all dependencies and start database
make setup

# In Terminal 1: Start backend
make dev-be

# In Terminal 2: Start frontend  
make dev-fe
```

### Manual Setup

#### Frontend (Vue 3 + Vite)

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173

See [frontend/README.md](./frontend/README.md) for detailed frontend documentation.

#### Backend (Go + PostgreSQL)

```bash
cd backend

# Start PostgreSQL
make docker-up

# Run the server
make run
```

API will be available at http://localhost:8080

See [backend/README.md](./backend/README.md) for detailed backend documentation.

### Available Root Commands

```bash
make help          # Show all available commands
make install       # Install all dependencies
make dev-fe        # Run frontend dev server
make dev-be        # Run backend server
make docker-up     # Start PostgreSQL
make build         # Build both projects
make test          # Run all tests
make clean         # Clean all artifacts
```

Run `make help` to see the full list of commands.

## 📋 Features

### 🎯 Core Functionality
- **Campers Management**: Track camper information, allergies, medical notes, and parent contacts
- **Staff Management**: Manage staff members with roles, certifications, and contact information
- **Family Groups**: Organize campers into family groups with assigned sleeping rooms and staff
- **Room Management**: Activity rooms and sleeping rooms (cabins) with capacity tracking
- **Event Calendar**: Visual calendar with drag-and-drop functionality for scheduling
- **Dynamic Camper Groups**: Create filtered groups based on age, gender, allergies, and more
- **Conflict Detection**: Automatic detection of scheduling conflicts including:
  - Room overcapacity
  - Event overcapacity
  - Camper double-booking
  - Staff double-booking
  - Missing required certifications

### ✨ Key Features
- **Drag & Drop Interface**: Easily move campers between events
- **Real-time Validation**: Prevent conflicts when enrolling campers in events
- **Capacity Management**: Visual indicators for room and event capacity
- **Responsive Design**: Works seamlessly on desktop and tablet devices
- **RESTful API**: Backend API following OpenAPI specification

## 🛠️ Technology Stack

### Frontend
- **Vue 3** - Progressive JavaScript framework
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **Pinia** - State management
- **Vue Router** - Client-side routing
- **Quasar** - Component framework
- **date-fns** - Date manipulation

### Backend
- **Go 1.22+** - Server language
- **Chi** - HTTP router
- **GORM** - ORM for database access
- **PostgreSQL 16** - Database
- **Zap** - Structured logging
- **Viper** - Configuration management

### API Specification
- **OpenAPI 3.0** - API schema for type safety between frontend and backend
- Modular structure with reusable components
- Auto-generated TypeScript types for frontend

## 📚 Documentation

### Getting Started
- [Frontend Documentation](./frontend/README.md) - Vue app setup and usage
- [Backend Documentation](./backend/README.md) - API server setup and architecture
- [API Documentation](./api/README.md) - OpenAPI specification and schemas

### Deployment & Operations
- [Deployment Guide](./DEPLOYMENT.md) - GitHub Pages and Render deployment
- [Render Deployment](./RENDER_DEPLOYMENT.md) - Detailed Render.com instructions
- [Security Guide](./SECURITY.md) - Security best practices and environment variables

### Development
- [Development Guides](./docs/) - Architecture, features, and workflows
- [Contributing](./docs/CONTRIBUTING.md) - Code of conduct and development process

## 🔧 API Commands

```bash
# View interactive API documentation
npm run api:serve
# Then open http://localhost:8080/swagger-ui.html

# Validate the OpenAPI specification
npm run api:validate

# Bundle all API files into a single file
npm run api:bundle

# Generate TypeScript types from OpenAPI spec
npm run api:generate-types
```

## 🧪 Testing

### Frontend Tests
```bash
cd frontend
npm run test
npm run test:coverage
```

### Backend Tests
```bash
cd backend
make test
```

## 📦 Building for Production

### Frontend
```bash
cd frontend
npm run build
# Output: frontend/dist/
```

### Backend
```bash
cd backend
make build
# Output: backend/bin/api
```

## 🚀 Deployment

This application supports two deployment strategies:

### Option 1: GitHub Pages (Frontend Only) - **Currently Deployed**

**Live Demo**: [https://YOUR_GITHUB_USERNAME.github.io/camp-manager/](https://YOUR_GITHUB_USERNAME.github.io/camp-manager/)

- ✅ **Automatic deployment** on push to `main` branch
- ✅ **Free hosting** forever
- ✅ **Mock data** for demonstration
- ✅ **No cold starts** - always available
- ⚠️ **No backend** - authentication and data are simulated

**Use for**: UI demos, portfolio showcases, testing frontend changes

### Option 2: Render.com (Full-Stack) - **Ready to Deploy**

Deploy the complete application with real backend and database:

```bash
# 1. Push latest code to GitHub
git push origin main

# 2. Deploy backend + database via Blueprint
# Go to https://dashboard.render.com
# New → Blueprint → Connect your GitHub repo
# Render auto-detects render.yaml and deploys backend + database

# 3. Deploy frontend via Dashboard (one-time setup)
# New → Static Site → Configure build settings
# (See RENDER_DEPLOYMENT.md for detailed steps)

# 4. Update environment variables
# - Generate JWT secret: openssl rand -base64 32
# - Update CORS with your frontend URL
```

**Includes**:
- ✅ Go backend API with JWT authentication
- ✅ PostgreSQL database
- ✅ Vue frontend (connected to real backend)
- ✅ Automatic SSL/TLS
- ✅ Free tier available

**Free Tier Limitations**:
- Cold starts after 15 minutes of inactivity (~50s)
- Database: 90-day retention, 1GB storage
- 750 hours/month per service

**Production URLs** (after deployment):
- Frontend: `https://camp-manager.onrender.com`
- Backend API: `https://camp-manager-api.onrender.com`
- Health Check: `https://camp-manager-api.onrender.com/health`

### Detailed Deployment Guides

- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Overview of all deployment options
- **[RENDER_DEPLOYMENT.md](./RENDER_DEPLOYMENT.md)** - Step-by-step Render guide
- **[SECURITY.md](./SECURITY.md)** - Security best practices

### Dual Deployment

You can keep both deployments active:
- **GitHub Pages** for frontend demos (mock data)
- **Render** for full application testing (real data)

Both can run simultaneously with proper CORS configuration.

## 🗺️ Roadmap

### Current Status
- ✅ Frontend application with mock data
- ✅ Backend API with JWT authentication
- ✅ OpenAPI specification
- ✅ Database schema and migrations
- ✅ Full CRUD API endpoints
- ✅ GitHub Pages deployment (frontend only)
- ✅ Render.com deployment ready (full-stack)
- 🚧 Production deployment (pending)

### Future Enhancements
- Multi-week/multi-session support
- Real-time updates with WebSockets
- Report generation (PDF exports)
- Email notifications for parents and staff
- Parent portal for registration and communication
- Photo sharing and galleries
- Payment and billing management
- Mobile apps (iOS and Android)
- Advanced analytics and insights
- Integration with external systems (CRM, payment processors)

## 🤝 Contributing

Please read [CONTRIBUTING.md](./docs/CONTRIBUTING.md) for details on our code of conduct and development process.

## 📄 License

MIT License - feel free to use this project for your summer camp!

## 💡 Support

For questions or issues, please open a GitHub issue.

---

**Current Version**: 0.2.0  
**Status**: 🚧 Active Development - Backend integration in progress
