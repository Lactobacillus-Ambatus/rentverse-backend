const propertiesService = require('./properties.service');
const { validationResult } = require('express-validator');

class PropertiesController {
  async getAllProperties(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      const filters = {
        type: req.query.type,
        city: req.query.city,
        available: req.query.available,
        minPrice: req.query.minPrice,
        maxPrice: req.query.maxPrice,
        bedrooms: req.query.bedrooms,
      };

      const result = await propertiesService.getAllProperties(
        page,
        limit,
        filters
      );

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error('Get properties error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  async getPropertyById(req, res) {
    try {
      const propertyId = req.params.id;
      const property = await propertiesService.getPropertyById(propertyId);

      res.json({
        success: true,
        data: { property },
      });
    } catch (error) {
      console.error('Get property error:', error);

      if (error.message === 'Property not found') {
        return res.status(404).json({
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

  async createProperty(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array(),
        });
      }

      const property = await propertiesService.createProperty(
        req.body,
        req.user.id
      );

      res.status(201).json({
        success: true,
        message: 'Property created successfully',
        data: { property },
      });
    } catch (error) {
      console.error('Create property error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  async updateProperty(req, res) {
    try {
      const propertyId = req.params.id;
      const property = await propertiesService.updateProperty(
        propertyId,
        req.body,
        req.user
      );

      res.json({
        success: true,
        message: 'Property updated successfully',
        data: { property },
      });
    } catch (error) {
      console.error('Update property error:', error);

      if (error.message === 'Property not found') {
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

  async deleteProperty(req, res) {
    try {
      const propertyId = req.params.id;
      const result = await propertiesService.deleteProperty(
        propertyId,
        req.user
      );

      res.json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      console.error('Delete property error:', error);

      if (error.message === 'Property not found') {
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

module.exports = new PropertiesController();
