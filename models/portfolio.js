'use strict';
const mongoose = require('mongoose');

const PortfolioSchema = mongoose.Schema({
  balance: { type: Number, required: true, default: 20000, min: 0 },
  holdings: { type: mongoose.Schema.Types.Mixed, required: true, default: {} },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
});

PortfolioSchema.methods.serialize = function() {
  return {
    id: this._id,
    balance: this.balance,
    holdings: this.holdings
  };
};

const Portfolio = mongoose.model('Portfolio', PortfolioSchema);

module.exports = Portfolio;
