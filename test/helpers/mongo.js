module.exports = {
	open: connect
};

var storage

function connect(done) {
	require('../../src/storage').open({}, function(err, st) {
		storage = st;
		done(null, st);
	});
};
