const bookingsRepository = require('./bookings.repository');
const propertiesRepository = require('../properties/properties.repository');

class BookingsService {
  async getAllBookings(page = 1, limit = 10, filters = {}, requestingUser) {
    const skip = (page - 1) * limit;
    const where = {};

    // Apply role-based filtering
    if (requestingUser.role === 'USER') {
      where.userId = requestingUser.id;
    } else if (requestingUser.role === 'LANDLORD') {
      where.OR = [
        { userId: requestingUser.id }, // Their own bookings
        { property: { ownerId: requestingUser.id } }, // Bookings for their properties
      ];
    }
    // Admin has no restrictions

    // Apply additional filters
    if (filters.status) where.status = filters.status;
    if (filters.propertyId) where.propertyId = filters.propertyId;

    const [bookings, total] = await Promise.all([
      bookingsRepository.findMany({ where, skip, take: limit }),
      bookingsRepository.count(where),
    ]);

    const pages = Math.ceil(total / limit);

    return {
      bookings,
      pagination: {
        page,
        limit,
        total,
        pages,
      },
    };
  }

  async getBookingById(id, requestingUser) {
    const booking = await bookingsRepository.findById(id);

    if (!booking) {
      throw new Error('Booking not found');
    }

    // Check access permissions
    const hasAccess =
      requestingUser.role === 'ADMIN' ||
      booking.userId === requestingUser.id ||
      booking.property.ownerId === requestingUser.id;

    if (!hasAccess) {
      throw new Error(
        'Access denied. You can only view your own bookings or bookings for your properties.'
      );
    }

    return booking;
  }

  async createBooking(bookingData, userId) {
    const { propertyId, startDate, endDate, notes } = bookingData;

    // Check if property exists and is available
    const property = await propertiesRepository.findById(propertyId);
    if (!property) {
      throw new Error('Property not found');
    }

    if (!property.isAvailable) {
      throw new Error('Property is not available for booking');
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start >= end) {
      throw new Error('End date must be after start date');
    }

    if (start < new Date()) {
      throw new Error('Start date cannot be in the past');
    }

    // Check for overlapping bookings
    const overlappingBooking = await bookingsRepository.findOverlapping(
      propertyId,
      end,
      start
    );
    if (overlappingBooking) {
      throw new Error('Property is already booked for the selected dates');
    }

    // Calculate total price (assuming monthly rent)
    const months = Math.ceil((end - start) / (1000 * 60 * 60 * 24 * 30));
    const totalPrice = property.price * months;

    const cleanBookingData = {
      propertyId,
      userId,
      startDate: start,
      endDate: end,
      totalPrice,
      notes: notes || null,
      status: 'PENDING',
    };

    return await bookingsRepository.create(cleanBookingData);
  }

  async updateBookingStatus(id, statusData, requestingUser) {
    const { status, notes } = statusData;

    // Get booking with property info
    const booking = await bookingsRepository.findById(id);
    if (!booking) {
      throw new Error('Booking not found');
    }

    // Only property owner or admin can update booking status
    if (
      requestingUser.role !== 'ADMIN' &&
      booking.property.ownerId !== requestingUser.id
    ) {
      throw new Error(
        'Access denied. Only property owners and admins can update booking status.'
      );
    }

    const updateData = { status };
    if (notes) updateData.notes = notes;

    return await bookingsRepository.update(id, updateData);
  }

  async deleteBooking(id, requestingUser) {
    const booking = await bookingsRepository.findById(id);
    if (!booking) {
      throw new Error('Booking not found');
    }

    // Only booking owner or admin can cancel/delete
    if (
      requestingUser.role !== 'ADMIN' &&
      booking.userId !== requestingUser.id
    ) {
      throw new Error('Access denied. You can only cancel your own bookings.');
    }

    // If booking is confirmed, just update status to cancelled instead of deleting
    if (booking.status === 'CONFIRMED') {
      await bookingsRepository.update(id, { status: 'CANCELLED' });
      return { message: 'Booking cancelled successfully' };
    } else {
      await bookingsRepository.delete(id);
      return { message: 'Booking deleted successfully' };
    }
  }
}

module.exports = new BookingsService();
