module.exports = function (grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        run: {
            localServer: {
                cmd: 'watch-http-server',
                args: [
                    '-o',
                    '-a',
                    'localhost'
                ]
            },
            sassWatch: {
                cmd: 'sass',
                args: [
                    '--watch',
                    'public/:public/app.css'
                ],
                options: {
                    wait: false
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-run');

    grunt.registerTask('dev', ['run:sassWatch', 'run:localServer']);
};
