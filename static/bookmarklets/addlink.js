!function() {
	var text = prompt('Link description:')
	  , data
	  , token = location.search.match(/token=([a-f0-9]+)/)[1]

	if(!text) return;

	data =
		{ text: text
		, title: document.title
		, url: window.location.href
		};

	putLink(data);

	function putLink(data) {
		var serviceUrl = 'http://localhost:8080/links/'
		  , async = true
		  , request = new XMLHttpRequest()
		  , encodedUrl = encodeURIComponent(data.url)

		request.open('PUT', serviceUrl + encodedUrl, async);
		request.onerror = errorCallback;
		request.onload = successCallback;
		request.setRequestHeader('x-user-token', token);
		request.setRequestHeader('Content-type', 'application/json');
		request.setRequestHeader('Accept', 'application/json');
		request.send(JSON.stringify(data));
	};

	function successCallback(response) {
		var target = response.target
		  , status = target.status

		if(400 <= status && status < 600) {
			return errorCallback(status);
		}

		alert('The link was added');
	};
	function errorCallback(error) {
		alert('Error!');
		console.log(arguments);
	};
}();