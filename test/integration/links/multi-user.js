describe('integration/links/multi-user.js', function() {
	var storageHelper = require('../../helpers/mongo')
	  , storage
	  , _ = require('underscore')
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
		var pool = async.pool();
		storage.users.add({ username: 'abc', token: 'aaa' }, pool.register());
		storage.users.add({ username: 'def', token: 'bbb' }, pool.register());
		pool.whenEmpty(done);

		requestOptions = {
			headers: {
				accept: 'application/json'
			}
			, url: url.parse('http://localhost:8080/links')
		};
	});
	afterEach(function(done) {
		var pool = async.pool();
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
		return _(requestOptions).clone();
	};
});