const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const Room = require(path.join(__dirname, "..", "models", "roomModel"));
const axios = require('axios');
const cheerio =  require('cheerio');

module.exports = async (db) => {
    const url = "https://www.cbssports.com/nba/scoreboard/";
    const {data} = await axios.get(url);
    const $ = await cheerio.load(data);
    let teams = [];
    $(".team").each(function (i, elm) {
        let el = $(this).text();
        teams.push($(this).text().replace(/[\W_]+/g,""));
    });
    let games = []
    db.collection('rooms').deleteMany({});
    for(var i = 0; i < teams.length; i+=4) {
        const team1Playoff = teams[i][0];
        const team2Playoff = teams[i+2][0];

        const game = {
            "team1": teams[i+1], 
            "team1Playoff":team1Playoff,
            "team2": teams[i+3], 
            "team2Playoff": team2Playoff,
        }

        const room = new Room({
            team1: teams[i+1],
            team1Playoff: team1Playoff,
            team2: teams[i+3],
            team2Playoff: team2Playoff,
            time: [],
            chat: [] 
        });
        room.save((err, result) => {
            if(err) return console.error(err);
        });
        games.push(game);
    }
    console.log("Games arrived!");
    return games;
}