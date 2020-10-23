var express = require('express');
var router = express.Router();
var template = require('../lib/template.js');
var shortid = require('shortid');
var db = require('../lib/db');
var bcrypt = require('bcrypt');

module.exports = function(passport){
  router.get('/login', function (request, response) {
    var fmsg = request.flash();
    var feedback = '';
    if(fmsg.error){
      feedback = fmsg.error[0];
    }
    console.log(fmsg);
    var title = 'WEB - login';
    var list = template.list(request.list);
    var html = template.HTML(title, list, `
        <div style="color:red;">${feedback}</div>
        <form action="/auth/login_process" method="post">
          <p><input type="text" name="email" placeholder="email"></p>
          <p><input type="password" name="pwd" placeholder="password"></p>
          <p>
            <input type="submit" value="login">
          </p>
        </form>
      `, '');
    response.send(html);
  });

  router.post('/login_process',
    passport.authenticate('local', { 
      //successRedirect: '/',
      failureRedirect: '/auth/login',
      failureFlash:true,
      successFlash:true
    }), function(request, response){
      request.session.save(function(){
        response.redirect('/');
      });
    });

  router.get('/register', function (request, response) {
    var fmsg = request.flash();
    var feedback = '';
    if(fmsg.error){
      feedback = fmsg.error[0];
    }
    console.log(fmsg);
    var title = 'WEB - register';
    var list = template.list(request.list);
    var html = template.HTML(title, list, `
        <div style="color:red;">${feedback}</div>
        <form action="/auth/register_process" method="post">
          <p><input type="text" name="email" placeholder="email" value="root@gmail.com"></p>
          <p><input type="password" name="pwd" placeholder="password" value="toor"></p>
          <p><input type="password" name="pwd2" placeholder="password" value="toor"></p>
          <p><input type="text" name="displayName" placeholder="display name" value="Choi"></p>            
          <p>
            <input type="submit" value="register">
          </p>
        </form>
      `, '');
    response.send(html);
  });

  router.post('/register_process', function (request, response) {
    var post = request.body;
    var email = post.email;
    var pwd = post.pwd;
    var pwd2 = post.pwd2;
    var displayName = post.displayName;
  
    if(pwd !== pwd2){
      request.flash('error', 'Passoword must same!');
      response.redirect('/auth/register');
    } else{
      bcrypt.hash(pwd, 10, function(err, hash) {
        var user = {
          id:shortid.generate(),
          email:email,
          password:hash,
          displayName:displayName      
        };
        db.get('users').push(user).write();
        request.login(user, function(err){
          console.log('redirect');
          return response.redirect('/');
        })  
      });
    }
  });

  router.get('/logout', function (request, response) {
    request.logout();
    request.session.save(function(){
      response.redirect('/');
    })
  });
  return router;
}