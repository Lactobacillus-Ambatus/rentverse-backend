const { prisma } = require('../../config/database');

class ProjectsRepository {
  async findMany(options = {}) {
    const {
      where = {},
      skip = 0,
      take = 10,
      orderBy = { createdAt: 'desc' },
      include = {},
    } = options;

    return await prisma.project.findMany({
      where,
      skip,
      take,
      orderBy,
      include: {
        defaultPropertyType: true,
        properties: {
          select: {
            id: true,
            title: true,
            status: true,
            isAvailable: true,
          },
        },
        ...include,
      },
    });
  }

  async count(where = {}) {
    return await prisma.project.count({ where });
  }

  async findById(id) {
    return await prisma.project.findUnique({
      where: { id },
      include: {
        defaultPropertyType: true,
        properties: {
          select: {
            id: true,
            title: true,
            status: true,
            isAvailable: true,
            price: true,
            bedrooms: true,
            bathrooms: true,
            areaSqm: true,
          },
        },
      },
    });
  }

  async findByName(name) {
    return await prisma.project.findFirst({
      where: { name },
    });
  }

  async findByLocation(city, state, country = 'MY') {
    return await prisma.project.findMany({
      where: {
        city: {
          contains: city,
          mode: 'insensitive',
        },
        state: {
          contains: state,
          mode: 'insensitive',
        },
        country,
      },
      include: {
        defaultPropertyType: true,
        _count: {
          select: {
            properties: true,
          },
        },
      },
    });
  }

  async create(projectData) {
    return await prisma.project.create({
      data: projectData,
      include: {
        defaultPropertyType: true,
      },
    });
  }

  async update(id, updateData) {
    return await prisma.project.update({
      where: { id },
      data: updateData,
      include: {
        defaultPropertyType: true,
        properties: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
      },
    });
  }

  async delete(id) {
    return await prisma.project.delete({
      where: { id },
    });
  }

  async findNearby(latitude, longitude, radiusKm = 10) {
    // Simple distance calculation using Haversine formula approximation
    const latDiff = radiusKm / 111.32; // 1 degree lat ≈ 111.32 km
    const lonDiff = radiusKm / (111.32 * Math.cos((latitude * Math.PI) / 180));

    return await prisma.project.findMany({
      where: {
        latitude: {
          gte: latitude - latDiff,
          lte: latitude + latDiff,
        },
        longitude: {
          gte: longitude - lonDiff,
          lte: longitude + lonDiff,
        },
      },
      include: {
        defaultPropertyType: true,
        _count: {
          select: {
            properties: true,
          },
        },
      },
    });
  }
}

module.exports = new ProjectsRepository();
