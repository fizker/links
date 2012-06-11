describe('integration/users/profile.js', function() {
	var request = require('request')
	  , btoa = require('btoa')
	  , url = require('url')
	  , mongoHelper = require('../../helpers/mongo')
	  , storage
	  , users
	  , req
	  , callbackSpy

	  , options

	before(function(done) {
		mongoHelper.open(function(err, st) {
			storage = st;
			users = storage.users;
			done();
		});
	});

	function opts() {
		return {
			headers: {
				Accept: 'application/json'
			}
			, url: url.parse('http://localhost:8080/profile')
		};
	};
	beforeEach(function(done) {
		options = opts();
		req = request

		users.add({ token: 'token', username: 'abc', password: 'def', email: 'a@b.cd' }, done);
	});
	afterEach(function(done) {
		users.del('abc', done);
	});
	describe('When not authorized', function() {
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
		it('should allow for 2 consecutive logins', function(done) {
			request.get(options, function(err, response, data) {
				expect(response.statusCode)
					.to.equal(200);
				done();
			});
		});
	});
	describe('When authorized', function() {
		beforeEach(function() {
			options.headers['x-user-token'] = 'token';
		});
		describe('and deleting "/profile"', function() {
			beforeEach(function(done) {
				var opt = opts();
				opt.url.path = '/links';
				opt.json = { url: 'http://abc.test' };
				request.post(opt, function(err) {
					if(err) return done(err);
					callbackSpy = sinon.spy(done);
					request.del(options, callbackSpy);
				});
			});
			it('should respond with 204', function() {
				expect(callbackSpy)
					.to.have.been.calledWithMatch(null, { statusCode: 204 });
			});
			it('should remove the user', function(done) {
				storage.users.get('abc', function(err, user) {
					expect(user)
						.to.not.be.ok;
					done();
				});
			});
			it('should remove all associated links', function(done) {
				storage.links.get('http://abc.test', function(err, link) {
					expect(link)
						.to.not.be.ok;
					done();
				});
			});
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
