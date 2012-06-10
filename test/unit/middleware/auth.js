describe('unit/middleware/auth.js', function() {
	var middleware = require('../../../src/middleware/auth')
	  , storage
	  , request
	  , response
	  , nextSpy

	beforeEach(function() {
		storage = {
			users: {
				byToken: sinon.stub(),
				verify: sinon.stub()
			}
			, bind: sinon.stub()
		};
		storage.bind.returns('bound-storage');
		storage.users
			.verify.yields(null, false);
		storage.users
			.verify.withArgs('valid', 'creds').yields(null, {
				username: 'abc',
				token: 'aaa'
			});
		storage.users
			.byToken.yields(null, false);

		request = {
			accepts: sinon.stub(),
			header: sinon.spy(function(key) {
				return this.headers[key];
			}),
			headers: {},
			storage: storage
			, cookies: {}
		};

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
	describe('When using the post-middleware', function() {
		describe('with valid credentials', function() {
			beforeEach(function() {
				request.body = { username: 'valid', password: 'creds' };
				middleware.postLogin(request, response, nextSpy);
			});
			it('should attempt to validate', function() {
				expect(storage.users.verify)
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
			it('should call next with error 401', function() {
				expect(nextSpy)
					.to.have.been.calledWithMatch({ status: 401 });
			});
		});
	});
	describe('When using cookie', function() {
		beforeEach(function() {
			request.cookies['x-user-token'] = 'cookie';
			storage.users.byToken.withArgs('cookie')
				.yields(null, { username: 'abc' });
			middleware(request, response, nextSpy);
		});
		it('should bind the storage to the user id', function() {
			expect(storage.bind)
				.to.have.been.calledWith({
					username: 'abc'
					});
		});
		it('should check the cookie as a token', function() {
			expect(storage.users.byToken)
				.to.have.been.calledWith('cookie');
		});
	});
	describe('When using header-token', function() {
		describe('that is valid', function() {
			beforeEach(function() {
				request.headers['x-user-token'] = 'aaa';
				storage.users.byToken.withArgs('aaa').yields(null, { username: 'abc' });
				middleware(request, response, nextSpy);
			});
			it('should bind the storage to the user id', function() {
				expect(storage.bind)
					.to.have.been.calledWith({
						username: 'abc'
						});
			});
			it('should not set cookies', function() {
				expect(response.cookie)
					.not.to.have.been.called;
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
			beforeEach(function() {
				request.headers['x-user-token'] = 'aaa';
				storage.users.byToken.yields(null, null);
				middleware(request, response, nextSpy);
			});
			it('should call next with an error', function() {
				expect(nextSpy)
					.to.have.been.calledWithMatch({ status: 401 });
			});
		});
	});
	describe('When using http-authentication', function() {
		describe('and valid credentials', function() {
			beforeEach(function() {
				var credentials = 'valid:creds'
					// created with btoa('valid:creds')
				  , asBase64 = 'dmFsaWQ6Y3JlZHM='

				request.headers['Authorization'] = 'Basic dmFsaWQ6Y3JlZHM=';
				middleware(request, response, nextSpy);
			});
			it('should bind the storage to the user id', function() {
				expect(storage.bind)
					.to.have.been.calledWith({
						username: 'abc'
						, token: 'aaa'
						});
			});
			it('should replace request.storage', function() {
				expect(request.storage)
					.to.equal('bound-storage');
			});
			it('should not set cookies', function() {
				expect(response.cookie)
					.not.to.have.been.called;
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

				request.headers['Authorization'] = 'Basic aW52YWxpZDpjcmVkcw==';
				middleware(request, response, nextSpy);
			});
			it('should call next with error status 401', function() {
				expect(nextSpy)
					.to.have.been.calledWithMatch({ status: 401 });
			});
		});
	});
	describe('When not authorized', function() {
		beforeEach(function() {
			request.accepts.returns(false);
			middleware(request, response, nextSpy);
		});
		it('should call next with error 401', function() {
			expect(nextSpy)
				.to.have.been.calledWithMatch({ status: 401 });
		});
	});
});