var gulp = require('gulp');
var less = require('gulp-less');
var uglify = require('gulp-uglify');
var minifyCSS = require('gulp-minify-css');

gulp.task('uglify', function () {
  gulp.src('src/js/**/*.js')
    .pipe(uglify())
    .on('error',function () {
      console.log(error.toString());
      this.emit('end');
    })
    .pipe(gulp.dest('build/js'));
});

gulp.task('less', function() {
  gulp.src('src/style/**/*.less')
    .pipe(less())
    .pipe(minifyCSS())
    .pipe(gulp.dest('build/style'));
});

gulp.task('default', ['uglify', 'less']);

gulp.task('watch', function () {
  gulp.watch('src/js/**/*.js', ['uglify']);
  gulp.watch('src/style/**/*.less', ['less']);
});


