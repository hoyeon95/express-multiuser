var express = require('express');
var router = express.Router();
var path = require('path');
var fs = require('fs');
var sanitizeHtml = require('sanitize-html');
var template = require('../lib/template.js');
var auth = require('../lib/auth.js');
var db = require('../lib/db');
var shortid = require('shortid');

router.get('/create', function (request, response) {
  if(!auth.IsOwner(request, response)){
    response.redirect('/');
    return false;
  }
  var title = 'WEB - create';
  var list = template.list(request.list);
  var html = template.HTML(title, list, `
      <form action="/topic/create_process" method="post">
        <p><input type="text" name="title" placeholder="title"></p>
        <p>
          <textarea name="description" placeholder="description"></textarea>
        </p>
        <p>
          <input type="submit">
        </p>
      </form>
    `, '',
    auth.StatusUI(request, response));
  response.send(html);
});

router.post('/create_process', function (request, response) {
  if(!auth.IsOwner(request, response)){
    response.redirect('/');
    return false;
  }
  var post = request.body;
  var title = post.title;
  var description = post.description;
  var id = shortid.generate();
  var topic = {
    id:id,
    title:title,
    description:description,
    user_id:request.user.id
  };
  db.get('topics').push(topic).write();
  response.redirect(`/topic/${id}`);
});

router.get('/update/:pageId', function (request, response) {
  if(!auth.IsOwner(request, response)){
    response.redirect('/');
    return false;
  }
  var topic = db.get('topics').find({id:request.params.pageId}).value();
  if(request.user.id !== topic.user_id){
    request.flash('error', 'Not yours');
    return response.redirect('/');
  }
  var list = template.list(request.list);
  var html = template.HTML(topic.title, list,
    `
      <form action="/topic/update_process" method="post">
        <input type="hidden" name="id" value="${topic.id}">
        <p><input type="text" name="title" placeholder="title" value="${topic.title}"></p>
        <p>
          <textarea name="description" placeholder="description">${topic.description}</textarea>
        </p>
        <p>
          <input type="submit">
        </p>
      </form>
      `,
    `<a href="/topic/create">create</a> <a href="/topic/update/${topic.id}">update</a>`,
    auth.StatusUI(request, response)
  );
  response.send(html);
});

router.post('/update_process', function (request, response) {
  if(!auth.IsOwner(request, response)){
    response.redirect('/');
    return false;
  }
  var post = request.body;
  var id = post.id;
  var title = post.title;
  var description = post.description;
  var topic = db.get('topics').find({id:id}).value();
  if(request.user.id !== topic.user_id){
    request.flash('error', 'Not yours');
    return response.redirect('/');
  }
  db.get('topics').find({id:id}).assign({
    title:title,
    description:description
  }).write();
  response.redirect(`/topic/${id}`);
});

router.post('/delete_process', function (request, response) {
  if(!auth.IsOwner(request, response)){
    response.redirect('/');
    return false;
  }
  var post = request.body;
  var id = post.id;
  var topic = db.get('topics').find({id:id}).value();
  if(request.user.id !== topic.user_id){
    request.flash('error', 'Not yours');
    return response.redirect('/');
  }
  db.get('topics').remove({id:id}).write();
  response.redirect(`/`);
});

router.get('/:pageId', function (request, response, next) {
  var topic = db.get('topics').find({
    id:request.params.pageId
  }).value();
  var user = db.get('users').find({
    id:topic.user_id
  }).value();
  var sanitizedTitle = sanitizeHtml(topic.title);
  var sanitizedDescription = sanitizeHtml(topic.description, {
    allowedTags: ['h1']
  });
  var list = template.list(request.list);
  var html = template.HTML(sanitizedTitle, list,
    `<h2>${sanitizedTitle}</h2>
    ${sanitizedDescription}
    <p>by ${user.displayName}</p>`
    ,
    ` <a href="/topic/create">create</a> 
        <a href="/topic/update/${topic.id}">update</a>
        <form action="/topic/delete_process" method="post">
          <input type="hidden" name="id" value="${topic.id}">
          <input type="submit" value="delete">
        </form>`,
        auth.StatusUI(request, response)
  );
  response.send(html);
});
module.exports = router;