describe('integration/users/profile.js', function() {
	var request = require('request')
	  , btoa = require('btoa')
	  , mongoHelper = require('../../helpers/mongo')
	  , users
	  , req
	  , callbackSpy

	  , options

	before(function(done) {
		mongoHelper.open(function(err, storage) {
			users = storage.users;
			done();
		});
	});

	beforeEach(function() {
		options = {
			headers: {
				Accept: 'application/json'
			}
			, uri: 'http://localhost:8080/profile'
		};
		req = request
	});
	describe('When not authorized', function() {
		describe('and not requesting html', function() {
			beforeEach(function(done) {
				callbackSpy = sinon.spy(done)
				request.get(options, callbackSpy);
			});
			it('should give a 401 error', function() {
				expect(callbackSpy)
					.to.have.been.calledWithMatch(null, { statusCode: 401 });
			});
		});
	});
	describe('When authorized', function() {
		beforeEach(function(done) {
			options.headers.Authorization = 'Basic ' + btoa('abc:def');
			users.add({ username: 'abc', password: 'def' }, done);
		});
		afterEach(function(done) {
			users.del('abc', done);
		});
		describe('and not requesting html', function() {
			beforeEach(function(done) {
				callbackSpy = sinon.spy(done);
				request.get(options, callbackSpy);
			});
			it('should give 200 result', function() {
				expect(callbackSpy)
					.to.have.been.calledWithMatch(null, { statusCode: 200 });
			});
		});
	});
});
