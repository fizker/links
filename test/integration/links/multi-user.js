describe('integration/links/multi-user.js', function() {
	var storageHelper = require('../../helpers/mongo')
	  , storage
	  , testUsers
	  , async = require('fasync')
	  , url = require('url')
	  , request = require('request')
	  , requestOptions

	before(function(done) {
		storageHelper.open(function(err, st) {
			storage = st;
			done();
		});
	});

	beforeEach(function(done) {
		testUsers = [];
		var pool = async.pool()
		  , push = function(err, user) { if(err) done(err); testUsers.push(user); }
		storage.users.add({ username: 'abc', token: 'aaa' }, pool.register(push));
		storage.users.add({ username: 'def', token: 'bbb' }, pool.register(push));
		pool.whenEmpty(done);

		requestOptions = opts();
	});
	afterEach(function(done) {
		var pool = async.pool();
		testUsers.forEach(function(user) {
			storage.links.clean(user._id, pool.register());
		});
		storage.users.del('abc', pool.register());
		storage.users.del('def', pool.register());
		pool.whenEmpty(done);
	});
	describe('When adding links to one user', function() {
		beforeEach(function(done) {
			var options = opts();
			options.json = { url: 'http://a.bc' };
			options.headers['x-user-token'] = 'aaa';
			request.post(options, done);
		});
		it('should be retrievable by that user', function(done) {
			var options = opts();
			options.headers['x-user-token'] = 'aaa';
			request.get(options, function(err, response, data) {
				expect(JSON.parse(data))
					.to.approximate([ { url: 'http://a.bc' } ]);
				done();
			});
		});
		it('should not be present for another user', function(done) {
			var options = opts();
			options.headers['x-user-token'] = 'bbb';
			request.get(options, function(err, response, data) {
				expect(JSON.parse(data))
					.not.to.approximate([ { url: 'http://a.bc' } ]);
				done();
			});
		});
	});

	function opts() {
		return {
			headers: {
				accept: 'application/json'
			}
			, url: url.parse('http://localhost:8080/links')
		};
	};
});