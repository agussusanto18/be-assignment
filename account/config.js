require('dotenv').config();
const mongoose = require('mongoose');

const mongoURL = process.env.MONGO_URI;

async function connectDB() {
    await mongoose.connect(mongoURL);
    console.log('MongoDb Connected');
}

module.exports = { connectDB };
