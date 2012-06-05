module.exports = {
	open: connect
};

var storage

function connect(done) {
	require('../../src/storage').open({}, function(err, st) {
		if(err) {
			process.emit('error', new Error('Could not connect to the database.'));
		}
		storage = st;
		done(null, st);
	});
};
