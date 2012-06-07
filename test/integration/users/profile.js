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

	beforeEach(function(done) {
		options = {
			headers: {
				Accept: 'application/json'
			}
			, uri: 'http://localhost:8080/profile'
		};
		req = request

		users.add({ token: 'token', username: 'abc', password: 'def', email: 'a@b.cd' }, done);
	});
	afterEach(function(done) {
		users.del('abc', done);
	});
	describe('When not authorized', function() {
		describe('and posting to "/profile"', function() {
			beforeEach(function(done) {
				options.json = { username: 'aaa', password: 'bbb' };

				callbackSpy = sinon.spy(done);
				request.post(options, callbackSpy);
			});
			afterEach(function() {
				users.del('aaa');
			});
			it('should create a new user', function(done) {
				users.get('aaa', function(err, user) {
					expect(user)
						.to.approximate({ username: 'aaa' });
					done();
				});
			});
			it('should return status 200', function() {
				expect(callbackSpy)
					.to.have.been.calledWithMatch(null, { statusCode: 200 });
			});
			it('should return a token that is accepted for auth', function(done) {
				var data = callbackSpy.getCall(0).args[2]
				expect(data).to.have.property('token');

				options.headers['x-user-token'] = data.token;
				options.method = 'get';
				request.get(options, function(err, response, data) {
					expect(response.statusCode)
						.to.equal(200);
					done();
				});
			});
		});
		describe('and getting "/profile"', function() {
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
	describe('When authorized with HTTP auth', function() {
		beforeEach(function(done) {
			options.headers.Authorization = 'Basic ' + btoa('abc:def');

			callbackSpy = sinon.spy(done);
			request.get(options, callbackSpy);
		});
		it('should give 200 result', function() {
			expect(callbackSpy)
				.to.have.been.calledWithMatch(null, { statusCode: 200 });
		});
	});
	describe('When authorized with token', function() {
		beforeEach(function(done) {
			options.headers['x-user-token'] = 'token';

			callbackSpy = sinon.spy(done);
			request.get(options, callbackSpy);
		});
		it('should give 200 result', function() {
			expect(callbackSpy)
				.to.have.been.calledWithMatch(null, { statusCode: 200 });
		});
		it('should not change the token', function() {
			var data = JSON.parse(callbackSpy.getCall(0).args[2])
			expect(data.token).to.equal('token');
		});
	});
	describe('When authorized', function() {
		beforeEach(function() {
			options.headers['x-user-token'] = 'token';
		});
		describe('and putting to /profile', function() {
			beforeEach(function(done) {
				callbackSpy = sinon.spy(done);
				options.json = {
					email: 'new@email.com'
				};
				request.put(options, callbackSpy);
			});
			it('should give code 200', function() {
				expect(callbackSpy)
					.to.have.been.calledWithMatch(null, { statusCode: 200 });
			});
			it('should update the database', function(done) {
				debugger
				users.get('abc', function(err, user) {
					expect(user).to.approximate({ email: 'new@email.com' });
					done();
				});
			});
		});
		describe('and getting /profile', function() {
			beforeEach(function(done) {
				callbackSpy = sinon.spy(done);
				request.get(options, callbackSpy);
			});
			it('should give 200 result', function() {
				expect(callbackSpy)
					.to.have.been.calledWithMatch(null, { statusCode: 200 });
			});
			it('should return the user info', function() {
				var data = JSON.parse(callbackSpy.getCall(0).args[2])
				expect(data)
					.to.approximate({
						username: 'abc',
						email: 'a@b.cd'
					});
			});
		});
	});
});
