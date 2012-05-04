'use strict';

module.exports.start = start;

var express = require('express')
//  , consolidate = require('consolidate')
  , port = 8080
  , server
  , http

function start(options, callback) {
	options.http = http = express.createServer();
	server = {
		port: options.port || port,
		http: http
	};

	http.configure(require('./configure')(options));

	require('./../routes')(options);

	http.listen(port);

	callback(null, server);
};
