'use strict';
const mongoose = require('mongoose');

const TransactionSchema = mongoose.Schema({
  date: { type: String, required: true },
  type: { type: String, required: true },
  symbol: { type: String, required: true },
  price: { type: Number, required: true },
  amount: { type: Number, required: true },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
});

TransactionSchema.methods.serialize = function() {
  return {
    id: this._id,
    date: this.date,
    type: this.type,
    symbol: this.symbol,
    price: this.price,
    amount: this.amount
  };
};

const Transaction = mongoose.model('Transaction', TransactionSchema);

module.exports = Transaction;
