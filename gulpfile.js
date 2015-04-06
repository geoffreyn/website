'use strict';     
var gulp = require('gulp'),
   uglify = require('gulp-uglify'),
   jshint = require('gulp-jshint');

gulp.task('jshint', function () {
    gulp.src(['app.js', '/routes/**/*.js', '/views/**/*.jade', 'public/javascripts/**/*.js'])
        .pipe(jshint('.jshintrc'))
        .pipe(jshint.reporter('jshint-stylish'))
        // .pipe(jshint.reporter('default'))
        .pipe(uglify()) 
        .pipe(gulp.dest('build'));
    
});