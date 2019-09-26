const { src, dest, watch, series } = require('gulp');
const twig = require('gulp-twig');
const beautify = require('gulp-jsbeautifier');
const browserSync = require('browser-sync').create();
const sass = require('gulp-sass');
const rollup = require('gulp-better-rollup');
const purgecss = require('gulp-purgecss');
const del = require('del');
const sourcemaps = require('gulp-sourcemaps');
const rename = require('gulp-rename');
const autoprefixer = require('autoprefixer');
const postcss = require('gulp-postcss');

function markup() {
  return src('src/pages/**/*.twig')
    .pipe(twig({
      functions: [
        {
          name: 'guid',
          func: function () {
            return 'xxxxx'.replace(/x/g, () => (Math.random() * 16 | 0).toString(16))
          }
        }
      ]
    }))
    .pipe(beautify({ indent_size: 2 }))
    .pipe(dest('dist'))
  ;
}

function watcher(done) {
  const opts = { ignoreInitial: false }
  watch('src/**/*.twig', opts, markup).on('change', browserSync.reload);
  watch('src/**/*.js', opts, scripts).on('change', browserSync.reload);
  watch('src/**/*.scss', opts, styles);
  done();
}

function serve(done) {
  browserSync.init({ server: './dist' })
  done();
}

function scripts(done) {
  return src('src/js/scripts.js')
    .pipe(rollup({}, 'iife'))
    .pipe(dest('dist'))
  ;
}

function styles() {
  return src('src/styles.scss')
    .pipe(sourcemaps.init())
      .pipe(sass())
      .pipe(postcss([ autoprefixer() ]))
      //.pipe(purgecss({ content: ['dist/**/*.html'] }))
    .pipe(sourcemaps.write())
    .pipe(rename('styles.css'))
    .pipe(dest('dist/css'))
    .pipe(browserSync.stream())
  ;
}

function clean() {
  return del(['dist/**', '!dist', '!dist/images']);
}

exports.markup = markup;
exports.watch = watcher;
exports.dev = series(serve, watcher);
exports.scripts = scripts;
exports.styles = styles;
exports.clean = clean;
