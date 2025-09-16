const express = require('express');
const { body } = require('express-validator');
const { auth, authorize } = require('../../middleware/auth');
const propertiesController = require('./properties.controller');

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
 * /properties.geojson:
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
 * /properties/{id}:
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
  authorize('LANDLORD', 'ADMIN'),
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
  authorize('LANDLORD', 'ADMIN'),
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
  authorize('LANDLORD', 'ADMIN'),
  propertiesController.deleteProperty
);

module.exports = router;
