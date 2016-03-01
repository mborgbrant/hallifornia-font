const googleAnalyticsId = require('./templates/variables.json').googleAnalyticsId;
const consolidate = require('gulp-consolidate');
const cleanCss = require('gulp-clean-css');
const iconfont = require('gulp-iconfont');
const ghPages = require('gulp-gh-pages');
const rename = require('gulp-rename');
const zip = require('gulp-zip');
const async = require('async');
const gulp = require('gulp');
const fs = require('fs');

const fontName = 'hallifornia-font';
const version = '0_4b';
const customDomain = 'www.hallifornia-font.com';
const runTimestamp = Math.round(Date.now() / 1000);

gulp.task('deploy', function () {
	fs.writeFileSync('www/CNAME', customDomain);
	return gulp.src('./www/**/*')
		.pipe(ghPages());
});

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
					version: version,
					googleAnalyticsId: googleAnalyticsId ? googleAnalyticsId : ''
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
		function handleMinifing(cb) {
			gulp.src('www/css/' + fontName + '.css')
				.pipe(cleanCss({ compatibility: 'ie8' }))
				.pipe(rename({
					basename: fontName,
					extname: '.min.css'
				}))
				.pipe(gulp.dest('www/css'))
				.on('finish', cb);
		},
		function handlePackage(cb) {
			gulp.src(['!./www/CNAME', '!./www/download', '!./www/download/**', '!./www/favicons', '!./www/favicons/**', '!./www/*.html', 'www/**'])
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