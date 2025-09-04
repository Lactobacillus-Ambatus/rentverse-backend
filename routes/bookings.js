const express = require('express');
const { body, validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

/**
 * @swagger
 * components:
 *   schemas:
 *     Booking:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: The auto-generated id of the booking
 *         startDate:
 *           type: string
 *           format: date-time
 *           description: The start date of the booking
 *         endDate:
 *           type: string
 *           format: date-time
 *           description: The end date of the booking
 *         totalPrice:
 *           type: number
 *           format: decimal
 *           description: The total price of the booking
 *         status:
 *           type: string
 *           enum: [PENDING, CONFIRMED, CANCELLED, COMPLETED]
 *           description: The status of the booking
 *         notes:
 *           type: string
 *           description: Additional notes for the booking
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The date the booking was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The date the booking was last updated
 *         user:
 *           $ref: '#/components/schemas/User'
 *         property:
 *           $ref: '#/components/schemas/Property'
 *       example:
 *         id: 1
 *         startDate: 2024-01-01T00:00:00.000Z
 *         endDate: 2024-12-31T00:00:00.000Z
 *         totalPrice: 30000.00
 *         status: CONFIRMED
 *         notes: Long-term rental agreement
 *         createdAt: 2023-01-01T00:00:00.000Z
 *         updatedAt: 2023-01-01T00:00:00.000Z
 */

/**
 * @swagger
 * tags:
 *   name: Bookings
 *   description: Booking management API
 */

/**
 * @swagger
 * /api/bookings:
 *   get:
 *     summary: Get bookings
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
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
 *         description: Number of bookings per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, CONFIRMED, CANCELLED, COMPLETED]
 *         description: Filter by booking status
 *       - in: query
 *         name: propertyId
 *         schema:
 *           type: integer
 *         description: Filter by property ID
 *     responses:
 *       200:
 *         description: List of bookings
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
 *                     bookings:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Booking'
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
 *         description: Unauthorized
 */
router.get('/', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const { status, propertyId } = req.query;

    const where = {};
    
    // Regular users can only see their own bookings
    // Landlords can see bookings for their properties
    // Admins can see all bookings
    if (req.user.role === 'USER') {
      where.userId = req.user.id;
    } else if (req.user.role === 'LANDLORD') {
      where.OR = [
        { userId: req.user.id }, // Their own bookings
        { property: { ownerId: req.user.id } }, // Bookings for their properties
      ];
    }
    // Admin has no restrictions

    if (status) where.status = status;
    if (propertyId) where.propertyId = parseInt(propertyId);

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
          property: {
            select: {
              id: true,
              title: true,
              address: true,
              city: true,
              state: true,
              price: true,
              type: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.booking.count({ where }),
    ]);

    const pages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: {
        bookings,
        pagination: {
          page,
          limit,
          total,
          pages,
        },
      },
    });
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

/**
 * @swagger
 * /api/bookings/{id}:
 *   get:
 *     summary: Get booking by ID
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Numeric ID of the booking to get
 *     responses:
 *       200:
 *         description: Booking details
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
 *                     booking:
 *                       $ref: '#/components/schemas/Booking'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Booking not found
 */
router.get('/:id', auth, async (req, res) => {
  try {
    const bookingId = parseInt(req.params.id);

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        property: {
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
        },
      },
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    // Check access permissions
    const hasAccess = req.user.role === 'ADMIN' || 
                     booking.userId === req.user.id || 
                     booking.property.ownerId === req.user.id;

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    res.json({
      success: true,
      data: { booking },
    });
  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

/**
 * @swagger
 * /api/bookings:
 *   post:
 *     summary: Create a new booking
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - propertyId
 *               - startDate
 *               - endDate
 *             properties:
 *               propertyId:
 *                 type: integer
 *               startDate:
 *                 type: string
 *                 format: date-time
 *               endDate:
 *                 type: string
 *                 format: date-time
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Booking created successfully
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
 *                     booking:
 *                       $ref: '#/components/schemas/Booking'
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Property not found
 */
router.post('/', auth, [
  body('propertyId').isInt({ min: 1 }),
  body('startDate').isISO8601(),
  body('endDate').isISO8601(),
  body('notes').optional().trim(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { propertyId, startDate, endDate, notes } = req.body;

    // Check if property exists and is available
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
    });

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found',
      });
    }

    if (!property.isAvailable) {
      return res.status(400).json({
        success: false,
        message: 'Property is not available for booking',
      });
    }

    // Check if dates are valid
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start >= end) {
      return res.status(400).json({
        success: false,
        message: 'End date must be after start date',
      });
    }

    if (start < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Start date cannot be in the past',
      });
    }

    // Check for overlapping bookings
    const overlappingBooking = await prisma.booking.findFirst({
      where: {
        propertyId,
        status: { in: ['PENDING', 'CONFIRMED'] },
        OR: [
          {
            startDate: { lte: end },
            endDate: { gte: start },
          },
        ],
      },
    });

    if (overlappingBooking) {
      return res.status(400).json({
        success: false,
        message: 'Property is already booked for the selected dates',
      });
    }

    // Calculate total price (assuming monthly rent for now)
    const months = Math.ceil((end - start) / (1000 * 60 * 60 * 24 * 30));
    const totalPrice = property.price * months;

    const booking = await prisma.booking.create({
      data: {
        propertyId,
        userId: req.user.id,
        startDate: start,
        endDate: end,
        totalPrice,
        notes: notes || null,
        status: 'PENDING',
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        property: {
          select: {
            id: true,
            title: true,
            address: true,
            city: true,
            state: true,
            price: true,
            type: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: { booking },
    });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

/**
 * @swagger
 * /api/bookings/{id}/status:
 *   patch:
 *     summary: Update booking status (Property owner/Admin only)
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Numeric ID of the booking to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [PENDING, CONFIRMED, CANCELLED, COMPLETED]
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Booking status updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Booking not found
 */
router.patch('/:id/status', auth, [
  body('status').isIn(['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED']),
  body('notes').optional().trim(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const bookingId = parseInt(req.params.id);
    const { status, notes } = req.body;

    // Get booking with property info
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { property: true },
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    // Only property owner or admin can update booking status
    if (req.user.role !== 'ADMIN' && booking.property.ownerId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only property owner or admin can update booking status.',
      });
    }

    const updateData = { status };
    if (notes) updateData.notes = notes;

    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        property: {
          select: {
            id: true,
            title: true,
            address: true,
            city: true,
            state: true,
            price: true,
            type: true,
          },
        },
      },
    });

    res.json({
      success: true,
      message: 'Booking status updated successfully',
      data: { booking: updatedBooking },
    });
  } catch (error) {
    console.error('Update booking status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

/**
 * @swagger
 * /api/bookings/{id}:
 *   delete:
 *     summary: Cancel/Delete booking
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Numeric ID of the booking to delete
 *     responses:
 *       200:
 *         description: Booking cancelled successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Booking not found
 */
router.delete('/:id', auth, async (req, res) => {
  try {
    const bookingId = parseInt(req.params.id);

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { property: true },
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    // Users can cancel their own bookings, property owners and admins can cancel any booking for their properties
    const canCancel = req.user.role === 'ADMIN' || 
                     booking.userId === req.user.id || 
                     booking.property.ownerId === req.user.id;

    if (!canCancel) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    // Instead of deleting, update status to CANCELLED
    await prisma.booking.update({
      where: { id: bookingId },
      data: { status: 'CANCELLED' },
    });

    res.json({
      success: true,
      message: 'Booking cancelled successfully',
    });
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

module.exports = router;
