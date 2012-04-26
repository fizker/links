'use strict';

var express = require('express')
//  , consolidate = require('consolidate')
  , http = express.createServer()
  , port = 8080

http.configure(require('./configure')(http));

require('./../routes')(http);

http.listen(port);
console.log('Server listening on port %s', port);