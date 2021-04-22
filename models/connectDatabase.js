const mongoose = require('mongoose');
const keys = require('../config/keys');

module.exports = () => {
    const URI = keys.MongoURI;
    mongoose.connect(URI, {useNewUrlParser: true, useUnifiedTopology: true});
    let db = mongoose.connection;
    db.on('error', console.error.bind(console, 'connection error:'));
    db.once('open', () => console.log("Connected to MongoDB!"));
    return db;
}