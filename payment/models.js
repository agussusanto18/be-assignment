const mongoose = require('mongoose');

const Transaction = mongoose.model('Transaction', {
    accountId: String,
    amount: Number,
    currency: String,
    toAddress: String,
    status: { type: String, default: 'PENDING' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = Transaction;
