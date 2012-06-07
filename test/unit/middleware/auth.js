describe('unit/middleware/auth.js', function() {
	var middleware = require('../../../src/server/middleware/auth')
	  , request
	  , response
	  , nextSpy

	beforeEach(function() {
		request = {
			accepts: sinon.stub(),
			header: sinon.stub(),
			storage: {
				users: {
					byToken: sinon.stub(),
					verify: sinon.stub()
				}
			}
			, cookies: {}
		};
		request.storage.users
			.verify.yields(null, false);
		request.storage.users
			.verify.withArgs('valid', 'creds').yields(null, {
				username: 'abc',
				token: 'aaa'
			});
		request.storage.users
			.byToken.yields(null, false);

		response = {
			cookie: sinon.spy(),
			headers: {},
			header: sinon.spy(function(key, value) {
				this.headers[key] = value;
			}),
			send: sinon.stub(),
			render: sinon.stub()
		};
		nextSpy = sinon.spy();
	});
	describe('When logging in and asking for html', function() {
		beforeEach(function() {
			request.accepts.withArgs('html').returns(true);
			request.header.withArgs('x-user-token').returns('aaa');
			request.storage.users.byToken.yields(null, { token: 'aaa' });
			middleware(request, response, nextSpy);
		});
		it('should set the token to the header', function() {
			expect(response.cookie)
				.to.have.been.calledWithMatch('token', 'aaa');
		});
	});
	describe('When using the post-middleware', function() {
		beforeEach(function() {
			request.accepts.withArgs('html').returns(true);
		});
		describe('with valid credentials', function() {
			beforeEach(function() {
				request.body = { username: 'valid', password: 'creds' };
				middleware.postLogin(request, response, nextSpy);
			});
			it('should attempt to validate', function() {
				expect(request.storage.users.verify)
					.to.have.been.calledWith('valid', 'creds');
			});
			it('should call next', function() {
				expect(nextSpy)
					.to.have.been.calledWithExactly();
			});
			it('should set a cookie', function() {
				expect(response.cookie)
					.to.have.been.calledWithMatch('token', 'aaa');
			});
		});
		describe('with invalid credentials', function() {
			beforeEach(function() {
				request.body = { username: 'abc', password: 'def' };
				middleware.postLogin(request, response, nextSpy);
			});
			it('should not call next', function() {
				expect(nextSpy)
					.not.to.have.been.called;
			});
			it('should render the login-view', function() {
				expect(response.render)
					.to.have.been.calledWithMatch('login');
			});
		});
	});
	describe('When using cookie', function() {
		beforeEach(function() {

		});
		xit('should check the cookie as a token', function() {
		});
	});
	describe('When using header-token', function() {
		describe('that is valid', function() {
			beforeEach(function() {
				request.header.withArgs('x-user-token').returns('aaa');
				request.storage.users.byToken.withArgs('aaa').yields(null, { username: 'abc' });
				middleware(request, response, nextSpy);
			});
			it('should call next-spy', function() {
				expect(nextSpy).to.have.been.calledWithExactly();
			});
			it('should attach user info to the request', function() {
				expect(request.user)
					.to.eql({ username: 'abc' });
			});
		});
		describe('that is invalid', function() {
			it('should call next with an error');
		});
	});
	describe('When using http-authentication', function() {
		describe('and valid credentials', function() {
			beforeEach(function() {
				var credentials = 'valid:creds'
					// created with btoa('valid:creds')
				  , asBase64 = 'dmFsaWQ6Y3JlZHM='

				request.header.withArgs('Authorization').returns('Basic dmFsaWQ6Y3JlZHM=');
				middleware(request, response, nextSpy);
			});
			it('should call next', function() {
				expect(nextSpy).to.have.been.calledWithExactly();
			});
			it('should attach user info to the request', function() {
				expect(request.user)
					.to.approximate({ username: 'abc' });
			});
			it('should not call any of the response functions', function() {
				expect(response.send).not.to.have.been.called;
				expect(response.render).not.to.have.been.called;
			});
		});
		describe('and invalid credentials', function() {
			beforeEach(function() {
				var credentials = 'invalid:creds'
					// created with btoa('abc:def')
				  , asBase64 = 'aW52YWxpZDpjcmVkcw=='

				request.header.withArgs('Authorization').returns('Basic aW52YWxpZDpjcmVkcw==');
				middleware(request, response, nextSpy);
			});
			it('should call send with error status 401', function() {
				expect(response.send)
					.to.have.been.calledWith(401);
			});
		});
	});
	describe('When not authorized', function() {
		describe('while requesting html', function() {
			beforeEach(function() {
				request.accepts.withArgs('html').returns(true);
				request.accepts.withArgs('text/html').returns(true);
				middleware(request, response, nextSpy);
			});
			it('should render the login view', function() {
				var view = response.render.lastCall.args[0]
				expect(view).to.have.string('login');
			});
			it('should not call send', function() {
				expect(response.send).not.to.have.been.called;
			});
			it('should not call next', function() {
				expect(nextSpy).not.to.have.been.called;
			});
		});
		describe('while not requesting html', function() {
			beforeEach(function() {
				request.accepts.returns(false);
				middleware(request, response, nextSpy);
			});
			it('should send header 401', function() {
				expect(response.send).to.have.been.calledWith(401);
			});
			it('should ask for basic auth in header', function() {
				expect(response.headers['WWW-Authenticate'])
					.to.have.string('Basic realm=')
			});
			it('should not call next', function() {
				expect(nextSpy).not.to.have.been.called;
			});
		});
	});
});