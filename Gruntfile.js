const builder = require('corifeus-builder');

module.exports = (grunt) => {

    const loader = new builder.loader(grunt);
    loader.js({
        replacer: {
            type: 'p3x',
            npmio: true
        }
    });


    grunt.registerTask('default', builder.config.task.build.js);

}
