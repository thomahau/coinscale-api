'use strict';
const mongoose = require('mongoose');

const models = {};

models.User = require('./user');
// other models here

module.exports = models;
