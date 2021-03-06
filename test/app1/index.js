// Copyright IBM Corp. 2015. All Rights Reserved.
// Node module: strong-runner
// This file is licensed under the Artistic License 2.0.
// License text available at https://opensource.org/licenses/Artistic-2.0

'use strict';

var assert = require('assert');
var env = process.env;
var fs = require('fs');
var http = require('http');

console.log('APPNAME %s', process.env.APPNAME || 'app');
console.log('PID %d', process.pid);
console.log('CWD %s', process.cwd());
console.log('ENV.supervisor_profile:', env.supervisor_profile);
console.log('ENV.PATH:', env.PATH);
console.log('ENV.PWD:', env.PWD);

// Check PWD is a symlink to our current working directory.
assert.notEqual(env.PWD, process.cwd());
assert.equal(fs.realpathSync(env.PWD), process.cwd());

http.createServer(onRequest) .listen(process.env.PORT || 0, function() {
  console.log('pid %d listening on %s', process.pid, this.address().port);

  // Used to verify process existence/health
  fs.writeFileSync('app.pid', process.pid);
  fs.writeFileSync('app.port', this.address().port);
});

function onRequest(req, res) {
  switch (req.url) {
    case '/env':
      res.end(JSON.stringify(process.env, null, 2) + '\n\n');
      break;
    default:
      res.end(req.method + ' ' + req.url + '\n\n');
      break;
  }
}

function handler(signame) {
  var signo = process.binding('constants')[signame];
  console.log('die on %s (%s)', signame, signo);
  process.kill(process.pid, signame);
}

function exitOn(signame) {
  process.once(signame, handler.bind(null, signame));
}

exitOn('SIGTERM');
exitOn('SIGINT');
exitOn('SIGHUP');
