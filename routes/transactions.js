'use strict';
const express = require('express');
const bodyParser = require('body-parser');
const passport = require('passport');
const models = require('../models');

const router = express.Router();
const jsonParser = bodyParser.json();
const jwtAuth = passport.authenticate('jwt', { session: false });
const Transaction = models.Transaction;
const User = models.User;

router.get('/', jwtAuth, (req, res) => {
  User.findOne({ username: req.user.username })
    .then(user => {
      return Transaction.find({ user }).sort('-date');
    })
    .then(transactions => {
      res.json({
        transactions: transactions.map(transaction => transaction.serialize())
      });
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ message: 'Internal server error' });
    });
});

router.post('/', jwtAuth, jsonParser, (req, res) => {
  const requiredFields = ['date', 'type', 'symbol', 'price', 'amount'];
  for (let i = 0; i < requiredFields.length; i++) {
    const field = requiredFields[i];
    if (!(field in req.body)) {
      const message = `Missing \`${field}\` in request body`;
      console.error(message);
      return res.status(400).send(message);
    }
  }

  User.findOne({ username: req.user.username })
    .then(user => {
      return Transaction.create({
        date: req.body.date,
        type: req.body.type,
        symbol: req.body.symbol,
        price: req.body.price,
        amount: req.body.amount,
        user: user
      });
    })
    .then(transaction => res.status(201).json(transaction.serialize()))
    .catch(err => {
      console.error(err);
      res.status(500).json({ message: 'Internal server error' });
    });
});

module.exports = { router };
