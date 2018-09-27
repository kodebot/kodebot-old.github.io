---
layout: post
title: "Organize AngularJS Tests within a test file"
date: 2015-03-15 10:07:00 +0000
comments: true
published: true
categories: ["programming"]
tags: ["javascript", "unit-testing"]
---

<p>I like to have one test file&nbsp;per components of AngularJS application. So, for example, homeController will have its own test file&nbsp;named homeSpec or homeControllerSpec.</p>
<p>First, create a&nbsp;suite to describe a component at a high level and for each scenario create&nbsp;nested suits. This allows us&nbsp;to define any test setup that are common for <!-- more -->all the tests&nbsp;in one place.</p>
<p>For example, loading module, overriding and injecting any dependencies are done in the beforeEach method of outter test suite. The setup is applicable for all the tests defined in the outter and nested test suits, so, if you don't want any setup for all the tests then do not include them here.</p>
{% codeblock lang:js %}. 
    var $controller;
    var calculatorService;
    

    beforeEach(function () {

        // load module
        module('app');

        // overrides for mock injections
        module(function ($provide) {
            // override any dependency here
            // $provide.value('service', 'override'); 

        });
        
        // initialise
        inject(function(_$controller_, _calculatorService_) {
            $controller = _$controller_;
            calculatorService = _calculatorService_;
            
        });

    });{% endcodeblock %}
<p>&nbsp;</p>
<p>Next, add tests directly in the outter suite if they don't fall under any scenario. For example, test to&nbsp;verify whether the controller is created successfully or not is better kept in the outter suit directly</p>
{% codeblock lang:js %}.
    it('should initialise the controller successfully', function() {

        // act
        var result = $controller('homeController');

        // assert
        expect(result).toBeDefined();

    });{% endcodeblock %}
<p>Finally, create test suits for each scenario and keep all the tests applicable for that scenario within the corresponding suite. Again, this allows us to keep all the setup applicable for all the tests within the suite in one place.</p>
{% codeblock lang:js %}.
    describe('when add is performed', function() {
        
        it('should invoke add in calculatorService', function() {

            // arrange
            // replace original method with spy
            calculatorService.add = jasmine.createSpy('add');
            var target = $controller('homeController', { calculatorService: calculatorService });

            // act
            target.add(1, 2);

            // assert
            expect(calculatorService.add).toHaveBeenCalledWith(1, 2);

        });
{% endcodeblock %}
<p>When required, create suits within nested suits to keep your&nbsp;test file&nbsp;<a href="http://en.wikipedia.org/wiki/Don%27t_repeat_yourself" target="_blank">DRY</a>.&nbsp;</p>
<p>You may change this structure if required but most of the time sticking to this structure keeps your&nbsp;test files consistent.</p>
<p>Leave all the dependencies to be resolved and loaded without replacing them with mock version unless it is required (some people may have different view on this).&nbsp;</p>
<p>For example, if I just want to mock a method call then I will replace the method with jasmine spy rather then creating new mock object.&nbsp;</p>
{% codeblock lang:js %}.
    calculatorService.add = jasmine.createSpy('add');
    var target = $controller('homeController', { calculatorService: calculatorService });
{% endcodeblock %}
<p>But, if I need&nbsp;to replace an object with mock version then I create it and configure $provide to provide the mock version when requested</p>
{% codeblock lang:js %}.
       // overrides for mock injections
        module(function ($provide) {
            $provide.value('claculatorService', 'mockCalculatorService'); 

        });{% endcodeblock %}
<p>&nbsp;</p>
