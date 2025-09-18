const express = require('express');
const { body } = require('express-validator');
const { auth, authorize } = require('../../middleware/auth');
const propertiesController = require('./properties.controller');
const propertyViewsController = require('../propertyViews/propertyViews.controller');

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Property:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated UUID of the property
 *         code:
 *           type: string
 *           description: The unique code of the property
 *         title:
 *           type: string
 *           description: The title of the property
 *         description:
 *           type: string
 *           description: The description of the property
 *         address:
 *           type: string
 *           description: The address of the property
 *         city:
 *           type: string
 *           description: The city where the property is located
 *         state:
 *           type: string
 *           description: The state where the property is located
 *         country:
 *           type: string
 *           description: The country where the property is located
 *         zipCode:
 *           type: string
 *           description: The zip code of the property
 *         placeId:
 *           type: string
 *           description: Google Places ID
 *         latitude:
 *           type: number
 *           format: float
 *           description: Latitude coordinate
 *         longitude:
 *           type: number
 *           format: float
 *           description: Longitude coordinate
 *         mapsUrl:
 *           type: string
 *           nullable: true
 *           description: Google Maps URL generated from latitude and longitude (null if coordinates not available)
 *         price:
 *           type: number
 *           format: decimal
 *           description: The monthly rent price
 *         currencyCode:
 *           type: string
 *           description: Currency code (e.g., IDR, USD)
 *         bedrooms:
 *           type: integer
 *           description: Number of bedrooms
 *         bathrooms:
 *           type: integer
 *           description: Number of bathrooms
 *         areaSqm:
 *           type: number
 *           format: float
 *           description: Area in square meters
 *         furnished:
 *           type: boolean
 *           description: Whether the property is furnished
 *         isAvailable:
 *           type: boolean
 *           description: Whether the property is available for rent
 *         status:
 *           type: string
 *           enum: [DRAFT, PENDING_REVIEW, APPROVED, REJECTED, ARCHIVED]
 *           description: The listing status
 *         images:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of image URLs
 *         viewCount:
 *           type: integer
 *           description: Total number of times this property has been viewed
 *           example: 42
 *         averageRating:
 *           type: number
 *           format: float
 *           description: Average rating from user reviews (0-5)
 *           example: 4.2
 *         totalRatings:
 *           type: integer
 *           description: Total number of ratings/reviews for this property
 *           example: 15
 *         isFavorited:
 *           type: boolean
 *           description: Whether the current user has favorited this property (false for unauthenticated users)
 *           example: true
 *         favoriteCount:
 *           type: integer
 *           description: Total number of users who have favorited this property
 *           example: 8
 *         propertyType:
 *           $ref: '#/components/schemas/PropertyType'
 *         amenities:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Amenity'
 *           description: Array of amenities
 *         owner:
 *           $ref: '#/components/schemas/User'
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The date the property was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The date the property was last updated
 *       example:
 *         id: "123e4567-e89b-12d3-a456-426614174000"
 *         code: "APT001"
 *         title: Beautiful Downtown Apartment
 *         description: A stunning 2-bedroom apartment in the heart of the city
 *         address: 123 Main St
 *         city: New York
 *         state: NY
 *         zipCode: "10001"
 *         price: 2500.00
 *         type: APARTMENT
 *         bedrooms: 2
 *         bathrooms: 1
 *         area: 850.5
 *         isAvailable: true
 *         viewCount: 42
 *         averageRating: 4.2
 *         totalRatings: 15
 *         isFavorited: true
 *         favoriteCount: 8
 *         images: ["https://example.com/image1.jpg"]
 *         amenities: ["WiFi", "Air Conditioning", "Parking"]
 *         createdAt: 2023-01-01T00:00:00.000Z
 *         updatedAt: 2023-01-01T00:00:00.000Z
 */

/**
 * @swagger
 * tags:
 *   name: Properties
 *   description: Property management API
 */

