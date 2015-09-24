'use strict'

let gulp = require('gulp')
let mocha = require('gulp-mocha')
var del = require('del')

gulp.task('clean:test', function () {
  return del([
    'test/db/**'
  ])
})

gulp.task('test', ['clean:test'], function () {
  return gulp.src('test/*.js', { read: false })
    .pipe(
      mocha({
        reporter: 'nyan'
      })
    )
})

gulp.task('default', ['test'])
