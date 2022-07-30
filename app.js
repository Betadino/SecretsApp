//jshint esversion:6
require('dotenv').config()
// console.log(process.env) // remove this after you've confirmed it working
const express = require('express')
const app = express();
const port = 3000;
const bodyParser = require('body-parser');
let ejs = require('ejs');
const mongoose = require('mongoose');
var encrypt = require('mongoose-encryption');
app.use(bodyParser.urlencoded({
  extended: true
}));
app.set('view engine', 'ejs');
app.use(express.static("public"));

main().catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://localhost:27017/userDB');

  const userSchema = mongoose.Schema({
    email: String,
    password: String
  });

  userSchema.plugin(encrypt, { secret: process.env.SECRET, encryptedFields: ['password'] });

  const User = new mongoose.model("User", userSchema);

  app.get('/', (req, res) => {
    res.render('home');
  })

  app.get('/login', (req, res) => {
    res.render('login');
  })

  app.get('/register', (req, res) => {
    res.render('register');
  })

  app.post('/register', (req, res)=>{
    const newUser = new User ({
      email: req.body.email,
      password: req.body.password
    });
    newUser.save((err)=>{
      if(!err){
        res.render('secrets');
      } else {
        console.log(err);
      }
    });
  });

  app.post('/login', (req, res)=>{
    const username = req.body.username;
    const password = req.body.password;

    User.findOne({email: username}, (err, foundUser)=>{
      if(err){
        console.log(err);
      } else {
        if(foundUser){
          if(foundUser.password === password){
            res.render('secrets');
          } else {
            res.redirect('/login');
          }
        }
        // else {}
      }
    })
  })

  app.listen(port, () => {
    console.log('Example app listening on port: ' + port);
  })

};
