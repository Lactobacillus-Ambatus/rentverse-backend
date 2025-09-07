const projectsService = require('./projects.service');
const { validationResult } = require('express-validator');

class ProjectsController {
  async getAllProjects(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const filters = {
        city: req.query.city,
        state: req.query.state,
        country: req.query.country,
        developer: req.query.developer,
        propertyTypeId: req.query.propertyTypeId,
      };

      const result = await projectsService.getAllProjects(page, limit, filters);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error('Get projects error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  async getProjectById(req, res) {
    try {
      const projectId = req.params.id;
      const project = await projectsService.getProjectById(projectId);

      res.json({
        success: true,
        data: { project },
      });
    } catch (error) {
      console.error('Get project error:', error);

      if (error.message === 'Project not found') {
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

  async createProject(req, res) {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array(),
        });
      }

      const projectData = req.body;
      const newProject = await projectsService.createProject(projectData);

      res.status(201).json({
        success: true,
        message: 'Project created successfully',
        data: { project: newProject },
      });
    } catch (error) {
      console.error('Create project error:', error);

      if (error.message === 'Project with this name already exists') {
        return res.status(409).json({
          success: false,
          message: error.message,
        });
      }

      if (error.message === 'Invalid property type ID') {
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

  async updateProject(req, res) {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array(),
        });
      }

      const projectId = req.params.id;
      const updateData = req.body;

      const updatedProject = await projectsService.updateProject(
        projectId,
        updateData
      );

      res.json({
        success: true,
        message: 'Project updated successfully',
        data: { project: updatedProject },
      });
    } catch (error) {
      console.error('Update project error:', error);

      if (error.message === 'Project not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }

      if (error.message === 'Project with this name already exists') {
        return res.status(409).json({
          success: false,
          message: error.message,
        });
      }

      if (error.message === 'Invalid property type ID') {
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

  async deleteProject(req, res) {
    try {
      const projectId = req.params.id;
      const result = await projectsService.deleteProject(projectId);

      res.json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      console.error('Delete project error:', error);

      if (error.message === 'Project not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }

      if (error.message.includes('Cannot delete project')) {
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

  async getProjectsByLocation(req, res) {
    try {
      const { city, state, country = 'MY' } = req.query;

      if (!city || !state) {
        return res.status(400).json({
          success: false,
          message: 'City and state are required',
        });
      }

      const projects = await projectsService.getProjectsByLocation(
        city,
        state,
        country
      );

      res.json({
        success: true,
        data: { projects },
      });
    } catch (error) {
      console.error('Get projects by location error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  async getNearbyProjects(req, res) {
    try {
      const { latitude, longitude, radius = 10 } = req.query;

      if (!latitude || !longitude) {
        return res.status(400).json({
          success: false,
          message: 'Latitude and longitude are required',
        });
      }

      const lat = parseFloat(latitude);
      const lon = parseFloat(longitude);
      const radiusKm = parseFloat(radius);

      if (isNaN(lat) || isNaN(lon) || isNaN(radiusKm)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid coordinates or radius',
        });
      }

      const projects = await projectsService.getNearbyProjects(
        lat,
        lon,
        radiusKm
      );

      res.json({
        success: true,
        data: { projects },
      });
    } catch (error) {
      console.error('Get nearby projects error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  async getProjectStatistics(req, res) {
    try {
      const statistics = await projectsService.getProjectStatistics();

      res.json({
        success: true,
        data: { statistics },
      });
    } catch (error) {
      console.error('Get project statistics error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }
}

module.exports = new ProjectsController();
