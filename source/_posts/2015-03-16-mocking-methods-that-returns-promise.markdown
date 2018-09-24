---
layout: post
title: "Mocking functions returning promise"
date: 2015-03-16 19:46:00 +0000
comments: true
published: true
categories: ["programming"]
tags: ["javascript", "unit-testing"]
alias: ["/blog/post/mocking-methods-that-returns-promise"]
---

<p>Promises are very useful to develope non-blocking web applications and it also helps to avoid <a href="http://calculist.org/blog/2011/12/14/why-coroutines-wont-work-on-the-web/" target="_blank">pyramid of doom</a>.</p>
<p>AngularJS supports&nbsp;<a href="https://github.com/kriskowal/q" target="_blank">Q</a>&nbsp;based promises, this means, we can create functions in AngularJS application that uses promises. When it comes to unit testing functions that returns promises, it is just like unit testing normal functions <!-- more -->only if you remember&nbsp;simulate scope's life cycle using $apply() or $digest()</p>
<p>Let's see this with an example. The following controller loads restaurants using promise</p>
{% codeblock lang:js %}// homeController
(function () {
    'use strict';

    angular
        .module('app')
        .controller('homeController', ['restaurantService', homeController]);

    function homeController(restaurantService) {

        // #region viewmodel
        var vm = this;
        vm.restaurants = [];

        // #endregion

        // #region activate
        activate();

        function activate() {
            getRestaurants();
        }
        // #endregion

        // #region internal methods

        function getRestaurants() {
            restaurantService.getRestaurants()
                .then(function (data) {
                    vm.restaurants = data;
                })
                .catch(function (error) {
                    // error
                });
        }

        // #endregion
    }

})();{% endcodeblock %}
<p>The unit testing for this method would look like this</p>
{% codeblock lang:js %}// unit test
describe('home page', function () {

    var $controller;
    var $q;
    var restaurantService;

    beforeEach(function () {

        // load module
        module('app');

        // overrides for mock injections
        module(function ($provide) {
            // override any dependency here
            // $provide.value('service', 'override'); 

        });

        // initialise
        inject(function (_$controller_, _$q_, _restaurantService_) {
            $controller = _$controller_;
            $q = _$q_;
            restaurantService = _restaurantService_;
        });
    });

    describe('when home controller is initiated', function () {

        it('should load restaurants', function () {

            restaurantService.getRestaurants = function() { return $q.when(['rest1', 'rest2']); }
            var target = $controller('homeController', { restaurantService: restaurantService });

            expect(target.restaurants).toEqual(['rest1', 'rest2']);
        });

    });
});{% endcodeblock %}
<p>When you run this unit test, it returns error stating that [] is not equal to ['rest1', 'rest2']. This is because callback functions are processed as part of $evalAsync in $digest loop. Unit tests are not in Angular's execution context to run $digest loop automatically so it needs some help to process the callbacks. All we need to do to make it work is to invoke $digest method on controller's scope or any of its parent.</p>
<p>Here is the updated example,</p>
{% codeblock lang:js %}// unit test
describe('home page', function () {

    var $controller;
    var $q;
    var $rootScope;
    var restaurantService;

    beforeEach(function () {

        // load module
        module('app');

        // overrides for mock injections
        module(function ($provide) {
            // override any dependency here
            // $provide.value('service', 'override'); 

        });

        // initialise
        inject(function (_$controller_, _$q_, _$rootScope_, _restaurantService_) {
            $controller = _$controller_;
            $q = _$q_;
            $rootScope = _$rootScope_;
            restaurantService = _restaurantService_;
        });
    });

    describe('when home controller is initiated', function () {

        it('should load restaurants', function () {

            restaurantService.getRestaurants = function() { return $q.when(['rest1', 'rest2']); }
            var target = $controller('homeController', { restaurantService: restaurantService });
            $rootScope.$digest();

            expect(target.restaurants).toEqual(['rest1', 'rest2']);
        });

    });
 });{% endcodeblock %}
<p>You can find more information on how $digest loop works&nbsp;<a href="https://docs.angularjs.org/guide/scope#integration-with-the-browser-event-loop" target="_blank">here</a>.</p>
