const builder = require('corifeus-builder');

module.exports = (grunt) => {

    const loader = new builder.Loader(grunt);
    loader.js();

    grunt.config.set('cory-replace', {
        header: {
            header: true,
            replace: `
[![Build Status](https://travis-ci.org/patrikx3/\${git.repo}.svg?branch=master)](https://travis-ci.org/patrikx3/\${git.repo})
[![Scrutinizer Code Quality](https://scrutinizer-ci.com/g/patrikx3/\${git.repo}/badges/quality-score.png?b=master)](https://scrutinizer-ci.com/g/patrikx3/\${git.repo}/?branch=master)
[![Code Coverage](https://scrutinizer-ci.com/g/patrikx3/\${git.repo}/badges/coverage.png?b=master)](https://scrutinizer-ci.com/g/patrikx3/\${git.repo}/?branch=master)  [![Trello](https://img.shields.io/badge/Trello-p3x-026aa7.svg)](https://trello.com/b/gqKHzZGy/p3x)
`,
            files: [
                '*.md'
            ]
        },
        footer: {
            footer: true,
            replace: `[by Patrik Laszlo](http://patrikx3.tk)`,
            files: [
                '*.md'
            ]
        }
    })

    grunt.registerTask('default', builder.config.task.build.js);

}