/**
 * @swagger
 * /api/properties:
 *   get:
 *     summary: Get all properties
 *     tags: [Properties]
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
 *         description: Number of properties per page
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [APARTMENT, HOUSE, STUDIO, CONDO, VILLA, ROOM]
 *         description: Filter by property type
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *         description: Filter by city
 *       - in: query
 *         name: available
 *         schema:
 *           type: boolean
 *         description: Filter by availability
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *         description: Minimum price filter
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *         description: Maximum price filter
 *       - in: query
 *         name: bedrooms
 *         schema:
 *           type: integer
 *         description: Filter by number of bedrooms
 *     responses:
 *       200:
 *         description: List of properties
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
 *                     properties:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Property'
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
 *                     maps:
 *                       type: object
 *                       nullable: true
 *                       description: Map coordinates with average location and property count
 *                       properties:
 *                         latMean:
 *                           type: number
 *                           format: float
 *                           description: Average latitude of properties
 *                         longMean:
 *                           type: number
 *                           format: float
 *                           description: Average longitude of properties
 *                         depth:
 *                           type: integer
 *                           description: Number of properties with valid coordinates
 *                       example:
 *                         latMean: 3.46541
 *                         longMean: 101.44526
 *                         depth: 10
 */
router.get('/', propertiesController.getAllProperties);

/**
 * @swagger
 * /api/properties/featured:
 *   get:
 *     summary: Get featured properties (most recently updated properties with pagination)
 *     tags: [Properties]
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
 *           default: 8
 *         description: Number of properties per page (default 8 for featured)
 *     responses:
 *       200:
 *         description: List of featured properties with pagination
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
 *                     properties:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Property'
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
 *       500:
 *         description: Internal server error
 */
router.get('/featured', propertiesController.getFeaturedProperties);

/**
 * @swagger
 * /api/properties/favorites:
 *   get:
 *     summary: Get user's favorite properties
 *     tags: [Properties]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: User's favorite properties
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
 *                     favorites:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Property'
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
 *       401:
 *         description: Authentication required
 *       500:
 *         description: Internal server error
 */
router.get('/favorites', auth, propertyViewsController.getUserFavorites);

/**
 * @swagger
 * /api/properties/property/{code}:
 *   get:
 *     summary: Get property by code/slug (public access)
 *     tags: [Properties]
 *     parameters:
 *       - in: path
 *         name: code
 *         schema:
 *           type: string
 *         required: true
 *         description: Code/slug of the property to get
 *     responses:
 *       200:
 *         description: Property details
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
 *                     property:
 *                       $ref: '#/components/schemas/Property'
 *       404:
 *         description: Property not found
 */
router.get('/property/:code', propertiesController.getPropertyByCode);

/**
 * @swagger
 * /api/properties.geojson:
 *   get:
 *     summary: Get property data in GeoJSON format for high-performance map rendering
 *     tags: [Properties]
 *     parameters:
 *       - in: query
 *         name: bbox
 *         schema:
 *           type: string
 *         required: true
 *         description: Bounding box in format "minLng,minLat,maxLng,maxLat"
 *         example: "106.7,-6.3,106.9,-6.1"
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 1000
 *           default: 1000
 *         description: Maximum number of properties to return
 *       - in: query
 *         name: clng
 *         schema:
 *           type: number
 *         description: Center longitude for distance-based sorting
 *       - in: query
 *         name: clat
 *         schema:
 *           type: number
 *         description: Center latitude for distance-based sorting
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Search query for title or location
 *     responses:
 *       200:
 *         description: GeoJSON FeatureCollection of properties
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 type:
 *                   type: string
 *                   example: "FeatureCollection"
 *                 features:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       type:
 *                         type: string
 *                         example: "Feature"
 *                       geometry:
 *                         type: object
 *                         properties:
 *                           type:
 *                             type: string
 *                             example: "Point"
 *                           coordinates:
 *                             type: array
 *                             items:
 *                               type: number
 *                             example: [106.8, -6.2]
 *                       properties:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           code:
 *                             type: string
 *                           title:
 *                             type: string
 *                           price:
 *                             type: number
 *                           currencyCode:
 *                             type: string
 *                           priceFormatted:
 *                             type: string
 *                           bedrooms:
 *                             type: integer
 *                           bathrooms:
 *                             type: integer
 *                           areaSqm:
 *                             type: number
 *                           propertyType:
 *                             type: string
 *                           city:
 *                             type: string
 *                           furnished:
 *                             type: boolean
 *                           isAvailable:
 *                             type: boolean
 *                           thumbnail:
 *                             type: string
 *                             nullable: true
 *       400:
 *         description: Invalid bounding box parameter
 *       500:
 *         description: Internal server error
 */
