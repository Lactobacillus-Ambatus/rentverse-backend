const propertiesService = require('./properties.service');
const { validationResult } = require('express-validator');

class PropertiesController {
  async getAllProperties(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const userId = req.user?.id; // Get user ID if authenticated
      const userRole = req.user?.role || 'USER'; // Get user role

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
        filters,
        userId,
        userRole
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
      const userId = req.user?.id; // Get user ID if authenticated
      const property = await propertiesService.getPropertyById(
        propertyId,
        userId
      );

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
      const userId = req.user?.id; // Get user ID if authenticated
      const property = await propertiesService.getPropertyByCode(
        propertyCode,
        userId
      );

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

  async getFeaturedProperties(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 8;
      const userId = req.user?.id; // Get user ID if authenticated

      const result = await propertiesService.getFeaturedProperties(
        page,
        limit,
        userId
      );

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error('Get featured properties error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  // Get pending approvals (admin only)
  async getPendingApprovals(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      const result = await propertiesService.getPendingApprovals(page, limit);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error('Get pending approvals error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  // Approve property (admin only)
  async approveProperty(req, res) {
    try {
      const propertyId = req.params.id;
      const { notes } = req.body;

      const result = await propertiesService.approveProperty(
        propertyId,
        req.user.id,
        notes
      );

      res.json({
        success: true,
        message: 'Property approved successfully',
        data: result,
      });
    } catch (error) {
      console.error('Approve property error:', error);

      if (
        error.message === 'Property not found' ||
        error.message === 'Approval record not found'
      ) {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }

      if (error.message.includes('Only PENDING_REVIEW properties')) {
        return res.status(400).json({
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

  // Reject property (admin only)
  async rejectProperty(req, res) {
    try {
      const propertyId = req.params.id;
      const { notes } = req.body;

      if (!notes || notes.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Rejection notes are required',
        });
      }

      const result = await propertiesService.rejectProperty(
        propertyId,
        req.user.id,
        notes
      );

      res.json({
        success: true,
        message: 'Property rejected successfully',
        data: result,
      });
    } catch (error) {
      console.error('Reject property error:', error);

      if (
        error.message === 'Property not found' ||
        error.message === 'Approval record not found'
      ) {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }

      if (error.message.includes('Only PENDING_REVIEW properties')) {
        return res.status(400).json({
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

  // Get approval history
  async getApprovalHistory(req, res) {
    try {
      const propertyId = req.params.id;
      const result = await propertiesService.getApprovalHistory(propertyId);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error('Get approval history error:', error);

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

  // Get properties owned by authenticated user
  async getMyProperties(req, res) {
    try {
      const userId = req.user.id; // User ID from auth middleware
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      const filters = {
        status: req.query.status,
        isAvailable: req.query.isAvailable
          ? req.query.isAvailable === 'true'
          : undefined,
        search: req.query.search,
      };

      const result = await propertiesService.getMyProperties(
        userId,
        page,
        limit,
        filters
      );

      res.json({
        success: true,
        message: 'Your properties retrieved successfully',
        data: result,
      });
    } catch (error) {
      console.error('Get my properties error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }
}

module.exports = new PropertiesController();
