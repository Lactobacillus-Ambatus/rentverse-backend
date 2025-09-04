const bookingsService = require('./bookings.service');
const { validationResult } = require('express-validator');

class BookingsController {
  async getAllBookings(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      const filters = {
        status: req.query.status,
        propertyId: req.query.propertyId,
      };

      const result = await bookingsService.getAllBookings(
        page,
        limit,
        filters,
        req.user
      );

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error('Get bookings error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  async getBookingById(req, res) {
    try {
      const bookingId = req.params.id;
      const booking = await bookingsService.getBookingById(bookingId, req.user);

      res.json({
        success: true,
        data: { booking },
      });
    } catch (error) {
      console.error('Get booking error:', error);

      if (error.message === 'Booking not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }

      if (error.message.includes('Access denied')) {
        return res.status(403).json({
          success: false,
          message: error.message,
        });
      }

      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  async createBooking(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array(),
        });
      }

      const booking = await bookingsService.createBooking(
        req.body,
        req.user.id
      );

      res.status(201).json({
        success: true,
        message: 'Booking created successfully',
        data: { booking },
      });
    } catch (error) {
      console.error('Create booking error:', error);

      if (
        error.message.includes('Property not found') ||
        error.message.includes('not available') ||
        error.message.includes('date') ||
        error.message.includes('already booked')
      ) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }

      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  async updateBookingStatus(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array(),
        });
      }

      const bookingId = req.params.id;
      const booking = await bookingsService.updateBookingStatus(
        bookingId,
        req.body,
        req.user
      );

      res.json({
        success: true,
        message: 'Booking status updated successfully',
        data: { booking },
      });
    } catch (error) {
      console.error('Update booking status error:', error);

      if (error.message === 'Booking not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }

      if (error.message.includes('Access denied')) {
        return res.status(403).json({
          success: false,
          message: error.message,
        });
      }

      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  async deleteBooking(req, res) {
    try {
      const bookingId = req.params.id;
      const result = await bookingsService.deleteBooking(bookingId, req.user);

      res.json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      console.error('Delete booking error:', error);

      if (error.message === 'Booking not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }

      if (error.message.includes('Access denied')) {
        return res.status(403).json({
          success: false,
          message: error.message,
        });
      }

      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }
}

module.exports = new BookingsController();