router.get('/geojson', propertiesController.getGeoJSON);

/**
 * @swagger
 * /api/properties/{id}:
 *   get:
 *     summary: Get property by ID
 *     tags: [Properties]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Property ID
 *     responses:
 *       200:
 *         description: Property details
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
 *                     property:
 *                       $ref: '#/components/schemas/Property'
 *       404:
 *         description: Property not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', propertiesController.getPropertyById);

/**
 * @swagger
 * /api/properties:
 *   post:
 *     summary: Create a new property (Landlord/Admin only)
 *     tags: [Properties]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - address
 *               - city
 *               - state
 *               - zipCode
 *               - price
 *               - propertyTypeId
 *             properties:
 *               code:
 *                 type: string
 *                 description: Property code (auto-generated if not provided)
 *               title:
 *                 type: string
 *                 description: Property title
 *               description:
 *                 type: string
 *                 description: Property description
 *               address:
 *                 type: string
 *                 description: Property address
 *               city:
 *                 type: string
 *                 description: City
 *               state:
 *                 type: string
 *                 description: State/Province
 *               country:
 *                 type: string
 *                 description: Country code (default ID)
 *               zipCode:
 *                 type: string
 *                 description: Postal code
 *               placeId:
 *                 type: string
 *                 description: Google Places ID
 *               latitude:
 *                 type: number
 *                 format: float
 *                 description: Latitude coordinate
 *               longitude:
 *                 type: number
 *                 format: float
 *                 description: Longitude coordinate
 *               price:
 *                 type: number
 *                 format: decimal
 *                 description: Monthly rent price
 *               currencyCode:
 *                 type: string
 *                 description: Currency code (default IDR)
 *               propertyTypeId:
 *                 type: string
 *                 format: uuid
 *                 description: Property type ID
 *               bedrooms:
 *                 type: integer
 *                 description: Number of bedrooms
 *               bathrooms:
 *                 type: integer
 *                 description: Number of bathrooms
 *               areaSqm:
 *                 type: number
 *                 format: float
 *                 description: Area in square meters
 *               furnished:
 *                 type: boolean
 *                 description: Whether property is furnished
 *               isAvailable:
 *                 type: boolean
 *                 default: true
 *                 description: Whether property is available
 *               status:
 *                 type: string
 *                 enum: [DRAFT, PENDING_REVIEW, APPROVED, REJECTED, ARCHIVED]
 *                 description: Listing status
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of image URLs
 *               amenityIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *                 description: Array of amenity IDs
 *     responses:
 *       201:
 *         description: Property created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     property:
 *                       $ref: '#/components/schemas/Property'
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post(
  '/',
  auth,
  authorize('USER', 'ADMIN'),
  [
    body('code').optional().trim().isLength({ max: 50 }),
    body('title').notEmpty().trim(),
    body('description').optional().trim(),
    body('address').notEmpty().trim(),
    body('city').notEmpty().trim(),
    body('state').notEmpty().trim(),
    body('country').optional().trim().isLength({ max: 2 }),
    body('zipCode').notEmpty().trim(),
    body('placeId').optional().trim(),
    body('latitude').optional().isFloat({ min: -90, max: 90 }),
    body('longitude').optional().isFloat({ min: -180, max: 180 }),
    body('price').isFloat({ min: 0 }),
    body('currencyCode').optional().trim().isLength({ min: 3, max: 3 }),
    body('propertyTypeId').notEmpty().isUUID(),
    body('bedrooms').optional().isInt({ min: 0 }),
    body('bathrooms').optional().isInt({ min: 0 }),
    body('areaSqm').optional().isFloat({ min: 0 }),
    body('furnished').optional().isBoolean(),
    body('isAvailable').optional().isBoolean(),
    body('status')
      .optional()
      .isIn(['DRAFT', 'PENDING_REVIEW', 'APPROVED', 'REJECTED', 'ARCHIVED']),
    body('images').optional().isArray(),
    body('amenityIds').optional().isArray(),
    body('amenityIds.*').optional().isUUID(),
  ],
  propertiesController.createProperty
);

/**
 * @swagger
 * /api/properties/{id}:
 *   put:
 *     summary: Update property by ID
 *     tags: [Properties]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: UUID of the property to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: Property title
 *               description:
 *                 type: string
 *                 description: Property description
 *               address:
 *                 type: string
 *                 description: Property address
 *               city:
 *                 type: string
 *                 description: City
 *               state:
 *                 type: string
 *                 description: State/Province
 *               country:
 *                 type: string
 *                 description: Country code
 *               zipCode:
 *                 type: string
 *                 description: Postal code
 *               placeId:
 *                 type: string
 *                 description: Google Places ID
 *               latitude:
 *                 type: number
 *                 format: float
 *                 description: Latitude coordinate
 *               longitude:
 *                 type: number
 *                 format: float
 *                 description: Longitude coordinate
 *               price:
 *                 type: number
 *                 format: decimal
 *                 description: Monthly rent price
 *               currencyCode:
 *                 type: string
 *                 description: Currency code
 *               propertyTypeId:
 *                 type: string
 *                 format: uuid
 *                 description: Property type ID
 *               bedrooms:
 *                 type: integer
 *                 description: Number of bedrooms
 *               bathrooms:
 *                 type: integer
 *                 description: Number of bathrooms
 *               areaSqm:
 *                 type: number
 *                 format: float
 *                 description: Area in square meters
 *               furnished:
 *                 type: boolean
 *                 description: Whether property is furnished
 *               isAvailable:
 *                 type: boolean
 *                 description: Whether property is available
 *               status:
 *                 type: string
 *                 enum: [DRAFT, PENDING_REVIEW, APPROVED, REJECTED, ARCHIVED]
 *                 description: Listing status
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of image URLs
 *               amenityIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *                 description: Array of amenity IDs
 *     responses:
 *       200:
 *         description: Property updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     property:
 *                       $ref: '#/components/schemas/Property'
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Property not found
 */
