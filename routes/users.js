const express = require('express');
const router = express.Router();
const path = require('path');
const User = require(path.join(__dirname, "..", "models", "userModel"));
const bcrypt = require('bcryptjs');
const passport = require('passport');

router.get('/login', (req, res) => {
    res.render("login");
});

router.get('/register', (req, res) => {
    res.render("register");
});

router.post('/register', (req, res) => {
    const {username, email, password, password2} = req.body;
    let errors = [];
    if(!username || !email || !password || !password2) {
        errors.push({msg: "Please fill in all fields."});
    }

    if(password !== password2) {
        errors.push({msg: "Passwords do not match."});
    }

    if(password.length < 6) {
        errors.push({msg: "Password should be at least 6 characters."});
    }

    if(errors.length > 0) {
        res.render('register', {errors, username, email, password, password2});
    } else {
        User.findOne({email: email})
            .then(user => {
                if(user) {
                    errors.push({msg: "Email is already registered."});
                    res.render('register', {errors, username, email, password, password2});
                }
                else {
                    User.findOne({username: username})
                    .then(user => {
                        if(user) {
                            errors.push({msg: "Username is already registered."});
                            res.render('register', {errors, username, email, password, password2});
                        }
                        else {
                            const newUser = new User({ username, email, password });
                            bcrypt.genSalt(10, (err, salt) => 
                                {bcrypt.hash(newUser.password, salt, 
                                    (err, hash) => {
                                        if(err) throw err;
                                        newUser.password = hash;
                                        newUser.save()
                                        .then(user => {
                                            req.flash('success_msg', "You are now registered and can login!");
                                            res.redirect('/users/login');
                                        })
                                        .catch(err => console.error(err));
        
                                     });
                                 });

                        }

                    });
                   

                }
            })
    }

});

router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: "/users/login",
        failureFlash: true
    })(req,res,next);
});

router.get('/logout', (req,res) => {
    req.logout();
    req.flash('success_msg', "You are logged out!");
    res.redirect('/users/login');
});

module.exports = router;