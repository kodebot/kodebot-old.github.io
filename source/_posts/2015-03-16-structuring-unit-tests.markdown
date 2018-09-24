---
layout: post
title: "Structuring Unit Tests"
date: 2015-03-16 17:19:00 +0000
comments: true
published: true
categories: ["programming"]
tags: ["c#", "unit-testing"]
alias: ["/blog/post/structuring-unit-tests"]
---

<p>I have been following the same unit test structure that Phil Haack described <a href="http://haacked.com/archive/2012/01/02/structuring-unit-tests.aspx/" target="_blank">here</a>. &nbsp;But, I use slightly different version when my tests need too many repeated test setups and cleanups.&nbsp;</p><!-- more -->
<p>I like <a href="http://jasmine.github.io/" target="_blank">jasmine</a>&nbsp;mainly because it allows to keep the tests <a href="http://en.wikipedia.org/wiki/Don%27t_repeat_yourself" target="_blank">DRY</a>&nbsp;using nested structure. Ofcourse it is possible in jasmine because method nesting is allowed in JavaScript. I like to structure my C# test files the same way using nested classes&nbsp;without using any additional libraries</p>
<p>For example, consider the following System Under Test class</p>
{% codeblock lang:csharp %}.
    public class AddressValidator
    {
        public bool IsValid(IList<string> addressLines)
        {
            if (addressLines == null)
            {
                throw new ArgumentNullException("addressLines",
                                                "AddressLines cannot be null");
            }

            if (addressLines.ElementAtOrDefault(0) != null &amp;&amp; 
                addressLines.ElementAtOrDefault(4) != null)
            {
                return true;
            }

            if (addressLines.ElementAtOrDefault(0) != null &amp;&amp;
                addressLines.ElementAtOrDefault(1) != null &amp;&amp;
                addressLines.ElementAtOrDefault(2) != null)
            {
                return true;
            }

            return false;
        }

        public bool IsNonUkAddress(IEnumerable<string> addressLines)
        {
            // return true for UK address
            
            return false;
        }
        
    }{% endcodeblock %}
<p>The test class for this System Under Test looks like this</p>
{% codeblock lang:csharp %}.
    [TestClass]
    public class AddressVaidatorTests
    {

        private AddressValidator _target;

        [TestInitialize]
        public virtual void TestSetup()
        {
            _target = new AddressValidator();
            // other test setups that are common for all the tests in this file.
        }

        [TestClass]
        public class TheIsValidMethod : AddressVaidatorTests
        {

            [TestInitialize]
            public override void TestSetup()
            {
                base.TestSetup();
                // additional test setups applicable for the current method under test
            }

            [TestClass]
            public class WhenTheAddressIsNull : TheIsValidMethod
            {

                // add test initialiser here to setup anything that are 
                // applicable for the current scenario

                [TestMethod]
                [ExpectedException(typeof(ArgumentNullException))]
                public void ShouldThrowArgumentNullException()
                {
                    // arrange
                    List<string> inputAddress = null;

                    // act
                    _target.IsValid(inputAddress);

                    // assert
                    // expected exception - ArgumentNullException.

                }

                // add test cleanups here

            }

            [TestClass]
            public class WhenAddressLine1AndPostcodeArePresent : TheIsValidMethod
            {

                // add test initialiser here to setup anything that are 
                // applicable for the current scenario

                [TestMethod]
                public void ShouldReturnTrue()
                {
                    // arrange
                    var inputAddress = new List<string>()
                    {
                        "Address1", null, null, null, "Postcode"
                    };

                    // act
                    var actual = _target.IsValid(inputAddress);

                    // assert
                    Assert.IsTrue(actual);

                }

                // add test cleanups here

            }

            // add test cleanups here

        }

        [TestClass]
        public class TheIsUkAddressMethod : AddressValidator
        {
            // tests
        }

        [TestCleanup]
        public virtual void TestCleanup()
        {
            // any cleanups
        }

    }{% endcodeblock %}
<p>So, the first improvement is creating nested test classes for each scenario. This allows us&nbsp;to create test inputs applicable for the current scenario only once regarless of the number of tests defined in the scenario.&nbsp;</p>
<p>Next one is keeping TestSetup and TestCleanup virtual so that we can add additional setups/cleanups by chaining method calls using base keyword. This also allows us to completly replace the setup/cleanup if it is required for any special cases by overriding the methods without chaining.&nbsp;</p>
<p>One of the additional benefit of this structuring is that when you group tests by class in the Test Explorer, the tests are nicely arranged&nbsp;like this</p>
<p><img src="/files/2015/03/Capture1.PNG" alt="" /></p>
<p>&nbsp;</p>