router.put(
  '/:id',
  auth,
  authorize('USER', 'ADMIN'),
  [
    body('title').optional().notEmpty().trim(),
    body('description').optional().trim(),
    body('address').optional().notEmpty().trim(),
    body('city').optional().notEmpty().trim(),
    body('state').optional().notEmpty().trim(),
    body('country').optional().trim().isLength({ max: 2 }),
    body('zipCode').optional().notEmpty().trim(),
    body('placeId').optional().trim(),
    body('latitude').optional().isFloat({ min: -90, max: 90 }),
    body('longitude').optional().isFloat({ min: -180, max: 180 }),
    body('price').optional().isFloat({ min: 0 }),
    body('currencyCode').optional().trim().isLength({ min: 3, max: 3 }),
    body('propertyTypeId').optional().isUUID(),
    body('bedrooms').optional().isInt({ min: 0 }),
    body('bathrooms').optional().isInt({ min: 0 }),
    body('areaSqm').optional().isFloat({ min: 0 }),
    body('furnished').optional().isBoolean(),
    body('isAvailable').optional().isBoolean(),
    body('status')
      .optional()
      .isIn(['DRAFT', 'PENDING_REVIEW', 'APPROVED', 'REJECTED', 'ARCHIVED']),
    body('images').optional().isArray(),
    body('amenityIds').optional().isArray(),
    body('amenityIds.*').optional().isUUID(),
  ],
  propertiesController.updateProperty
);

/**
 * @swagger
 * /api/properties/{id}:
 *   delete:
 *     summary: Delete property by ID
 *     tags: [Properties]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: UUID of the property to delete
 *     responses:
 *       200:
 *         description: Property deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Property not found
 */
router.delete(
  '/:id',
  auth,
  authorize('USER', 'ADMIN'),
  propertiesController.deleteProperty
);

