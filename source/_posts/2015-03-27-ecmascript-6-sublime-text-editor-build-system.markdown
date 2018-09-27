---
layout: post
title: "ECMAScript 6 - Sublime Text editor build system"
date: 2015-03-27 20:39:00 +0000
comments: true
published: true
categories: ["programming"]
tags: ["javascript", "es6", "es2015", "sublime"]
---

<p>The specification for ECMAScript 6 (aka ES6, ECMAScript harmony) is expected to be released in June 2015 and many tools, frameworks and browers have started implementing the features of ES6. For example, <a href="https://angular.io/" target="_blank">Angular 2.0</a>&nbsp;and <a href="http://aurelia.io/" target="_blank">Aurelia</a>&nbsp;allows us to write code in ES6 now. There are transpilers as well out there, which <!-- more -->allows us to write code in ES6 and transpile them into ES5. I have come across two major transpilers&nbsp;<a href="https://github.com/google/traceur-compiler" target="_blank">traceur</a>&nbsp;and&nbsp;<a href="https://babeljs.io/">babel</a>, they are equally good.</p>
<p>I wanted to setup something like <a href="https://www.linqpad.net/">LinqPad</a>&nbsp;for JavaScript to learn and practice ES6 without using browser to see the output.</p>
<p>The tools I used to achieve the desired setup are</p>
<ol>
<li><a href="http://www.sublimetext.com/" target="_blank">Sublime text</a>&nbsp;- primary editor</li>
<li><a href="https://nodejs.org/" target="_blank">Nodejs</a>&nbsp;- runs ES5</li>
<li><a href="https://babeljs.io/" target="_blank">Babel</a>&nbsp;- ES6 to ES5 transpiler</li>
<li><a href="http://gulpjs.com/" target="_blank">Gulp</a>&nbsp;with <a href="https://github.com/babel/gulp-babel" target="_blank">gulp-babel</a>&nbsp;and <a href="https://github.com/sun-zheng-an/gulp-shell" target="_blank">gulp-shell</a>&nbsp;plugins - task runner</li>
</ol>
<p>I took advantage of Sublime text build system by creating a new one for ES6 using gulp task. The gulp task will transpile the code from ES6 to ES5 and run it as a normal node program.</p>
<p>Let's start from the gulp task, here is the task I have created</p>
{% codeblock lang:js %}// gulpfile.js
var gulp = require('gulp');
var babel = require('gulp-babel');
var shell = require('gulp-shell');


gulp.task('run', function(){
	return gulp.src('app.js')
			.pipe(babel())
			.pipe(gulp.dest('result'))
			.pipe(shell(['node result\\app.js']));
			
});{% endcodeblock %}
<p>This task simple takes the source file named app.js and applies babel task to convert from ES6 to ES5, stores the output in result folder and finally runs the output file as a normal node program using grunt's shell plugin.</p>
<p>Here is the build system I created for ES6</p>
{% codeblock lang:js %}{
  "cmd": ["gulp.cmd", "run"]
}{% endcodeblock %}
<p>Note: If you are using Windows 8, you must use gulp.cmd rather than gulp.</p>
<p>The build script simply invokes gulp to run a task named 'run'.</p>
<p>I have also installed <a href="https://packagecontrol.io/packages/JavaScriptNext%20-%20ES6%20Syntax" target="_blank">this</a>&nbsp;package to enable ES6 syntax highlight feature in Sublime text.</p>
<p>My file structure looks like this in the end</p>
<p>&nbsp;<img src="/files/2015/03/Untitled.png" alt="" /></p>
<p>The code looks like this with syntax highlight feature</p>
<p>&nbsp;<img src="/files/2015/03/Capture3.PNG" alt="" /></p>
<p>Finally, output looks like this when I use Ctrl+B to run the build</p>
<p>&nbsp;<img src="/files/2015/03/Capture5.PNG" alt="" /></p>
<p>Note: This setup is only recommended if you just want to play with ES6 like me. The grunt task uses hard coded files names and you need to use the same file name to get it working.</p>
