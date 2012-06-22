describe('integration/links/basics.js', function() {
	var url = require('url')
	  , request = require('request')
	  , fasync = require('fasync')
	  , requestOptions
	  , getOptions
	  , storageHelper = require('../../helpers/mongo')
	  , storage
	  , user

	before(function(done) {
		storageHelper.open(function(err, st) {
			storage = st;
			done();
		});
	});

	beforeEach(function(done) {
		requestOptions = opts();
		getOptions = opts();
		storage.users.add
			( { username: 'abc'
			  , tokens: [ { key: 'aaa', created: new Date().toISOString() } ]
			  }
			, function(err, u)
		{
			user = u;
			done(err);
		});
	});
	afterEach(function(done) {
		var pool = fasync.pool();
		storage.links.clean(user._id, pool.register());
		storage.users.del('abc', pool.register());
		pool.whenEmpty(done);
	});
	describe('When posting to "/links"', function() {
		var result
		beforeEach(function(done) {
			requestOptions.json = { url: 'http://a.bc' };

			request.post(requestOptions, function(err, res, data) {
				result = data;
				done();
			});
		});
		it('should return the new data', function() {
			expect(result)
				.to.approximate({ url: 'http://a.bc' });
		});
		it('should add a link', function(done) {
			request.get(getOptions, function(err, res, body) {
				expect(JSON.parse(body))
					.to.approximate([ { url: 'http://a.bc' } ]);
				done();
			});
		});
	});

	function opts() {
		return {
			url: url.parse('http://localhost:8080/links')
			, headers: {
				accept: 'application/json'
				, 'x-user-token': 'aaa'
			}
		};
	};
});