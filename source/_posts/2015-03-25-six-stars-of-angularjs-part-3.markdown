---
layout: post
title: "Six stars of AngularJS - Part 3"
date: 2015-03-25 19:25:00 +0000
comments: true
published: true
categories: ["programming"]
tags: ["angularjs", "javascript"]
alias: ["/blog/post/six-stars-of-angularjs-part-3"]
---

<p>In part <a href="/blog/2015/03/23/post/six-stars-of-angularjs" target="_blank">1</a>&nbsp;and <a href="/blog/2015/03/24/six-stars-of-angularjs-part-2" target="_blank">2</a>&nbsp;of this series, we have seen five different ways to create a service in angular.</p><!-- more -->
<p>The last one we are going to look at in this series is 'decorate' function of $provide service.</p>
<h2>Decorator</h2>
<p>The decorate function is NOT used to create a service, instead, this is used to decorate or replace an existing service. Let's look at this function with an example</p>
{% codeblock lang:js %}// sample 1
app.factory('movieService', movieService);

    function movieService() {
        return {
            getAllMovies: getAllMovies
        }

        function getAllMovies() {
            return ['engMovie1', 'engMovie2', 'engMovie3'];
        }
    }  {% endcodeblock %}
<p>In this example, we have movieService which exposes a function to get all the movies. Now, Let's create a decorator for this service to change the behaviour of getAllMovies to return only the first 2 items.</p>
<p>The following is a decorator created for movieService</p>
{% codeblock lang:js %}// sample 2
 app.config(function($provide) {
        $provide.decorator('movieService', movieServiceDecorator);

        function movieServiceDecorator($delegate) {
            var originalGetAllMovies = $delegate.getAllMovies;
            
            $delegate.getAllMovies = function() {
                var result = originalGetAllMovies();
                return result.slice(0,2);
            }

            return $delegate;

        }
    });{% endcodeblock %}
<p>Note: decorate function is not available to invoke from module.</p>
<p>The first parameter of the decorate function is the name of the service we want to decorate with and second parameter is the decorator function.</p>
<p>The decorator is invoked using $injector so, we can annotate dependencies as we do with any other services. The $delegate is one of the special dependencies we can use with decorator. It provides the original instance of a service so that we can decorate or replace it in whole or parts of it.</p>
<p>If you look at the code, all we have done is replaced getAllMovies with a new function and the new function makes use of the original function to get full result and slices it with two results. Finally, we are returning the modified service.</p>
<p>Under the hood, when $injector creates an instance of a service, it calls any decorators in the order they were defined and stores the decorated instance in the instance cache.</p>
<p>We can use decorator to override any service which is not in our control.</p>
