describe('token.js', function() {
	var generator = require('../src/token')
	  , crypto = require('crypto')
	  , digester
	describe('When generating tokens', function() {
		var result
		beforeEach(function() {
			digester = {
				digest: sinon.stub()
				, update: sinon.stub()
			};
			sinon.stub(crypto, 'createHash');

			sinon.stub(Date, 'now');
			Date.now.returns(123);

			crypto.createHash
				.withArgs('sha256').returns(digester);
			digester.digest.returns('digest');
			result = generator.generate('abc', 'def', 'ghi');
		});
		afterEach(function() {
			Date.now.restore();
			crypto.createHash.restore();
		});
		it('should pass the values and a salt into a hashing method', function() {
			expect(digester.update)
				.to.have.been.calledWith('abc:def:ghi:secret-salt:123', 'utf8');
			expect(digester.digest)
				.to.have.been.calledWith('hex');
		});
		it('returns the result', function() {
			expect(result).to.eql('digest');
		});
	});
});