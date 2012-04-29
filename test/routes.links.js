describe('routes.links.js', function() {
	var routes = require('../src/routes/links')
	  , http
	  , slice = Array.prototype.slice
	  , caller = function(callstack, request, response) {
			var i = 0;
			function next(err) {
				if(err) throw err;
				var func = callstack[i++];
				if(func) func(request, response, next);
			}
			next();
		}
	beforeEach(function() {
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

		routes(http);
	});
	describe('When posting to "/links"', function() {
		beforeEach(function() {
			var request = {
					params: {},
					body: {
						url: 'abc',
						title: 'def'
					}
				}
			  , response = {
					locals: {},
					render: function() {},
					local: function(key, val) {
						if(val) this.locals[key] = val;
						else return this.locals[key];
					}
				}
			caller(http.routes.post['/links'], request, response);
		});
		it('should store the link', function() {
			expect(routes.links['abc']).to.eql({ url: 'abc', title: 'def'});
		});
	});
	
});