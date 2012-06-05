#!/usr/bin/env node

process.on('uncaughtException', function(err) {
	console.log('Uncaught exception: %s', err, JSON.stringify(err), err.stack);
});

require('./src/storage').open({}, storageOpened);

var storage
  , server
  , EventEmitter = require('events').EventEmitter
  , events = new EventEmitter()

events.on('error', function() {});
module.exports = events;

function storageOpened(err, st) {
	if(err) {
		console.log('%s\nCould not create a connection to the database.', err.toString());
		events.emit('error', err);
		return;
	}

	console.log('Storage is running..');
	storage = st;

	require('./src/server').start({
		storage: storage
	}, serverStarted);
};
function serverStarted(err, srv) {
	if(err) {
		console.log('%s\nCould not create the web-server.', err.toString());
		storage.close(function() {});
		events.emit('error', err);
		return;
	}

	server = srv;
	console.log('Server is running on port %s', server.port);
	events.emit('ready', { server: server, storage: storage });
};
