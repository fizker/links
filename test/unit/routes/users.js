describe('unit/routes/users.js', function() {
	var routes = require('../../../src/routes/users')
	  , helper = require('../../helpers/routes')
	  , http
	  , caller = helper.caller
	  , storage
	  , response
	  , request

	  , middleware = require('../../../src/middleware')

	beforeEach(function() {
		sinon.stub(middleware, 'auth');
		middleware.auth.postLogin = sinon.stub();
		// If auth is not valid, the route is never hit.
		// We only need to test successful auth here.
		middleware.auth.yields();
		middleware.auth.postLogin.yields();
	});
	afterEach(function() {
		middleware.auth.restore();
	});

	beforeEach(function() {
		helper.setup();
		http = helper.http;

		response =
			{ locals: {}
			, cookie: sinon.spy()
			, render: sinon.spy()
			, redirect: sinon.spy()
			, send: sinon.spy()
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
			, update: sinon.stub()
			};
		storage.verify.withArgs('valid', 'creds').yields(null, true);

		request = {
			storage: { users: storage }
		};

		routes({
			http: http
		});
	});

	describe('When deleting "/profile"', function() {
		beforeEach(function() {
			request.user = { username: 'abc' };
			caller(http.routes.del['/profile'], request, response);
		});
		it('should require auth', function() {
			expect(middleware.auth)
				.to.have.been.called;
		});
		it('should delete the user', function() {
			expect(storage.del)
				.to.have.been.calledWith('abc');
		});
	});
	describe('When posting to "/login"', function() {
		beforeEach(function() {
			request.body = { username: 'abc', password: 'def' };
			caller(http.routes.post['/login'], request, response);
		});
		it('should not require auth', function() {
			expect(middleware.auth)
				.not.to.have.been.called;
		});
		it('should use the postLogin middleware', function() {
			expect(middleware.auth.postLogin)
				.to.have.been.called;
		});
		it('should redirect to "/"', function() {
			expect(response.redirect)
				.to.have.been.calledWith('/');
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
			expect(response.render).to.have.been.calledWithMatch('signup')
		});
	});

	describe('When posting to "/signup"', function() {
		beforeEach(function() {
			request.body = {
				username: 'abc',
				password: 'def'
			};
			caller(http.routes.post['/signup'], request, response);
		});
		it('should not require auth', function() {
			expect(middleware.auth).not.to.have.been.called;
		});
		it('should create the user', function() {
			expect(storage.add)
				.to.have.been.calledWithMatch({
					username: 'abc',
					password: 'def'
				});
		});
		it('should render a welcome site', function() {
			storage.add.yield(null, { a: 1, b: 2 });
			expect(response.render)
				.to.have.been.calledWithMatch('welcome', { a: 1, b: 2 });
		});
		it('should set a cookie', function() {
			storage.add.yield(null, { a: 1, b: 2, token: 'aaa' });
			expect(response.cookie)
				.to.have.been.calledWith('x-user-token', 'aaa');
		});
	});
	describe('When putting "/profile"', function() {
		beforeEach(function() {
			request.user = {
				username: 'abc'
			};
			request.body = {
				username: 'def',
				email: 'ghi'
			};
			caller(http.routes.put['/profile'], request, response);
		});
		it('should update the user', function() {
			expect(storage.update)
				.to.have.been.calledWith('abc', {
					username: 'def',
					email: 'ghi'
				});
		});
		it('should render the resulting user', function() {
			storage.update.yield(null, { a: 1, b: 2 });
			expect(response.render)
				.to.have.been.calledWithMatch('profile', {
					a: 1, b: 2
				});
		});
		it('should require auth', function() {
			expect(middleware.auth)
				.to.have.been.called;
		});
	});
	describe('When getting "/profile"', function() {
		beforeEach(function() {
			request = {
				user: { username: 'abc' }
			}
			caller(http.routes.get['/profile'], request, response);
		});
		it('should require auth', function() {
			expect(middleware.auth).to.have.been.called;
		});
		it('should load the profile view', function() {
			expect(response.render)
				.to.have.been.calledWithMatch('profile')
		});
		it('should pass the user in the render call', function() {
			expect(response.render)
				.to.have.been.calledWithMatch('', { username: 'abc' });
		});
	});
});
