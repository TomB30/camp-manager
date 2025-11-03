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

- [Frontend Documentation](./frontend/README.md) - Vue app setup and usage
- [Backend Documentation](./backend/README.md) - API server setup and architecture
- [API Documentation](./api/README.md) - OpenAPI specification and schemas
- [Development Guides](./docs/) - Architecture, features, and workflows

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

## 🗺️ Roadmap

### Current Status
- ✅ Frontend application with mock data
- ✅ Backend infrastructure setup
- ✅ OpenAPI specification
- 🚧 Database schema and migrations (in progress)
- 🚧 API endpoints implementation (in progress)

### Future Enhancements
- Multi-week/multi-session support
- User authentication and authorization
- Real-time updates with WebSockets
- Report generation (PDF exports)
- Email notifications
- Parent portal
- Photo sharing
- Payment and billing management
- Mobile apps

## 🤝 Contributing

Please read [CONTRIBUTING.md](./docs/CONTRIBUTING.md) for details on our code of conduct and development process.

## 📄 License

MIT License - feel free to use this project for your summer camp!

## 💡 Support

For questions or issues, please open a GitHub issue.

---

**Current Version**: 0.2.0  
**Status**: 🚧 Active Development - Backend integration in progress
