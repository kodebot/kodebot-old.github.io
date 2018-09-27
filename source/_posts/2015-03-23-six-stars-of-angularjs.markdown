---
layout: post
title: "Six stars of AngularJS - Part 1"
date: 2015-03-23 18:59:00 +0000
comments: true
published: true
categories: ["programming"]
tags: ["angularjs", "javascript"]
---

<h2>Introduction</h2>
<p>Services are one of the core buiding blocks of AngularJS. It helps us to create reusable code that can be shared accross the application(s).</p><!-- more -->
<p>AngularJS gives us five different options to create services. We will look at what are those five options and how and when they can be used. But, before that lets take a brief look at couple of built-in angular services and how they works in the context of dependency injection.</p>
<ol>
<li><a href="https://docs.angularjs.org/api/auto/service/$injector" target="_blank">$injector</a> - This is a special service which creates and injects any injectable dependencies.</li>
<li><a href="https://docs.angularjs.org/api/auto/service/$provide" target="_blank">$provide</a>&nbsp;- This is another special service which tells $injector that a particular service is injectable and&nbsp;shares&nbsp;information to create new instance when required</li>
</ol>
<p>So, $provide is our gateway to introduce any services into our angular application. This is how it works at a very high level</p>
<ol>
<li>We will tell $provide that this is a new service that I would like to use in my application</li>
<li>$provide will register it with $injector</li>
<li>$injector will create a new instance and inject it when requested</li>
</ol>
<h2>Provider</h2>
<p>As described in AngularJS API documentation, $provide takes service provider which wraps service factory and service factory wraps the service.</p>
<p>To create service provider and register it with $injector, we use provider function of $provide service. Here is an example of simple service provider created using provider function</p>
{% codeblock lang:js %}// provider sample 1
       $provide.provider('movieService', movieServiceProvider);

            // provider
            function movieServiceProvider() {
            var self = this;
            this.$get = movieService; // factory
            this.isFrench = false;
        
            function movieService() {
                return { // service
                    getAllMovies: getAllMovies
                };

                function getAllMovies() {

                    if (self.isFrench) {
                        return ['frenchMovie1', 'frenchMovie2', 'frenchMovie3'];
                    } else {
                        return ['engMovie1', 'engMovie2', 'engMovie3'];
                    }
                }

            }
        }
{% endcodeblock %}
<p>The first parameter is name of the service we want to create (note: this is name of the service, not the name of the service provider, angular will automatically append 'Provider' at the end of the name you specify here and create provider name. So, the provider name created for movieService will be&nbsp;movieServiceProvider) and the second parameter is service provider itself.</p>
<p>The service provider function must have $get member which should be or hold reference to service factory. The service provider&nbsp;can have any number of other member. We will generally create additional members to configure the service before creating them.</p>
<p>In the example above, we have movieService function which is assigned to $get member. The movieService is a service factory and when invoked, it returns an object with all the functions we expose from the movieService. When injector needs to create an instance of the service, it will simply invoke $get.</p>
<p>The movieServiceProvider also has a member isFrench. This can be used to configure how service is created or how it behaves. In this case, the behaviour of the service is modified to return french movies or english movies.&nbsp;</p>
<p>The configuration of providers can only be done during configuration phase of a module where the provider is defined.</p>
<p>Let's take a quick detour and understand what we mean by 'configuration phase of a module' to understand providers throughly.</p>
<p>When a module is defined, we can setup zero or more configuration blocks and run blocks. When a module is created by angular, it will execute all the configuration blocks in the order they were defined first and then it will run all the run blocks in the order they were defined.</p>
<p>The service provider is configured in the configuration phase by defining it as one of the step in module's config function.</p>
<p>Here is an example of how movieServiceProvider is configured as part of module's configuration phase&nbsp;</p>
{% codeblock lang:js %}// provider sample 2
    var app = angular.module('app', []);

    app.config(function($provide) {

        // creates and register's provider
        var movieServiceProviderInstance = $provide.provider('movieService',  movieServiceProvider);

        // configures provider
        movieServiceProviderInstance.isFrench = true;

        function movieServiceProvider() {
            var self = this;
            this.$get = movieService;
            this.isFrench = false;

            function movieService() {
                return {
                    getAllMovies: getAllMovies
                };

                function getAllMovies() {

                    if (self.isFrench) {
                        return ['frenchMovie1', 'frenchMovie2', 'frenchMovie3'];
                    } else {
                        return ['engMovie1', 'engMovie2', 'engMovie3'];
                    }
                }

            }
        }

    });{% endcodeblock %}
<p>Usually, if you want to do anything&nbsp;when the module is create, you will keep them in module's run function.&nbsp;</p>
<p>One of the important thing to note here is, the $provide service can be injected only into the config function of a module and the same is true for providers as well.</p>
<p>This means, services or in this case service providers can be created only in the config phase of a module and the code to create them should be kept inside the config method. It is not really convenient mainly when we want to keep the services in their own files. Angular rescues us from this situation by exposing the methods we use to create services as a member of module as well.</p>
<p>So, you can use provider function of $provide from an instance of a module. For example, the following is same as the first sample</p>
{% codeblock lang:js %}// Sample 3
    var app = angular.module('app');
    app.provider('movieService', movieServiceProvider);

    function movieServiceProvider() {
        var self = this;
        this.$get = movieService;
        this.isFrench = false;

        function movieService() {
            return {
                getAllMovies: getAllMovies
            };

            function getAllMovies() {

                if (self.isFrench) {
                    return ['frenchMovie1', 'frenchMovie2', 'frenchMovie3'];
                } else {
                    return ['engMovie1', 'engMovie2', 'engMovie3'];
                }
            }

        }
    }{% endcodeblock %}
<h2>When to use?</h2>
<p>As you would have understood by now, providers are the lowest level function available to create services. It gives you options to configure the services during its creation. It is recommended to use this function only when you need to create configurable services. You are better off with other functions&nbsp;available to create services if you don't want them to be configurable.</p>
<p>We will look at other options to create services in <a href="/2015/03/24/six-stars-of-angularjs-part-2" target="_blank">part 2</a>&nbsp;of this post.</p>
