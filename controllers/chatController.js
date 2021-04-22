const socketio = require('socket.io');
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cron = require("node-cron");
const Room = require(path.join(__dirname, "..", "models", "roomModel"));
const liveScoreController = require(path.join(__dirname, "..", "controllers", "liveScoreController"));

let Guests = {};

module.exports = async function(server, db) {
    const io = socketio(server);
    const url = "https://www.cbssports.com/nba/scoreboard/";
    //make this a cron for every minute
    let liveGameInfo = await liveScoreController(io, url);
    cron.schedule('*/1 * * * *', async () => {
        liveGameInfo = await liveScoreController(io, url);
    });

    let previousUserName = "";
    let isColorWhite = true;
    let color = "#FFFFFF";
   
    io.on('connection', async (socket) => {
        console.log('a user connected');
        socket.join(socket.id);
        io.to(socket.id).emit("score change",liveGameInfo);
        socket.leave(socket.id);
        socket.on('disconnect', () => {
            console.log('user disconnected');
        });

        socket.on('room change', (team1, team2) => {
            socket.leave(socket.roomName);
            socket.roomName = team1 + " V " + team2;
            socket.team1 =  team1;
            socket.team2 = team2;
            socket.join(socket.id);
            Room.findOne({team1: socket.team1, team2: socket.team2}, function(err, data) {
                if(data !== null)
                    io.to(socket.id).emit('room change', data.chat); 
            });
            socket.join(socket.roomName);
            console.log("user joined " + socket.roomName);
        })

  
        socket.on('chat message', (msg, username) => {
            var date = new Date();
            if(username === "Guest") {
                username += " (";
                username += socket.id.substring(0, 6);
                username += ")";
            }
            if(username !== previousUserName) {
                isColorWhite = !isColorWhite;
                if(isColorWhite) color = "#FFFFFF";
                else color = "#EEEEEE";
                previousUserName = username;
            }
            socket.username = username;
            var chatObj = {msg: msg, date: date, username:username, color:color}
            console.log(msg);
            console.log(socket.roomName);   
            io.to(socket.roomName).emit('chat message',  date, msg, username, color);
            Room.update(
                {team1: socket.team1, team2: socket.team2},
                 {$push: {chat: chatObj}},
                 (err, result) => {if(err) console.error(err);}
            );
        });


    });

}