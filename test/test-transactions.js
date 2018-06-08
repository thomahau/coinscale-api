'use strict';
const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const { app, runServer, closeServer } = require('../server');
const { JWT_SECRET, TEST_DATABASE_URL } = require('../config');
const models = require('../models');

const User = models.User;
const Transaction = models.Transaction;
const expect = chai.expect;
let user;

chai.use(chaiHttp);
