const { prisma } = require('../../config/database');

class BookingsService {
  /**
   * Check if property is available for specific date range
   * @param {string} propertyId
   * @param {Date} startDate
   * @param {Date} endDate
   * @param {string} excludeLeaseId - Optional: exclude specific lease from check
   * @returns {Promise<boolean>}
   */
  async isPropertyAvailableForPeriod(
    propertyId,
    startDate,
    endDate,
    excludeLeaseId = null
  ) {
    const where = {
      propertyId,
      status: { in: ['APPROVED', 'ACTIVE'] },
      OR: [
        // Check for date overlaps
        {
          AND: [
            { startDate: { lte: endDate } },
            { endDate: { gte: startDate } },
          ],
        },
      ],
    };

    // Exclude specific lease if provided (for updates)
    if (excludeLeaseId) {
      where.id = { not: excludeLeaseId };
    }

    const overlappingLeases = await prisma.lease.findMany({ where });

    return overlappingLeases.length === 0;
  }

  /**
   * Create new booking/lease
   * @param {Object} bookingData
   * @param {string} userId
   * @returns {Promise<Object>}
   */
  async createBooking(bookingData, userId) {
    const {
      propertyId,
      startDate,
      endDate,
      rentAmount,
      securityDeposit,
      notes,
    } = bookingData;

    // Convert strings to Date objects
    const bookingStartDate = new Date(startDate);
    const bookingEndDate = new Date(endDate);

    // Validate dates
    if (bookingStartDate >= bookingEndDate) {
      throw new Error('Start date must be before end date');
    }

    if (bookingStartDate < new Date()) {
      throw new Error('Start date cannot be in the past');
    }

    // Check if property exists and is available
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      include: {
        owner: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            name: true,
          },
        },
      },
    });

    if (!property) {
      throw new Error('Property not found');
    }

    // Check if property owner is not the same as tenant
    if (property.ownerId === userId) {
      throw new Error('You cannot book your own property');
    }

    // Check if property is manually disabled by owner
    if (!property.isAvailable) {
      throw new Error('Property is currently not available for booking');
    }

    // Smart availability check: Check for date conflicts with approved/active leases
    const isAvailable = await this.isPropertyAvailableForPeriod(
      propertyId,
      bookingStartDate,
      bookingEndDate
    );

    if (!isAvailable) {
      throw new Error(`Property is already booked for the selected period`);
    }

    // Create booking
    const booking = await prisma.lease.create({
      data: {
        propertyId,
        tenantId: userId,
        landlordId: property.ownerId,
        startDate: bookingStartDate,
        endDate: bookingEndDate,
        rentAmount: parseFloat(rentAmount),
        securityDeposit: securityDeposit ? parseFloat(securityDeposit) : null,
        status: 'PENDING',
        notes: notes || null,
      },
      include: {
        property: {
          select: {
            id: true,
            title: true,
            address: true,
            city: true,
            images: true,
          },
        },
        tenant: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            name: true,
          },
        },
        landlord: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            name: true,
          },
        },
      },
    });

    return booking;
  }

  /**
   * Get bookings for a user (as tenant)
   * @param {string} userId
   * @param {number} page
   * @param {number} limit
   * @returns {Promise<Object>}
   */
  async getUserBookings(userId, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [bookings, total] = await Promise.all([
      prisma.lease.findMany({
        where: { tenantId: userId },
        include: {
          property: {
            select: {
              id: true,
              title: true,
              address: true,
              city: true,
              images: true,
              price: true,
              currencyCode: true,
            },
          },
          landlord: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              name: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.lease.count({
        where: { tenantId: userId },
      }),
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

  /**
   * Get bookings for a property owner
   * @param {string} ownerId
   * @param {number} page
   * @param {number} limit
   * @param {string} status - Optional filter by status
   * @returns {Promise<Object>}
   */
  async getOwnerBookings(ownerId, page = 1, limit = 10, status = null) {
    const skip = (page - 1) * limit;

    const where = { landlordId: ownerId };
    if (status) {
      where.status = status;
    }

    const [bookings, total] = await Promise.all([
      prisma.lease.findMany({
        where,
        include: {
          property: {
            select: {
              id: true,
              title: true,
              address: true,
              city: true,
              images: true,
              price: true,
              currencyCode: true,
            },
          },
          tenant: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              name: true,
              phone: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.lease.count({ where }),
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

  /**
   * Approve booking (owner only)
   * @param {string} bookingId
   * @param {string} ownerId
   * @param {string} notes - Optional notes
   * @returns {Promise<Object>}
   */
  async approveBooking(bookingId, ownerId, notes = '') {
    // Get booking details
    const booking = await prisma.lease.findUnique({
      where: { id: bookingId },
      include: {
        property: true,
        tenant: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            name: true,
          },
        },
      },
    });

    if (!booking) {
      throw new Error('Booking not found');
    }

    // Check ownership
    if (booking.landlordId !== ownerId) {
      throw new Error(
        'Access denied: You can only approve bookings for your own properties'
      );
    }

    // Check if booking is in PENDING status
    if (booking.status !== 'PENDING') {
      throw new Error('Only PENDING bookings can be approved');
    }

    // Double-check availability (in case other bookings were approved in meantime)
    const isStillAvailable = await this.isPropertyAvailableForPeriod(
      booking.propertyId,
      booking.startDate,
      booking.endDate,
      bookingId // Exclude current booking from check
    );

    if (!isStillAvailable) {
      throw new Error(
        'Property is no longer available for this period due to other approved bookings'
      );
    }

    // Approve the booking
    const approvedBooking = await prisma.lease.update({
      where: { id: bookingId },
      data: {
        status: 'APPROVED',
        notes: notes
          ? `${booking.notes || ''}\n\nOwner approval notes: ${notes}`.trim()
          : booking.notes,
        updatedAt: new Date(),
      },
      include: {
        property: {
          select: {
            id: true,
            title: true,
            address: true,
            city: true,
          },
        },
        tenant: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            name: true,
          },
        },
      },
    });

    return approvedBooking;
  }

  /**
   * Reject booking (owner only)
   * @param {string} bookingId
   * @param {string} ownerId
   * @param {string} reason - Required rejection reason
   * @returns {Promise<Object>}
   */
  async rejectBooking(bookingId, ownerId, reason) {
    if (!reason || reason.trim().length === 0) {
      throw new Error('Rejection reason is required');
    }

    // Get booking details
    const booking = await prisma.lease.findUnique({
      where: { id: bookingId },
      include: {
        property: true,
        tenant: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            name: true,
          },
        },
      },
    });

    if (!booking) {
      throw new Error('Booking not found');
    }

    // Check ownership
    if (booking.landlordId !== ownerId) {
      throw new Error(
        'Access denied: You can only reject bookings for your own properties'
      );
    }

    // Check if booking is in PENDING status
    if (booking.status !== 'PENDING') {
      throw new Error('Only PENDING bookings can be rejected');
    }

    // Reject the booking
    const rejectedBooking = await prisma.lease.update({
      where: { id: bookingId },
      data: {
        status: 'REJECTED',
        notes: `${booking.notes || ''}\n\nRejection reason: ${reason}`.trim(),
        updatedAt: new Date(),
      },
      include: {
        property: {
          select: {
            id: true,
            title: true,
            address: true,
            city: true,
          },
        },
        tenant: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            name: true,
          },
        },
      },
    });

    return rejectedBooking;
  }

  /**
   * Get booking by ID
   * @param {string} bookingId
   * @param {string} userId - For access control
   * @returns {Promise<Object>}
   */
  async getBookingById(bookingId, userId) {
    const booking = await prisma.lease.findUnique({
      where: { id: bookingId },
      include: {
        property: {
          include: {
            amenities: {
              include: {
                amenity: true,
              },
            },
          },
        },
        tenant: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            name: true,
            phone: true,
          },
        },
        landlord: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            name: true,
            phone: true,
          },
        },
      },
    });

    if (!booking) {
      throw new Error('Booking not found');
    }

    // Check access: user must be either tenant or landlord
    if (booking.tenantId !== userId && booking.landlordId !== userId) {
      throw new Error('Access denied: You can only view your own bookings');
    }

    return booking;
  }

  /**
   * Get property availability for a date range (for frontend calendar)
   * @param {string} propertyId
   * @param {Date} startDate
   * @param {Date} endDate
   * @returns {Promise<Array>} Array of booked periods
   */
  async getPropertyBookedPeriods(propertyId, startDate, endDate) {
    const bookedPeriods = await prisma.lease.findMany({
      where: {
        propertyId,
        status: { in: ['APPROVED', 'ACTIVE'] },
        OR: [
          {
            AND: [
              { startDate: { lte: endDate } },
              { endDate: { gte: startDate } },
            ],
          },
        ],
      },
      select: {
        id: true,
        startDate: true,
        endDate: true,
        status: true,
      },
      orderBy: { startDate: 'asc' },
    });

    return bookedPeriods;
  }
}

module.exports = new BookingsService();
