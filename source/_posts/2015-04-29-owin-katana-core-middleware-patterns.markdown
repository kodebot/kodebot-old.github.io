---
layout: post
title: "Owin - Katana core middleware patterns"
date: 2015-04-29 21:14:00 +0100
comments: true
published: true
categories: ["programming"]
tags: ["owin", "katana", "asp.net", "mvc5"]
---

<h3>Introduction</h3>
<p>Katana supports 4 different convention based patterns for adding middlewares in its lowest level. They are,</p>
<ol>
<li>Delegate Pattern</li>
<li>Instance Pattern</li>
<li>Generator/Nested Delegate Pattern</li>
<li>Constructor Type or Type Pattern</li>
</ol><!-- more -->
<p>All the other formats/patterns supported through IAppBuilder's extension methods are implemented using one of these 4 patterns under the hood.</p>
<p>I couldn't find any examples in the web which show how to use these patterns, so I am creating it for my future reference.</p>
<h3>Delegate Pattern</h3>
<p>Delegate pattern accepts the following delegate as a first parameter for the Use method of IAppBuilder and any number of additional parameter of any type</p>
 {% codeblock lang:csharp %}// Delegate Pattern
Func<AppFunc, AppFunc>{% endcodeblock %}
<p>where AppFunc is </p> {% codeblock lang:csharp %}Func<IDictionary<string, object>, Task>>{% endcodeblock %}
<p>The delegate takes AppFunc as parameter and returns AppFunc. The parameter represents the next middleware in the pipeline and return value represents the implementaion of the middleware we are adding. </p>
 {% codeblock lang:csharp %}// Delegate Pattern Implementation
public void Configuration(IAppBuilder builder)
{
    builder.Use(new Func<AppFunc, AppFunc>(next => async env =>
    {
        Console.WriteLine("From Delegate Middleware - Start");
        await next(env);
        Console.WriteLine("From Delegate Middleware - End");

    }));
}{% endcodeblock %}
<p>In the example above, the middleware we are adding prints something in the console, calls next middleware in the pipeline and once it is complete, it continues by executing rest of the code in the middleware we are adding.</p>
<p>The following example shows the delegate pattern with additional parameters</p>
 {% codeblock lang:csharp %}// Delegate Pattern with additional parameters
public void Configuration(IAppBuilder builder)
{
   builder.Use(new Func<AppFunc, string, AppFunc>((next, param) => async (env) =>
    {
        Console.WriteLine("From Delegate Middleware with param- Start");
        Console.WriteLine("Paramater value : {0}", param);
        await next(env);
        Console.WriteLine("From Delegate Middleware with param- End");

    }), "additional param");
}{% endcodeblock %}
<h3>Instance Pattern</h3>
<p>To use this pattern to add middlewares, we need newable types with the following two methods</p>
 {% codeblock lang:csharp %}// Instance Pattern method signatures
public void Initialize(AppFunc next, params object[] args);
public Task Invoke(IDictionary<string, object> environment);{% endcodeblock %}
<p>Here is an example of middleware created using instance pattern</p>
 {% codeblock lang:csharp %} // Instance Pattern with parameter
public void Configuration(IAppBuilder builder)
{
 	builder.Use(new InstanceMiddlewareWithParam(), "instance param value");
}

public class InstanceMiddlewareWithParam
{
    private AppFunc _next;
    private string _param;
    public void Initialize(AppFunc next, string param)
    {
        _next = next;
        _param = param;
    }

    public async Task Invoke(IDictionary<string, object> environment)
    {
        Console.WriteLine("From Instance Middleware with param - Start");
        Console.WriteLine("Parameter value: {0}", _param);
        await _next(environment);
        Console.WriteLine("From Instance Middleware with param - Start");
    }

}{% endcodeblock %}
<h3>Generator/Nested Delegate Pattern</h3>
<p>To use this pattern to create middlewares, we need a newable type with the following method</p>
 {% codeblock lang:csharp %}// Generator / Nested Delegate pattern
public AppFunc Invoke(AppFunc next, params object[] args);{% endcodeblock %}
<p>This method takes next middleware in the pipeline and any number of additional arguments and returns the implementation of current middleware. Here is an example</p>
 {% codeblock lang:csharp %}// Middleware using Generator / Nested Delegate pattern

public void Configuration(IAppBuilder builder)
{
 builder.Use(new GeneratorMiddlewareWithParam(), "generator param value");
}

public class InstanceMiddlewareWithParam
{
    private AppFunc _next;
    private string _param;
    public void Initialize(AppFunc next, string param)
    {
        _next = next;
        _param = param;
    }

    public async Task Invoke(IDictionary<string, object> environment)
    {
        Console.WriteLine("From Instance Middleware with param - Start");
        Console.WriteLine("Parameter value: {0}", _param);
        await _next(environment);
        Console.WriteLine("From Instance Middleware with param - Start");
    }

}{% endcodeblock %}
<h3>Constructor Type / Type Pattern</h3>
<p>A type with the following constructor and method can be added a middleware using this pattern</p>
 {% codeblock lang:csharp %}// Constructor Type / Type pattern
 public Ctor(AppFunc next, params object[] args);
 public Task Invoke(IDictionary<string, object> env);{% endcodeblock %}
<p>Here is an example</p>
 {% codeblock lang:csharp %}// Middleware using Constructor Type / Type pattern

public void Configuration(IAppBuilder builder)
{
     builder.Use(typeof(ConstructorTypeMiddlewareWithParam), "type param value");

}

public class ConstructorTypeMiddlewareWithParam
{
    private readonly AppFunc _next;
    private readonly string _param;

    public ConstructorTypeMiddlewareWithParam(AppFunc next, string param)
    {
        _next = next;
        _param = param;
    }

    public async Task Invoke(IDictionary<string, object> env)
    {

        Console.WriteLine("From Constructor Type Middleware - Start");
        Console.WriteLine("Parameter value: {0}", _param);
        await _next(env);
        Console.WriteLine("From Constructor Type Middleware - End");
    }
}{% endcodeblock %}

