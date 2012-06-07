describe('unit/middleware/errors.js', function() {
	var middleware = require('../../../src/server/middleware/errors')
	  , request
	  , response
	  , nextSpy
	  , err

	beforeEach(function() {
		request = {
			accepts: sinon.stub(),
			headers: {},
			header: sinon.spy(function(key) {
				return this.headers[key];
			})
		};

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

	describe('When called with a 404 error', function() {
		var view
		beforeEach(function() {
			err = { status: 404 };
			middleware(err, request, response, nextSpy);
			view = response.render.lastCall.args[0]
		});
		it('should render the 404 view', function() {
			expect(view).to.have.string('404');
		});
		it('should pass the status on for the accept-handler to put into the header');
	});
	describe('When called with a 401 error', function() {
		beforeEach(function() {
			err = { status: 401 };
		});
		describe('while requesting html', function() {
			beforeEach(function() {
				request.accepts.withArgs('html').returns(true);
				request.accepts.withArgs('text/html').returns(true);
				middleware(err, request, response, nextSpy);
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
				middleware(err, request, response, nextSpy);
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
	describe('When called with an unknown error', function() {
		var view
		beforeEach(function() {
			err = {};
			middleware(err, request, response, nextSpy);
			view = response.render.lastCall.args[0]
		});
		it('should show a default error page', function() {
			expect(view).to.have.string('500');
		});
	});
});
