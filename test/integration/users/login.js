describe('integration/users/login.js', function() {
	var request = require('request')
	  , url = require('url')
	  , mongoHelper = require('../../helpers/mongo')
	  , users
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
				accept: 'text/html'
			}
			, url: url.parse('http://localhost:8080/login')
			, jar: request.jar()
			, form: { username: 'abc', password: 'def' }
		}
		users.add({ username: 'abc', password: 'def' }, done);
	});
	afterEach(function(done) {
		users.del('abc', done);
	});

	describe('When posting to login', function() {
		describe('and asking for json', function() {
			beforeEach(function(done) {
				callbackSpy = sinon.spy(done);
				options.headers.accept = 'application/json';
				request.post(options, callbackSpy);
			});
			it('should return code 200', function() {
				expect(callbackSpy.getCall(0).args[1].statusCode)
					.to.equal(200);
			});
			it('should return user-info and a token', function() {
				expect(JSON.parse(callbackSpy.getCall(0).args[2]))
					.to.have.property('token');
			});
			describe('and logging in a second time', function() {
				var secondCallbackSpy
				beforeEach(function(done) {
					secondCallbackSpy = sinon.spy(done);
					request.post(options, secondCallbackSpy);
				});
				it('should return a different token', function() {
					var firstToken = JSON.parse(callbackSpy.getCall(0).args[2]).token
					  , secondToken = JSON.parse(secondCallbackSpy.getCall(0).args[2]).token
					expect(secondToken).not.to.equal(firstToken);
				});
				it('should allow login with the original token', function(done) {
					var firstToken = JSON.parse(callbackSpy.getCall(0).args[2]).token
					options.headers['x-user-token'] = firstToken;
					delete options.form;
					delete options.method;
					options.url.path = '/links';
					request.get(options, function(err, res, body) {
						expect(res.statusCode).to.be.lessThan(400);
						done();
					});
				});
			});
		});
		describe('with valid credentials', function() {
			beforeEach(function(done) {
				callbackSpy = sinon.spy(done);
				request.post(options, callbackSpy);
			});
			it('should return code 302 (redirect)', function() {
				expect(callbackSpy.getCall(0).args[1].statusCode)
					.to.equal(302);
			});
			it('should set a cookie to allow subsequent login', function(done) {
				options.url.path = '/profile';
				options.headers.accept = 'application/json';
				options.method = 'get';
				request.get(options, function(err, response, data) {
					expect(response.statusCode).to.equal(200);
					done();
				});
			});
		});
	});
});
