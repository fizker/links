
module.exports = storage

function storage(options) {
	var db = options.storage

	return function(request, response, next) {
		request.storage = db;
		next();
	};
};
