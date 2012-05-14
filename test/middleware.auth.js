describe('middleware.auth.js', function() {
	var middleware = require('../src/server/middleware/auth')
	  , request
	  , response
	  , nextSpy

	beforeEach(function() {
		request = {
			header: sinon.stub(),
			storage: {
				users: {
					verify: sinon.stub()
				}
			}
		};
		request.storage.users.verify.yields(null, false);
		request.storage.users.verify.withArgs('valid', 'creds').yields(null, { username: 'abc' });

		response = {
			send: sinon.stub(),
			render: sinon.stub()
		};
		nextSpy = sinon.spy();
	});
	describe('When authorized', function() {
		describe('with valid credentials', function() {
			beforeEach(function() {
				var credentials = 'valid:creds'
					// created with btoa('creds:creds')
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
			it('should send http status 401', function() {
				var status = response.render.lastCall.args[1].status;
				expect(status).to.be.eql(401);
			});
		});
	});
	describe('When not authorized', function() {
		beforeEach(function() {
			middleware(request, response, nextSpy);
		});
		it('should send http status 401', function() {
			var status = response.render.lastCall.args[1].status;
			expect(status).to.be.eql(401);
		});
		it('should request the 401 error page', function() {
			var view = response.render.lastCall.args[0];
			expect(view)
				.to.have.string('401')
				.and.to.have.string('errors');
		});
	});
});