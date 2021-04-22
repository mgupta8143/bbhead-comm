mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
    team1: String,
    team1Playoff: String,
    team2: String,
    team2Playoff: String,
    chat: [{
        msg: String,
        date: Date,
        username: String,
        color: String
    }]
});

module.exports = mongoose.model("rooms", roomSchema);


