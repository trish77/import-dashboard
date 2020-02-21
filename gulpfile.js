"use strict";

var gulp = require('gulp'),
  sass = require('gulp-sass'),
  del = require('del'),
  uglify = require('gulp-uglify'),
  cleanCSS = require('gulp-clean-css'),
  concat = require("gulp-concat"),
  rename = require("gulp-rename"),
  sourcemaps = require("gulp-sourcemaps"),
  uglifycss = require('gulp-uglifycss'),
  merge = require('merge-stream'),
  htmlreplace = require('gulp-html-replace'),
  autoprefixer = require('gulp-autoprefixer'),
  pipeline = require('readable-stream').pipeline,
  browserSync = require('browser-sync').create();

// Clean task
gulp.task('clean', function() {
  return del(['dist', 'assets/css/*.css']);
});

// Copy third party libraries from node_modules into /vendor
gulp.task('vendor:js', function() {
  return gulp.src([
    './assets/js/*.js'

  ])
    .pipe(gulp.dest('./assets/js'));
});

// Copy font-awesome from node_modules into /fonts
gulp.task('fonts', function() {
  return  gulp.src([
    './assets/fonts/**/*',
    '!./assets/fonts/icomoon/{css/*}'
  ])
    .pipe(gulp.dest('./dist/assets/fonts'))
});

// vendor task
//gulp.task('vendor', gulp.parallel('vendor:fonts'));

// Copy vendor's js to /dist
gulp.task('vendor:build', function() {

  var cssStream = gulp.src([
    './assets/css/bootstrap.css',
    './assets/css/fixedColumns.bootstrap4.css',
    './assets/css/fixedHeader.bootstrap4.css',
    './assets/css/icomoon.css',
    './assets/css/responsive.bootstrap4.css',
    './assets/css/select.bootstrap4.css',
  ])
  .pipe(gulp.dest('./dist/assets/css'));


  var jsStream = gulp.src([
    './assets/js/vendor/a-jquery.js',
    './assets/js/vendor/b-popper.js',
    './assets/js/vendor/bootstrap.js',
    './assets/js/vendor/c-datatables.js',
    './assets/js/vendor/dataTables.rowReorder.min.js',
    './assets/js/vendor/prototype.datatables.js',
    './assets/js/vendor/theApp.js',
  ])
    .pipe(gulp.dest('./dist/assets/js'));


  var fontStream = gulp.src(['./assets/fonts/icomoon/**/*.*']).pipe(gulp.dest('./dist/assets/fonts/'));
  return merge (jsStream, fontStream, cssStream);
});

// Copy Bootstrap SCSS(SASS) from node_modules to /assets/scss/bootstrap
gulp.task('bootstrap:scss', function() {
  return gulp.src(['./assets/scss/bootstrap/**/*'])
    .pipe(gulp.dest('./assets/scss/bootstrap'));
});

// Compile SCSS(SASS) files
gulp.task('scss', gulp.series('bootstrap:scss', function compileScss() {
  return gulp.src(['./assets/scss/*.scss'])
    .pipe(sass.sync({
      outputStyle: 'expanded'
    }).on('error', sass.logError))
    .pipe(autoprefixer())
    .pipe(gulp.dest('./assets/css'))
}));

// Minify CSS
gulp.task('css:minify', gulp.series('scss', function cssMinify() {
  return gulp.src( "./assets/css/*.css"  )
    //.pipe(sourcemaps.init())
    .pipe(concat({ path: 'app.css' }))
    //.pipe(cleanCSS({ rebase: false, debug: true }))
    .pipe(uglifycss({ "uglyComments": true}))
    .pipe(rename({suffix: '.min'}))
    //.pipe(sourcemaps.write())
    .pipe(gulp.dest('./dist/assets/css'))
    .pipe(browserSync.stream());

}));

// Minify Js
gulp.task('js:minify', function () {
  // let jsFiles =

  return pipeline(
    gulp.src('./assets/js/*.js'),
    concat('app.min.js'),
   // uglify(),
    gulp.dest('./dist/assets/js'),
    browserSync.stream()
  );

});

// Replace HTML block for Js and Css file upon build and copy to /dist
gulp.task('replaceHtmlBlock', function () {
  return gulp.src(['*.html'])
    .pipe(htmlreplace({
      'js': 'assets/js/app.min.js',
      'css': 'assets/css/app.min.css'
    }))
    .pipe(gulp.dest('dist/'));
});

// Configure the browserSync task and watch file path for change
gulp.task('dev', function browserDev(done) {
  browserSync.init({
    server: {
      baseDir: "./"
    },
    port: 3030
  });
  gulp.watch(['assets/scss/*.scss','assets/scss/**/*.scss','!assets/scss/bootstrap/**', "assets/js/*.js"], gulp.series('css:minify', 'js:minify', function cssBrowserReload (done) {
    browserSync.reload();
    done(); //Async callback for completion.
  }));
  gulp.watch('assets/js/app.js', gulp.series('js:minify', function jsBrowserReload (done) {
    browserSync.reload();
    done();
  }));
  gulp.watch(['*.html']).on('change', browserSync.reload);
  done();
});

// Build task
gulp.task("build", gulp.series(gulp.parallel('css:minify', 'js:minify',  'fonts'), function copyAssets() {
  return gulp.src([
    '*.html',
    'favicon.ico',
    "assets/img/**"
  ], { base: './'})
    .pipe(gulp.dest('dist'));
}));

// Default task
gulp.task("default", gulp.series("dev", "clean", 'build', 'replaceHtmlBlock'));