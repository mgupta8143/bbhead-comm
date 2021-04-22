const express = require('express');
const http = require('http');
const { urlencoded } = require('body-parser');
const path = require('path');
const { connect } = require('http2');
const cron = require("node-cron");
const chatController = require(path.join(__dirname, "controllers", "chatController"));
const connectDatabase = require("./models/connectDatabase");
const roomController = require(path.join(__dirname, "controllers", "roomController"));
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');

const app = express();
const server = http.createServer(app);

require('./config/passport')(passport);


app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static("./public"));
app.use(urlencoded({extended: false}));
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
})

app.use('/users', require(path.join(__dirname, "routes", "users")));

const PORT = process.env.PORT || 3000;

const db = connectDatabase();
chatController(server, db);
let games = {}

//at 7, clear all the previous rooms and add the new room 
roomController(db).then((res) => {
    games = res;
})  //add crons to do this at 5 AM and once at the beginning.

cron.schedule("0 5 * * *", function() {
    roomController(db).then((res) => {
        games = res;
    })
});

app.get("/", async (req, res) => {
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.header('Expires', '-1');
    res.header('Pragma', 'no-cache');
    res.render('home', {games:games, user:req.user, authenticated: req.isAuthenticated()});
    //with the user we can get different properties
})



server.listen(PORT, () => console.log(`Listening on port ${PORT}`));





