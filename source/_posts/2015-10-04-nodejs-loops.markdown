---
layout: post
title: "NodeJs: Loops, Closure and Async Invocation"
date: 2015-10-04 18:36:03 +0100
comments: true
categories: ["programming"]
tags: ["nodejs", "javascript"]
---

## Closure
Closure is something that is very familier to all C# developers who know lambda expressions/functions but they just may not know that it is called Closure in JavaScript.  
Lets look at what is closure in JavaScript without further ado with an example:

{% codeblock lang:javascript %}
function outter(){
	var inOutter = "outter";
	inner();
	
	function inner(){
		console.log(inOutter); // prints 'outter'
	}
}
{% endcodeblock %}

In this example, the variable `inOutter` is defined in the function `outter` but it is used in the function `inner`. This is possible because, the a function in JavaScript can access all the varibales in the scope where the function is defined and this is called Closure.

## Loop and Closure
Lets consider the following example:

{% codeblock lang:javascript %}
function outter(){
	for(var i=1; i<=5; i++){
		inner();
	}
	
	function inner(){
		console.log(i); // prints 1, 2, 3, 4, 5
	}
}
{% endcodeblock %}

Here the function `inner` is called from a loop and iterator varibale is printed from inside the function `inner`. It prints, as you guessed, `1, 2, 3, 4, 5`.
This is because the function `inner` get the value of `i` whatever it is when the function `inner` is invoked.

## Loop, Closure and async invocation
Lets look at what happens if we invoke the function `inner` asynchronously

{% codeblock lang:javascript %}
function outter(){
	for(var i=1; i<=5; i++){
		process.nextTick(inner); // We can use setImmediate or setTimout in browser environment to get similar effect
	}
	
	function inner(){
		console.log(i); // prints 6, 6, 6, 6, 6
	}
}
{% endcodeblock %}

You may not expect it to print `6, 6, 6, 6, 6` but that's what it does. This is because the loop runs to completion in the current tick and the function `inner` is only invoked in some tick down the line.
So, the value of `i` will be `6` when function `inner` is executed and it prints `6`.

Now, what do you do if you want to print `1, 2, 3, 4, 5`  instead of `6, 6, 6, 6, 6`?  
Well, it turns out, you can do this simply by creating new function to create a new variable scope. This is because, in JavaScript variables are scoped to function instead of block.

>Note: Starting ES2015, you can use `let` instead of `var` to create block scope.

Here is the revised code:

{% codeblock lang:javascript %}
function outter(){
	for(var i=1; i<=5; i++){
		process.nextTick((function(){
			var j = i;
			return inner;		
	
			function inner(){
				console.log(j); // prints 1, 2, 3, 4, 5
			}
		})());
	}
}
{% endcodeblock %}

We have created a new scope and assined value of `i` to `j` which is defined in the new scope. We have also moved the function `inner` to the new scope.  
That's it, now it prints what we want it to print.
 