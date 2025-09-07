const express = require('express');
const { body } = require('express-validator');
const { auth, authorize } = require('../../middleware/auth');
const projectsController = require('./projects.controller');

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Project:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated UUID of the project
 *         name:
 *           type: string
 *           description: The name of the project
 *         developer:
 *           type: string
 *           description: The developer name
 *         description:
 *           type: string
 *           description: The project description
 *         address:
 *           type: string
 *           description: The project address
 *         city:
 *           type: string
 *           description: The city where project is located
 *         state:
 *           type: string
 *           description: The state where project is located
 *         country:
 *           type: string
 *           description: The country code (default: ID)
 *         postalCode:
 *           type: string
 *           description: The postal code
 *         placeId:
 *           type: string
 *           description: Google Places ID
 *         latitude:
 *           type: number
 *           description: Latitude coordinate
 *         longitude:
 *           type: number
 *           description: Longitude coordinate
 *         defaultBedrooms:
 *           type: integer
 *           description: Default number of bedrooms
 *         defaultBathrooms:
 *           type: integer
 *           description: Default number of bathrooms
 *         defaultSizeSqm:
 *           type: number
 *           description: Default size in square meters
 *         defaultPrice:
 *           type: number
 *           description: Default price
 *         defaultAmenities:
 *           type: array
 *           items:
 *             type: string
 *           description: Default amenities list
 *         defaultPropertyTypeId:
 *           type: string
 *           description: Default property type ID
 *         sampleDataUrl:
 *           type: string
 *           description: Sample data URL
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *       example:
 *         id: "123e4567-e89b-12d3-a456-426614174000"
 *         name: "Penang Pearl City"
 *         developer: "IJM Land Berhad"
 *         description: "Premium mixed development in the heart of Penang"
 *         address: "Jalan Burma, George Town"
 *         city: "George Town"
 *         state: "Penang"
 *         country: "MY"
 *         postalCode: "10050"
 *         latitude: 5.4141
 *         longitude: 100.3288
 */

/**
 * @swagger
 * tags:
 *   name: Projects
 *   description: Project management API
 */

/**
 * @swagger
 * /api/projects:
 *   get:
 *     summary: Get all projects
 *     tags: [Projects]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of projects per page
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *         description: Filter by city
 *       - in: query
 *         name: state
 *         schema:
 *           type: string
 *         description: Filter by state
 *       - in: query
 *         name: country
 *         schema:
 *           type: string
 *         description: Filter by country
 *       - in: query
 *         name: developer
 *         schema:
 *           type: string
 *         description: Filter by developer
 *       - in: query
 *         name: propertyTypeId
 *         schema:
 *           type: string
 *         description: Filter by property type
 *     responses:
 *       200:
 *         description: List of projects
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     projects:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Project'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: integer
 *                         limit:
 *                           type: integer
 *                         total:
 *                           type: integer
 *                         pages:
 *                           type: integer
 */
router.get('/', projectsController.getAllProjects);

/**
 * @swagger
 * /api/projects/statistics:
 *   get:
 *     summary: Get project statistics
 *     tags: [Projects]
 *     responses:
 *       200:
 *         description: Project statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     statistics:
 *                       type: object
 *                       properties:
 *                         totalProjects:
 *                           type: integer
 *                         totalProperties:
 *                           type: integer
 *                         averagePrice:
 *                           type: number
 *                         projectsByCountry:
 *                           type: array
 *                         projectsByPropertyType:
 *                           type: array
 */
router.get('/statistics', projectsController.getProjectStatistics);

/**
 * @swagger
 * /api/projects/location:
 *   get:
 *     summary: Get projects by location
 *     tags: [Projects]
 *     parameters:
 *       - in: query
 *         name: city
 *         required: true
 *         schema:
 *           type: string
 *         description: City name
 *       - in: query
 *         name: state
 *         required: true
 *         schema:
 *           type: string
 *         description: State name
 *       - in: query
 *         name: country
 *         schema:
 *           type: string
 *           default: "MY"
 *         description: Country code
 *     responses:
 *       200:
 *         description: Projects in the specified location
 *       400:
 *         description: Missing required parameters
 */
