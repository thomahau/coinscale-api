'use strict';
const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const { app, runServer, closeServer } = require('../server');
const { JWT_SECRET, TEST_DATABASE_URL } = require('../config');

const User = mongoose.model('User');
const Portfolio = mongoose.model('Portfolio');
const expect = chai.expect;
let user;

chai.use(chaiHttp);

function seedPortfolioData() {
  console.info('Seeding portfolio data');
  const seedData = {
    balance: 18500,
    holdings: {
      BTC: 1,
      ETH: 50
    },
    user
  };

  return Portfolio.create(seedData);
}

function tearDownDb() {
  console.warn('Deleting database');
  return mongoose.connection.dropDatabase();
}

describe('Protected portfolio API resource', function() {
  const username = 'exampleUser';
  const password = 'examplePassword';
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
        return seedPortfolioData();
      });
  });

  afterEach(function() {
    return tearDownDb();
  });

  after(function() {
    return closeServer();
  });

  describe('GET endpoint', function() {
    it('should return the portfolio of current user', function() {
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
      let res;

      return chai
        .request(app)
        .get('/api/portfolio')
        .set('authorization', `Bearer ${token}`)
        .then(_res => {
          res = _res;
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body.portfolio).to.be.an('object');
        });
    });

    it('should return portfolio with the right fields', function() {
      let resPortfolio;
      return chai
        .request(app)
        .get('/api/portfolio')
        .set('authorization', `Bearer ${token}`)
        .then(res => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body.portfolio).to.be.an('object');
          expect(res.body.portfolio).to.include.keys('id', 'balance', 'holdings');

          resPortfolio = res.body.portfolio;
          return Portfolio.findById(resPortfolio.id);
        })
        .then(portfolio => {
          expect(resPortfolio.id).to.equal(portfolio.id);
          expect(resPortfolio.balance).to.equal(portfolio.balance);
          expect(resPortfolio.holdings).to.deep.equal(portfolio.holdings);
        });
    });

    it('should add a new portfolio with default values if none exists', function() {
      const username2 = 'exampleUser2';
      const password2 = 'examplePassword2';
      const token2 = jwt.sign(
        {
          user: {
            username2
          }
        },
        JWT_SECRET,
        {
          algorithm: 'HS256',
          subject: username,
          expiresIn: '7d'
        }
      );

      User.hashPassword(password2)
        .then(password => {
          return User.create({ username2, password2 });
        })
        .then(_user => {
          user2 = _user;
        });

      return chai
        .request(app)
        .get('/api/portfolio')
        .set('authorization', `Bearer ${token2}`)
        .then(res => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.an('object');
          expect(res.body.portfolio).to.include.keys('id', 'balance', 'holdings');
          expect(res.body.portfolio.id).to.not.be.null;
          expect(res.body.portfolio.balance).to.equal(20000); // default value
          expect(res.body.portfolio.holdings).deep.equal({}); // default value
        });
    });
  });

  describe('PUT endpoint', function() {
    it('should update the portfolio with new values', function() {
      const updateData = {
        balance: 666,
        holdings: {
          BTC: 3,
          ETH: 1,
          LTC: 500
        }
      };

      return Portfolio.findOne()
        .then(portfolio => {
          updateData.id = portfolio.id;
          return chai
            .request(app)
            .put(`/api/portfolio/${portfolio.id}`)
            .set('authorization', `Bearer ${token}`)
            .send(updateData);
        })
        .then(res => {
          expect(res).to.have.status(204);
          return Portfolio.findById(updateData.id);
        })
        .then(portfolio => {
          expect(portfolio.balance).to.equal(updateData.balance);
          expect(portfolio.holdings).to.deep.equal(updateData.holdings);
        });
    });
  });
});
