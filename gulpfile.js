const gulp = require('gulp'),
      del = require('gulp-clean'),
      browserSync = require('browser-sync'),
      plumber = require('gulp-plumber'),
      tinyPNG = require('gulp-tinypng-compress'),
      replace = require('gulp-replace'),
      autoPrefixer = require('gulp-autoprefixer'),
      rename = require('gulp-rename'),
      scss = require('gulp-sass'),
      emailBuilder = require('gulp-email-builder'),
      watch = require('gulp-watch');

scss.compiler = require('node-sass');

/* Start Build => Production */
const production = (cb) => {
    cb();
};

const cleanForSave = (cb) => {
    return gulp.src(['node_modules', 'build'])
        .pipe(del());
    cb();
};

const compressImg = (cb) => {
    return gulp.src('build/img/*.{png,jpg,jpeg}')
        .pipe(tinyPNG({
            key: 'mJlv0hcHVqlj6z0xKdcQXd9Z0PXS6Qm5',
            summarize: true,
            parallel: true,
            parallelMax: 20,
            log: true
        }))
        .pipe(gulp.dest('mail/'));
    cb();
};

const changeSrc = (cb) => {
    return gulp.src('build/index.html')
        .pipe(replace('img/', ''))
        .pipe(gulp.dest('mail/'));
    cb();
};

exports.production = gulp.series(compressImg, changeSrc, cleanForSave);
/* End Build => Mail */

/* Start Dev => Build */

const browser = () => {
    browserSync.init({
        server: {
            baseDir: './build'
        }
    })
};

const copyImg = (cb) => {
    return gulp.src('app/img/*.{png,jpg}')
        .pipe(gulp.dest('build/img/'))
        .pipe(browserSync.reload({
            stream: true
        }));
    cb();
};

const styles = (cb) => {
    return gulp.src('app/scss/main.scss')
        .pipe(plumber())
        .pipe(scss().on('error', scss.logError))
        .pipe(autoPrefixer('last 5 versions'))
        .pipe(rename('style.css'))
        .pipe(gulp.dest('app/css/'))
        .pipe(browserSync.reload({
            stream: true
        }));
    cb();
};

const copyStyles = (cb) => {
    return gulp.src('app/css/style.css')
        .pipe(gulp.dest('build/css'))
        .pipe(browserSync.reload({
            stream: true
        }));
    cb();
};

const inline = (cb) => {
    return gulp.src('app/index.html')
        .pipe(plumber())
        .pipe(emailBuilder().build())
        .pipe(gulp.dest('build/'))
        .pipe(browserSync.reload({
            stream: true
        }));
    cb();
};

const watcher = () => {
    watch('app/img/*.{png,jpg}', gulp.series(copyImg));
    watch('app/scss/**/*.*', gulp.series(styles));
    watch('app/css/*.css', gulp.series(copyStyles, inline));
    watch('app/*.html', gulp.series(inline));
};

exports.default = gulp.series(gulp.parallel(copyImg, styles, copyStyles, inline), gulp.parallel(browser, watcher));
/* End Dev => Build */