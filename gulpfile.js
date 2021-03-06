/*-----------------------------------------------------------------------------
| Copyright (c) 2014-2015, S. Chris Colbert
|
| Distributed under the terms of the BSD 3-Clause License.
|
| The full license is in the file LICENSE, distributed with this software.
|----------------------------------------------------------------------------*/
'use strict';

var del = require('del');
var concat = require('gulp-concat');
var gulp = require('gulp');
var header = require('gulp-header');
var nib = require('nib');
var rename = require('gulp-rename');
var stream = require('event-stream');
var stylus = require('gulp-stylus');
var typedoc = require('gulp-typedoc');
var typescript = require('gulp-typescript');
var uglify = require('gulp-uglify');


var typings = ['./typings/tsd.d.ts'];


var tsSources = [
  'collections/algorithm',
  'collections/circularbuffer',
  'collections/common',
  'collections/queue',

  'utility/boxsizing',
  'utility/cursor',
  'utility/disposable',
  'utility/empty',
  'utility/hittest',
  'utility/pair',
  'utility/point',
  'utility/rect',
  'utility/size',
  'utility/viewport',

  'core/imessage',
  'core/imessagefilter',
  'core/imessagehandler',
  'core/message',
  'core/messageloop',
  'core/nodebase',
  'core/signal',

  'di/token',
  'di/container',
  'di/icontainer',

  'virtualdom/factory',
  'virtualdom/basecomponent',
  'virtualdom/component',
  'virtualdom/dom',
  'virtualdom/elem',
  'virtualdom/icomponent',
  'virtualdom/renderer',

  'widgets/alignment',
  'widgets/childmessage',
  'widgets/direction',
  'widgets/dockmode',
  'widgets/ilayoutitem',
  'widgets/movemessage',
  'widgets/orientation',
  'widgets/resizemessage',
  'widgets/sizepolicy',
  'widgets/widgetflag',
  'widgets/layout',
  'widgets/layoutengine',
  'widgets/spaceritem',
  'widgets/widgetitem',
  'widgets/boxlayout',
  'widgets/splithandle',
  'widgets/splitlayout',
  'widgets/stackedlayout',
  'widgets/widget',
  'widgets/panel',
  'widgets/boxpanel',
  'widgets/splitpanel',
  'widgets/stackedpanel',
  'widgets/dockarea',
  'widgets/menuitem',
  'widgets/menu',
  'widgets/menubar',
  'widgets/renderwidget',
  'widgets/scrollbar',
  'widgets/tab',
  'widgets/tabbar',
  'widgets/tabpanel',

  'shell/iplugin',
  'shell/ipluginlist',
  'shell/ishellview',
  'shell/autohide',
  'shell/bootstrapper',
  'shell/menumanager',
  'shell/pluginlist',
  'shell/shellpanel',
  'shell/shellview'
].map(function(name) { return './src/' + name + '.ts'; });


var stylSources = './styl/index.styl';


gulp.task('clean', function(cb) {
  del(['./dist'], cb);
});


gulp.task('src', function() {
  var project = typescript.createProject({
    declarationFiles: true,
    noImplicitAny: true,
    target: 'ES5',
  });

  var src = gulp.src(typings.concat(tsSources))
    .pipe(typescript(project));

  var dts = src.dts.pipe(concat('phosphor.d.ts'))
    .pipe(gulp.dest('./dist'));

  var js = src.pipe(concat('phosphor.js'))
    .pipe(header('"use strict";\n'))
    .pipe(gulp.dest('./dist'));

  return stream.merge(dts, js);
});


gulp.task('styl', function() {
  return gulp.src(stylSources)
    .pipe(stylus({ use: [nib()] }))
    .pipe(rename('phosphor.css'))
    .pipe(gulp.dest('./dist'));
});


gulp.task('build', ['src', 'styl']);


gulp.task('dist', ['build'], function() {
  return gulp.src('./dist/phosphor.js')
    .pipe(uglify())
    .pipe(rename('phosphor.min.js'))
    .pipe(gulp.dest('./dist'));
});


gulp.task('watch', function() {
  gulp.watch(tsSources, ['src']);
});


gulp.task('examples', function() {
  var project = typescript.createProject({
    declarationFiles: false,
    noImplicitAny: true,
    target: 'ES5',
  });

  var sources = typings.concat([
    'dist/phosphor.d.ts',
    'examples/**/*.ts'
  ]);

  var src = gulp.src(sources)
    .pipe(typescript(project))
    .pipe(rename(function (path) {
      path.dirname += '/build'; }))
    .pipe(header('"use strict";\n'))
    .pipe(gulp.dest('examples'));

  var css = gulp.src('examples/**/index.styl')
    .pipe(stylus({ use: [nib()] }))
    .pipe(rename(function (path) {
      path.dirname += '/build'; }))
    .pipe(gulp.dest('examples'));

  return stream.merge(src, css);
});


gulp.task('docs', function() {
  // FIXME order of concat is important here because typedoc link tag
  // resolving seems to have a bug in scope resolution order. As an
  // example using the [[find]] tag inside the `algorithm` module
  // will resolve to `CodeMirror#find` instead of the `find` function
  // defined in `algorithm`.
  return gulp.src(tsSources.concat(typings))
    .pipe(typedoc({
      out: './build/docs',
      name: 'Phosphor',
      target: 'ES5',
      mode: 'file',
      includeDeclarations: true }));
});


gulp.task('default', ['dist']);
