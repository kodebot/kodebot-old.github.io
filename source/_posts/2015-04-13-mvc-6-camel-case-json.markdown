---
layout: post
title: "MVC 6 Camel Case JSON"
date: 2015-04-13 21:21:00 +0100
comments: true
published: true
categories: ["programming"]
tags: ["asp.net", "mvc6"]
alias: ["/blog/post/mvc-6-camel-case-json"]
---

<p>I am excited with all the new features that are coming with MVC 6. One of the main differences between MVC 6 and previous versions is that it doesn't have two different libraries and controllers for MVC and Web <!-- more -->API.&nbsp;</p>
<p>The previous versions of Asp.Net MVC uses <a href="https://msdn.microsoft.com/en-us/library/system.web.script.serialization.javascriptserializer(v=vs.110).aspx" target="_blank">JavaScriptSerializer</a>&nbsp;for MVC controllers and <a href="http://www.newtonsoft.com/json" target="_blank">JSON.NET</a>&nbsp;for Web API controllers.</p>
<p>This means, if you have an application which uses both MVC controllers and Web API controllers then you need to apply any custom JSON serialization configurations twice or you&nbsp;should&nbsp;replace JavaScriptSerializer with JSON.NET.</p>
<p>Asp.Net MVC 6 uses <a href="http://www.newtonsoft.com/json" target="_blank">JSON.NET</a>&nbsp;by default for JSON serialization and because it doesn't use two different controller base classes for MVC and Web API, we apply any custom JSON&nbsp;settings once that will be used by MVC and Web API.</p>
<p>We can apply these settings in ConfigureServices method when adding MVC service in the&nbsp;Startup class.</p>
<p>Here is an example how we can change JSON output formatter to use camel case</p>
{% codeblock lang:csharp %}// Sample
 public class Startup
    {
        public void ConfigureServices(IServiceCollection services)
        {
			services.AddMvc()
					.Configure<MvcOptions>(options => {

						var jsonOutputFormatter = new JsonOutputFormatter();
						jsonOutputFormatter.SerializerSettings.ContractResolver =
							new CamelCasePropertyNamesContractResolver();
						options.OutputFormatters.Insert(0, jsonOutputFormatter);
					});
        }

        public void Configure(IApplicationBuilder app)
        {
			app.UseMvc();
				
        }
    }{% endcodeblock %}
<p>In this example, I simply created JsonOutputFormatter with custom settings and added it as a first item in the output formatters list.</p>
<p>You can also achieve the same result&nbsp;by any of the following approaches</p>
<ol>
<li>replace all&nbsp;existing JSON formatter with new custom formatter</li>
<li>update existing JSON formatter with custom settings</li>
</ol>
<p>&nbsp;I am just using the easiest approach in this case.</p>
