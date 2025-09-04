const bookingsRoutes = require('./bookings.routes');
const bookingsController = require('./bookings.controller');
const bookingsService = require('./bookings.service');
const bookingsRepository = require('./bookings.repository');

module.exports = {
  routes: bookingsRoutes,
  controller: bookingsController,
  service: bookingsService,
  repository: bookingsRepository,
};
