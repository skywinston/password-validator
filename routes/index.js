var express = require('express');
var router = express.Router();
var db = require('monk')('localhost/password-validations');
var users = db.get('users');
var bcrypt = require('bcrypt');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

router.route('/login')
.get(function(req, res, next){
  res.render('login');
})
.post(function(req,res,next){

});

router.route('/register')
.get(function(req, res, next){
  res.render('register', {errors:''});
})
.post(function(req, res, next){
  var errors = [];
  var numCount = 0;
  var symbolCount = 0;
  var symbolTest = new RegExp('.!@#$%^&*()_+-=');

  users.findOne({email: req.body.email}, function(err, user){
    if(user){
      console.log(user);
      errors.push('This email is already in use.');
      res.render('register', {errors: errors});
    } else {
      // PWs should match
      if(req.body.password !== req.body.confirmPW){
        errors.push('Passwords entered do not match');
        res.render('register', {errors: errors});
      }
      // PW must be 8 chars in length
      if(req.body.password.length < 8){
        errors.push('Your password must be at least 8 characters in length');
      }

      for (var i = 0; i < req.body.password.length; i++) {
        // PW should contain at least 1 number
        if(!isNaN(req.body.password[i])){
          numCount++;
        }
        // PW should contain at least 1 symbol
        if(symbolTest.test(req.body.password[i])){
          symbolCount++;
        }
      }

      if(symbolCount > 0){
        errors.push('Your password must contain at least one special character');
      } else if (numCount > 0){
        errors.push('Your password must contain at least one number');
      }

      console.log(numCount);
      console.log(symbolCount);

      if(errors.length > 0){
        res.render('register', {errors:errors});
      } else {
        var passwordDigest = bcrypt.hashSync(req.body.password, 10);
        users.insert({
          email: req.body.email,
          passwordDigest: passwordDigest
        }).then(function(user){
          res.render('index', {user: user});
        });
      }
    }
  });
});

module.exports = router;
