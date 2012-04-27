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
	response.render('links', {
		links: Object.keys(links).map(function(key) {
			return links[key];
		})
	});
};
function getLink(request, response) {
	var url = request.params.url
	  , link = links[url]

	if(!link) {
		response.render('404', { status: 404 });
		return;
	}

	response.render('link', link);
};
function putLink(request, response) {
	var url = request.params.url
	  , link = request.body

	links[url] = link;
	response.render('link', link);
};
function deleteLink(request, response) {
	var url = request.params.url

	delete links[url];
	response.render('link.del', 200);
};