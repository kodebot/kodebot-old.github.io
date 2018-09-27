---
layout: post
title: "TypeScript - Accessing object with null key"
date: 2015-06-03 19:14:00 +0100
comments: true
published: true
categories: ["programming"]
tags: ["typescript"]
---

<p>Objects in JavaScript is just a key value pair and key is usually string and value can be anything. The following is an example of JavaScript object literal</p><!-- more -->
{% codeblock lang:js %}
var car = {
    wheels : 3,
    colour: 'red',
    drive: function(){
    ...
    }
}
    
{% endcodeblock %}
<p>The key in the object can be null. The default route in AngularJS is associated with null key, for example.</p>
<p>We can access the value associated with the null key in JavaScript quite easily like this:</p>
{% codeblock lang:js %}
routes[null].redirectTo
{% endcodeblock %}
<p>If you do the same in TypeScript, you will get the following error</p>
{% codeblock %}
An index expression argument must be of type 'string', 'number', 'symbol, or 'any'.
{% endcodeblock %}
<p>So, how do we make it work? It turns out that rather than using null key word, you can use a variable which is null. The following code is valid in TypeScript.</p>
{% codeblock lang:js %}
var nullRef: any = null;
routes[nullRef].redirectTo
{% endcodeblock %}
<p>I spent long time to get it working so posting this here for future reference.</p>
