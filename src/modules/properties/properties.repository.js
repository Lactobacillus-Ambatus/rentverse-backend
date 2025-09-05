const { prisma } = require('../../config/database');

class PropertiesRepository {
  async findMany(options = {}) {
    const {
      where = {},
      skip = 0,
      take = 10,
      orderBy = { createdAt: 'desc' },
    } = options;

    return await prisma.property.findMany({
      where,
      skip,
      take,
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        propertyType: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
        amenities: {
          include: {
            amenity: {
              select: {
                id: true,
                name: true,
                category: true,
              },
            },
          },
        },
      },
      orderBy,
    });
  }

  async count(where = {}) {
    return await prisma.property.count({ where });
  }

  async findById(id) {
    return await prisma.property.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        propertyType: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
        amenities: {
          include: {
            amenity: {
              select: {
                id: true,
                name: true,
                category: true,
              },
            },
          },
        },
      },
    });
  }

  async findByCode(code) {
    return await prisma.property.findUnique({
      where: { code },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        propertyType: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
        amenities: {
          include: {
            amenity: {
              select: {
                id: true,
                name: true,
                category: true,
              },
            },
          },
        },
      },
    });
  }

  async create(propertyData) {
    return await prisma.property.create({
      data: propertyData,
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
  }

  async update(id, updateData) {
    return await prisma.property.update({
      where: { id },
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
  }

  async delete(id) {
    return await prisma.property.delete({
      where: { id },
    });
  }

  async codeExists(code) {
    const property = await prisma.property.findUnique({
      where: { code },
      select: { id: true },
    });
    return !!property;
  }
}

module.exports = new PropertiesRepository();
