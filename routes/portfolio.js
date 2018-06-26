'use strict';
const express = require('express');
const bodyParser = require('body-parser');
const passport = require('passport');
const models = require('../models');

const router = express.Router();
const jsonParser = bodyParser.json();
const jwtAuth = passport.authenticate('jwt', { session: false });
const Portfolio = models.Portfolio;
const User = models.User;

router.get('/', jwtAuth, (req, res) => {
  User.findOne({ username: req.user.username })
    .then(user => {
      return Portfolio.findOneAndUpdate(
        { user },
        { user },
        { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
      );
    })
    .then(portfolio => {
      res.json({
        portfolio: portfolio.serialize()
      });
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ message: 'Internal server error' });
    });
});

router.put('/:id', jwtAuth, jsonParser, (req, res) => {
  if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
    const message =
      `Request path id (${req.params.id}) and request body id ` + `(${req.body.id}) must match`;
    console.error(message);
    return res.status(400).json({ message: message });
  }
  const { balance, holdings } = req.body;

  Portfolio.findByIdAndUpdate(req.params.id, { $set: { balance: balance, holdings: holdings } })
    .then(portfolio => res.status(204).end())
    .catch(err => res.status(500).json({ message: 'Internal server error' }));
});

module.exports = { router };
