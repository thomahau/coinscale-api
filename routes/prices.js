'use strict';
const express = require('express');
const passport = require('passport');
const fetch = require('node-fetch');
const { NOMICS_API_KEY } = require('../config');
const { getStartDate, parsePriceData } = require('../helpers');

const router = express.Router();
const jwtAuth = passport.authenticate('jwt', { session: false });
const NOMICS_API_URI = 'https://api.nomics.com/v1/currencies/interval';

router.get('/', jwtAuth, (req, res) => {
  console.log('Requesting price data...');
  if (!req.query.date) {
    const message = 'Missing date in request query.';
    console.error(message);
    return res.status(400).send(message);
  }

  const startDate = getStartDate(req.query.date);
  const endDate = req.query.date;
  const url = `${NOMICS_API_URI}?start=${startDate}T00%3A00%3A00Z&end=${endDate}T00%3A00%3A00Z&key=${NOMICS_API_KEY}`;

  fetch(url)
    .then(res => {
      if (!res.ok) {
        return Promise.reject(res.statusText);
      }
      return res.json();
    })
    .then(data => {
      const priceData = parsePriceData(data);
      return res.json({ priceData: priceData });
    })
    .catch(err => {
      console.error(err);
      return res.status(500).json({ message: 'Internal server error' });
    });
});

module.exports = { router };
