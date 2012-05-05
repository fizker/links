describe('routes.links.js', function() {
	var routes = require('../src/routes/links')
	  , http
	  , storage
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
			, headers: {}
			, header: function(key, val) {
					if(val) this.headers[key] = val;
					else return this.headers[key];
				}
			};
		storage = 
			{ get: sinon.stub()
			, del: sinon.stub()
			, add: sinon.stub()
			};

		routes({
			http: http,
			storage: { links: storage }
		});
	});
	describe('When getting "/links/abc"', function() {
		beforeEach(function() {
			storage.get.withArgs('abc').yields(null, { url: 'abc' });
			request = {
				params: {
					url: 'abc'
				}
			};
			caller(http.routes.get['/links/:url'], request, response);
		});
		it('should return the requested link', function() {
			var links = response.render.lastCall.args[1];
			expect(links).to.eql({ url: 'abc' });
		});
	});
	describe('When getting "/links"', function() {
		beforeEach(function() {
			storage.get.withArgs().yields(null,
				[{ url: 'abc' }
				,{ url: 'def' }
				]);
			request = {};
			caller(http.routes.get['/links'], request, response);
		});
		it('should return a list of links', function() {
			var links = response.render.lastCall.args[1];
			expect(links).to.eql([
				{ url: 'abc' }, { url: 'def' }
			]);
		});
	});
	describe('When putting to "/links/:url"', function() {
		describe('with invalid data', function() {
			beforeEach(function() {
				request = {
					params: {
						url: 'abc'
					},
					body: {
						text: 'def'
					}
				};
				caller(http.routes.put['/links/:url'], request, response);
			});
			it('should not store the link', function() {
				expect(storage.add).not.to.have.been.called;
			});
			it('should call next with error', function() {
				expect(caller.error).to.exist;
			});
			it('should return status code 400', function() {
				var options = response.render.lastCall.args[1];
				expect(options.status).to.equal(400);
			});
		});
		describe('with valid data', function() {
			describe('and there is already data there', function() {
				beforeEach(function() {
					storage.add.yields(null, {
						url: 'after adding'
					});
					routes.links['abc'] = { text: 'old' };
					request = {
						params: {
							url: 'abc'
						},
						body: {
							url: 'abc',
							text: 'def'
						}
					};
					caller(http.routes.put['/links/:url'], request, response);
				});
				it('should be replaced', function() {
					expect(storage.add).to.have.been.calledWith({
						encodedUrl: 'abc',
						url: 'abc',
						text: 'def'
					});
				});
				it('should render the new link', function() {
					expect(response.render).to.have.been.calledWith('link', {
						url: 'after adding'
					});
				});
			});
			describe('and there is no data there', function() {
				beforeEach(function() {
					storage.add.yields(null, { url: 'after adding' });
					request = {
						params: {
							url: 'http://a.b/c'
						},
						body: {
							url: 'http://a.b/c',
							text: 'def'
						}
					};
					caller(http.routes.put['/links/:url'], request, response);
				});
				it('should be created', function() {
					expect(storage.add).to.have.been.called;
				});
				it('should add an encodedUrl version of the url', function() {
					expect(storage.add).to.have.been.calledWith({
						encodedUrl: 'http%3A%2F%2Fa.b%2Fc',
						url: 'http://a.b/c',
						'text': 'def'
					});
				});
				it('should render the new link', function() {
					expect(response.render).to.have.been.calledWith('link', {
						url: 'after adding'
					});
				});
			});
		});
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
			it('should not store the link', function() {
				expect(storage.add).not.to.have.been.called;
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
				storage.add.yields(null, {
					encodedUrl: 'http%3A%2F%2Fa.b%2Fc',
					url: 'http://a.b/c',
					title: 'def'
				});
				request = {
						params: {},
						body: {
							url: 'http://a.b/c',
							title: 'def'
						}
					}
				caller(http.routes.post['/links'], request, response);
			});
			it('should store the link', function() {
				expect(storage.add).to.have.been.called;
			});
			it('should add an encoded url', function() {
				expect(storage.add).to.have.been.calledWith({
					encodedUrl: 'http%3A%2F%2Fa.b%2Fc',
					url: 'http://a.b/c',
					title: 'def'
				});
			});
			it('should set location to point to the new link', function() {
				expect(response.headers['location']).to.equal('/links/http%3A%2F%2Fa.b%2Fc');
			});
			it('should set status code 201 (created)', function() {
				expect(response.locals.status).to.equal(201);
			});
		});
	});
	describe('When making delete-request', function() {
		beforeEach(function() {
			storage.del.yields(null, { url: 'abc' });
			request = {
					params: {
						url: 'abc'
					}
				}
			caller(http.routes.del['/links/:url'], request, response);
		});
		it('should remove the requested link', function() {
			expect(storage.del).to.have.been.calledWith('abc');
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
