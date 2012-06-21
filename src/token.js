'use strict';

module.exports = {
	generate: generate
};

var crypto = require('crypto')

function generate(args) {
	var hash = crypto.createHash('sha256')
	  , now = new Date()

	hash.update(Array.prototype.join.call(arguments, ':') + ':secret-salt:' + now.getTime(), 'utf8');
	return { key: hash.digest('hex'), created: now.toISOString() };
};