/**
 * @swagger
 * /api/properties/{id}/view:
 *   post:
 *     summary: Log property view for analytics
 *     tags: [Properties]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: UUID of the property to log view for
 *     security:
 *       - bearerAuth: []
 *       - {}
 *     requestBody:
 *       required: false
 *       description: View logging is automatic based on request headers
 *     responses:
 *       200:
 *         description: View logged successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "View logged successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     property:
 *                       $ref: '#/components/schemas/Property'
 *                     viewLogged:
 *                       type: boolean
 *                       description: Whether a new view was logged (false if recent duplicate)
 *                       example: true
 *       404:
 *         description: Property not found
 *       500:
 *         description: Internal server error
 */
router.post('/:id/view', propertyViewsController.logView);

/**
 * @swagger
 * /api/properties/{id}/view-stats:
 *   get:
 *     summary: Get property view statistics (Owner/Admin only)
 *     tags: [Properties]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: UUID of the property to get view stats for
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           default: 30
 *         description: Number of days to look back for recent views
 *     responses:
 *       200:
 *         description: Property view statistics
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
 *                     stats:
 *                       type: object
 *                       properties:
 *                         totalViews:
 *                           type: integer
 *                           description: Total views all time
 *                           example: 156
 *                         recentViews:
 *                           type: object
 *                           properties:
 *                             count:
 *                               type: integer
 *                               description: Views in the specified period
 *                               example: 23
 *                             period:
 *                               type: string
 *                               description: The period for recent views
 *                               example: "30 days"
 *                         uniqueViewers:
 *                           type: integer
 *                           description: Number of unique registered users who viewed
 *                           example: 18
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Property not found
 *       500:
 *         description: Internal server error
 */
router.get(
  '/:id/view-stats',
  auth,
  authorize('USER', 'ADMIN'),
  propertyViewsController.getViewStats
);

/**
 * @swagger
 * /api/properties/{id}/rating:
 *   post:
 *     summary: Create or update property rating (Authenticated users only)
 *     tags: [Properties]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: UUID of the property to rate
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - rating
 *             properties:
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 description: Rating from 1 to 5 stars
 *                 example: 4
 *               comment:
 *                 type: string
 *                 description: Optional review comment
 *                 example: "Great property with excellent amenities!"
 *     responses:
 *       200:
 *         description: Rating submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Rating submitted successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     rating:
 *                       type: object
 *                       description: The created/updated rating
 *       400:
 *         description: Bad request (invalid rating value)
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Property not found
 *       500:
 *         description: Internal server error
 */
router.post(
  '/:id/rating',
  auth,
  [
    body('rating')
      .isInt({ min: 1, max: 5 })
      .withMessage('Rating must be between 1 and 5'),
    body('comment')
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage('Comment must not exceed 1000 characters'),
  ],
  propertyViewsController.createOrUpdateRating
);

