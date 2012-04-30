'use strict';

module.exports = setupRoutes;

var links

function setupRoutes(http) {
	setupRoutes.links = links = {};
	http.get('/links', allLinks);

	http.post('/links', validateLink, postLink);
	http.get('/links/new', newLink);
	http.get('/links/:url', validateLink, getLink);
	http.put('/links/:url', validateLink, putLink);
	http.del('/links/:url', deleteLink);
};
function validateLink(request, response, next) {
	var url = request.params && request.params.url
	  , link = request.body
	  , error

	if(!link || link.url == null) {
		error = 'No link given';
		response.render('400', { status: 400, error: error });
		next(new Error(error));
		return;
	}
	if(url !== undefined) {
		if(url !== link.url) {
			error = 'URL does not match';
			response.render('400', { status: 400, error: error });
			next(new Error(error));
			return;
		}
	}
	next();
};
function newLink(request, response) {
	response.render('link.edit.mustache');
};
function allLinks(request, response) {
	response.render('links', Object.keys(links)
		.map(function(key) {
			return links[key];
		}));
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

function postLink(request, response) {
	var link = request.body
	  , url = link.url

	links[url] = link;
	response.local('message', 'link created');
	allLinks(request, response);
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
	response.render('link.del.mustache', { status: 200 });
};