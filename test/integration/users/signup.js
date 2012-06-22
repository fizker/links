describe('integration/users/signup.js', function() {
	var request = require('request')
	  , callbackSpy
	  , mongoHelper = require('../../helpers/mongo')
	  , users

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
			, uri: 'http://localhost:8080/signup'
		};

		users.add(
			{ tokens: [ { key: 'token', created: new Date().toISOString() } ]
			, username: 'abc'
			, password: 'def'
			, email: 'a@b.cd'
			}, done);
	});
	afterEach(function(done) {
		users.del('abc', done);
	});
	describe('When not authorized', function() {
		describe('and posting to "/signup"', function() {
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
						.to.be.within(200, 299);
					done();
				});
			});
		});
	});
});
