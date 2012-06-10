describe('integration/links/basics.js', function() {
	var url = require('url')
	  , _ = require('underscore')
	  , request = require('request')
	  , requestOptions
	  , getOptions
	  , storageHelper = require('../../helpers/mongo')
	  , storage

	before(function(done) {
		storageHelper.open(function(err, st) {
			storage = st;
			done();
		});
	});

	beforeEach(function(done) {
		requestOptions = {
			url: url.parse('http://localhost:8080')
			, headers: {
				accept: 'application/json'
				, 'x-user-token': 'aaa'
			}
		};
		getOptions = opts();
		storage.users.add({ username: 'abc', token: 'aaa' }, done);
	});
	afterEach(function(done) {
		storage.users.del('abc', done);
	});
	describe('When posting to "/links"', function() {
		var result
		beforeEach(function(done) {
			requestOptions.url.path = '/links';

			var options = opts();
			options.json = { url: 'http://a.bc' };

			request.post(options, function(err, res, data) {
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
		return _(requestOptions).clone();
	};
});