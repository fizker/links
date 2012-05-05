'use strict';

module.exports = setupRoutes;

var links
  , util = require('util')
  , db

function setupRoutes(options) {
	var http = options.http

	db = options.storage.links;

	setupRoutes.links = links = {};
	http.get('/links', allLinks);

	http.post('/links', validateLink, postLink);
	http.get('/links/new', newLink);
	http.get('/links/:url', getLink);
	http.put('/links/:url', validateLink, putLink);
	http.del('/links/:url', deleteLink);
};
function validateLink(request, response, next) {
	var url = request.params && request.params.url
	  , link = request.body
	  , error

	if(!link || link.url == null) {
		error = 'No link given';
		response.render('errors/400', { status: 400, error: error });
		next(new Error(error));
		return;
	}
	link.encodedUrl = encodeURIComponent(link.url);
	if(url !== undefined) {
		if(url !== link.url) {
			error = 'URL does not match';
			response.render('errors/400', { status: 400, error: error });
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
	db.get(function(err, data) {
		if(err) {
			response.render('errors/500', { status: 500, error: err });
			return;
		}
		response.render('links', data);
	});
};

function getLink(request, response) {
	var url = request.params.url

	db.get(url, function(err, link) {
		if(err) {
			response.render('errors/500', { status: 500, error: err });
			return;
		};
		if(!link) {
			response.render('errors/404', { status: 404 });
			return;
		}

		response.render('link', link);
	});
};

function postLink(request, response) {
	var link = request.body
	  , url = link.url

	db.add(link, function(err, link) {
		response.local('message', 'link created');
		response.local('status', 201);
		response.header('location', util.format('/links/%s', link.encodedUrl));
		response.render('link.post.mustache', link);
	});
};
function putLink(request, response) {
	var url = request.params.url
	  , link = request.body

	db.add(link, function(err, link) {
		response.render('link', link);
	});
};
function deleteLink(request, response) {
	var url = request.params.url

	db.del(url, function(err, link) {
		response.render('link.del.mustache', { status: 200 });
	});
};