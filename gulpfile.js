'use strict'

let gulp = require('gulp')
let mocha = require('gulp-mocha')
let standard = require('gulp-standard')
let del = require('del')

gulp.task('lint', function () {
  return gulp.src(['index.js', 'lib/**/*.js', 'test/**/*.js'])
    .pipe(standard())
    .pipe(standard.reporter('default', {
      breakOnError: true
    }))
})

gulp.task('clean:test', function () {
  return del([
    'test/db/**'
  ])
})

gulp.task('test', ['clean:test', 'lint'], function () {
  return gulp.src('test/*.js', { read: false })
    .pipe(mocha())
})

gulp.task('default', ['test'])
