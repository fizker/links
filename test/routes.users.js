describe('routes.users.js', function() {
	var routes = require('../src/routes/users')
	  , helper = require('./helpers/routes')
	  , http
	  , caller = helper.caller
	  , storage
	  , response
	  , request

	  , middleware = require('../src/server/middleware')
	  , originalAuth

	beforeEach(function() {
		originalAuth = middleware.auth;
		middleware.auth = sinon.stub();
	});
	afterEach(function() {
		middleware.auth = originalAuth;
	});

	beforeEach(function() {
		helper.setup();
		http = helper.http;

		response =
			{ locals: {}
			, render: sinon.spy()
			, local: function(key, val) {
					if(val) this.locals[key] = val;
					else return this.locals[key];
				}
			, headers: {}
			, header: function(key, val) {
					if(val) this.headers[key] = val;
					else return this.headers[key];
				}
			};

		storage =
			{ get: sinon.stub()
			, del: sinon.stub()
			, add: sinon.stub()
			, verify: sinon.stub()
			};
		storage.verify.withArgs('valid', 'creds').yields(null, true);

		routes({
			http: http,
			storage: { users: storage }
		});
	});

	describe('When getting "/signup"', function() {
		beforeEach(function() {
			caller(http.routes.get['/signup'], request, response);
		});
		it('should not require auth', function() {
			expect(middleware.auth).not.to.have.been.called;
		});
		it('should request the signup view', function() {
			var view = response.render.lastCall.args[0]
			expect(view).to.have.string('signup')
		});
	});

	describe('When getting "/profile"', function() {
		beforeEach(function() {
			request = {
				user: { username: 'abc' }
			}
			middleware.auth.yields();
			caller(http.routes.get['/profile'], request, response);
		});
		it('should require auth', function() {
			expect(middleware.auth).to.have.been.called;
		});
		it('should load the profile view', function() {
			var view = response.render.lastCall.args[0]
			expect(view)
				.to.have.string('profile')
		});
		it('should pass the user in the render call', function() {
			var data = response.render.lastCall.args[1]
			expect(data).to.eql({ username: 'abc' });
		});
	});
});
