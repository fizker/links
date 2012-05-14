'use strict';

module.exports = {
	setup: setup,
	get caller() {
		return caller;
	},
	get http() {
		return http;
	}
};

var http
  , slice = Array.prototype.slice

function caller(callstack, request, response) {
	var i = 0
	function next(err) {
		caller.error = err;
		if(err) {
			return;
		}
		var func = callstack[i++];
		if(func) func(request, response, next);
	};
	next();
}

function setup() {
	http =
		{ post: function(route) {
				this.routes.post[route] = slice.call(arguments, 1);
			}
		, get: function(route) {
				this.routes.get[route] = slice.call(arguments, 1);
			}
		, put: function(route) {
				this.routes.put[route] = slice.call(arguments, 1);
			}
		, del: function(route) {
				this.routes.del[route] = slice.call(arguments, 1);
			}
		, routes:
			{get: {}
			,post: {}
			,put: {}
			,del: {}
			}
		};

	return {
		http: http,
		caller: caller
	};
};
