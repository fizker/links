describe('unit/routes/links.js', function() {
	var routes = require('../../../src/routes/links')
	  , helper = require('../../helpers/routes')
	  , http
	  , caller = helper.caller
	  , storage
	  , response
	  , request

	beforeEach(function() {
		helper.setup();
		http = helper.http;
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
			, update: sinon.stub()
			};

		routes({
			http: http,
			storage: { links: storage }
		});
	});
	describe('When getting "/links/:url/edit', function() {
		describe('With a non-existing url', function() {
			beforeEach(function() {
				storage.get.yields(null, null);
				request = {
					params: {
						url: 'abc'
					}
				};
				caller(http.routes.get['/links/:url/edit'], request, response);
			});
			it('should not call render', function() {
				expect(response.render).not.to.have.been.called;
			});
			it('should call next with error code 404', function() {
				expect(caller.error.status).to.equal(404);
			});
		});
		describe('With an existing url', function() {
			beforeEach(function() {
				storage.get.withArgs('abc').yields(null, { url: 'abc' });
				request = {
					params: {
						url: 'abc'
					}
				};
				caller(http.routes.get['/links/:url/edit'], request, response);
			});
			it('should return the link', function() {
				var link = response.render.lastCall.args[1];
				expect(link).to.eql({ url: 'abc' });
			});
			it('should present the link.edit view', function() {
				var view = response.render.lastCall.args[0];
				expect(view).to.match(/link\.edit/);
			});
		});
	});
	describe('When getting "/links/:url"', function() {
		describe('with an existing url', function() {
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
		describe('with an unknown url', function() {
			beforeEach(function() {
				storage.get.yields(null, null);
				request = {
					params: {
						url: 'abc'
					}
				};
				caller(http.routes.get['/links/:url'], request, response);
			});
			it('should call next with error code 404', function() {
				expect(caller.error.status).to.equal(404);
			});
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
	describe('When posting to "/links/:url"', function() {
		beforeEach(function() {
			storage.del.withArgs('abc').yields({ url: 'abc' });
			storage.add.yields({ url: 'abc' });
		});
		describe('with the same url', function() {
			beforeEach(function() {
				request = {
					params: {
						url: 'abc'
					},
					body: {
						url: 'abc'
					}
				};
				storage.update.yields({ url: 'abc' });
				caller(http.routes.post['/links/:url'], request, response);
			});
			it('should not delete the existing', function() {
				expect(storage.del)
					.not.to.have.been.calledWith('abc');
			});
			it('should update the existing', function() {
				expect(storage.update)
					.to.have.been.calledWithMatch('abc', { url: 'abc' });
			});
		});
		describe('with updated urls', function() {
			beforeEach(function() {
				request = {
					params: {
						url: 'abc'
					},
					body: {
						url: 'def'
					}
				};
				storage.update.yields(null, { url: 'def' });
				caller(http.routes.post['/links/:url'], request, response);
			});
			it('should not fail for different urls', function() {
			var status = response.render.lastCall.args[1].status;
			expect(status).not.to.satisfy(function(num) {
				return num < 200 || num > 299;
			});
		});
			it('should not remove the old link', function() {
				expect(storage.del)
					.not.to.have.been.calledWith('abc');
			});
			it('should update the link', function() {
				expect(storage.update)
					.to.have.been.calledWithMatch('abc', { url: 'def' });
			});
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
			it('should not call render', function() {
				expect(response.render).not.to.have.been.called;
			});
			it('should call next with error code 400', function() {
				expect(caller.error.status).to.equal(400);
			});
			it('should add a validation parameter to the next call', function() {
				expect(caller.error.validation).to.exist;
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
					expect(storage.add).to.have.been.calledWithMatch({
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
			it('should not call render', function() {
				expect(response.render).not.to.have.been.called;
			});
			it('should call next with error 400', function() {
				expect(caller.error.status).to.equal(400);
			});
			it('should add a validation parameter to the next call', function() {
				expect(caller.error.validation).to.exist;
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
