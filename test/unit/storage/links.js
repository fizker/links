describe('unit/storage/links.js', function() {
	'use strict';

	var factory = require('../../../src/storage/links')
	  , db
	  , storage
	  , callback
	  , linkCollection

	beforeEach(function() {
		callback = sinon.spy();
		linkCollection =
			{find: sinon.stub()
			,findOne: sinon.stub()
			,findAndModify: sinon.stub()
			,remove: sinon.stub()
			,save: sinon.stub()
			};
		db = {
			collection: sinon.stub().withArgs('links').yields(null, linkCollection)
		};
		storage = factory(db);
	});
	describe('When calling update(url, link)', function() {
		beforeEach(function() {
			linkCollection.findAndModify
				.withArgs({ url: 'abc' }, [], { $set: { url: 'def' } }, { new: true })
				.yields(null, { url: 'def', text: 'ghi' });

			storage.update('abc', { url: 'def' }, callback);
		});
		it('calls findAndModify', function() {
			expect(linkCollection.findAndModify)
				.to.have.been
					.calledWith({ url: 'abc' }, [], { $set: { url: 'def' } });
		});
		it('calls the callback with the changed link', function() {
			expect(callback)
				.to.have.been.calledWith(null, { url: 'def', text: 'ghi' });
		});
	});
	describe('When calling add(link)', function() {
		beforeEach(function() {
			linkCollection.save
				.withArgs({ url: 'abc', text:'def' })
				.yields(null, { new: 'object' });
			storage.add({ url: 'abc', text:'def' }, callback);
		});
		it('should call collection.save', function() {
			expect(linkCollection.save)
				.to.have.been.calledWith({ url:'abc', text:'def' });
		});
		it('should call callback with the saved object', function() {
			expect(callback)
				.to.have.been.calledWith(null, { new: 'object' });
		});
	});
	describe('When calling del(url)', function() {
		beforeEach(function() {
			linkCollection.remove
				.withArgs({ url: 'abc' })
				.yields(null, { url:'abc', text:'def' });
			storage.del('abc', callback);
		});
		it('should ask the collection to remove the specified link', function() {
			expect(linkCollection.remove)
				.to.have.been.calledWith({ url: 'abc' });
		});
		it('should call callback with the removed object', function() {
			expect(callback)
				.to.have.been.calledWith(null, { url:'abc', text:'def' });
		});
	});
	describe('When calling get(url)', function() {
		var findResults

		beforeEach(function() {
			linkCollection.findOne
				.withArgs({ url: 'abc' })
				.yields(null, { url: 'abc', text: 'def' });

			storage.get('abc', callback);
		});
		it('should ask for links-collection', function() {
			expect(db.collection).to.have.been.calledWith('links');
		});
		it('should hand the found object to the callback', function() {
			expect(callback)
				.to.have.been.calledWith(null, { url:'abc', text:'def' });
		});
	});
	describe('When calling get()', function() {
		var findResults

		beforeEach(function() {
			findResults = {
				toArray: sinon.stub()
			};
			findResults.toArray.yields(null, [{url: 'a'}, {url: 'b'}]);

			linkCollection.find
				.withArgs()
				.returns(findResults);

			storage.get(callback);
		});
		it('should ask for link-collection', function() {
			expect(db.collection).to.have.been.calledWith('links');
		});
		it('should call callback with the returned objects', function() {
			expect(callback)
				.to.have.been.calledWith(null, [{url:'a'}, {url:'b'}]);
		});
	});
});