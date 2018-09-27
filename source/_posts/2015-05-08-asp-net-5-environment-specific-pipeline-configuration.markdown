---
layout: post
title: "ASP.NET 5 - Environment specific pipeline configuration"
date: 2015-05-08 22:18:00 +0100
comments: true
published: true
categories: ["programming"]
tags: ["asp.net", "mvc5"]
---

<h4>Introduction</h4>
<p>In ASP.NET 5, we configure and add middlewares (aka pipelines) using Startup class. The convention is similar to Owin/Katana but not the same.</p>
<p>The Configuration method in Owin/Katana Startup class is replaced by Configure method and the parameter type is IApplicationBuilder rather than IAppBuilder and how we create and add&nbsp;middleware is also different to some extend.&nbsp;</p><!-- more -->
<p>ASP.NET 5 Startup class allows us to add and configure services using ConfigureService method, this is not available in Owin/Katana Startup class. The sevices we add using this method is added to the DependencyInjection container which comes with ASP.NET 5 out of the box.</p>
<h4>Environment awareness</h4>
<p>The Startup class can access the hosting environment details using IHostingEnvironment.&nbsp;When we specify IHostingEnvironment as a dependency by making it as a parameter in Startup constructor, ConfigureServices or Configure method, the dnx will populate it for us and DependencyInjection framework will inject the instance.</p>
<p>The injected instance has EnvironmentName property, the value of this property is set from an environment variable ASPNET_ENV. If this variable is not found then the value is set as Development.</p>
<p>The instance also has a handy method IsEnvironment to find out whether the code is running on a specific environment or not. We can use this to do things differently based on the environment where the code is running. For example, we can read different config files as shown below</p>
{% codeblock lang:csharp %}

    // Example
    public class Startup
    {
        private readonly IHostingEnvironment _env;

        public Startup(IHostingEnvironment env)
        {
            _env = env;
        }

        public void ConfigureServices(IServiceCollection services)
        {
            if (_env.IsEnvironment("Production"))
            {
                // read prod config
            }
            else
            {
                // read dev config
            }
        }

    .
    .
    .

   }
{% endcodeblock %}
<p>If we want to add/configure middlewares differently based on the environment then we can use IsEnvironment method just like how it is used in ConfigureServices method or we can use environment specific Configure methods.&nbsp;</p>
<p>The environment specific Configure method only support Development, Staging and Production environment names and the method names have to be ConfigureDevelopment, ConfigureStaging and ConfigureProduction respectively for this to work. Here is an example of how we can use this,</p>
{% codeblock lang:csharp %}

// Full example
    public class Startup
    {
        private readonly IHostingEnvironment _env;

        public Startup(IHostingEnvironment env)
        {
            _env = env;
        }

        public void ConfigureServices(IServiceCollection services)
        {
            if (_env.IsEnvironment("Production"))
            {
                // read prod config
            }
            else if (_env.IsEnvironment("Staging"))
            {
                // read staging config
            }
            else
            {
                // read dev config
            }
        }

        public void ConfigureDevelopment(IApplicationBuilder builder, IHostingEnvironment env)
        {
            // Development configuration
            Configure(builder);
        }

        public void ConfigureStaging(IApplicationBuilder builder)
        {
            // Staging configuration
            Configure(builder);
        }

        public void ConfigureProduction(IApplicationBuilder builder)
        {
            // Production configuration
            Configure(builder);
        }

        public void Configure(IApplicationBuilder builder)
        {
            // Common
        }
    }
    {% endcodeblock %}
<p>This allows us to keep environment specific configurations/pipelines in a better&nbsp;way.&nbsp;</p>
