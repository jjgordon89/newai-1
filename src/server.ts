/**
 * Express Server
 *
 * Main server file that initializes the Express server and sets up routes
 */

import express from 'express';
import cors from 'cors';
import { initDatabase } from './lib/db/sqlite';
import { logAuditEvent, AuditAction, ResourceType } from './lib/security/auditLog';

// API Route Handlers - Updated imports
import userRoutes from './routes/userRoutes';
import authRoutes from './routes/api/auth';
import documentRoutes from './routes/documentRoutes';
import apiKeyRoutes from './routes/api/apiKeys';
import auditLogRoutes from './routes/api/auditLogs';

// Initialize the database
initDatabase()
  .then(() => {
    console.log('Database initialized successfully');
  })
  .catch(err => {
    console.error('Database initialization error:', err);
    // Log the error to a file or monitoring service if available
    logAuditEvent({
      action: AuditAction.UPDATE,
      resourceType: ResourceType.SYSTEM,
      details: JSON.stringify({
        error: err.message || 'Unknown database initialization error',
        stack: err.stack,
        timestamp: new Date().toISOString()
      })
    });
    // In a production environment, you might want to exit the process
    // process.exit(1);
  });

// Create Express app
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// API routes
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/api-keys', apiKeyRoutes);
app.use('/api/audit-logs', auditLogRoutes);

// Error handling middleware with proper typing
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled Error:', err);
  
  // Log the error
  logAuditEvent({
    action: AuditAction.UPDATE,
    resourceType: ResourceType.SYSTEM,
    details: JSON.stringify({
      error: err.message || 'Unknown error',
      stack: err.stack,
      url: req.url,
      method: req.method
    })
  });
  
  res.status(500).json({
    error: {
      type: 'server_error',
      message: 'Internal server error',
      status: 500
    }
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  
  // Log server start
  logAuditEvent({
    action: AuditAction.UPDATE,
    resourceType: ResourceType.SYSTEM,
    details: JSON.stringify({
      event: 'server_start',
      port: PORT
    })
  });
});

export default app;