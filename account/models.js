const mongoose = require('mongoose');

const Account = mongoose.model('Account', {
    type: String,
    balance: { type: Number, default: 0 },
    userId: String,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = Account;
