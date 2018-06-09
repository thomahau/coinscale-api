'use strict';
const mongoose = require('mongoose');

const models = {};

models.User = require('./user');
models.Portfolio = require('./portfolio');
models.Transaction = require('./transaction');

module.exports = models;
