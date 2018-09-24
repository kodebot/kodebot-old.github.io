---
layout: post
title: "ASP.NET MVC 5 Hosting for Integration / E2E Testing"
date: 2015-05-30 10:55:00 +0100
comments: true
published: true
categories: ["programming"]
tags: ["asp.net", "mvc5"]
alias: ["/blog/post/ASPNET-MVC-5-Hosting-for-Integration-E2E-Testing", "/blog/post/aspnet-mvc-5-hosting-for-integration-e2e-testing"]
---

<h4>Introduction</h4>
<p>When we want to do proper Integration or End to End testing of Web API, we can choose any process as host for Web API 2 or higher. This is possible because Web API supports Owin/Katana, which means, <!-- more -->it doesn&rsquo;t have any direct dependency on IIS. On the other hand MVC 5 doesn&rsquo;t have support for Owin/Katana due to the fact that ASP.NET pipeline is depending on IIS. So this leaves us with only one option to host MVC 5, which is IIS, even for integration/e2e testing.</p>
<h4>How do we do it?</h4>
<p>When we do integration/e2e testing, for most scenarios we would want the application in clean state and at the same time we want our tests to run fast. For many reasons, the simplest option to achieve this is to use IIS Express rather than standard version.</p>
<p>We can write an utility class that will start the IIS Express with the the application we are testing for each test and close it at the end of the test. This many not be super fast but fast enough to use.</p>
<p>Here is the utility class I created to start and stop IIS Express:</p>
{% codeblock lang:csharp %}
public static class ApplicationUtilities
{
    private static Process _webHostProcess;
    private const string WEB_APP_NAME = "BookShop.Web";
    private const int WEB_APP_PORT = 12345;

    public static void StartApplication()
    {
        var webHostStartInfo = GetProcessStartInfo();
        _webHostProcess = Process.Start(webHostStartInfo);
        _webHostProcess.TieLifecycleToParentProcess();
    }

    public static void StopApplication()
    {
        if (_webHostProcess == null)
            return;
        if (!_webHostProcess.HasExited)
            _webHostProcess.Kill();
        _webHostProcess.Dispose();
    }

    public static string ApplicationBaseUrl
    {
        get { return string.Format("http://localhost:{0}", WEB_APP_PORT); }
    }

    public static string GetFullUrl(string relativePath)
    {
        return string.Format("{0}{1}", ApplicationUtilities.ApplicationBaseUrl, relativePath);
    }

    private static string GetSolutionFolderPath()
    {
        var directory = new DirectoryInfo(Environment.CurrentDirectory);

        while (directory.GetFiles("*.sln").Length == 0)
        {
            directory = directory.Parent;
        }
        return directory.FullName;
    }

    private static ProcessStartInfo GetProcessStartInfo()
    {
        var key = Environment.Is64BitOperatingSystem ? "programfiles(x86)" : "programfiles";
        var programfiles = Environment.GetEnvironmentVariable(key);

        var startInfo = new ProcessStartInfo
        {
            WindowStyle = ProcessWindowStyle.Normal,
            ErrorDialog = true,
            LoadUserProfile = true,
            CreateNoWindow = false,
            UseShellExecute = false,
            Arguments = String.Format("/path:\"{0}\" /port:{1}", Path.Combine(GetSolutionFolderPath(), @"src\" + WEB_APP_NAME), WEB_APP_PORT),
            FileName = string.Format("{0}\\IIS Express\\iisexpress.exe", programfiles)
        };

        // Add any environment variables
        // startInfo.EnvironmentVariables.Add(key, value);

        return startInfo;
    }
}
{% endcodeblock %}
<p>This code is self explanatory so, I am not going to try to explain this. One thing to note though is, it uses third party package(<a href="https://github.com/Holf/AllForOne">AllForOne</a>) to kill child processes when parent is not running anymore.</p>

