module.exports = grunt;

function grunt(grunt) {
	grunt.initConfig({
		min: {
			bookmarklet: {
				src: 'static/bookmarklets/addlink.bookmarklet.js',
				dest: 'static/bookmarklets/addlink.min.js'
			}
		}
	});

	grunt.registerTask('default', 'min');
};