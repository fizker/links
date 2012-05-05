'use strict';

module.exports = config;

var express = require('express')
  , hogan = require('hogan.js')
  , path = require('path')
  , fs = require('fs')

  , viewsDir = path.join(__dirname, '../../views')
  , layout = hogan
	.compile(fs
		.readFileSync(path.join(viewsDir, 'layout.mustache'), 'utf8'))

function config(options) {
	var http = options.http
	return function() {
		http.set('view engine', 'mustache');
		http.set('views', viewsDir);
		http.set('view options', { layout: false });
		http.use(express.static(path.join(__dirname, '../../static')));
		http.use(express.bodyParser());
		http.use(require('./middleware/accept'));

		http.register('.mustache', {
			compile: function() {
				var t = hogan.compile.apply(hogan, arguments);
				return function() {
					var body = t.render.apply(t, arguments);
					return layout.render({ body: body });
				}
			}
		});
	}
};
