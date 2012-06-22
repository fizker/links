describe('unit/token.js', function() {
	var generator = require('../../src/token')
	  , crypto = require('crypto')
	  , digester
	describe('When generating tokens', function() {
		var result
		  , originalDate = Date
		beforeEach(function() {
			digester = {
				digest: sinon.stub()
				, update: sinon.stub()
			};
			sinon.stub(crypto, 'createHash');

			global.Date = sinon.stub();
			var fakeDate =
				{ toISOString: sinon.stub()
				, getTime: sinon.stub()
				};
			fakeDate.toISOString.returns('2012-01-01T12:00:00Z');
			fakeDate.getTime.returns(123);
			Date.returns(fakeDate);

			Date.now = sinon.stub();
			Date.now.returns(123);

			crypto.createHash
				.withArgs('sha256').returns(digester);
			digester.digest.returns('digest');
			result = generator.generate('abc', 'def', 'ghi');
		});
		afterEach(function() {
			global.Date = originalDate;
			crypto.createHash.restore();
		});
		it('should pass the values and a salt into a hashing method', function() {
			expect(digester.update)
				.to.have.been.calledWith('abc:def:ghi:secret-salt:123', 'utf8');
			expect(digester.digest)
				.to.have.been.calledWith('hex');
		});
		it('returns the result', function() {
			expect(result).to.deep.equal({ key: 'digest', created: '2012-01-01T12:00:00Z' });
		});
	});
});