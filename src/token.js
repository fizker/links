'use strict';

module.exports = {
	generate: generate
};

var crypto = require('crypto')

function generate(args) {
	var hash = crypto.createHash('sha256')

	hash.update(Array.prototype.join.call(arguments, ':') + ':secret-salt:' + Date.now(), 'utf8');
	return hash.digest('hex');
};