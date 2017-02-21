const builder = require('corifeus-builder');

module.exports = (grunt) => {

    const loader = new builder.Loader(grunt);
    loader.js();
    grunt.registerTask('default', builder.config.task.build.js);

}