/**
 * @swagger
 * /api/properties/{id}/rating:
 *   delete:
 *     summary: Delete user's rating for property (Authenticated users only)
 *     tags: [Properties]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: UUID of the property to delete rating from
 *     responses:
 *       200:
 *         description: Rating deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Rating deleted successfully"
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Property or rating not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id/rating', auth, propertyViewsController.deleteRating);

/**
 * @swagger
 * /api/properties/{id}/ratings:
 *   get:
 *     summary: Get property ratings with pagination
 *     tags: [Properties]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: UUID of the property to get ratings for
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
 *         description: Number of ratings per page
 *     responses:
 *       200:
 *         description: Property ratings with pagination
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
 *                     ratings:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           rating:
 *                             type: integer
 *                             minimum: 1
 *                             maximum: 5
 *                           comment:
 *                             type: string
 *                             nullable: true
 *                           ratedAt:
 *                             type: string
 *                             format: date-time
 *                           user:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                               name:
 *                                 type: string
 *                               firstName:
 *                                 type: string
 *                               lastName:
 *                                 type: string
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
 *       404:
 *         description: Property not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id/ratings', propertyViewsController.getPropertyRatings);

/**
 * @swagger
 * /api/properties/{id}/my-rating:
 *   get:
 *     summary: Get current user's rating for property (Authenticated users only)
 *     tags: [Properties]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: UUID of the property to get user's rating for
 *     responses:
 *       200:
 *         description: User's rating for the property
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
 *                     rating:
 *                       type: object
 *                       nullable: true
 *                       description: User's rating or null if not rated yet
 *                       properties:
 *                         id:
 *                           type: string
 *                         rating:
 *                           type: integer
 *                           minimum: 1
 *                           maximum: 5
 *                         comment:
 *                           type: string
 *                           nullable: true
 *                         ratedAt:
 *                           type: string
 *                           format: date-time
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Property not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id/my-rating', auth, propertyViewsController.getUserRating);

/**
 * @swagger
 * /api/properties/{id}/rating-stats:
 *   get:
 *     summary: Get detailed rating statistics for property
 *     tags: [Properties]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: UUID of the property to get rating stats for
 *     responses:
 *       200:
 *         description: Detailed rating statistics
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
 *                     stats:
 *                       type: object
 *                       properties:
 *                         averageRating:
 *                           type: number
 *                           format: float
 *                           description: Average rating (0-5)
 *                           example: 4.2
 *                         totalRatings:
 *                           type: integer
 *                           description: Total number of ratings
 *                           example: 15
 *                         ratingDistribution:
 *                           type: object
 *                           description: Count of ratings for each star level
 *                           properties:
 *                             "1":
 *                               type: integer
 *                               example: 1
 *                             "2":
 *                               type: integer
 *                               example: 0
 *                             "3":
 *                               type: integer
 *                               example: 2
 *                             "4":
 *                               type: integer
 *                               example: 5
 *                             "5":
 *                               type: integer
 *                               example: 7
 *       404:
 *         description: Property not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id/rating-stats', propertyViewsController.getRatingStats);

// ==================== FAVORITE ROUTES ====================

/**
 * @swagger
 * /api/properties/{id}/favorite:
 *   post:
 *     summary: Toggle property favorite status (add/remove from favorites)
 *     tags: [Properties]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: UUID of the property to toggle favorite status
 *     responses:
 *       200:
 *         description: Favorite status toggled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                   description: Success message
 *                   example: "Property added to favorites"
 *                 data:
 *                   type: object
 *                   properties:
 *                     action:
 *                       type: string
 *                       enum: [added, removed]
 *                       description: Action performed
 *                       example: "added"
 *                     isFavorited:
 *                       type: boolean
 *                       description: Current favorite status
 *                       example: true
 *                     favoriteCount:
 *                       type: integer
 *                       description: Total number of users who favorited this property
 *                       example: 12
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Property not found
 *       500:
 *         description: Internal server error
 */
router.post('/:id/favorite', auth, propertyViewsController.toggleFavorite);

/**
 * @swagger
 * /api/properties/{id}/favorite-status:
 *   get:
 *     summary: Get property favorite status for current user
 *     tags: [Properties]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: UUID of the property to check favorite status
 *     responses:
 *       200:
 *         description: Property favorite status
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
 *                     propertyId:
 *                       type: string
 *                       description: Property UUID
 *                       example: "123e4567-e89b-12d3-a456-426614174000"
 *                     isFavorited:
 *                       type: boolean
 *                       description: Whether this property is favorited by current user
 *                       example: true
 *                     favoriteCount:
 *                       type: integer
 *                       description: Total number of users who favorited this property
 *                       example: 12
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Property not found
 *       500:
 *         description: Internal server error
 */
router.get(
  '/:id/favorite-status',
  auth,
  propertyViewsController.getFavoriteStatus
);

/**
 * @swagger
 * /api/properties/{id}/favorite-stats:
 *   get:
 *     summary: Get property favorite statistics (public)
 *     tags: [Properties]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: UUID of the property to get favorite stats
 *     responses:
 *       200:
 *         description: Property favorite statistics
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
 *                     propertyId:
 *                       type: string
 *                       description: Property UUID
 *                       example: "123e4567-e89b-12d3-a456-426614174000"
 *                     favoriteCount:
 *                       type: integer
 *                       description: Total number of users who favorited this property
 *                       example: 12
 *                     recentFavorites:
 *                       type: array
 *                       description: Recent users who favorited this property (limited info)
 *                       items:
 *                         type: object
 *                         properties:
 *                           userId:
 *                             type: string
 *                           username:
 *                             type: string
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *       404:
 *         description: Property not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id/favorite-stats', propertyViewsController.getFavoriteStats);

module.exports = router;
