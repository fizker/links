describe('unit/storage/index.js', function() {
	var factory = require('../../../src/storage')
	  , mongo = require('mongodb')
	  , links = require('../../../src/storage/links')
	  , fakeDb

	beforeEach(function() {
		fakeDb = {
			open: sinon.stub()
		};
		fakeDb.open.yields(null);

		sinon.stub(mongo, 'Server');
		sinon.stub(mongo, 'Db');
		mongo.Db.returns(fakeDb);

		sinon.stub(links, 'create');
		links.create.returns({});
	});
	afterEach(function() {
		mongo.Server.restore();
		mongo.Db.restore();
		links.create.restore();
	});

	describe('When working on an open storage', function() {
		var storage
		  , storageOptions
		  , storageCallback

		beforeEach(function(done) {
			storageOptions = {};
			storageCallback = sinon.spy(function(err, st) {
				storage = st;
				done();
			});
			factory.open(storageOptions, storageCallback);
		});
		it('should have a bind-method', function() {
			expect(storage)
				.to.respondTo('bind');
		});
		it('should have users-storage', function() {
			expect(storage)
				.to.have.property('users');
		});
		it('should not have links-storage', function() {
			expect(storage)
				.not.to.have.property('links');
		});
		describe('and binding storage to a user', function() {
			beforeEach(function() {
				storage = storage.bind({ _id: 'abc', username: 'def' });
			});
			it('should have links-storage', function() {
				expect(storage)
					.to.have.property('links');
			});
			it('should pass the proper information to the bound storage', function() {
				expect(links.create)
					.to.have.been.calledWithMatch({ user: 'abc' });
			});
		});
	});
});