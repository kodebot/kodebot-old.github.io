---
layout: post
title: "Exception Handling in NodeJS"
date: 2015-09-27 13:03:12 +0100
comments: true
categories: ["programming"]
tags: ["nodejs", "javascript"]
---
##Introduction
Exception handling in Node might look completely different for developers coming from C# background like myself.
It is mainly because of the way Node works. Node uses single thread based event loop to enable concurrency, this results in higher throughput with relatively low overhead.
When it comes to exception handling, having some understanding of the event loop will help you to do the right thing.

##Event Loop
Node has the following three main components to acheive concurrent, non-blocking execution  
	1. Event Demultiplexer  
	2. Event Loop  
	3. Event Queue  
	
To put it simply, any function/piece of code which depends on time consuming, non-cpu intensive I/O operation registers itself with Event Demultiplexer along with a handler.
Event demultiplexer deals with the underlying I/O operation and when the data is available to process, it adds the registered event to the Event Queue to make the data availble for further processing.
The Event Loop simply dequeue the event and runs its associated handler.

## Synchronous Block
Now, with the high level understanding of how Node's Event Loop works, we will look at how execption handling works in a synchronous block of code.

If you don't wrap your exception prone code in `try..catch` block then the exeception would simply reach event loop and your app will crash.
Any exception reaching event loop would simply result in application crash, it's that simple.
This means, if you want to provide nice user experiance you have to handle the exception properly.
For, synchronous block of code, this is as simple as wrapping your code in `try..catch` and do whatever you want to do in the catch block.

> Note: You should not let the exception bubble up using `throw` to avoid it reaching event loop and application crash.

{% codeblock lang:javascript %}
function divide(x, y){
	try{
		return x/y;
	}
	catch(e){
		console.log("Error::" + e.message);
		return 0;
	}
}
{% endcodeblock %}

In this, example the message is displayed in the console and value 0 is returned from the catch block.

## Asynchronous Block
Node is known for it callbacks. These callbacks are nothing but the handlers that are registered with Event Demultiplexer.
Because these handlers/callbacks are executed directly by event loop, we need to wrap anything and everything in the `try..catch` block to make sure the exception is not reaching the event loop.

{% codeblock lang:javascript %}
var fs = require('fs');
var path = 'C:\temp\tempFile.txt';

try{
	fs.stat(path, statCallback);	
}
catch(e){
	console.log("Error::" + e.message);
	return;
}
function statCallback(err, stats){
	try{
		return stats.isFile();
	}
	catch(e){
		console.log("Error::" + e.message);
		return false;
	}
}
{% endcodeblock %}

If you look at the example above, the we use two `try..catch` blocks one for the code around `fs.stat()` and another one is inside the callback function.
This is required because, as we saw earlier the callback is executed direcly by the event loop so any unhanlded execeptions in the callback will reach event loop.

This will be annoying when we have nested callbacks as we need to wrap each callback in its own `try..catch` block.

Node provides [domain](https://nodejs.org/api/domain.html) to make this process simple but it is deprecated at the moment in favour of better solution which is not available yet.

## Unhandled Exceptions
When event loop encounters any unhandled exceptions, it emits `uncaughtException`. We can use this to log the error before let the application crash.

{% codeblock lang:javascript %}
process.on('uncaughtException', function(err){
	console.log(err);
});
{% endcodeblock %}

You can find lot more information on this topic [here](http://www.joyent.com/developers/node/design/errors), including event emiters - which is not covered in this post, in the official documentation.
  