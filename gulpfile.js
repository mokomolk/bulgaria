const { src, dest, watch, series, parallel } = require('gulp');
const sass = require("gulp-sass")(require("node-sass"));
const cp = require("child_process");
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const browserSync = require('browser-sync').create();

// File paths

const files = {
    scssPath: '_asset/**/*.scss',
    cssPath: './docs/css/',
    jsPath: './docs/**/*.js',
   
}


// Sass task: compiles the style.scss file into style.css
function scssTask(){
    return src(files.scssPath)
        
        .pipe(sass().on('error', sass.logError))
		.pipe(postcss([ autoprefixer() ]))
        .pipe(dest("./docs/css/")) // put final CSS in dist folder
        .pipe(browserSync.reload({stream:true}));
}

// JS task: concatenates and uglifies JS files to script.js
function jsTask(){
  return src([
      files.jsPath
      //,'!' + 'includes/js/jquery.min.js', // to exclude any specific files
  ])
      .pipe(uglify())
      .pipe(dest('./docs/**/*.js'))
      .pipe(browserSync.reload({stream:true}))
}





// Jekyll
function jekyll() {
    return cp.spawn("bundle", ["exec", "jekyll", "build"], { stdio: "inherit", shell: true });
}


// Watch task: watch SCSS and JS files for changes
// If any change, run scss and js tasks simultaneously


function watchTask(){

    watch([files.scssPath], parallel(scssTask, browserSyncReload));
    watch([files.jsPath], parallel(jsTask, browserSyncReload));
    watch(["./*.html",
    "./*.yml",
    "./_includes/*.html",
    "./_layouts/*.html",
    "./_posts/**/*.*"], series(jekyll, browserSyncReload));
   

}

//browsersynce function
function browserSyncServe(done) {
    browserSync.init({
        server: {
            baseDir: "./docs/"
        }
    });
    done();
}

function browserSyncReload(done) {
    browserSync.reload();
    done();
}

// exports.build = build;
// exports.default = series(clean, build);

exports.default = series(
    parallel(jekyll, scssTask),
    browserSyncServe,
    watchTask
);

// exports.default = series(parallel(scssTask, jsTask, browserSyncServe), watchTask);

