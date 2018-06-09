'use strict';
const mongoose = require('mongoose');

const models = {};

models.User = require('./user');
models.Transaction = require('./transaction');

module.exports = models;
