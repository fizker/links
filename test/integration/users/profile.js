describe('integration/users/profile.js', function() {
	var request = require('request')
	  , req
	  , callbackSpy

	beforeEach(function() {
		req = request.defaults({
			headers: { Accept: 'application/json' }
		});
	});
	describe('When not authorized', function() {
		describe('and not requesting html', function() {
			beforeEach(function(done) {
				callbackSpy = sinon.spy(done)
				req.get('http://localhost:8080/profile', callbackSpy);
			});
			it('should give a 401 error', function() {
				expect(callbackSpy)
					.to.have.been.calledWithMatch(null, { statusCode: 401 });
			});
		});
	});
});
