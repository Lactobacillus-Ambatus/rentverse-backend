require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');

const { connectDB } = require('./config/database');
const swaggerSpecs = require('./config/swagger');
const sessionMiddleware = require('./middleware/session');

const app = express();

// Ngrok and proxy handling middleware
app.use((req, res, next) => {
  // Trust ngrok proxy
  app.set('trust proxy', true);

  // Handle ngrok headers
  if (req.headers['x-forwarded-proto']) {
    req.protocol = req.headers['x-forwarded-proto'];
  }

  if (req.headers['x-forwarded-host']) {
    req.headers.host = req.headers['x-forwarded-host'];
  }

  next();
});

// Connect to database
connectDB();

// Middleware
app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// Simple CORS configuration - allow everything in development
app.use(
  cors({
    origin: function (origin, callback) {
      console.log('CORS Origin:', origin);

      // Always allow in development
      if (process.env.NODE_ENV === 'development') {
        return callback(null, true);
      }

      // Allow no origin (mobile apps, postman, etc)
      if (!origin) {
        return callback(null, true);
      }

      // Explicitly allow ngrok URL
      if (origin === 'https://curious-lively-monster.ngrok-free.app') {
        return callback(null, true);
      }

      // Allow localhost variants
      if (origin.match(/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/)) {
        return callback(null, true);
      }

      return callback(null, true); // Allow all for now
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
      'Origin',
      'Access-Control-Request-Method',
      'Access-Control-Request-Headers',
      'X-Forwarded-Proto',
      'X-Forwarded-Host',
    ],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    maxAge: 86400,
    preflightContinue: false,
    optionsSuccessStatus: 200,
  })
);

// Additional CORS debugging and handling
app.use((req, res, next) => {
  const origin = req.headers.origin;

  // Set CORS headers manually for ngrok and other origins
  res.header('Access-Control-Allow-Origin', origin || '*');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header(
    'Access-Control-Allow-Methods',
    'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS'
  );
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-Forwarded-Proto, X-Forwarded-Host'
  );
  res.header('Access-Control-Expose-Headers', 'Content-Range, X-Content-Range');

  // Debug logging
  if (process.env.NODE_ENV === 'development') {
    console.log(`CORS: ${req.method} ${req.path}`);
    console.log(`Origin: ${origin}`);
    console.log(`Host: ${req.headers.host}`);
    console.log(`X-Forwarded-Host: ${req.headers['x-forwarded-host']}`);
    console.log(`X-Forwarded-Proto: ${req.headers['x-forwarded-proto']}`);
    console.log('---');
  }

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  next();
});

app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session middleware (required for OAuth)
app.use(sessionMiddleware);

// Static files
app.use(express.static('public'));

// Serve uploaded PDFs from uploads directory with proper security
const path = require('path');
app.use(
  '/api/files/pdfs',
  express.static(path.join(__dirname, '../uploads/pdfs'), {
    // Only allow PDF files
    setHeaders: (res, path, stat) => {
      if (path.endsWith('.pdf')) {
        res.set('Content-Type', 'application/pdf');
        res.set('Content-Disposition', 'inline'); // Display in browser instead of download
        res.set('Cache-Control', 'public, max-age=31536000'); // 1 year cache
      } else {
        res.status(404).end(); // Block non-PDF files
      }
    },
  })
);

// Swagger UI setup
app.use(
  '/docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpecs, {
    explorer: true,
    customCss: `
      .swagger-ui .topbar { display: none }
      .swagger-ui .info .title { color: #1976d2 }
      .server-info { 
        background: #e3f2fd; 
        padding: 10px; 
        border-radius: 5px; 
        margin: 10px 0;
        border-left: 4px solid #1976d2;
      }
    `,
    customSiteTitle: 'Rentverse API Documentation',
    customfavIcon: '/favicon.ico',
    swaggerOptions: {
      persistAuthorization: true,
      servers: [
        {
          url:
            process.env.NGROK_URL ||
            `http://localhost:${process.env.PORT || 3005}`,
          description: process.env.NGROK_URL
            ? `🌐 Ngrok Tunnel: ${process.env.NGROK_URL}`
            : `🏠 Local Server: http://localhost:${process.env.PORT || 3005}`,
        },
        {
          url: `http://localhost:${process.env.PORT || 3005}`,
          description: '🏠 Local Development Server',
        },
      ],
    },
  })
);

