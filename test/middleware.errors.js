describe('middleware.errors.js', function() {
	var middleware = require('../src/server/middleware/errors')
	  , request
	  , response
	  , nextSpy
	  , err

	beforeEach(function() {
		request = {};

		response = {
			send: sinon.stub(),
			render: sinon.stub()
		};
		nextSpy = sinon.spy();
	});

	describe('When called with a 401 error', function() {
		var view
		beforeEach(function() {
			err = { status: 401 };
			middleware(err, request, response, nextSpy);
			view = response.render.lastCall.args[0]
		});
		it('should render the login view', function() {
			expect(view).to.have.string('login');
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
