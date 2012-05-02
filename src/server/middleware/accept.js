'use strict';

module.exports = accept;

function accept(request, response, next) {
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
};
