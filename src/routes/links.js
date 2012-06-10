'use strict';

module.exports = setupRoutes;

var links
  , util = require('util')
  , middleware = require('../middleware')

function setupRoutes(options) {
	var http = options.http

	setupRoutes.links = links = {};
	http.get('/links', middleware.auth, allLinks);

	http.post('/links', middleware.auth, validateLink, postLink);
	http.get('/links/new', middleware.auth, newLink);

	http.get('/links/:url', middleware.auth, getLink);
	http.put('/links/:url', middleware.auth, validateLink, putLink);
	http.post('/links/:url', middleware.auth, validateLink, postUpdateLink);
	http.del('/links/:url', middleware.auth, deleteLink);

	http.get('/links/:url/edit', middleware.auth, editLink);
};
function validateLink(request, response, next) {
	var link = request.body
	  , error

	if(!link || link.url == null) {
		error = 'No link given';
		next({ status: 400, validation: {}, error: error });
		return;
	}
	link.encodedUrl = encodeURIComponent(link.url);
	next();
};
function newLink(request, response) {
	response.render('link.edit.mustache', {});
};
function editLink(request, response, next) {
	var url = request.params.url

	request.storage.links.get(url, linkLoaded)

	function linkLoaded(err, link) {
		if(!link) {
			next({ status: 404 });
			return;
		}

		response.render('link.edit.mustache', link);
	};
};
function allLinks(request, response) {
	request.storage.links.get(function(err, data) {
		response.render('links', data);
	});
};

function getLink(request, response, next) {
	var url = request.params.url

	request.storage.links.get(url, function(err, link) {
		if(!link) {
			next({ status: 404 });
			return;
		}

		response.render('link', link);
	});
};

function postLink(request, response) {
	var link = request.body

	request.storage.links.add(link, function(err, link) {
		response.local('message', 'link created');
		response.local('status', 201);
		response.header('location', util.format('/links/%s', link.encodedUrl));
		response.render('link.post.mustache', link);
	});
};
function postUpdateLink(request, response) {
	var link = request.body
	  , url = request.params.url

	request.storage.links.update(url, link, function() {
		response.render('link.post.mustache', link);
	});
};
function putLink(request, response) {
	var url = request.params.url
	  , link = request.body

	request.storage.links.add(link, function(err, link) {
		response.render('link', link);
	});
};
function deleteLink(request, response) {
	var url = request.params.url

	request.storage.links.del(url, function(err, link) {
		response.render('link.del.mustache', { status: 200 });
	});
};