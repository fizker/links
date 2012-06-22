describe('unit/storage/users.js', function() {
	'use strict';

	var factory = require('../../../src/storage/users').create
	  , db
	  , storage
	  , callback
	  , userCollection
	  , linkCollection

	beforeEach(function() {
		callback = sinon.spy();
		userCollection =
			{find: sinon.stub()
			,findOne: sinon.stub()
			,findAndModify: sinon.stub()
			,remove: sinon.stub()
			,save: sinon.stub()
			};
		linkCollection =
			{remove: sinon.stub()
			};
		db = {
			collection: sinon.stub()
		};
		db.collection.withArgs('users').yields(null, userCollection);
		db.collection.withArgs('links').yields(null, linkCollection);
		storage = factory(db);
	});
	describe('When calling update(username, user)', function() {
		beforeEach(function() {
			storage.update('abc', { username: 'def', email: 'ghi' }, callback);
		});
		it('should query findAndModify for the old username', function() {
			expect(userCollection.findAndModify)
				.to.have.been.calledWithMatch({ username: 'abc' });
		});
		it('should supply the modified values', function() {
			expect(userCollection.findAndModify)
				.to.have.been.calledWithMatch({}, [], { $set: { username: 'def', email: 'ghi' } });
		});
		it('should pass the modified user to the callback', function() {
			userCollection.findAndModify
				.yield(null, {
					username: 'def', email: 'ghi', tokens: [ 'jkl' ]
				});
			expect(callback)
				.to.have.been.calledWith(null, {
					username: 'def', email: 'ghi', tokens: [ 'jkl' ]
				});
		});
	});
	describe('When calling byToken(token)', function() {
		describe('with valid token', function() {
			beforeEach(function() {
				userCollection.findOne
					.withArgs({ 'tokens.key': 'aaa' })
					.yields(null, { username: 'abc' });
				storage.byToken('aaa', callback);
			});
			it('should pass the user', function() {
				expect(callback)
					.to.have.been.calledWith(null, { username: 'abc' });
			});
		});
		describe('with invalid token', function() {
			beforeEach(function() {
				userCollection.findOne
					.yields(null);
				storage.byToken('aaa', callback);
			});
			it('should pass null to the callback', function() {
				expect(callback)
					.to.have.been.calledWith(null, null);
			});
		});
	});
	describe('When calling verify(username, password)', function() {
		describe('with valid credentials', function() {
			var tokenGenerator = require('../../../src/token')
			beforeEach(function() {
				sinon.stub(tokenGenerator, 'generate');
				tokenGenerator.generate
					.withArgs('abc', 'def')
					.returns({ key: 'token-value', created: '2012-01-01T12:00:00Z' });

				userCollection.findAndModify
					.withArgs(
						{ username: 'abc', password: 'def' }
						, []
						, { $push: { tokens: { key: 'token-value', created: '2012-01-01T12:00:00Z' } } }
						, { new: true }
					)
					.yields(null, { username: 'abc', password: 'def', otherValue: 'ghi', tokens: [ { key: 'token-value by findAndModify' } ] });
				userCollection.findOne
					.withArgs({ username: 'abc', password: 'def' })
					.yields(null, { username: 'abc', password: 'def', otherValue: 'ghi' });

				storage.verify('abc', 'def', callback);
			});
			afterEach(function() {
				tokenGenerator.generate.restore();
			});
			it('should pass the user', function() {
				expect(callback)
					.to.have.been.calledWithMatch(null,
						{ username: 'abc'
						, password: 'def'
						, otherValue: 'ghi'
						});
			});
			it('should calculate a token', function() {
				expect(callback.lastCall.args[1].tokens)
					.to.approximate([ { key: 'token-value by findAndModify' } ]);
			});
		});
		describe('with invalid credentials', function() {
			beforeEach(function() {
				userCollection.findAndModify
					.withArgs({ username: 'abc', password: 'def' })
					.yields(null);
				storage.verify('abc', 'def', callback);
			});
			it('should pass null', function() {
				expect(callback)
					.to.have.been.calledWith(null, null);
			});
		});
	});
	describe('When calling add(user)', function() {
		var tokenGenerator = require('../../../src/token')
		beforeEach(function() {
			sinon.stub(tokenGenerator, 'generate');
			tokenGenerator.generate
				.withArgs('abc')
				.returns('token-value');

			userCollection.save
				.yields(null, { new: 'object' });
			storage.add({ username: 'abc', text:'def' }, callback);
		});
		afterEach(function() {
			tokenGenerator.generate.restore();
		});
		it('should call collection.save', function() {
			expect(userCollection.save.lastCall.args[0])
				.to.approximate({ username:'abc', tokens: [ 'token-value' ], text:'def' });
		});
		it('should call callback with the saved object', function() {
			expect(callback)
				.to.have.been.calledWith(null, { new: 'object' });
		});
		it('should ask for a token as well', function() {
			expect(tokenGenerator.generate)
				.to.have.been.called;
		});
	});
	describe('When calling del(username)', function() {
		beforeEach(function() {
			userCollection.findAndModify
				.yields(null, { _id: '123', username:'abc', text:'def' });
			linkCollection.remove
				.yields(null);
			storage.del('abc', callback);
		});
		it('should ask the collection to remove the specified user', function() {
			expect(userCollection.findAndModify)
				.to.have.been.calledWithMatch({ username: 'abc' }, [], {}, { remove: true });
		});
		it('should call callback with the removed object', function() {
			expect(callback)
				.to.have.been.calledWithMatch(null, { username:'abc', text:'def' });
		});
		it('should delete all refs from the links-collections', function() {
			expect(linkCollection.remove)
				.to.have.been.calledWith({ _user: '123' });
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
