---
layout: post
title: "Selenium and Page Objects"
date: 2015-04-06 14:12:00 +0100
comments: true
published: true
categories: ["programming"]
tags: ["e2e-testing", "selenium", "c#"]
---

<p>I use&nbsp;<a href="http://docs.seleniumhq.org/" target="_blank">Selenium</a>&nbsp;or <a href="http://angular.github.io/protractor/#/" target="_blank">Protractor</a>&nbsp;for E2E tests that require browser automation. I prefer to use Selenium when I want to write my tests in C# and Protractor for AngularJS applications.</p><!-- more -->
<p>It doesn't matter what tool/framework you use, if you want to bring in structure and make your test code reusable when dealing with any UI automation then Page Object is your friend.</p>
<p>I have been creating my Page Objects incorrectly with two major flaws until I read <a href="http://martinfowler.com/bliki/PageObject.html" target="_blank">this</a>&nbsp;great article from Martin Fowler. The flaws in my Page Objects were</p>
<ol>
<li>Only one Page Object Type per page or screen</li>
<li>Expose tool specific objects</li>
</ol>
<p>When only one page object is created for the entire page or screen that you are trying to automate then, the&nbsp;object will have too many things to do and if the the page or screen has shared sections then all your page objects will have duplicate code.</p>
<p>Likewise, if the&nbsp;page object exposes any objects from underlying tools/framworks then you will create hard dependencies between you test code and test tools/framework which will create challenges when you want to replace your tool/framework with other or when you want to upgrame from one version to another.&nbsp;</p>
<p>Here is the sample Page Objects I created to search and get the results from&nbsp;Bing using Selenium</p>
{% codeblock lang:csharp %}// Search Page
 public class BingSearch
    {
        private IWebElement _searchTerm;
        private List<BingSearchResult> _searchResults;

        public BingSearch()
        {
            Browser.GoTo("http://www.bing.com");
        }

        public string SearchTerm
        {
            get
            {
                return _searchTerm.Text;
            }
            set
            {
                _searchTerm = _searchTerm ?? Browser.WebDriver.FindElement(By.Name("q"));
                _searchTerm.SendKeys(value);
            }
        }

        public void Search()
        {
            if (_searchTerm != null)
            {
                if (_searchResults != null)
                {
                    _searchResults.Clear();
                }

                _searchTerm.Submit();
            }
        }

        public List<BingSearchResult> SearchResults
        {
            get
            {
                _searchResults = _searchResults ?? new List<BingSearchResult>();

                if (!_searchResults.Any())
                {
                    var elements = Browser.WebDriver.FindElements(By.CssSelector(".b_algo a"));

                    foreach (var element in elements)
                    {
                        _searchResults.Add(new BingSearchResult()
                        {
                            DisplayText = element.Text,
                            Link = element.GetAttribute("href")

                        });
                    }
                }

                return _searchResults;
            }

        }
    }{% endcodeblock %}
<p>&nbsp;</p>
{% codeblock lang:csharp %}// Search Result

  public class BingSearchResult
    {
        public string DisplayText { get; set; }
        public string Link { get; set; }
    }{% endcodeblock %}
<p>&nbsp;</p>
{% codeblock lang:csharp %}// Browser abstraction 
public static class Browser
    {
        private static IWebDriver _driver;
        static Browser()
        {
            _driver = new FirefoxDriver();
            _driver.Manage().Timeouts().ImplicitlyWait(TimeSpan.FromSeconds(10));
        }
        public static void GoTo(string url)
        {
            _driver.Navigate().GoToUrl(url);
        }

        public static IWebDriver WebDriver { get { return _driver; } }

        public static void Close()
        {
            _driver.Close();
        }
    }{% endcodeblock %}
<p>If you look at the BingSearch class it doesn't expose any Selenium objects but it has a list for SearchResults which uses BingSearchResult as its generic type. &nbsp;The BingSearchResult represents only one result in the page. Because I don't want to page through the search result I didn't bother creating any type to support it.</p>
<p>Browser is represented using static class in this sample but it doesn't have to be static class.</p>
