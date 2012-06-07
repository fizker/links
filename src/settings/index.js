module.exports = {
	load: load
};

var fs = require('fs')
  , path = require('path')

function load(name) {
	return JSON.parse(
		fs.readFileSync(
			path.join(__dirname, name + '.json'), 'utf8'));
};
