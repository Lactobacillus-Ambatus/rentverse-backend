const swaggerJsdoc = require('swagger-jsdoc');

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Rentverse Backend API',
      version: '1.0.0',
      description:
        'API documentation for Rentverse backend application with Prisma and PostgreSQL',
      contact: {
        name: 'API Support',
        email: 'support@rentverse.com',
      },
      license: {
        name: 'ISC',
        url: 'https://opensource.org/licenses/ISC',
      },
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3000}`,
        description: 'Development server',
      },
      {
        url: 'https://api.rentverse.com',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/routes/*.js', './src/modules/*/*.routes.js', './src/app.js'],
  // Path to the API docs
};

const specs = swaggerJsdoc(swaggerOptions);

module.exports = specs;
