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

	http.listen(port, function(err) {
		// TODO: If the port is in use, this is not actually called.
		// We would want to look at that at some point.
		if(err) {
			return callback(err, {
				port: options.port || port
			});
		}
		callback(null, server);
	});
};
