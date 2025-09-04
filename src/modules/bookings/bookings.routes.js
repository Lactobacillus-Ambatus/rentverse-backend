const express = require('express');
const { body } = require('express-validator');
const { auth } = require('../../middleware/auth');
const bookingsController = require('./bookings.controller');

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Booking:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated UUID of the booking
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
 *         id: "123e4567-e89b-12d3-a456-426614174000"
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
 *           type: string
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
router.get('/', auth, bookingsController.getAllBookings);

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
 *           type: string
 *         required: true
 *         description: UUID of the booking to get
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
router.get('/:id', auth, bookingsController.getBookingById);

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
 *                 type: string
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
router.post(
  '/',
  auth,
  [
    body('propertyId').notEmpty().trim(),
    body('startDate').isISO8601(),
    body('endDate').isISO8601(),
    body('notes').optional().trim(),
  ],
  bookingsController.createBooking
);

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
 *           type: string
 *         required: true
 *         description: UUID of the booking to update
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
router.patch(
  '/:id/status',
  auth,
  [
    body('status').isIn(['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED']),
    body('notes').optional().trim(),
  ],
  bookingsController.updateBookingStatus
);

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
 *           type: string
 *         required: true
 *         description: UUID of the booking to delete
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
router.delete('/:id', auth, bookingsController.deleteBooking);

module.exports = router;
