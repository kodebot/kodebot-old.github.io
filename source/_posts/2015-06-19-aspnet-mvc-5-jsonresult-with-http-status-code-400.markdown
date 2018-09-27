---
layout: post
title: "ASP.NET MVC 5 - JsonResult with Http Status Code 400"
date: 2015-06-19 21:26:09 +0100
comments: true
published: true
categories: ["programming"]
tags: ["asp.net", "mvc5",]
---

ASP.NET Web API 2 introduced several helper methods like Ok, NotFound, BadRequest, etc… . This allows us to write code which makes its intentions clear.

In recent times, I have been working in semi-single page application which uses ASP.NET MVC 5 and AngularJS. The application is designed in a way that, there is only one view per feature and each view is SPA. So, each ASP.NET MVC controller have only one GET action that returns the view and rest of the communication is using actions that returns JsonResult that can be used by client in AJAX style just like consuming Web API.
With this design, I have to send JsonResult for everything, but, the Http Status Code has to be set appropriately so that the client can use them for any processing that it needs to do based on the Status Code.

First, I set the status code directly in Response in the action method and then returned JsonResult like this:
<!-- more -->
{% codeblock lang:csharp %}
Response.StatusCode = 400;
return Json(data);
{% endcodeblock %}

<p>Soon, I noticed doing this in too many places and I though this is obscure. To address this, I created a custom result type called <code>BadRequest</code> and moved this code into that class and I used the BadRequest class in my action methods. This made the code more intention revealing and DRY.</p>
<p>Here is the code for BadRequest ActionResult:</p>
{% codeblock lang:csharp %}
public class BadRequest : JsonResult
{
    public BadRequest()
    {
    }

    public BadRequest(string message)
    {
        this.Data = message;
    }

    public BadRequest(object data)
    {
        this.Data = data;
    }

    public override void ExecuteResult(ControllerContext context)
    {
        context.RequestContext.HttpContext.Response.StatusCode = 400;
        base.ExecuteResult(context);
    }

}
{% endcodeblock %}
<p>Here is how you use it:</p>
{% codeblock lang:csharp %}
[HttpPost]
public ActionResult Add(Author author, HttpPostedFileBase photoContent)
{
    if (author == null)
    {
        return new BadRequest("Invalid author details.");
    }

    .
    .
    .
}
{% endcodeblock %}
<p>You can create similar classes for all other type of results that you would want to send to client. </p>
<p>As always, please let me know if there is a better way for doing this.</p>
