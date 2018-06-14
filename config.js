'use strict';
exports.DATABASE_URL = process.env.DATABASE_URL || 'mongodb://localhost/coinscale';
exports.TEST_DATABASE_URL = process.env.TEST_DATABASE_URL || 'mongodb://localhost/test-coinscale';
exports.PORT = process.env.PORT || 8080;
exports.JWT_SECRET = process.env.JWT_SECRET;
exports.JWT_EXPIRY = process.env.JWT_EXPIRY || '7d';
exports.NOMICS_API_KEY = process.env.NOMICS_API_KEY;
exports.CLIENT_ORIGIN =
  process.env.CLIENT_ORIGIN ||
  global.CLIENT_ORIGIN ||
  'http://localhost:3000/' ||
  'https://coinscale.netlify.com/';
