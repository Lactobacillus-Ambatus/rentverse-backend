const express = require('express');
const { body } = require('express-validator');
const { auth, authorize } = require('../../middleware/auth');
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
 *         propertyId:
 *           type: string
 *           description: Property being booked
 *         tenantId:
 *           type: string
 *           description: User who made the booking
 *         landlordId:
 *           type: string
 *           description: Property owner
 *         startDate:
 *           type: string
 *           format: date-time
 *           description: Rental start date
 *         endDate:
 *           type: string
 *           format: date-time
 *           description: Rental end date
 *         rentAmount:
 *           type: number
 *           format: decimal
 *           description: Monthly rent amount
 *         securityDeposit:
 *           type: number
 *           format: decimal
 *           description: Security deposit amount
 *         status:
 *           type: string
 *           enum: [PENDING, APPROVED, REJECTED, ACTIVE, COMPLETED]
 *           description: Booking status
 *         notes:
 *           type: string
 *           description: Booking notes/comments
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

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
 *               - rentAmount
 *             properties:
 *               propertyId:
 *                 type: string
 *                 format: uuid
 *                 description: Property to book
 *               startDate:
 *                 type: string
 *                 format: date-time
 *                 description: Rental start date
 *               endDate:
 *                 type: string
 *                 format: date-time
 *                 description: Rental end date
 *               rentAmount:
 *                 type: number
 *                 minimum: 0
 *                 description: Monthly rent amount
 *               securityDeposit:
 *                 type: number
 *                 minimum: 0
 *                 description: Security deposit (optional)
 *               notes:
 *                 type: string
 *                 description: Booking notes/comments
 *     responses:
 *       201:
 *         description: Booking created successfully
 *       400:
 *         description: Bad request or validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Property not found
 */
router.post(
  '/',
  auth,
  authorize('USER', 'ADMIN'),
  [
    body('propertyId').isUUID().withMessage('Valid property ID is required'),
    body('startDate').isISO8601().withMessage('Valid start date is required'),
    body('endDate').isISO8601().withMessage('Valid end date is required'),
    body('rentAmount')
      .isFloat({ min: 0 })
      .withMessage('Valid rent amount is required'),
    body('securityDeposit')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Security deposit must be positive'),
    body('notes')
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage('Notes cannot exceed 1000 characters'),
  ],
  bookingsController.createBooking
);

/**
 * @swagger
 * /api/bookings/my-bookings:
 *   get:
 *     summary: Get user's bookings (as tenant)
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Items per page
 *     responses:
 *       200:
 *         description: User bookings retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/my-bookings', auth, bookingsController.getUserBookings);

/**
 * @swagger
 * /api/bookings/owner-bookings:
 *   get:
 *     summary: Get owner's bookings (as landlord)
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Items per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, APPROVED, REJECTED, ACTIVE, COMPLETED]
 *         description: Filter by booking status
 *     responses:
 *       200:
 *         description: Owner bookings retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/owner-bookings', auth, bookingsController.getOwnerBookings);

/**
 * @swagger
 * /api/bookings/property/{propertyId}/booked-periods:
 *   get:
 *     summary: Get property booked periods (for calendar)
 *     tags: [Bookings]
 *     parameters:
 *       - in: path
 *         name: propertyId
 *         required: true
 *         schema:
 *           type: string
 *         description: Property ID
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Start date for query range
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: End date for query range
 *     responses:
 *       200:
 *         description: Booked periods retrieved successfully
 */
router.get(
  '/property/:propertyId/booked-periods',
  bookingsController.getPropertyBookedPeriods
);

/**
 * @swagger
 * /api/bookings/{id}:
 *   get:
 *     summary: Get booking details by ID
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Booking ID
 *     responses:
 *       200:
 *         description: Booking details retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       404:
 *         description: Booking not found
 */
router.get('/:id', auth, bookingsController.getBookingById);

/**
 * @swagger
 * /api/bookings/{id}/approve:
 *   post:
 *     summary: Approve booking (owner only)
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Booking ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               notes:
 *                 type: string
 *                 description: Optional approval notes
 *     responses:
 *       200:
 *         description: Booking approved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied or booking cannot be approved
 *       404:
 *         description: Booking not found
 *       409:
 *         description: Property no longer available for this period
 */
router.post('/:id/approve', auth, bookingsController.approveBooking);

/**
 * @swagger
 * /api/bookings/{id}/reject:
 *   post:
 *     summary: Reject booking (owner only)
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Booking ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reason
 *             properties:
 *               reason:
 *                 type: string
 *                 description: Reason for rejection (required)
 *     responses:
 *       200:
 *         description: Booking rejected successfully
 *       400:
 *         description: Rejection reason is required
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied or booking cannot be rejected
 *       404:
 *         description: Booking not found
 */
router.post('/:id/reject', auth, bookingsController.rejectBooking);

module.exports = router;
