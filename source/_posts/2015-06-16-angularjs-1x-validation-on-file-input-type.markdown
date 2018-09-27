---
layout: post
title: "AngularJS 1.x - Validation on File Input type"
date: 2015-06-16 21:27:38 +0100
comments: true
published: true
categories: ["programming"]
tags: ["angularjs", "javascript"]
---

<h5>Introduction</h5> <p>You might already known that AngularJS 1.x <a href="https://github.com/angular/angular.dart/issues/1094" target="_blank">doesn’t support</a> model binding for File Input type at the moment. This means, implementing any validation on File Input type is not straight forward as validation entirely depends on model binding.</p> <p>I have come across a requirement where, I need to create a form <!-- more -->with ‘required’ validation on File Input type and I also need to display bootstrap form feedback. There are number of <a href="http://stackoverflow.com/a/20506037/3208697" target="_blank">great solutions out there</a> to make file upload with angular easier but none of them provide easier way to enforce validation.</p> <h5>What I did?</h5> <p>First I have made file input type to look like a button as explained <a href="http://www.abeautifulsite.net/whipping-file-inputs-into-shape-with-bootstrap-3/" target="_blank">here</a>, and then made it as an add-on to a normal disabled text input as follows</p>
{% codeblock lang:xml %}
<div class="form-group">
    <label class="col-md-2 control-label" for="photoUrl">Photo</label>
    <div class="col-md-4">
        <div class="input-group">
            <span class="btn btn-primary btn-file input-group-addon">
                Browse <input type="file" id="photoUrlSelector" name="photoUrlSelector" accept="image/*" >
            </span>
            <input class="form-control" type="text" id="photoUrl" name="photoUrl" data-ng-disabled="true">
        </div>
    </div>
</div>
{% endcodeblock %}
<p>The output looks like this:</p>
<p><a href="/files/image_4.png"><img title="image" style="border-top: 0px; border-right: 0px; background-image: none; border-bottom: 0px; float: left; padding-top: 0px; padding-left: 0px; border-left: 0px; display: inline; padding-right: 0px" border="0" alt="image" src="/files/image_4.png" width="435" align="left" height="49"></a></p>

<p>Next, I have used <a href="https://github.com/danialfarid/ng-file-upload" target="_blank">ng-file-upload</a> to make file selection update the model and made $touched property of the form field true on mouse click. So,</p>
{% codeblock lang:xml %}
<span class="btn btn-primary btn-file input-group-addon">
    Browse <input type="file" id="photoUrlSelector" name="photoUrlSelector" accept="image/*">
</span>
{% endcodeblock %}
<p>is changed as follows</p>
{% codeblock lang:xml mark:2 %}
<span class="btn btn-primary btn-file input-group-addon">
    Browse <input type="file" id="photoUrlSelector" name="photoUrlSelector" ngf-select ng-model="vm.author.photoUrl" accept="image/*" data-ng-click="addAuthorForm.photoUrl.$touched=true">
</span>
{% endcodeblock %}
<p>Then, the first file name is set as model for the text input type as follows, so it shows the selected file</p>
{% codeblock lang:xml %}
<input class="form-control" type="text" id="photoUrl" name="photoUrl" data-ng-model="vm.author.photoUrl[0].name" data-ng-required="true" data-ng-disabled="true">
{% endcodeblock %}
as you can see, the input field is also decorated with ng-required directive to enforce required field validation. 
<p>Now, until the File Input type is selected, the $touched property will be false and it will become true when user touches it. The user selected file object will be available in the model we used in the File Input type and selected file name will be shown in the text input type.</p>
<p>The File object can be used in your controller to send file to the back end or what ever you want to do with it. </p>
<p>After adding bootstarp feedback, the form group looks like this</p>
{% codeblock lang:xml %}
<div class="form-group has-feedback" data-ng-class="{'has-error':addAuthorForm.photoUrl.$invalid && addAuthorForm.photoUrl.$touched,
     'has-success':addAuthorForm.photoUrl.$valid && addAuthorForm.photoUrl.$touched}">
    <label class="col-md-2 control-label" for="photoUrl">Photo</label>
    <div class="col-md-4">
        <div class="input-group">
            <span class="btn btn-primary btn-file input-group-addon">
                Browse <input type="file" id="photoUrlSelector" name="photoUrlSelector" ngf-select ng-model="vm.author.photoUrl" accept="image/*" data-ng-click="addAuthorForm.photoUrl.$touched=true">
            </span>
            <input class="form-control" type="text" id="photoUrl" name="photoUrl" data-ng-model="vm.author.photoUrl[0].name" data-ng-required="true" data-ng-disabled="true">
            <span data-ng-if="addAuthorForm.photoUrl.$invalid && addAuthorForm.photoUrl.$touched" class="glyphicon glyphicon-remove form-control-feedback"></span>
            <span data-ng-if="addAuthorForm.photoUrl.$valid && addAuthorForm.photoUrl.$touched" class="glyphicon glyphicon-ok form-control-feedback"></span>

        </div>
    </div>
    <span class="help-block">
        <span data-ng-show="addAuthorForm.photoUrl.$error.required &amp;&amp; addAuthorForm.photoUrl.$touched">The Photo is required field.</span>
    </span>
</div>
{% endcodeblock %}
<p>Output with validation error looks like this</p>
<p><a href="http://mvenkatraman.co.uk/image.axd?picture=image1.png"><img title="image" style="border-top: 0px; border-right: 0px; background-image: none; border-bottom: 0px; padding-top: 0px; padding-left: 0px; border-left: 0px; display: inline; padding-right: 0px" border="0" alt="image" src="http://mvenkatraman.co.uk/image.axd?picture=image1_thumb.png" width="697" height="57"></a></p>
<p>and success looks like this</p>
<p><a href="http://mvenkatraman.co.uk/image.axd?picture=image4.png"><img title="image" style="border-top: 0px; border-right: 0px; background-image: none; border-bottom: 0px; padding-top: 0px; padding-left: 0px; border-left: 0px; display: inline; padding-right: 0px" border="0" alt="image" src="http://mvenkatraman.co.uk/image.axd?picture=image4_thumb.png" width="491" height="55"></a></p>
<h5>Conclusion</h5>
<p>This is not perfect but it does the job. We could also create a directive to hide away all the messy details but that is not necessary until you need to use this in many places in your application. </p>
<p>Please let me know if you know a better way to achieve this.</p>
