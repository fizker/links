describe('unit/middleware/accept.js', function() {
	var middleware = require('../../../src/middleware/accept')
	  , request
	  , response
	  , renderSpy
	  , sendSpy
	  , nextSpy

	beforeEach(function() {
		response = {
			render: renderSpy = sinon.spy(),
			send: sendSpy = sinon.spy(),
			locals: {},
			local: function(key, val) {
				if(val) this.locals[key] = val;
				else return this.locals[key];
			}
		};
		request = {};
		nextSpy = sinon.spy();
	});

	describe('When called with accept header "text/html"', function() {
		beforeEach(function() {
			request.accepts = sinon.stub();
			request.accepts.returns(false);
			request.accepts.withArgs('html').returns(true);
			request.accepts.withArgs('text/html').returns(true);

			middleware(request, response, nextSpy);
		});
		it('should call the next-function', function() {
			expect(nextSpy).to.have.been.called;
		});
		describe('and rendered with an object as data', function() {
			beforeEach(function() {
				response.render('view', {a:1, b:2});
			});
			it('should not call send directly', function() {
				expect(sendSpy).not.to.have.been.called;
			});
			it('should call original render', function() {
				expect(renderSpy).to.have.been.called;
			});
			it('should pass view-name', function() {
				expect(renderSpy.lastCall.args[0]).to.equal('view');
			});
			it('should wrap object in view-name', function() {
				expect(renderSpy.lastCall.args[1].view).to.eql({a:1,b:2});
			});
		});
		describe('and rendered with a complex view-name', function() {
			it('should use the first dot-part as wrap-name', function() {
				response.render('view.complex', {a:1, b:2});
				expect(renderSpy.lastCall.args[1].view).to.eql({a:1,b:2});
			});
			it('should use the views actual name, and not folders', function() {
				response.render('folder/view', {a:1, b:2});
				expect(renderSpy.lastCall.args[1].view).to.eql({a:1,b:2});
			});
			it('should work with multiple folders', function() {
				response.render('folder/folder/view.suffix', {a:1, b:2});
				expect(renderSpy.lastCall.args[1].view).to.eql({a:1,b:2});
			});
		});
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
			describe('and status is set', function() {
				it('should respect the status if in the object', function() {
					response.render('view', { status: 400 });
					expect(sendSpy).to.have.been.calledWith({ status: 400 }, 400);
				});
				it('should respect the status if as a local', function() {
					response.local('status', 400);
					response.render('view');
					expect(sendSpy).to.have.been.calledWith(undefined, 400);
				});
			});
		});
	});
});