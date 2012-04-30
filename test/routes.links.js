describe('routes.links.js', function() {
	var routes = require('../src/routes/links')
	  , http
	  , sinon = require('sinon')
	  , slice = Array.prototype.slice
	  , caller = function(callstack, request, response) {
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
	  , response
	  , request
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
		response =
			{ locals: {}
			, render: sinon.spy()
			, local: function(key, val) {
					if(val) this.locals[key] = val;
					else return this.locals[key];
				}
			};

		routes(http);
	});
	describe('When posting to "/links"', function() {
		describe('and the data is invalid', function() {
			beforeEach(function() {
				request = {
						params: {},
						body: {
							title: 'def'
						}
					}
				caller(http.routes.post['/links'], request, response);
			});
			it('should give an error 400', function() {
				var options = response.render.lastCall.args[1];
				expect(options.status).to.equal(400);
			});
			it('should call next with an error', function() {
				expect(caller.error).to.exist;
			});
		});
		describe('and the data is valid', function() {
			beforeEach(function() {
				request = {
						params: {},
						body: {
							url: 'abc',
							title: 'def'
						}
					}
				caller(http.routes.post['/links'], request, response);
			});
			it('should store the link', function() {
				expect(routes.links['abc']).to.eql({ url: 'abc', title: 'def'});
			});
		});
	});
	describe('When making delete-request', function() {
		beforeEach(function() {
			routes.links['abc'] = {};
			request = {
					params: {
						url: 'abc'
					}
				}
			caller(http.routes.del['/links/:url'], request, response);
		});
		it('should remove the requested link', function() {
			expect(routes.links['abc']).to.not.exist;
		});
		it('should end with code 200', function() {
			var responseCode = response.render.lastCall.args[1].status;
			expect(responseCode).to.equal(200);
		});
		it('should only render once', function() {
			expect(response.render).to.have.been.calledOnce;
		});
	});
});
