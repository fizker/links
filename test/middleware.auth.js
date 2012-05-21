describe('middleware.auth.js', function() {
	var middleware = require('../src/server/middleware/auth')
	  , request
	  , response
	  , nextSpy

	beforeEach(function() {
		request = {
			accept: sinon.stub(),
			header: sinon.stub(),
			storage: {
				users: {
					verify: sinon.stub()
				}
			}
		};
		request.storage.users
			.verify.yields(null, false);
		request.storage.users
			.verify.withArgs('valid', 'creds').yields(null, { username: 'abc' });

		response = {
			headers: {},
			header: sinon.spy(function(key, value) {
				this.headers[key] = value;
			}),
			send: sinon.stub(),
			render: sinon.stub()
		};
		nextSpy = sinon.spy();
	});
	describe('When authorized', function() {
		describe('with valid credentials', function() {
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
					.to.eql({ username: 'abc' });
			});
		});
		describe('with invalid credentials', function() {
			beforeEach(function() {
				var credentials = 'invalid:creds'
					// created with btoa('abc:def')
				  , asBase64 = 'aW52YWxpZDpjcmVkcw=='

				request.header.withArgs('Authorization').returns('Basic aW52YWxpZDpjcmVkcw==');
				middleware(request, response, nextSpy);
			});
			it('should call send with error status 401', function() {
				var status = response.send.lastCall.args[0];
				expect(status).to.be.eql(401);
			});
		});
	});
	describe('When not authorized', function() {
		describe('while requesting html', function() {
			beforeEach(function() {
				request.accept.withArgs('html').returns(true);
				request.accept.withArgs('text/html').returns(true);
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
				request.accept.returns(false);
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