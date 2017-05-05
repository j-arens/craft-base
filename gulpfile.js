'use-strict';

/**
 * Config
 */

// general processors
const gulp = require('gulp');
const sourcemaps = require('gulp-sourcemaps');
const argv = require('yargs').argv;
const bsync = require('browser-sync').create();
const rename = require('gulp-rename');

// css processors
const postcss = require('gulp-postcss');
const next = require('postcss-cssnext');
const cssImport = require('postcss-import');
const cssFor = require('postcss-for');
const nano = require('gulp-cssnano');
const flexbug = require('postcss-flexbugs-fixes');

// js processors
const webpack = require('webpack-stream');

// assets processors
const imagemin = require('gulp-imagemin');

const env = {
    migrate: argv.migrate || false,
    devUrl: 'localhost',
    craftDistPath: '/var/www/craft',
    publicDistPath: '/var/www/html'
}

/**
 * Styles
 */
const prefixSupport = [
    "Android 2.3",
    "Android >= 4",
    "Chrome >= 20",
    "Firefox >= 24",
    "Explorer >= 8",
    "iOS >= 6",
    "Opera >= 12",
    "Safari >= 6"
];

const cssPlugins = [
    cssImport(),
    cssFor(),
    next({
        browsers: prefixSupport,
        features: {
            rem: false,
            customProperties: {
                strict: false
            }
        }
    }),
    flexbug()
];

gulp.task('styles', () => gulp.src('./public/source/styles/style.css')
    .pipe(sourcemaps.init())
    .pipe(postcss(cssPlugins))
    .pipe(nano({zindex: false, reduceIdents: false}))
    .pipe(rename('style.min.css'))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('./public/build/style'))
);

gulp.task('migrate-styles', () => gulp.src('./public/build/style/style.min.css')
    .pipe(gulp.dest(env.publicDistPath + '/style'))
);

/**
 * JS
 */
gulp.task('js', () => gulp.src('./public/source/js/main.js')
    .pipe(webpack(require('./webpack.bundle.js')))
    .pipe(rename('bundle.min.js'))
    .pipe(gulp.dest('./public/build/js/'))
);

gulp.task('migrate-js', () => gulp.src('./public/build/js/bundle.min.js')
    .pipe(gulp.dest(env.publicDistPath + '/js'))
);

/**
 * Assets
 */
gulp.task('images', () => gulp.src('./public/build/assets/images/**/*.+(jpg|jpeg|gif|png|svg)')
    .pipe(imagemin())
    .pipe(gulp.dest('./public/build/assets/images'))
);

gulp.task('migrate-images', () => gulp.src('./public/build/assets/images/**/*.+(jpg|jpeg|gif|png|svg)')
    .pipe(gulp.dest(env.publicDistPath + '/assets/images'))
);


gulp.task('icons', () => gulp.src('./public/build/assets/icons/**/*.+(jpg|jpeg|gif|png|svg)')
    .pipe(imagemin())
    .pipe(gulp.dest('./public/build/assets/icons'))
);

gulp.task('migrate-icons', () => gulp.src('./public/build/assets/icons/**/*.+(jpg|jpeg|gif|png|svg)')
    .pipe(gulp.dest(env.publicDistPath + '/assets/icons'))
);

/**
 * Templates
 */
gulp.task('migrate-templates', () => gulp.src('./templates/**/*.html', {base: './templates'})
    .pipe(gulp.dest(env.craftDistPath + '/templates'))
);

/**
 * Local deployment
 */
gulp.task('localdeploy', () => gulp.src(env.distPath)
    .pipe(bsync.stream())
);

/**
 * Browsersync
 */
gulp.task('bsync', () => {

    bsync.init({
        proxy: env.devUrl
    });

    gulp.watch(env.craftDistPath + '/templates/**/*.html').on('change', bsync.reload);
    gulp.watch(env.publicDistPath + '/**/*').on('change', bsync.reload);
});

/**
 * Watch
 */
gulp.task('watch', () => {
    gulp.watch('./public/source/styles/**/*.css', ['styles']);
    gulp.watch('./public/source/js/**/*.js', ['js']);
    gulp.watch('./public/source/assets/icons/**/*', ['icons']);
    gulp.watch('./public/source/assets/images/**/*', ['images']);

    if (env.migrate) {
        gulp.watch('./public/build/style/style.min.css', ['migrate-styles']);
        gulp.watch('./public/build/js/bundle.min.js', ['migrate-js']);
        gulp.watch('./public/build/assets/icons/**/*', ['migrate-icons']);
        gulp.watch('./public/build/assets/images/**/*', ['migrate-images']);
        gulp.watch('./templates/**/*.html', ['migrate-templates']);
    }
});

/**
 * Commands
 */
gulp.task('migrate', ['migrate-styles', 'migrate-js', 'migrate-icons', 'migrate-images', 'migrate-templates']);
gulp.task('build', ['styles', 'js', 'images', 'icons']);
gulp.task('build-watch', ['build', 'watch']);
gulp.task('default', ['build-watch', 'bsync']);