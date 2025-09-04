const { prisma } = require('../../config/database');

class BookingsRepository {
  async findMany(options = {}) {
    const {
      where = {},
      skip = 0,
      take = 10,
      orderBy = { createdAt: 'desc' },
    } = options;

    return await prisma.booking.findMany({
      where,
      skip,
      take,
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
      orderBy,
    });
  }

  async count(where = {}) {
    return await prisma.booking.count({ where });
  }

  async findById(id) {
    return await prisma.booking.findUnique({
      where: { id },
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
  }

  async findOverlapping(propertyId, startDate, endDate) {
    return await prisma.booking.findFirst({
      where: {
        propertyId,
        status: { in: ['PENDING', 'CONFIRMED'] },
        OR: [
          {
            startDate: { lte: endDate },
            endDate: { gte: startDate },
          },
        ],
      },
    });
  }

  async create(bookingData) {
    return await prisma.booking.create({
      data: bookingData,
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
  }

  async update(id, updateData) {
    return await prisma.booking.update({
      where: { id },
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
  }

  async delete(id) {
    return await prisma.booking.delete({
      where: { id },
    });
  }
}

module.exports = new BookingsRepository();
