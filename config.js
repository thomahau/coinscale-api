'use strict';

exports.CLIENT_ORIGIN =
  process.env.CLIENT_ORIGIN ||
  global.CLIENT_ORIGIN ||
  'http://localhost:3000/' ||
  'https://coinscale.netlify.com/';
