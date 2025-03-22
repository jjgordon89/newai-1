# Backend API Implementation

This project implements a complete backend API system with authentication, authorization, database integration, and error handling.

## Features Implemented

### API Endpoints
- **Authentication**: Login, register, logout, and user profile management
- **Document Management**: CRUD operations with access control
- **API Keys**: Managing API keys for external services
- **Audit Logs**: Comprehensive audit logging system
- **User Management**: User profile management and administration

### Database Integration
- SQLite database for storing user data, documents, permissions, and audit logs
- In-memory database with option to persist data
- Secure storage for sensitive information with encryption

### Authentication & Authorization
- Token-based authentication with secure session management
- Role-based access control for documents
- Permission checking middleware
- Secure password handling with bcrypt

### Error Handling
- Standardized error responses
- Centralized error handling middleware
- Type-safe error handling with TypeScript
- Comprehensive error logging

## Project Structure

```
src/
├── lib/
│   ├── api/
│   │   ├── errorHandler.ts        # Standardized API error handling
│   │   └── routeUtils.ts          # Route utilities for Express
│   ├── db/
│   │   ├── secureDb.ts            # Encrypted database storage
│   │   └── sqlite.ts              # SQLite database connection and operations
│   └── security/
│       ├── accessControl.ts       # Document access control
│       ├── auditLog.ts            # Audit logging system
│       └── encryption.ts          # Encryption utilities
├── middleware/
│   ├── auth.ts                    # General auth middleware 
│   └── authMiddleware.ts          # Express-specific auth middleware
├── routes/
│   └── api/
│       ├── apiKeys.ts             # API key management routes
│       ├── auditLogs.ts           # Audit logs routes
│       ├── auth.ts                # Authentication routes
│       ├── documents.ts           # Document management routes
│       └── users.ts               # User management routes
├── types/
│   └── database.ts                # TypeScript interfaces for database entities
└── server.ts                      # Main server file
```

## Running the Server

To start the development server:

```bash
npm run server:dev
```

This will start the server with nodemon for automatic reloading.

For production:

```bash
npm run server
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Authenticate and get token
- `POST /api/auth/logout` - Logout (invalidate token)
- `GET /api/auth/user` - Get current user

### Documents

- `GET /api/documents` - Get all documents for user
- `POST /api/documents` - Create a new document
- `GET /api/documents/:id` - Get a document by ID
- `PUT /api/documents/:id` - Update a document
- `DELETE /api/documents/:id` - Delete a document
- `GET /api/documents/:id/access` - Get users with access to a document
- `POST /api/documents/:id/access` - Grant access to a document
- `DELETE /api/documents/:id/access/:userId` - Revoke access

### API Keys

- `GET /api/api-keys` - Get all API keys for user
- `POST /api/api-keys` - Create/update an API key
- `GET /api/api-keys/:service` - Get an API key for a specific service
- `DELETE /api/api-keys/:service` - Delete an API key

### Users

- `GET /api/users` - Get all users (admin only)
- `GET /api/users/:id` - Get a user by ID
- `PUT /api/users/:id` - Update a user
- `DELETE /api/users/:id` - Delete a user (admin only)

### Audit Logs

- `GET /api/audit-logs` - Get audit logs with filters (admin only)
- `GET /api/audit-logs/:id` - Get a single audit log entry
- `GET /api/audit-logs/user/:userId` - Get audit logs for a specific user

## Authentication

All routes except for `/api/auth/login` and `/api/auth/register` require authentication. To authenticate, include the token in the Authorization header:

```
Authorization: Bearer <token>
```

The token is obtained from the `/api/auth/login` endpoint.

## Test Users

The system automatically creates two test users on startup:

- Admin: `admin@example.com` / `password123`
- User: `user@example.com` / `password123`
