'use strict';

var config = require('./config');

var gulp   = require('gulp');
var reload = require('./reload');

gulp.task('watch', ['reload'], function(callback) {
    gulp.watch(config.appDir + '/**/*', ['bundle']);
    gulp.watch(config.stylesDir + '/**/*', ['styles']);
    gulp.watch(config.imagesDir + '/**/*', ['images']);
    gulp.watch(config.src + 'index.html', ['markup']);
});
