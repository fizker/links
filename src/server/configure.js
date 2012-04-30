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

function config(http) {
	return function() {
		http.set('view engine', 'mustache');
		http.set('views', viewsDir);
		http.set('view options', { layout: false });
		http.use(express.static(path.join(__dirname, '../../static')));
		http.use(express.bodyParser());
		http.use(acceptOutput(http));

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

function acceptOutput(http) {
	return function(request, response, next) {
		var render = response.render
		if(request.accepts('html')) {
			response.render = function(view, options, cb) {
				var opts = {};
				opts[view] = options;
				response.render = render;
				response.render(view, opts, cb);
			};
			next();
			return;
		}

		if(request.accepts('json')) {
			response.render = function(view, options) {
				response.send(options, options.status || 200);
			};
			next();
			return;
		}

		response.send(406);
	}
};
