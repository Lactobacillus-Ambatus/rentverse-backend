const propertiesService = require('./properties.service');
const { validationResult } = require('express-validator');

class PropertiesController {
  async getAllProperties(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      const filters = {
        propertyTypeId: req.query.propertyTypeId,
        city: req.query.city,
        available: req.query.available,
        status: req.query.status,
        furnished: req.query.furnished,
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

  async getPropertyByCode(req, res) {
    try {
      const propertyCode = req.params.code;
      const property = await propertiesService.getPropertyByCode(propertyCode);

      res.json({
        success: true,
        data: { property },
      });
    } catch (error) {
      console.error('Get property by code error:', error);

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
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array(),
        });
      }

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

  async getGeoJSON(req, res) {
    try {
      const { bbox, limit = 1000, clng, clat, q } = req.query;

      // Validate required bbox parameter
      if (!bbox) {
        return res.status(400).json({
          error:
            'bbox parameter is required in format "minLng,minLat,maxLng,maxLat"',
        });
      }

      // Parse and validate bounding box
      const bboxArray = bbox.split(',').map(parseFloat);
      if (bboxArray.length !== 4 || bboxArray.some(isNaN)) {
        return res.status(400).json({
          error: 'Invalid bbox format. Use "minLng,minLat,maxLng,maxLat"',
        });
      }

      const [minLng, minLat, maxLng, maxLat] = bboxArray;

      // Validate bounding box values
      if (minLng >= maxLng || minLat >= maxLat) {
        return res.status(400).json({
          error:
            'Invalid bounding box: min values must be less than max values',
        });
      }

      // Validate limit
      const maxResults = parseInt(limit);
      if (maxResults < 1 || maxResults > 1000) {
        return res.status(400).json({
          error: 'Limit must be between 1 and 1000',
        });
      }

      // Parse center coordinates for distance-based sorting
      let centerLng = null,
        centerLat = null;
      if (clng && clat) {
        centerLng = parseFloat(clng);
        centerLat = parseFloat(clat);
        if (isNaN(centerLng) || isNaN(centerLat)) {
          return res.status(400).json({
            error: 'Invalid center coordinates',
          });
        }
      }

      const geojson = await propertiesService.getGeoJSON({
        minLng,
        minLat,
        maxLng,
        maxLat,
        limit: maxResults,
        centerLng,
        centerLat,
        query: q,
      });

      // Set proper content type for GeoJSON
      res.setHeader('Content-Type', 'application/geo+json');
      res.json(geojson);
    } catch (error) {
      console.error('Get GeoJSON error:', error);
      res.status(500).json({
        error: 'Internal server error',
      });
    }
  }
}

module.exports = new PropertiesController();
