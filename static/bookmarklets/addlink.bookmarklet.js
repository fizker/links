(function() {
	var server = 'http://localhost:8080'
	  , script = document.createElement('script')

	script.src = server + '/bookmarklets/addlink.js';
	document.body.appendChild(script);

	return false;
})();
