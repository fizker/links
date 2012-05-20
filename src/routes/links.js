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
	http.post('/links/:url', validateLink, postUpdateLink);
	http.del('/links/:url', deleteLink);

	http.get('/links/:url/edit', editLink);
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

	db.get(url, linkLoaded)

	function linkLoaded(err, link) {
		if(!link) {
			next({ status: 404 });
			return;
		}

		response.render('link.edit.mustache', link);
	};
};
function allLinks(request, response) {
	db.get(function(err, data) {
		response.render('links', data);
	});
};

function getLink(request, response, next) {
	var url = request.params.url

	db.get(url, function(err, link) {
		if(!link) {
			next({ status: 404 });
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
function postUpdateLink(request, response) {
	var link = request.body
	  , url = request.params.url
	  , otherIsComplete

	db.del(url, checkIsComplete);
	db.add(link, checkIsComplete);

	function checkIsComplete() {
		if(otherIsComplete) {
			allDone();
		}
		otherIsComplete = true;
	};
	function allDone() {
		response.render('link.post.mustache', link);
	};
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