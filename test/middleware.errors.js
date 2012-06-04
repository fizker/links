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
		var view
		beforeEach(function() {
			err = { status: 401 };
			middleware(err, request, response, nextSpy);
			view = response.render.lastCall.args[0]
		});
		it('should show the 403 view', function() {
			expect(view).to.have.string('403');
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