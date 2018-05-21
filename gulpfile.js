var gulp = require("gulp");
var htmlclean = require("gulp-htmlclean")
var less = require("gulp-less");
var postcss = require("gulp-postcss");
var autoprefixer = require("autoprefixer");
var cssnano = require("cssnano");
var strip = require("gulp-strip-debug");
var concat = require("gulp-concat");
var uglify = require("gulp-uglify");
var newer = require("gulp-newer");
var imagemin = require("gulp-imagemin");
var connect = require("gulp-connect");
var sourcemap = require("gulp-sourcemaps");

var dev = false;

var folder = {
    src: 'src/',
    dist: 'dist/'
}
gulp.task('html', function () {
    var p = gulp.src(folder.src + 'html/*')
        .pipe(connect.reload()).pipe(htmlclean()).pipe(gulp.dest(folder.dist));
})
gulp.task('css', function () {
    var option = [autoprefixer, cssnano];
    var p = gulp.src(folder.src + 'css/**/*')
        .pipe(less())
        .pipe(connect.reload())
    if (!dev) {
        p = p.pipe(postcss(option));
    }
    p.pipe(gulp.dest(folder.dist + 'css/'))
})
gulp.task('js', function () { //公共依赖建立单独任务
    var p = gulp.src(folder.src + 'js/*')
        .pipe(connect.reload());
    if (!dev) {
        p = p.pipe(strip())
            .pipe(uglify())
            .pipe(concat('main.js'));
    }else{
        p = p.pipe(sourcemap.init())
        .pipe(concat('main.js'))
        .pipe(sourcemap.write());
    }
    p.pipe(gulp.dest(folder.dist + 'js/'))
})
gulp.task('publicjs', function () { //公共任务
    gulp.src(folder.src + 'publicjs/*')
        .pipe(gulp.dest(folder.dist + 'publicjs/'))
})
gulp.task('img', function () {
    gulp.src(folder.src + 'img/**/*')
        .pipe(newer(folder.dist + 'img/'))
        .pipe(imagemin())
        .pipe(connect.reload())
        .pipe(gulp.dest(folder.dist + 'img/'))
})
gulp.task("watch", function () {
    gulp.watch(folder.src + 'html/*', ['html']);
    gulp.watch(folder.src + 'css/*', ['css']);
    gulp.watch(folder.src + 'js/*', ['js']);
    gulp.watch(folder.src + 'publicjs/*', ['publicjs']);
    gulp.watch(folder.src + 'img/*', ['img']);
})
gulp.task("server", function () {
    connect.server({
        // name : '',
        port: '8081',
        root: folder.dist,
        livereload: true
    });
})
gulp.task('default', ['html', 'css', 'js', 'publicjs', 'img', 'watch', 'server'], function () {

})