const express = require('express');
const { body, validationResult } = require('express-validator');
const { prisma } = require('../config/database');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Property:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: The auto-generated id of the property
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
 *         zipCode:
 *           type: string
 *           description: The zip code of the property
 *         price:
 *           type: number
 *           format: decimal
 *           description: The monthly rent price
 *         type:
 *           type: string
 *           enum: [APARTMENT, HOUSE, STUDIO, CONDO, VILLA, ROOM]
 *           description: The type of property
 *         bedrooms:
 *           type: integer
 *           description: Number of bedrooms
 *         bathrooms:
 *           type: integer
 *           description: Number of bathrooms
 *         area:
 *           type: number
 *           format: float
 *           description: Area in square feet
 *         isAvailable:
 *           type: boolean
 *           description: Whether the property is available for rent
 *         images:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of image URLs
 *         amenities:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of amenities
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The date the property was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The date the property was last updated
 *         owner:
 *           $ref: '#/components/schemas/User'
 *       example:
 *         id: "123e4567-e89b-12d3-a456-426614174000"
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
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const { type, city, available, minPrice, maxPrice, bedrooms } = req.query;

    const where = {};

    if (type) where.type = type;
    if (city) where.city = { contains: city, mode: 'insensitive' };
    if (available !== undefined) where.isAvailable = available === 'true';
    if (bedrooms) where.bedrooms = parseInt(bedrooms);

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }

    const [properties, total] = await Promise.all([
      prisma.property.findMany({
        where,
        skip,
        take: limit,
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.property.count({ where }),
    ]);

    const pages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: {
        properties,
        pagination: {
          page,
          limit,
          total,
          pages,
        },
      },
    });
  } catch (error) {
    console.error('Get properties error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

/**
 * @swagger
 * /api/properties/{id}:
 *   get:
 *     summary: Get property by ID
 *     tags: [Properties]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: UUID of the property to get
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
router.get('/:id', async (req, res) => {
  try {
    const propertyId = req.params.id;

    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found',
      });
    }

    res.json({
      success: true,
      data: { property },
    });
  } catch (error) {
    console.error('Get property error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

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
 *               - type
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               address:
 *                 type: string
 *               city:
 *                 type: string
 *               state:
 *                 type: string
 *               zipCode:
 *                 type: string
 *               price:
 *                 type: number
 *               type:
 *                 type: string
 *                 enum: [APARTMENT, HOUSE, STUDIO, CONDO, VILLA, ROOM]
 *               bedrooms:
 *                 type: integer
 *               bathrooms:
 *                 type: integer
 *               area:
 *                 type: number
 *               isAvailable:
 *                 type: boolean
 *                 default: true
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *               amenities:
 *                 type: array
 *                 items:
 *                   type: string
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
    body('title').notEmpty().trim(),
    body('address').notEmpty().trim(),
    body('city').notEmpty().trim(),
    body('state').notEmpty().trim(),
    body('zipCode').notEmpty().trim(),
    body('price').isFloat({ min: 0 }),
    body('type').isIn([
      'APARTMENT',
      'HOUSE',
      'STUDIO',
      'CONDO',
      'VILLA',
      'ROOM',
    ]),
    body('bedrooms').optional().isInt({ min: 0 }),
    body('bathrooms').optional().isInt({ min: 0 }),
    body('area').optional().isFloat({ min: 0 }),
    body('isAvailable').optional().isBoolean(),
    body('images').optional().isArray(),
    body('amenities').optional().isArray(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array(),
        });
      }

      const {
        title,
        description,
        address,
        city,
        state,
        zipCode,
        price,
        type,
        bedrooms = 0,
        bathrooms = 0,
        area,
        isAvailable = true,
        images = [],
        amenities = [],
      } = req.body;

      const property = await prisma.property.create({
        data: {
          title,
          description,
          address,
          city,
          state,
          zipCode,
          price: parseFloat(price),
          type,
          bedrooms,
          bathrooms,
          area: area ? parseFloat(area) : null,
          isAvailable,
          images,
          amenities,
          ownerId: req.user.id,
        },
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
        },
      });

      res.status(201).json({
        success: true,
        message: 'Property created successfully',
        data: { property },
      });
    } catch (error) {
      console.error('Create property error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }
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
 *               description:
 *                 type: string
 *               address:
 *                 type: string
 *               city:
 *                 type: string
 *               state:
 *                 type: string
 *               zipCode:
 *                 type: string
 *               price:
 *                 type: number
 *               type:
 *                 type: string
 *                 enum: [APARTMENT, HOUSE, STUDIO, CONDO, VILLA, ROOM]
 *               bedrooms:
 *                 type: integer
 *               bathrooms:
 *                 type: integer
 *               area:
 *                 type: number
 *               isAvailable:
 *                 type: boolean
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *               amenities:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Property updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Property not found
 */
router.put('/:id', auth, authorize('LANDLORD', 'ADMIN'), async (req, res) => {
  try {
    const propertyId = req.params.id;

    // Check if property exists and if user owns it (unless admin)
    const existingProperty = await prisma.property.findUnique({
      where: { id: propertyId },
    });

    if (!existingProperty) {
      return res.status(404).json({
        success: false,
        message: 'Property not found',
      });
    }

    // Only property owner or admin can update
    if (req.user.role !== 'ADMIN' && existingProperty.ownerId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only update your own properties.',
      });
    }

    const updateData = {};
    const allowedFields = [
      'title',
      'description',
      'address',
      'city',
      'state',
      'zipCode',
      'price',
      'type',
      'bedrooms',
      'bathrooms',
      'area',
      'isAvailable',
      'images',
      'amenities',
    ];

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        if (field === 'price' || field === 'area') {
          updateData[field] = parseFloat(req.body[field]);
        } else {
          updateData[field] = req.body[field];
        }
      }
    }

    const property = await prisma.property.update({
      where: { id: propertyId },
      data: updateData,
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    res.json({
      success: true,
      message: 'Property updated successfully',
      data: { property },
    });
  } catch (error) {
    console.error('Update property error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

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
  async (req, res) => {
    try {
      const propertyId = req.params.id;

      // Check if property exists and if user owns it (unless admin)
      const existingProperty = await prisma.property.findUnique({
        where: { id: propertyId },
      });

      if (!existingProperty) {
        return res.status(404).json({
          success: false,
          message: 'Property not found',
        });
      }

      // Only property owner or admin can delete
      if (
        req.user.role !== 'ADMIN' &&
        existingProperty.ownerId !== req.user.id
      ) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only delete your own properties.',
        });
      }

      await prisma.property.delete({
        where: { id: propertyId },
      });

      res.json({
        success: true,
        message: 'Property deleted successfully',
      });
    } catch (error) {
      console.error('Delete property error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }
);

module.exports = router;