router.get('/location', projectsController.getProjectsByLocation);

/**
 * @swagger
 * /api/projects/nearby:
 *   get:
 *     summary: Get nearby projects
 *     tags: [Projects]
 *     parameters:
 *       - in: query
 *         name: latitude
 *         required: true
 *         schema:
 *           type: number
 *         description: Latitude coordinate
 *       - in: query
 *         name: longitude
 *         required: true
 *         schema:
 *           type: number
 *         description: Longitude coordinate
 *       - in: query
 *         name: radius
 *         schema:
 *           type: number
 *           default: 10
 *         description: Search radius in kilometers
 *     responses:
 *       200:
 *         description: Nearby projects
 *       400:
 *         description: Invalid coordinates
 */
router.get('/nearby', projectsController.getNearbyProjects);

/**
 * @swagger
 * /api/projects/{id}:
 *   get:
 *     summary: Get project by ID
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: UUID of the project to get
 *     responses:
 *       200:
 *         description: Project details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     project:
 *                       $ref: '#/components/schemas/Project'
 *       404:
 *         description: Project not found
 */
router.get('/:id', projectsController.getProjectById);

/**
 * @swagger
 * /api/projects:
 *   post:
 *     summary: Create a new project (Admin only)
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 description: Project name
 *               developer:
 *                 type: string
 *                 description: Developer name
 *               description:
 *                 type: string
 *                 description: Project description
 *               address:
 *                 type: string
 *                 description: Project address
 *               city:
 *                 type: string
 *                 description: City
 *               state:
 *                 type: string
 *                 description: State
 *               country:
 *                 type: string
 *                 default: "MY"
 *                 description: Country code
 *               postalCode:
 *                 type: string
 *                 description: Postal code
 *               placeId:
 *                 type: string
 *                 description: Google Places ID
 *               latitude:
 *                 type: number
 *                 description: Latitude
 *               longitude:
 *                 type: number
 *                 description: Longitude
 *               defaultBedrooms:
 *                 type: integer
 *                 minimum: 0
 *                 description: Default bedrooms
 *               defaultBathrooms:
 *                 type: integer
 *                 minimum: 0
 *                 description: Default bathrooms
 *               defaultSizeSqm:
 *                 type: number
 *                 minimum: 0
 *                 description: Default size in sqm
 *               defaultPrice:
 *                 type: number
 *                 minimum: 0
 *                 description: Default price
 *               defaultAmenities:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Default amenities
 *               defaultPropertyTypeId:
 *                 type: string
 *                 description: Default property type ID
 *               sampleDataUrl:
 *                 type: string
 *                 description: Sample data URL
 *             example:
 *               name: "Penang Pearl City"
 *               developer: "IJM Land Berhad"
 *               description: "Premium mixed development"
 *               address: "Jalan Burma, George Town"
 *               city: "George Town"
 *               state: "Penang"
 *               country: "MY"
 *               latitude: 5.4141
 *               longitude: 100.3288
 *     responses:
 *       201:
 *         description: Project created successfully
 *       400:
 *         description: Validation errors
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       409:
 *         description: Project with this name already exists
 */
