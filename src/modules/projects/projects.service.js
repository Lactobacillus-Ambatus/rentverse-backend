const projectsRepository = require('./projects.repository');

class ProjectsService {
  async getAllProjects(page = 1, limit = 10, filters = {}) {
    const skip = (page - 1) * limit;
    const where = {};

    // Filter by city
    if (filters.city) {
      where.city = {
        contains: filters.city,
        mode: 'insensitive',
      };
    }

    // Filter by state
    if (filters.state) {
      where.state = {
        contains: filters.state,
        mode: 'insensitive',
      };
    }

    // Filter by country
    if (filters.country) {
      where.country = filters.country;
    }

    // Filter by developer
    if (filters.developer) {
      where.developer = {
        contains: filters.developer,
        mode: 'insensitive',
      };
    }

    // Filter by property type
    if (filters.propertyTypeId) {
      where.defaultPropertyTypeId = filters.propertyTypeId;
    }

    const [projects, total] = await Promise.all([
      projectsRepository.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      projectsRepository.count(where),
    ]);

    const pages = Math.ceil(total / limit);

    return {
      projects,
      pagination: {
        page,
        limit,
        total,
        pages,
      },
    };
  }

  async getProjectById(id) {
    const project = await projectsRepository.findById(id);

    if (!project) {
      throw new Error('Project not found');
    }

    return project;
  }

  async createProject(projectData) {
    // Check if project with same name already exists
    const existingProject = await projectsRepository.findByName(
      projectData.name
    );
    if (existingProject) {
      throw new Error('Project with this name already exists');
    }

    // Validate property type if provided
    if (projectData.defaultPropertyTypeId) {
      const { prisma } = require('../../config/database');
      const propertyType = await prisma.propertyType.findUnique({
        where: { id: projectData.defaultPropertyTypeId },
      });

      if (!propertyType) {
        throw new Error('Invalid property type ID');
      }
    }

    return await projectsRepository.create(projectData);
  }

  async updateProject(id, updateData) {
    // Check if project exists
    const existingProject = await projectsRepository.findById(id);
    if (!existingProject) {
      throw new Error('Project not found');
    }

    // Check name uniqueness if name is being updated
    if (updateData.name && updateData.name !== existingProject.name) {
      const projectWithName = await projectsRepository.findByName(
        updateData.name
      );
      if (projectWithName && projectWithName.id !== id) {
        throw new Error('Project with this name already exists');
      }
    }

    // Validate property type if provided
    if (updateData.defaultPropertyTypeId) {
      const { prisma } = require('../../config/database');
      const propertyType = await prisma.propertyType.findUnique({
        where: { id: updateData.defaultPropertyTypeId },
      });

      if (!propertyType) {
        throw new Error('Invalid property type ID');
      }
    }

    return await projectsRepository.update(id, updateData);
  }

  async deleteProject(id) {
    // Check if project exists
    const existingProject = await projectsRepository.findById(id);
    if (!existingProject) {
      throw new Error('Project not found');
    }

    // Check if project has properties
    if (existingProject.properties && existingProject.properties.length > 0) {
      throw new Error(
        'Cannot delete project that has properties. Please delete or reassign properties first.'
      );
    }

    await projectsRepository.delete(id);
    return { message: 'Project deleted successfully' };
  }

  async getProjectsByLocation(city, state, country = 'MY') {
    return await projectsRepository.findByLocation(city, state, country);
  }

  async getNearbyProjects(latitude, longitude, radiusKm = 10) {
    if (!latitude || !longitude) {
      throw new Error('Latitude and longitude are required');
    }

    return await projectsRepository.findNearby(latitude, longitude, radiusKm);
  }

  async getProjectStatistics() {
    const { prisma } = require('../../config/database');

    const [
      totalProjects,
      projectsByCountry,
      projectsByPropertyType,
      averagePrice,
      totalProperties,
    ] = await Promise.all([
      prisma.project.count(),
      prisma.project.groupBy({
        by: ['country'],
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
      }),
      prisma.project.groupBy({
        by: ['defaultPropertyTypeId'],
        _count: { id: true },
        where: {
          defaultPropertyTypeId: { not: null },
        },
      }),
      prisma.project.aggregate({
        _avg: { defaultPrice: true },
        where: {
          defaultPrice: { not: null },
        },
      }),
      prisma.property.count(),
    ]);

    return {
      totalProjects,
      totalProperties,
      averagePrice: averagePrice._avg.defaultPrice,
      projectsByCountry,
      projectsByPropertyType,
    };
  }
}

module.exports = new ProjectsService();
