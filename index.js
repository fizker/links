#!/usr/bin/env node

process.on('uncaughtException', function(err) {
	console.log('Uncaught exception: %s', err, JSON.stringify(err), err.stack);
});

require('./src/storage').open({}, storageOpened);

var storage
  , server


function storageOpened(err, st) {
	if(err) throw err;

	console.log('Storage is running..');
	storage = st;

	require('./src/server').start({
		storage: storage
	}, serverStarted);
};
function serverStarted(err, srv) {
	if(err) {
		storage.close(function() {
			throw err;
		});
	}

	server = srv;
	console.log('Server is running on port %s', server.port);
};