// Import routes
const authRoutes = require('./routes/auth');
const uploadRoutes = require('./routes/upload');
const userRoutes = require('./modules/users/users.routes');
const propertyRoutes = require('./modules/properties/properties.routes');
const bookingRoutes = require('./modules/bookings/bookings.routes');
const propertyTypeRoutes = require('./modules/propertyTypes/propertyTypes.routes');
const amenityRoutes = require('./modules/amenities/amenities.routes');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/users', userRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/property-types', propertyTypeRoutes);
app.use('/api/amenities', amenityRoutes);

/**
 * @swagger
 * /:
 *   get:
 *     summary: Welcome endpoint
 *     description: Returns a welcome message for the API
 *     tags: [General]
 *     responses:
 *       200:
 *         description: Welcome message
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Welcome to Rentverse Backend API
 *                 version:
 *                   type: string
 *                   example: 1.0.0
 *                 docs:
 *                   type: string
 *                   example: Visit /docs for API documentation
 *                 database:
 *                   type: string
 *                   example: Connected to PostgreSQL via Prisma
 *                 environment:
 *                   type: string
 *                   example: development
 */
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Rentverse Backend API',
    version: '1.0.0',
    docs: 'Visit /docs for API documentation',
    database: 'Connected to PostgreSQL via Prisma',
    environment: process.env.NODE_ENV || 'development',
    cors: 'CORS configured for development',
    ngrok: process.env.NGROK_URL || 'No ngrok URL configured',
    baseUrl: process.env.BASE_URL || 'http://localhost:3005',
  });
});

/**
 * @swagger
 * /cors-test:
 *   get:
 *     summary: CORS test endpoint
 *     description: Test endpoint for CORS functionality
 *     tags: [General]
 *     responses:
 *       200:
 *         description: CORS test successful
 */
app.get('/cors-test', (req, res) => {
  res.json({
    message: 'CORS test successful!',
    origin: req.headers.origin,
    host: req.headers.host,
    forwardedHost: req.headers['x-forwarded-host'],
    forwardedProto: req.headers['x-forwarded-proto'],
    timestamp: new Date().toISOString(),
  });
});

/**
 * @swagger
 * /cors-test:
 *   post:
 *     summary: CORS POST test endpoint
 *     description: Test POST endpoint for CORS functionality
 *     tags: [General]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: CORS POST test successful
 */
app.post('/cors-test', (req, res) => {
  res.json({
    message: 'CORS POST test successful!',
    body: req.body,
    origin: req.headers.origin,
    host: req.headers.host,
    forwardedHost: req.headers['x-forwarded-host'],
    forwardedProto: req.headers['x-forwarded-proto'],
    timestamp: new Date().toISOString(),
  });
});

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     description: Returns the health status of the API and database
 *     tags: [General]
 *     responses:
 *       200:
 *         description: API is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: OK
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 database:
 *                   type: string
 *                   example: Connected
 *                 uptime:
 *                   type: number
 *                   example: 123.456
 *       503:
 *         description: Service unavailable
 */
app.get('/health', async (req, res) => {
  try {
    const { prisma } = require('./config/database');

    // Test database connection
    await prisma.$queryRaw`SELECT 1`;

    res.json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      database: 'Connected',
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
    });
  } catch (error) {
    res.status(503).json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      database: 'Disconnected',
      error: error.message,
      uptime: process.uptime(),
    });
  }
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.originalUrl}`,
    timestamp: new Date().toISOString(),
  });
});

// Global error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, _next) => {
  console.error('Global error handler:', err.stack);

  // Handle Prisma errors
  if (err.code?.startsWith('P')) {
    return res.status(400).json({
      success: false,
      error: 'Database error',
      message: 'A database error occurred',
      ...(process.env.NODE_ENV === 'development' && { details: err.message }),
    });
  }

  // Handle validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: 'Validation error',
      message: err.message,
    });
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      error: 'Authentication error',
      message: 'Invalid token',
    });
  }

  // Default error response
  res.status(err.status || 500).json({
    success: false,
    error: 'Internal Server Error',
    message:
      process.env.NODE_ENV === 'production'
        ? 'Something went wrong!'
        : err.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

module.exports = app;
