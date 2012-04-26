'use strict';

module.exports = setupRoutes;

var links = {}

function setupRoutes(http) {
	http.get('/links', allLinks);

	http.get('/links/:url', getLink);
	http.put('/links/:url', putLink);
	http.delete('/links/:url', deleteLink);
};

function allLinks(request, response) {
	response.send(Object.keys(links).map(function(key) {
		return links[key];
	}));
};
function getLink(request, response) {
	var url = request.params.url
	  , link = links[url]

	if(!link) {
		response.send(404);
		return;
	}

	response.send(link);
};
function putLink(request, response) {
	var url = request.params.url
	  , link = request.body

	links[url] = link;
	response.send(link);
};
function deleteLink(request, response) {
	var url = request.params.url

	delete links[url];
	response.send(200);
};