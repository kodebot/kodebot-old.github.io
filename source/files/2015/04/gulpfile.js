(function () {
    var gulp = require('gulp');
    var typescript = require('gulp-typescript');
    var tslint = require('gulp-tslint');
    var tslintStyle = require('gulp-tslint-stylish');
    var sourcemaps = require('gulp-sourcemaps');
    var inject = require('gulp-inject');
    var rimraf = require('gulp-rimraf');

    var tsLintConfig = require('./tslintConfig');

    gulp.task('clean', function () {
        gulp.src('wwwroot/js/app', { read: false })
            .pipe(rimraf())
    });

    gulp.task('ts-lint', function () {
        gulp.src('wwwroot/**/*.ts')
            .pipe(tslint(tsLintConfig))
            .pipe(tslint.report(tslintStyle, {
                emitError: false,
                sort: true,
                bell: true
            }));
    });

    gulp.task('ts-compile', ['ts-lint', 'clean'], function () {
        var tsResult = gulp.src('wwwroot/**/*.ts')
                           .pipe(sourcemaps.init())
                           .pipe(typescript());
        tsResult.js
            .pipe(sourcemaps.write('.'))
            .pipe(gulp.dest('wwwroot/js'));
    });
        
    gulp.task('inject', ['ts-compile'], function () {
        var target = gulp.src('wwwroot/index.html');
        var sources = gulp.src(['wwwroot/js/app/**/*.js'], { read: false });

        target.pipe(inject(sources, { relative: true }))
              .pipe(gulp.dest('wwwroot'));
    });
    
    gulp.task('ts-watch', function () {
        gulp.watch('wwwroot/**/*.ts', ['inject']);
    });

    gulp.task('default', ['inject']);

})();