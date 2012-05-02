describe('middleware.accept.js', function() {
	var middleware = require('../src/server/middleware/accept')
	  , request
	  , response
	  , renderSpy
	  , sendSpy
	  , nextSpy

	beforeEach(function() {
		response = {
			render: renderSpy = sinon.spy(),
			send: sendSpy = sinon.spy()
		};
		request = {};
		nextSpy = sinon.spy();
	});

	describe('When called with accept header "application/json"', function() {
		beforeEach(function() {
			request.accepts = sinon.stub();
			request.accepts.returns(false);
			request.accepts.withArgs('json').returns(true);
			request.accepts.withArgs('application/json').returns(true);

			middleware(request, response, nextSpy);
		});
		it('should call the next-function', function() {
			expect(nextSpy).to.have.been.called;
		});
		describe('and rendered with an object as data', function() {
			beforeEach(function() {
				response.render('view', [{a:1}, {b:2}]);
			});
			it('should not call the "real" render', function() {
				expect(renderSpy).not.to.have.been.called;
			});
			it('should call send instead', function() {
				expect(sendSpy).to.have.been.called;
			});
			it('should not wrap the array in an object', function() {
				expect(sendSpy).to.have.been.calledWith([{a:1}, {b:2}], 200);
			});
		});
	});
});