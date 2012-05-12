module.exports = grunt;

function grunt(grunt) {
	grunt.initConfig({
		min: {
			"addlink-bookmarklet": {
				src: 'static/bookmarklets/addlink.bookmarklet.js',
				dest: 'static/bookmarklets/addlink.bookmarklet.min.js'
			},
			addlink: {
				src: 'static/bookmarklets/addlink.js',
				dest: 'static/bookmarklets/addlink.min.js'
			}
		}
	});

	grunt.registerTask('default', 'min');
};