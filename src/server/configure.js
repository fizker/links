'use strict';

module.exports = config;

var express = require('express')
  , hogan = require('hogan.js')
  , path = require('path')
  , fs = require('fs')
  , middleware = require('./middleware')

  , viewsDir = path.join(__dirname, '../../views')
  // We would want a dev-switch here, and use precompiled when not in dev mode.
  , layout = { render: function(options) {
			return hogan.compile(fs
					.readFileSync(path.join(viewsDir, 'layout.mustache'), 'utf8'))
				.render(options);
		}
	}

function config(options) {
	var http = options.http
	return function() {
		http.set('view engine', 'mustache');
		http.set('views', viewsDir);
		http.set('view options', { layout: false });
		http.use(middleware.storage(options));
		http.use(middleware.accept);
		http.use(express.static(path.join(__dirname, '../../static')));
		http.use(express.bodyParser());
		http.use(require('connect-xcors')({}));

		http.use(http.router);

		http.use(middleware.errors);

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
