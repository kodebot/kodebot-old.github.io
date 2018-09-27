---
layout: post
title: "Decorator over Inheritance hierarchy"
date: 2015-03-15 20:20:00 +0000
comments: true
published: true
categories: ["programming"]
tags: ["design-pattern", "c#"]
---

<p>I have used inheritance to solve a problem in many situations - some of them are correct and some of them are not when thinking about it now.</p>
<div>
<p>When you are in a situation where you think you need multi-level inheritance, 9 out of 10 times you can solve the same problem using decorators.</p>
</div><!-- more -->
<div>
<p>One of the problems I have seen recently which fits in this pattern is the implementation of ICommand interface. See the implementation below</p>
{% codeblock lang:csharp %}
public class Command : ICommand  
   {  
     public bool CanExecute(object parameter)  
     {  
       // normal can execute version  
       return true;  
     }  

     public event EventHandler CanExecuteChanged;  

     public void Execute(object parameter)  
     {  
       // normal execute version  
     }  
   }  

   public class AuditedCommand:Command  
   {  
     public bool CanExecute(object parameter)  
     {  
       // audited can execute version  
       return base.CanExecute(parameter);  
     }  

     public void Execute(object parameter)  
     {  
       // audited execute version  
       base.Execute(parameter);  
     }  
   }  

   public class SecureCommand : Command  
   {  
     public bool CanExecute(object parameter)  
     {  
       // Secure can execute version  
       return base.CanExecute(parameter);  
     }  

     public void Execute(object parameter)  
     {  
       // Secure execute version  
       base.Execute(parameter);  
     }  
   }  
{% endcodeblock %}
<p>In this example, Command class is implementing ICommand interface and it provides basic version of the Command. Two other classes AuditedCommand and SecureCommand are inherited from Command to add some additional behaviours.</p>
<p>What do we do if we need a Command which supports Auditing and Security? There are two ways we can solve this problem using inheritance&nbsp;</p>
<ol>
<li>Use multi-level inheritance where SecureCommand inherits from AuditedCommand and AuditedCommand from Command</li>
<li>Create a new class SecureAuditedCommand which inherits from &nbsp;Command</li>
</ol>
<div>
<p>If we use the first approach we loose the flexibility to use just SecureCommand without going through AuditedCommand. Approach 2 is not really sustainable because we cannot create new classes for every combination of new command behaviours we might need in the future.</p>
</div>
<div>
<p>Another problem with approach 2 is it violates <a href="http://en.wikipedia.org/wiki/Single_responsibility_principle" target="_blank">SRP</a>.</p>
</div>
<div>
<p>So, what is the better way to solve this problem and keep our code maintainable.</p>
</div>
<div>
<p>The one word answer is "Decorator".</p>
</div>
<div>
<p>Here is how it looks like with Decorator pattern</p>
{% codeblock lang:csharp %}
public class Command : ICommand  
   {  
     public bool CanExecute(object parameter)  
     {  
       // normal can execute  
       return true;  
     }  

     public event EventHandler CanExecuteChanged;  

     public void Execute(object parameter)  
     {  
       // normal execute  
     }  
   }  

   public abstract class CommandDecorator : ICommand  
   {  
     private ICommand _command;  

     public CommandDecorator(ICommand command)  
     {  
       this._command = command;  
     }  

     public virtual bool CanExecute(object parameter)  
     {  
       return _command.CanExecute(parameter);  
     }  

    // should be a wrapper to the property in the base class
     public event EventHandler CanExecuteChanged; 

     public virtual void Execute(object parameter)  
     {  
       _command.Execute(parameter);  
     }  
   }  

   public class AuditedCommand:CommandDecorator  
   {  
     public AuditedCommand(ICommand command):base(command)  
     {  
     }  

     public override bool CanExecute(object parameter)  
     {  
       // Audit behaviour goes here  
       return base.CanExecute(parameter);  
     }  

     public override void Execute(object parameter)  
     {  
       // Audit behaviour goes here  
       base.Execute(parameter);  
     }  

   }  

   public class SecureCommand : CommandDecorator  
   {  
     public SecureCommand(ICommand command):base(command)  
     {  
     }  

     public override bool CanExecute(object parameter)  
     {  
       // Secure behaviour goes here  
       return base.CanExecute(parameter);  
     }  

     public override void Execute(object parameter)  
     {  
       // Secure behaviour goes here  
       base.Execute(parameter);  
     }  
   }  

       // Here is how you compose your commands
       ICommand auditedDecorator = new AuditedCommand(command);  
       ICommand secureDecorator = new SecureCommand(command);  
       ICommand auditedSecureDecorator = new SecureCommand(auditedDecorator); {% endcodeblock %}
<p>Now, we can compose any type of command without compromising maintainability.</p>
</div>
</div>
