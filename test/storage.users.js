describe('storage.users.js', function() {
	'use strict';

	var factory = require('../src/storage/users')
	  , db
	  , storage
	  , callback
	  , userCollection

	beforeEach(function() {
		callback = sinon.spy();
		userCollection =
			{find: sinon.stub()
			,findOne: sinon.stub()
			,remove: sinon.stub()
			,save: sinon.stub()
			};
		db = {
			collection: sinon.stub().withArgs('users').yields(null, userCollection)
		};
		storage = factory(db);
	});
	describe('When calling verify(username, password)', function() {
		describe('with valid credentials', function() {
			beforeEach(function() {
				userCollection.findOne
					.withArgs({ username: 'abc', password: 'def' })
					.yields(null, { username: 'abc', password: 'def' });
				storage.verify('abc', 'def', callback);
			});
			it('should pass true', function() {
				expect(callback)
					.to.have.been.calledWith(null, true);
			});
		});
		describe('with invalid credentials', function() {
			beforeEach(function() {
				userCollection.findOne
					.withArgs({ username: 'abc', password: 'def' })
					.yields(null);
				storage.verify('abc', 'def', callback);
			});
			it('should pass false', function() {
				expect(callback)
					.to.have.been.calledWith(null, false);
			});
		});
	});
	describe('When calling add(username)', function() {
		beforeEach(function() {
			userCollection.save
				.withArgs({ username: 'abc', text:'def' })
				.yields(null, { new: 'object' });
			storage.add({ username: 'abc', text:'def' }, callback);
		});
		it('should call collection.save', function() {
			expect(userCollection.save)
				.to.have.been.calledWith({ username:'abc', text:'def' });
		});
		it('should call callback with the saved object', function() {
			expect(callback)
				.to.have.been.calledWith(null, { new: 'object' });
		});
	});
	describe('When calling del(username)', function() {
		beforeEach(function() {
			userCollection.remove
				.withArgs({ username: 'abc' })
				.yields(null, { username:'abc', text:'def' });
			storage.del('abc', callback);
		});
		it('should ask the collection to remove the specified user', function() {
			expect(userCollection.remove)
				.to.have.been.calledWith({ username: 'abc' });
		});
		it('should call callback with the removed object', function() {
			expect(callback)
				.to.have.been.calledWith(null, { username:'abc', text:'def' });
		});
	});
	describe('When calling get(username)', function() {
		var findResults

		beforeEach(function() {
			userCollection.findOne
				.withArgs({ username: 'abc' })
				.yields(null, { username: 'abc', text: 'def' });

			storage.get('abc', callback);
		});
		it('should hand the found object to the callback', function() {
			expect(callback)
				.to.have.been.calledWith(null, { username:'abc', text:'def' });
		});
	});
	describe('When calling get()', function() {
		var findResults

		beforeEach(function() {
			findResults = {
				toArray: sinon.stub()
			};
			findResults.toArray.yields(null, [{username: 'a'}, {username: 'b'}]);

			userCollection.find
				.withArgs()
				.returns(findResults);

			storage.get(callback);
		});
		it('should call callback with the returned objects', function() {
			expect(callback)
				.to.have.been.calledWith(null, [{username:'a'}, {username:'b'}]);
		});
	});
});
