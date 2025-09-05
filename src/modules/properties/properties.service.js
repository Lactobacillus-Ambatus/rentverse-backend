const propertiesRepository = require('./properties.repository');
const { generateUniquePropertyCode } = require('../../utils/codeGenerator');
const { prisma } = require('../../config/database');

class PropertiesService {
  // Helper function to generate Google Maps URL
  generateMapsUrl(latitude, longitude) {
    if (!latitude || !longitude) return null;
    return `https://www.google.com/maps?q=${latitude},${longitude}`;
  }

  // Helper function to add maps URL to property object
  addMapsUrlToProperty(property) {
    if (property) {
      if (property.latitude && property.longitude) {
        property.mapsUrl = this.generateMapsUrl(
          property.latitude,
          property.longitude
        );
      } else {
        property.mapsUrl = null;
      }
    }
    return property;
  }

  // Helper function to add maps URL to multiple properties
  addMapsUrlToProperties(properties) {
    return properties.map(property => this.addMapsUrlToProperty(property));
  }

  async getAllProperties(page = 1, limit = 10, filters = {}) {
    const skip = (page - 1) * limit;
    const where = {};

    // Apply filters
    if (filters.propertyTypeId) where.propertyTypeId = filters.propertyTypeId;
    if (filters.city)
      where.city = { contains: filters.city, mode: 'insensitive' };
    if (filters.available !== undefined)
      where.isAvailable = filters.available === 'true';
    if (filters.bedrooms) where.bedrooms = parseInt(filters.bedrooms);
    if (filters.status) where.status = filters.status;
    if (filters.furnished !== undefined)
      where.furnished = filters.furnished === 'true';

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

    // Add Google Maps URL to each property
    const propertiesWithMapsUrl = this.addMapsUrlToProperties(properties);

    return {
      properties: propertiesWithMapsUrl,
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

    // Add Google Maps URL to the property
    return this.addMapsUrlToProperty(property);
  }

  async getPropertyByCode(code) {
    const property = await propertiesRepository.findByCode(code);

    if (!property) {
      throw new Error('Property not found');
    }

    // Add Google Maps URL to the property
    return this.addMapsUrlToProperty(property);
  }

  async createProperty(propertyData, ownerId) {
    // Generate unique property code if not provided
    let propertyCode = propertyData.code;
    if (!propertyCode) {
      // Get property type code for better code generation
      let propertyTypeCode = '';
      if (propertyData.propertyTypeId) {
        const propertyType = await prisma.propertyType.findUnique({
          where: { id: propertyData.propertyTypeId },
          select: { code: true },
        });
        propertyTypeCode = propertyType?.code || '';
      }

      propertyCode = await generateUniquePropertyCode(
        propertyData.title,
        propertyTypeCode,
        code => propertiesRepository.codeExists(code)
      );
    }

    const cleanPropertyData = {
      code: propertyCode,
      title: propertyData.title,
      description: propertyData.description,
      address: propertyData.address,
      city: propertyData.city,
      state: propertyData.state,
      country: propertyData.country || 'ID',
      zipCode: propertyData.zipCode,
      placeId: propertyData.placeId,
      latitude: propertyData.latitude
        ? parseFloat(propertyData.latitude)
        : null,
      longitude: propertyData.longitude
        ? parseFloat(propertyData.longitude)
        : null,
      price: parseFloat(propertyData.price),
      currencyCode: propertyData.currencyCode || 'IDR',
      bedrooms: propertyData.bedrooms || 0,
      bathrooms: propertyData.bathrooms || 0,
      areaSqm: propertyData.areaSqm ? parseFloat(propertyData.areaSqm) : null,
      furnished: propertyData.furnished || false,
      isAvailable:
        propertyData.isAvailable !== undefined
          ? propertyData.isAvailable
          : true,
      status: propertyData.status || 'DRAFT',
      images: propertyData.images || [],
      propertyTypeId: propertyData.propertyTypeId,
      ownerId,
    };

    // Create property first
    const property = await propertiesRepository.create(cleanPropertyData);

    // Handle amenities if provided
    if (propertyData.amenityIds && propertyData.amenityIds.length > 0) {
      const amenityConnections = propertyData.amenityIds.map(amenityId => ({
        propertyId: property.id,
        amenityId: amenityId,
      }));

      await prisma.propertyAmenity.createMany({
        data: amenityConnections,
      });
    }

    // Return property with includes
    const createdProperty = await propertiesRepository.findById(property.id);

    // Add Google Maps URL to the created property
    return this.addMapsUrlToProperty(createdProperty);
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
      'country',
      'zipCode',
      'placeId',
      'latitude',
      'longitude',
      'price',
      'currencyCode',
      'bedrooms',
      'bathrooms',
      'areaSqm',
      'furnished',
      'isAvailable',
      'status',
      'images',
      'propertyTypeId',
    ];

    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        if (
          field === 'price' ||
          field === 'areaSqm' ||
          field === 'latitude' ||
          field === 'longitude'
        ) {
          cleanUpdateData[field] = parseFloat(updateData[field]);
        } else if (field === 'bedrooms' || field === 'bathrooms') {
          cleanUpdateData[field] = parseInt(updateData[field]);
        } else if (field === 'furnished' || field === 'isAvailable') {
          cleanUpdateData[field] = Boolean(updateData[field]);
        } else {
          cleanUpdateData[field] = updateData[field];
        }
      }
    }

    await propertiesRepository.update(id, cleanUpdateData);

    // Handle amenities update if provided
    if (updateData.amenityIds !== undefined) {
      // Delete existing amenity connections
      await prisma.propertyAmenity.deleteMany({
        where: { propertyId: id },
      });

      // Add new amenity connections if provided
      if (updateData.amenityIds && updateData.amenityIds.length > 0) {
        const amenityConnections = updateData.amenityIds.map(amenityId => ({
          propertyId: id,
          amenityId: amenityId,
        }));

        await prisma.propertyAmenity.createMany({
          data: amenityConnections,
        });
      }
    }

    // Get updated property with all relations
    const finalProperty = await propertiesRepository.findById(id);

    // Add Google Maps URL to the updated property
    return this.addMapsUrlToProperty(finalProperty);
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
