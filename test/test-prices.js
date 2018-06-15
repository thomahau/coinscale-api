'use strict';
const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const { app, runServer, closeServer } = require('../server');
const { JWT_SECRET, TEST_DATABASE_URL } = require('../config');

const User = mongoose.model('User');
const expect = chai.expect;
let user;

chai.use(chaiHttp);

function tearDownDb() {
  console.warn('Deleting database');
  return mongoose.connection.dropDatabase();
}

describe('Protected price data API resource', function() {
  const username = 'exampleUser';
  const password = 'examplePassword';
  const date = '2017-06-30';
  const token = jwt.sign(
    {
      user: {
        username
      }
    },
    JWT_SECRET,
    {
      algorithm: 'HS256',
      subject: username,
      expiresIn: '7d'
    }
  );

  before(function() {
    return runServer(TEST_DATABASE_URL);
  });

  beforeEach(function() {
    return User.hashPassword(password)
      .then(password => {
        return User.create({ username, password });
      })
      .then(_user => {
        user = _user;
      });
  });

  afterEach(function() {
    return tearDownDb();
  });

  after(function() {
    return closeServer();
  });

  describe('GET endpoint', function() {
    it('should return price data for authenticated users', function() {
      return chai
        .request(app)
        .get(`/api/prices?date=${date}`)
        .set('authorization', `Bearer ${token}`)
        .then(res => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body.priceData).to.be.an('array');
          expect(res.body.priceData).to.have.length.of.at.least(1);
        });
    });

    it('should return price data with the right fields', function() {
      return chai
        .request(app)
        .get(`/api/prices?date=${date}`)
        .set('authorization', `Bearer ${token}`)
        .then(res => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          console.log(res.body.priceData);
          expect(res.body.priceData).to.be.an('array');
          res.body.priceData.forEach(coinDatum => {
            expect(coinDatum).to.be.an('object');
            expect(coinDatum).to.include.keys('currency', 'name', 'current', 'sevenDaysAgo');
          });
        });
    });
  });
});
