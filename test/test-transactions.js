'use strict';
const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const format = require('date-fns/format');
const { app, runServer, closeServer } = require('../server');
const { JWT_SECRET, TEST_DATABASE_URL } = require('../config');

const User = mongoose.model('User');
const Transaction = mongoose.model('Transaction');
const expect = chai.expect;
let user;

chai.use(chaiHttp);

function seedTransactionData() {
  console.info('Seeding transaction data');
  const seedData = [];

  for (let i = 0; i <= 5; i++) {
    seedData.push(generateTransactionData());
  }
  return Transaction.insertMany(seedData);
}

function randomDate(start, end) {
  return format(
    new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())),
    'YYYY-MM-DD'
  );
}

function generateTransactionData() {
  const date = randomDate(new Date(2017, 1, 1), new Date(2018, 6, 1));
  const type = ['Buy', 'Sell'][Math.floor(Math.random() * 2)];
  const symbol = ['BTC', 'ETH', 'LTC'][Math.floor(Math.random() * 3)];
  const price = [10, 5, 100][Math.floor(Math.random() * 3)];
  const amount = Math.floor(Math.random() * 10);
  return {
    date,
    type,
    symbol,
    price,
    amount,
    user
  };
}

function tearDownDb() {
  console.warn('Deleting database');
  return mongoose.connection.dropDatabase();
}

describe('Protected transactions API resource', function() {
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
        return seedTransactionData();
      });
  });

  afterEach(function() {
    return tearDownDb();
  });

  after(function() {
    return closeServer();
  });

  describe('Protection', function() {
    it('Should reject requests with no credentials', function() {
      return chai
        .request(app)
        .get('/api/transactions')
        .then(res => {
          expect(res).to.have.status(401);
        });
    });

    it('Should reject requests with an invalid token', function() {
      const incorrectToken = jwt.sign(
        {
          user: username
        },
        'wrongSecret',
        {
          algorithm: 'HS256',
          subject: username,
          expiresIn: '7d'
        }
      );

      return chai
        .request(app)
        .get('/api/transactions')
        .set('Authorization', `Bearer ${incorrectToken}`)
        .then(res => {
          expect(res).to.have.status(401);
        });
    });

    it('Should reject requests with an expired token', function() {
      const expiredToken = jwt.sign(
        {
          user: {
            username
          },
          exp: Math.floor(Date.now() / 1000) - 10 // Expired ten seconds ago
        },
        JWT_SECRET,
        {
          algorithm: 'HS256',
          subject: username
        }
      );

      return chai
        .request(app)
        .get('/api/transactions')
        .set('authorization', `Bearer ${expiredToken}`)
        .then(res => {
          expect(res).to.have.status(401);
        });
    });
  });

  describe('GET endpoint', function() {
    it('should return all existing transactions for current user', function() {
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
        .get('/api/transactions')
        .set('authorization', `Bearer ${token}`)
        .then(_res => {
          res = _res;
          expect(res).to.have.status(200);
          expect(res.body.transactions).to.have.length.of.at.least(1);
          return Transaction.count();
        })
        .then(count => {
          expect(res.body.transactions).to.have.lengthOf(count);
        });
    });

    it('should return transactions with the right fields', function() {
      let resTransaction;
      return chai
        .request(app)
        .get('/api/transactions')
        .set('authorization', `Bearer ${token}`)
        .then(res => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body.transactions).to.be.a('array');
          expect(res.body.transactions).to.have.length.of.at.least(1);

          res.body.transactions.forEach(transaction => {
            expect(transaction).to.be.a('object');
            expect(transaction).to.include.keys('id', 'date', 'type', 'symbol', 'price', 'amount');
          });
          resTransaction = res.body.transactions[0];
          return Transaction.findById(resTransaction.id);
        })
        .then(transaction => {
          expect(resTransaction.id).to.equal(transaction.id);
          expect(resTransaction.date).to.equal(transaction.date);
          expect(resTransaction.type).to.equal(transaction.type);
          expect(resTransaction.symbol).to.equal(transaction.symbol);
          expect(resTransaction.price).to.equal(transaction.price);
          expect(resTransaction.amount).to.equal(transaction.amount);
        });
    });
  });

  describe('POST endpoint', function() {
    it('should add a new transaction', function() {
      const newTransaction = generateTransactionData();

      return chai
        .request(app)
        .post('/api/transactions')
        .set('authorization', `Bearer ${token}`)
        .send(newTransaction)
        .then(res => {
          expect(res).to.have.status(201);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body).to.include.keys('id', 'date', 'type', 'symbol', 'price', 'amount');
          expect(res.body.id).to.not.be.null;
          expect(res.body.date).to.equal(newTransaction.date);
          expect(res.body.type).to.equal(newTransaction.type);
          expect(res.body.symbol).to.equal(newTransaction.symbol);
          expect(res.body.price).to.equal(newTransaction.price);
          return Transaction.findById(res.body.id);
        })
        .then(transaction => {
          expect(transaction.type).to.equal(newTransaction.type);
          expect(transaction.symbol).to.equal(newTransaction.symbol);
          expect(transaction.amount).to.equal(newTransaction.amount);
        });
    });
  });
});
