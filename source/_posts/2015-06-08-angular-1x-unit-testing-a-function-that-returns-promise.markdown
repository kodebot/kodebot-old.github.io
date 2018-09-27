---
layout: post
title: "Angular 1.x - Unit Testing a function that returns Promise"
date: 2015-06-08 20:23:17 +0100
comments: true
published: true
categories: ["programming"]
tags: ["angularjs", "javascript", "unit-testing"]
---

<p>I wrote <a href="/2015/03/16/mocking-methods-that-returns-promise" target="_blank">this</a> post few months back which show how we can mock a function that returns Promise. In this post, we will see how to test a function that returns Promise.</p> <p>We will use the following simple controller as our SUT</p>
<!-- more -->
{% codeblock lang:js %}
var app = angular.module("app");

app.controller("studentController", function($q, studentDataService){
    var vm = this;    
    vm.students = undefined;
    
    activate();
    
    function activate (){
        vm.students = getAllStudents();
    }
    
    function getAllStudents(){
        return studentDataService
        .getAll();
    }
});
{% endcodeblock %}
<p>This simple controller has <code>getAllStudents()</code> which returns a promise. The activate method calls <code>getAllStudents()</code> and assigns the returned promise to <code>vm.students</code>. In angular, you can directly bind promise, so, this is perfectly valid.</p>
<p>When it comes to testing, we would like to test what data this promise returns when it is resolved. </p>
<p>And, this is how we do it,</p>
{% codeblock lang:js %}
it("should get students on activation", function(done){
    // Fixture Setup
    // Exercise Systcode
    var sut = $controller("studentController");
    
    // Verify Outcome
    sut.students.then(function(data){
        expect(data).toBeDefined();    
        done();
    });
    $rootScope.$apply();
    
    // Fixture Teardown
});
{% endcodeblock %}
<p>In this test, we are considering <code>sut.students</code> as promise and the assert is written inside the <code>then()</code> method. Because assert is written inside the <code>then()</code>method, we have access to the data the promise returns when resolved. This means, we can directly test the data returned by the promise. In this example, I have simply verified whether the data is defined or not, but, it can be anything.</p>
<p>This test method also uses jasmine’s asynchronous spec and <code>done()</code>callback is called inside the <code>then()</code> method after the assert statcodeent. This helps to complete the test as soon as our assert ran and it also time out the test if the <code>then()</code> is not defined or not called for some reason. </p>
<p>Isn’t this simple and effective?</p>