router.post(
  '/',
  auth,
  authorize('ADMIN'),
  [
    body('name')
      .trim()
      .notEmpty()
      .isLength({ min: 2 })
      .withMessage('Project name must be at least 2 characters long'),
    body('developer').optional().trim(),
    body('description').optional().trim(),
    body('address').optional().trim(),
    body('city').optional().trim(),
    body('state').optional().trim(),
    body('country')
      .optional()
      .trim()
      .isLength({ min: 2, max: 3 })
      .withMessage('Country code must be 2-3 characters'),
    body('postalCode').optional().trim(),
    body('placeId').optional().trim(),
    body('latitude')
      .optional()
      .isFloat({ min: -90, max: 90 })
      .withMessage('Latitude must be between -90 and 90'),
    body('longitude')
      .optional()
      .isFloat({ min: -180, max: 180 })
      .withMessage('Longitude must be between -180 and 180'),
    body('defaultBedrooms')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Default bedrooms must be a non-negative integer'),
    body('defaultBathrooms')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Default bathrooms must be a non-negative integer'),
    body('defaultSizeSqm')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Default size must be a positive number'),
    body('defaultPrice')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Default price must be a positive number'),
    body('defaultAmenities')
      .optional()
      .isArray()
      .withMessage('Default amenities must be an array'),
    body('defaultPropertyTypeId')
      .optional()
      .isUUID()
      .withMessage('Property type ID must be a valid UUID'),
    body('sampleDataUrl')
      .optional()
      .isURL()
      .withMessage('Sample data URL must be a valid URL'),
  ],
  projectsController.createProject
);

/**
 * @swagger
 * /api/projects/{id}:
 *   put:
 *     summary: Update project by ID (Admin only)
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: UUID of the project to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *               developer:
 *                 type: string
 *               description:
 *                 type: string
 *               address:
 *                 type: string
 *               city:
 *                 type: string
 *               state:
 *                 type: string
 *               country:
 *                 type: string
 *               postalCode:
 *                 type: string
 *               latitude:
 *                 type: number
 *               longitude:
 *                 type: number
 *               defaultBedrooms:
 *                 type: integer
 *               defaultBathrooms:
 *                 type: integer
 *               defaultSizeSqm:
 *                 type: number
 *               defaultPrice:
 *                 type: number
 *               defaultAmenities:
 *                 type: array
 *                 items:
 *                   type: string
 *               defaultPropertyTypeId:
 *                 type: string
 *               sampleDataUrl:
 *                 type: string
 *     responses:
 *       200:
 *         description: Project updated successfully
 *       400:
 *         description: Validation errors
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Project not found
 *       409:
 *         description: Project with this name already exists
 */
router.put(
  '/:id',
  auth,
  authorize('ADMIN'),
  [
    body('name')
      .optional()
      .trim()
      .isLength({ min: 2 })
      .withMessage('Project name must be at least 2 characters long'),
    body('developer').optional().trim(),
    body('description').optional().trim(),
    body('address').optional().trim(),
    body('city').optional().trim(),
    body('state').optional().trim(),
    body('country')
      .optional()
      .trim()
      .isLength({ min: 2, max: 3 })
      .withMessage('Country code must be 2-3 characters'),
    body('postalCode').optional().trim(),
    body('placeId').optional().trim(),
    body('latitude')
      .optional()
      .isFloat({ min: -90, max: 90 })
      .withMessage('Latitude must be between -90 and 90'),
    body('longitude')
      .optional()
      .isFloat({ min: -180, max: 180 })
      .withMessage('Longitude must be between -180 and 180'),
    body('defaultBedrooms')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Default bedrooms must be a non-negative integer'),
    body('defaultBathrooms')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Default bathrooms must be a non-negative integer'),
    body('defaultSizeSqm')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Default size must be a positive number'),
    body('defaultPrice')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Default price must be a positive number'),
    body('defaultAmenities')
      .optional()
      .isArray()
      .withMessage('Default amenities must be an array'),
    body('defaultPropertyTypeId')
      .optional()
      .isUUID()
      .withMessage('Property type ID must be a valid UUID'),
    body('sampleDataUrl')
      .optional()
      .isURL()
      .withMessage('Sample data URL must be a valid URL'),
  ],
  projectsController.updateProject
);

/**
 * @swagger
 * /api/projects/{id}:
 *   delete:
 *     summary: Delete project by ID (Admin only)
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: UUID of the project to delete
 *     responses:
 *       200:
 *         description: Project deleted successfully
 *       400:
 *         description: Cannot delete project with properties
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Project not found
 */
router.delete(
  '/:id',
  auth,
  authorize('ADMIN'),
  projectsController.deleteProject
);

module.exports = router;
