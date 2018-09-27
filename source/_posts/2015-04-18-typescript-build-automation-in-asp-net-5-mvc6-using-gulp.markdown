---
layout: post
title: "TypeScript build automation in ASP.NET 5 (MVC6) using Gulp"
date: 2015-04-18 09:52:00 +0100
comments: true
published: true
categories: ["programming"]
tags: ["asp.net", "mvc6", "typescript"]
---

<h3>Introduction</h3>
<p>ASP.NET 5 introduces some major changes in terms of how we develop applications like no need for project and file association, wwwroot folder, first class support for JSON config files, .NET framework <!-- more -->choice, separation of client side and server side package management and more. You can read more on this <a href="http://weblogs.asp.net/scottgu/introducing-asp-net-5" target="_blank">here</a>.</p>
<p>Above all of these, it supports JavaScript build automation by providing support for the <a href="https://nodejs.org/" target="_blank">nodejs</a>&nbsp;platform.&nbsp;</p>
<p>Visual Studio 2015 has in-built task runner to run grunt or gulp tasks, this is great because we don't have to leave Visual Studio to run these tasks.&nbsp;</p>
<p>When you create a new ASP.NET 5 Starter Web project, you will get predefined gruntfile to automate most of the frequent tasks you may want to do. I personally prefer Gulp over Grunt.</p>
<p>Now, we will see how we can configure TypeScript build system in ASP.NET 5 MVC 6 project using Gulp.</p>
<h3>Gulp package and plugins</h3>
<p>First, we will see all the packages we need to setup TypeScript build system</p>
<ol>
<li><a href="http://gulpjs.com/" target="_blank">gulp</a>&nbsp;- JavaScript build automation tool</li>
<li><a href="https://www.npmjs.com/package/gulp-typescript" target="_blank">gulp-typescript</a>&nbsp;- TypeScript compiler with incremental compile support</li>
<li><a href="https://www.npmjs.com/package/gulp-tslint" target="_blank">gulp-tslint</a>&nbsp;- TypeScript lint tool</li>
<li><a href="https://www.npmjs.com/package/gulp-tslint-stylish" target="_blank">gulp-tslint-stylish</a>&nbsp;- Formats TypeScript lint errors nicely</li>
<li><a href="https://www.npmjs.com/package/gulp-sourcemaps" target="_blank">gulp-sourcemaps</a>&nbsp;- Creates sourcemaps to enable debugging in TypeScript</li>
<li><a href="https://www.npmjs.com/package/gulp-inject" target="_blank">gulp-inject</a>&nbsp;- Injects JavaScript and CSS into HTML file</li>
<li><a href="https://www.npmjs.com/package/gulp-rimraf" target="_blank">gulp-rimraf</a>&nbsp;- Deletes folders and files</li>
</ol>
<h3>Installation</h3>
<p>All these are node modules and we need to install these as dev dependencies. I assume you have node installed in your machine, if not, go to <a href="https://nodejs.org/" target="_blank">nodejs</a>&nbsp;website and follow the instructions.</p>
<p>Open command prompt and navigate to your project folder the follow the steps below to install all the packages you need</p>
<p style="padding-left: 30px;">1. Run the following command and answer all the questions</p>
{% codeblock lang:csharp %}// creates package.json
npm init{% endcodeblock %}
<p style="padding-left: 30px;">This will create package.json file which will have all the node packages you depend on.<br /><br /></p>
<p style="padding-left: 30px;">2. Next, run the following command&nbsp;</p>
{% codeblock lang:csharp %}// install packages
npm install gulp gulp-typescript gulp-tslint gulp-tslint-stylish gulp-sourcemaps gulp-inject gulp-rimraf --save-dev{% endcodeblock %}
<p style="padding-left: 30px;">This will install all the packages you need and save them as development dependency in package.json file.</p>
<p>Now we&nbsp;are ready to create our&nbsp;gulpfile.</p>
<h3>Gulpfile.js</h3>
<p>We will assume the following folder structure for our gulp tasks</p>
<p><strong>wwwroot/app</strong> - this is will have all our TypeScript&nbsp;files. This folder may have subfolders as well</p>
<p><strong>wwwroot/js/app</strong> - this is where we will place all the compiled JavaScript files</p>
<p><strong>wwwroot/js/lib</strong> - this is where we will place all thrid party libraries like AngularJS, jQuery, etc...</p>
<p>Next, import all the packages we installed into gulpfile.js</p>
{% codeblock lang:js %}// Package imports
var gulp = require('gulp');
var typescript = require('gulp-typescript');
var tslint = require('gulp-tslint');
var tslintStyle = require('gulp-tslint-stylish');
var sourcemaps = require('gulp-sourcemaps');
var inject = require('gulp-inject');
var rimraf = require('gulp-rimraf');{% endcodeblock %}
<p>Lets create our&nbsp;tasks now</p>
<h4>1. Clean</h4>
<p>We need a task to clean wwwroot/js/app to clean up old compiled JavaScript files</p>
{% codeblock lang:js %}// clean
gulp.task('clean', function () {
        gulp.src('wwwroot/js/app', { read: false })
            .pipe(rimraf())
});{% endcodeblock %}
<p>This task takes a source location and deletes everything in it.</p>
<h4>2.&nbsp;TSLint</h4>
<p>Just like <a href="http://jslint.com/" target="_blank">JSLint</a>, we have <a href="https://github.com/palantir/tslint" target="_blank">TSLint</a>&nbsp;to report mistakes in our TypeScript. The TSLint needs tslint.json file with the lint configuration, you can find a sample one <a href="https://github.com/palantir/tslint/blob/master/tslint.json" target="_blank">here</a>&nbsp;but you can add/remove any rules. Instead of having the rules in a json file, I created JavaScript based config file&nbsp;<a href="../../file.axd?file=%2f2015%2f04%2ftslintConfig.js" target="_blank">tslintConfig.js</a>&nbsp;and kept all the rules in it.</p>
<p>The task created for TSLint looks like this</p>
{% codeblock lang:js %}// TS Lint
var tsLintConfig = require('./tslintConfig');
gulp.task('ts-lint', function () {
        gulp.src('wwwroot/**/*.ts')
            .pipe(tslint(tsLintConfig))
            .pipe(tslint.report(tslintStyle, {
                emitError: false,
                sort: true,
                bell: true
            }));
});{% endcodeblock %}
<p>This task also uses&nbsp;<a href="https://www.npmjs.com/package/gulp-tslint-stylish" target="_blank">gulp-tslint-stylish</a>&nbsp;plugin to produce nicely formatted errors.</p>
<h4>3. TS Compile</h4>
<p>This task compiles TypeScripts&nbsp;and produces JavaScript with sourcemaps</p>
{% codeblock lang:js %}// TS Compile
gulp.task('ts-compile', ['ts-lint', 'clean'], function () {
        var tsResult = gulp.src('wwwroot/**/*.ts')
                           .pipe(sourcemaps.init())
                           .pipe(typescript());
        tsResult.js
            .pipe(sourcemaps.write('.'))
            .pipe(gulp.dest('wwwroot/js'));
});{% endcodeblock %}
<p>This task runs 'ts-lint' and 'clean' before running compile task. The compiled files are placed in wwwroot/js/app folder.</p>
<h4>4. Inject</h4>
<p>This task is to inject compiled JavaScript files into our main HTML file</p>
{% codeblock lang:js %}// Inject
 gulp.task('inject', ['ts-compile'], function () {
        var target = gulp.src('wwwroot/index.html');
        var sources = gulp.src(['wwwroot/js/app/**/*.js'], { read: false });

target.pipe(inject(sources, { relative: true }))
          .pipe(gulp.dest('wwwroot'));
});{% endcodeblock %}
<p>The main html file in wwwroot has the following HTML comment to indicate where the scripts should be injected,</p>
{% codeblock lang:html %}// injection comment
<!--inject:js-->
<!--endinject-->{% endcodeblock %}
<p>This task generates script tag for&nbsp;all the generated JavaScript files in our wwwroot/js/app and places them between start and end comment tags.</p>
<h4>5. Watch</h4>
<p>Next, we create watch task to run TSLint, Clean, TS Compile and Inject whenever any change in detected in wwwroot/app with *.ts extension</p>
{% codeblock lang:js %}// Watch
gulp.task('ts-watch', function () {
        gulp.watch('wwwroot/**/*.ts', ['inject']);
});{% endcodeblock %}
<p>Due to dependent task setups, when we run 'inject' it will trigger 'ts-lint', 'clean' and 'ts-compile' for us.</p>
<h4>6. Default task</h4>
<p>Finally, we will make 'inject' as default task. This allows us to run&nbsp;inject task when we ask gulp to run the default task</p>
{% codeblock lang:js %}// Default task
gulp.task('default', ['inject']);{% endcodeblock %}
<p>In the end, our gulpfile.js would look like&nbsp;<a href="../../file.axd?file=%2f2015%2f04%2fgulpfile.js">this</a>.</p>
<p>That's it. We are now ready to use TypeScript as our client side development language in ASP.NET 5 &nbsp;MVC 6.</p>
<p>I have not created tasks to minify and concatinate compiled JavaScript files. You can add them easily using <a href="https://www.npmjs.com/package/gulp-uglify" target="_blank">gulp-uglify</a>&nbsp;and&nbsp;<a href="https://www.npmjs.com/package/gulp-concat" target="_blank">gulp-concat</a>.</p>
<p>&nbsp;</p>
<p><strong>Update:</strong> sourcemaps was not resolving source files correctly for me. It started working after specifying sourceRoot in sourcemaps.write() method as follows&nbsp;</p>
{% codeblock lang:js %}// ts-compile updated
gulp.task('ts-compile', ['ts-lint', 'clean'], function () {
        var tsResult = gulp.src('wwwroot/**/*.ts')
                           .pipe(sourcemaps.init())
                           .pipe(typescript());
        tsResult.js
            .pipe(sourcemaps.write(".", { sourceRoot: 'wwwroot/app' }))
            .pipe(gulp.dest('wwwroot/js'));
});{% endcodeblock %}
<p>&nbsp;</p>
