var express = require('express');
var router = express.Router();
var template = require('../lib/template.js');
var auth = require('../lib/auth.js');

router.get('/', function (request, response) {
  // passport가 request.user 객체를 주입.(deserialize의 authData 인자를 받음)
  console.log('/', request.user);

  var fmsg = request.flash();
  var feedback = '';
  if(fmsg.success){
    feedback = fmsg.success[0];
  } 
  if(fmsg.error){
      feedback = fmsg.error[0];
  }
  var title = 'Welcome';
  var description = 'Hello, Node.js';
  var list = template.list(request.list);
  
  var html = template.HTML(title, list,
    `
      <div style="color:green;">${feedback}</div>
      <h2>${title}</h2>${description}
      <img src="/images/hello.jpg" style="width:300px; display:block; margin-top:10px;">
      `,
    `<a href="/topic/create">create</a>`,
    auth.StatusUI(request, response)
  );
  response.send(html);
});

module.exports = router;