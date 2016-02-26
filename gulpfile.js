const gulp = require('gulp');
const async = require('async');
const consolidate = require('gulp-consolidate');
const iconfont = require('gulp-iconfont');
const rename = require('gulp-rename');
const zip = require('gulp-zip');

const fontName = 'hallifornia-font';
const version = '0_1b';
const runTimestamp = Math.round(Date.now() / 1000);

gulp.task('default', function (done) {
	var iconStream = gulp.src(['icons/*.svg'])
		.pipe(iconfont({
			fontName: fontName,
			prependUnicode: true,
			formats: ['ttf', 'eot', 'woff', 'svg', 'woff2'],
			timestamp: runTimestamp,
			descent: 80
		}));

	async.waterfall([
		function handleGlyphs(cb) {
			iconStream.on('glyphs', function (glyphs, options) {

				var templateVariables = {
					glyphs: glyphs,
					fontName: fontName,
					fontPath: '../fonts/',
					className: 'hf',
					version: version
				};

				gulp.src('templates/html.template')
					.pipe(consolidate('lodash', templateVariables))
					.pipe(rename({
						basename: "index",
						extname: ".html"
					}))
					.pipe(gulp.dest('www/'))

				gulp.src('templates/css.template')
					.pipe(consolidate('lodash', templateVariables))
					.pipe(rename({
						basename: fontName,
						extname: '.css'
					}))
					.pipe(gulp.dest('www/css/'))
					.on('finish', cb);
			});
		},
		function handleFonts(cb) {
			iconStream
				.pipe(gulp.dest('www/fonts/'))
				.on('finish', cb);
		},
		function handlePackage(cb) {
			gulp.src(['!./www/download', '!./www/download/**', '!./www/*.html', 'www/**'])
				.pipe(zip('hallifornia_font_' + version + '.zip'))
				.pipe(gulp.dest('www/download'))
				.on('finish', cb);
		},
		function copyFavIcons(cb) {
			gulp.src(['favicons/*.*'])
				.pipe(gulp.dest('www/favicons'))
				.on('finish', cb);
		}
	], done);
});