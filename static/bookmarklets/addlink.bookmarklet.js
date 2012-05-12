(function() {
	var server = 'http://localhost:8080'
	  , script = document.createElement('script')

	script.src = server + '/bookmarklets/addlink.min.js';
	document.body.appendChild(script);

	return false;
})();
