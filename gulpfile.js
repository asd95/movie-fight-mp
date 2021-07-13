// используемые значения переменных
const project_folder = require("path").basename(__dirname),
  source_folder = "src";

// зависимости
const { src, dest, parallel, watch, series } = require("gulp"),
  browsersync = require("browser-sync").create(),
  fileinclude = require("gulp-file-include"),
  del = require("del"),
  sass = require("gulp-sass"),
  autoprefixer = require("gulp-autoprefixer"),
  groupmedia = require("gulp-group-css-media-queries"),
  cleancss = require("gulp-clean-css"),
  rename = require("gulp-rename"),
  uglify = require("gulp-uglify-es").default,
  concat = require("gulp-concat"),
  imagemin = require("gulp-imagemin");
// webp = require("gulp-webp"),
// webphtml = require("gulp-webp-html"),
// webpcss = require("gulp-webp-css");

// пути к папкам
const path = {
  build: {
    html: `${project_folder}/`,
    css: `${project_folder}/css/`,
    js: `${project_folder}/js/`,
    img: `${project_folder}/img/`,
    fonts: `${project_folder}/fonts/`,
  },
  src: {
    html: [`${source_folder}/*.html`, `!${source_folder}/_*.html`],
    css: `${source_folder}/scss/styles.scss`,
    js: `${source_folder}/js/*.js`,
    img: `${source_folder}/img/**/*.{jpg,png,svg,gif,ico,webp}`,
    fonts: `${source_folder}/fonts/*.ttf`,
  },
  watch: {
    html: `${source_folder}/**/*.html`,
    css: `${source_folder}/scss/**/*.scss`,
    js: `${source_folder}/js/**/*.js`,
    img: `${source_folder}/img/**/*.{jpg,png,svg,gif,ico,webp`,
  },
  clean: `${project_folder}/`,
};

// Таски
function browserSync() {
  browsersync.init({
    server: {
      baseDir: `${project_folder}/`,
    },
    port: 3000,
    notify: false,
  });
}

function html() {
  return (
    src(path.src.html)
      .pipe(fileinclude())
      // .pipe(webphtml())
      .pipe(dest(path.build.html))
      .pipe(browsersync.stream())
  );
}

function styles() {
  return (
    src(path.src.css)
      .pipe(
        sass({
          outputStyle: "expanded",
        })
      )
      .pipe(groupmedia())
      .pipe(
        autoprefixer({
          overrideBrowserslist: ["last 10 versions"],
          grid: true,
          cascade: true,
        })
      )
      // .pipe(webpcss())
      .pipe(dest(path.build.css))
      .pipe(
        cleancss({
          level: { 1: { specialComments: 0 } },
          // format:"beautify"
        })
      )
      .pipe(
        rename({
          extname: ".min.css",
        })
      )
      .pipe(dest(path.build.css))
      .pipe(browsersync.stream())
  );
}

function scripts() {
  return src(path.src.js)
    .pipe(concat("scripts.js"))
    .pipe(dest(path.build.js))
    .pipe(uglify())
    .pipe(
      rename({
        extname: ".min.js",
      })
    )
    .pipe(dest(path.build.js))
    .pipe(browsersync.stream());
}

function images() {
  return (
    src(path.src.img)
      // .pipe(
      //   webp({
      //     quality: 70,
      //   })
      // )
      // .pipe(dest(path.build.img))
      // .pipe(src(path.src.img))
      .pipe(imagemin())
      .pipe(dest(path.build.img))
      .pipe(browsersync.stream())
  );
}

function startWatch() {
  watch(path.watch.html, html);
  watch(path.watch.css, styles);
  watch(path.watch.js, scripts);
  watch(path.watch.img, images);
}

function clean() {
  return del(path.clean);
}

// экспорт тасков
let build = series(clean, parallel(html, styles, scripts, images));

exports.html = html;
exports.styles = styles;
exports.html = scripts;
exports.images = images;
exports.build = build;
exports.default = parallel(build, browserSync, startWatch);
