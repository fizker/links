#!/usr/bin/env node

var app = require('./index')
	.on('error', function(err) {
		console.log('Could not create the server: %s.', err);
	})
	.on('ready', function() {
		require('./node_modules/.bin/mocha');
	})
