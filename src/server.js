'use strict';

var express = require('express')
//  , consolidate = require('consolidate')
  , hogan = require('hogan.js')
  , http = express.createServer()
  , port = 8080
  , path = require('path')
  , fs = require('fs')
  , layout = hogan
	.compile(fs
		.readFileSync(
			path.join(__dirname, '../views/layout.mustache')
			, 'utf8'))


http.set('view engine', 'mustache');
http.set('views', __dirname + '/../views');
http.set('view options', { layout: false });
http.use(express.bodyParser());
http.register('.mustache', {
	compile: function() {
		var t = hogan.compile.apply(hogan, arguments);
		return function() {
			var body = t.render.apply(t, arguments);
			return layout.render({ body: body });
		}
	}
});

require('./routes')(http);

http.listen(port);
console.log('Server listening on port %s', port);