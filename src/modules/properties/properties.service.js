const propertiesRepository = require('./properties.repository');

class PropertiesService {
  async getAllProperties(page = 1, limit = 10, filters = {}) {
    const skip = (page - 1) * limit;
    const where = {};

    // Apply filters
    if (filters.type) where.type = filters.type;
    if (filters.city)
      where.city = { contains: filters.city, mode: 'insensitive' };
    if (filters.available !== undefined)
      where.isAvailable = filters.available === 'true';
    if (filters.bedrooms) where.bedrooms = parseInt(filters.bedrooms);

    if (filters.minPrice || filters.maxPrice) {
      where.price = {};
      if (filters.minPrice) where.price.gte = parseFloat(filters.minPrice);
      if (filters.maxPrice) where.price.lte = parseFloat(filters.maxPrice);
    }

    const [properties, total] = await Promise.all([
      propertiesRepository.findMany({ where, skip, take: limit }),
      propertiesRepository.count(where),
    ]);

    const pages = Math.ceil(total / limit);

    return {
      properties,
      pagination: {
        page,
        limit,
        total,
        pages,
      },
    };
  }

  async getPropertyById(id) {
    const property = await propertiesRepository.findById(id);

    if (!property) {
      throw new Error('Property not found');
    }

    return property;
  }

  async createProperty(propertyData, ownerId) {
    const cleanPropertyData = {
      title: propertyData.title,
      description: propertyData.description,
      address: propertyData.address,
      city: propertyData.city,
      state: propertyData.state,
      zipCode: propertyData.zipCode,
      price: parseFloat(propertyData.price),
      type: propertyData.type,
      bedrooms: propertyData.bedrooms || 0,
      bathrooms: propertyData.bathrooms || 0,
      area: propertyData.area ? parseFloat(propertyData.area) : null,
      isAvailable:
        propertyData.isAvailable !== undefined
          ? propertyData.isAvailable
          : true,
      images: propertyData.images || [],
      amenities: propertyData.amenities || [],
      ownerId,
    };

    return await propertiesRepository.create(cleanPropertyData);
  }

  async updateProperty(id, updateData, requestingUser) {
    // Check if property exists
    const existingProperty = await propertiesRepository.findById(id);
    if (!existingProperty) {
      throw new Error('Property not found');
    }

    // Only property owner or admin can update
    if (
      requestingUser.role !== 'ADMIN' &&
      existingProperty.ownerId !== requestingUser.id
    ) {
      throw new Error(
        'Access denied. You can only update your own properties.'
      );
    }

    // Prepare update data
    const cleanUpdateData = {};
    const allowedFields = [
      'title',
      'description',
      'address',
      'city',
      'state',
      'zipCode',
      'price',
      'type',
      'bedrooms',
      'bathrooms',
      'area',
      'isAvailable',
      'images',
      'amenities',
    ];

    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        if (field === 'price' || field === 'area') {
          cleanUpdateData[field] = parseFloat(updateData[field]);
        } else {
          cleanUpdateData[field] = updateData[field];
        }
      }
    }

    return await propertiesRepository.update(id, cleanUpdateData);
  }

  async deleteProperty(id, requestingUser) {
    // Check if property exists
    const existingProperty = await propertiesRepository.findById(id);
    if (!existingProperty) {
      throw new Error('Property not found');
    }

    // Only property owner or admin can delete
    if (
      requestingUser.role !== 'ADMIN' &&
      existingProperty.ownerId !== requestingUser.id
    ) {
      throw new Error(
        'Access denied. You can only delete your own properties.'
      );
    }

    await propertiesRepository.delete(id);
    return { message: 'Property deleted successfully' };
  }
}

module.exports = new PropertiesService();
