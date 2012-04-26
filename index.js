#!/usr/bin/env node

process.on('uncaughtException', function(err) {
	console.log('Uncaught exception: %s', err, JSON.stringify(err), err.stack);
});

require('./src/server');
