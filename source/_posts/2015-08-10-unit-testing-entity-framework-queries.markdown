---
layout: post
title: "Unit Testing Entity Framework Queries"
date: 2015-08-10 19:53:08 +0100
comments: true
categories: ["programming"]
tags: [unit-testing, entity-framework]
---
## Introduction
When writing unit tests, we should test only one thing at once and isolate the system under test(SUT) from all the dependencies. We should follow the same approach for any LINQ queries you write to retrieve data from the underlying Database. But, I have seen many developers excluding the whole data access layer from unit tesing. This is not right approach to follow IMHO. Many developers don't bother unit testing data access layer because of the perceived effort and complexity involved in isolating the data access layer from underlying Database and ORM tools like Entity Framework. The truth is, it is very easy to test your queries without touching Entity Framework or Database.

## DataContext, DbSet and Finder
Let's assume that we have Movies database with Movie table and we want to write some queries to get top 5 movies released in year 1999. The default DbContext for this database would look like this

{% codeblock lang:csharp %}
public class MoviesContext : DbContext
{
    public MoviesContext()
        : base("name=MoviesEntities")
    {
    }

    public virtual DbSet<Movie> Movies { get; set; }
}
{% endcodeblock %}

First, we need to make two changes to isolate this DbContext from unit testing
<ol>
	<li> Repalce DbSet with IDbSet </li>
	<li> Extract interface from MoviesContext and use the interface wherever you want to use the DbContext </li>
</ol>
[**Note:** You should not create instance of DbContext dierctly, instead use your faviroute DI Framework to inject it as dependency when requested.] 

Updated DbContext class and interface should look like this

{% codeblock lang:csharp%}
public class MoviesContext : DbContext, IMoviesContext
{
    public MoviesContext()
        : base("name=MoviesEntities")
    {
    }

    public virtual IDbSet<Movie> Movies { get; set; }
}

public interface IMoviesContext
{
    IDbSet<Movie> Movies { get; set; }
}

{% endcodeblock %}

Now, let's create a MovieFinder with a method `GetTopFiveMovies` to return top 5 movies for a given year as follows

{%codeblock lang:csharp %}
public class MovieFinder
{
    private readonly IMoviesContext _moviesContext;

    public MovieFinder(IMoviesContext moviesConext)
    {
        _moviesContext = moviesConext;
    }

    public IQueryable<Movie> GetTopFiveMovies(int year)
    {
        return _moviesContext.Movies
            .Where(movie => movie.Year == year)
            .OrderByDescending(movie => movie.Rating)
            .Take(5);
    }
}
{% endcodeblock %}

## Unit Testing
To write unit tests for `GetTopFiveMovies`, we need to mock `MoviesContext` to provide testable implementation for `Movies` properties. For this example, I am going to use Moq but you can use any mocking framework you like. The completed unit test method would look like this

{% codeblock lang:csharp %}
[TestClass]
public class MovieFinderTests
{
    [TestMethod]
    public void GetTopFiveMoviesShouldReturnTopFiveMoviesSuccessfully()
    {
        // Fixture Setup
        int year = 1999;
        // test movie list data
        var movieList = new List<Movie>
        {
            new Movie() {Id =1, Name="Test1", Rating =5, Year=1999 },
            new Movie() {Id =1, Name="Test1", Rating =5, Year=1999 },
            new Movie() {Id =1, Name="Test1", Rating =4, Year=1999 },
            new Movie() {Id =1, Name="Test1", Rating =1, Year=1999 },
            new Movie() {Id =1, Name="Test1", Rating =2, Year=1999 },
            new Movie() {Id =1, Name="Test1", Rating =4, Year=1999 },
            new Movie() {Id =1, Name="Test1", Rating =4, Year=1991 }
        };

        // mock DbSet
        var mockDbSetMovies = new Mock<IDbSet<Movie>>();
        mockDbSetMovies.Setup(mock => mock.Provider).Returns(movieList.AsQueryable().Provider);
        mockDbSetMovies.Setup(mock => mock.Expression).Returns(movieList.AsQueryable().Expression);
        mockDbSetMovies.Setup(mock => mock.ElementType).Returns(movieList.AsQueryable().ElementType);
        mockDbSetMovies.Setup(mock => mock.GetEnumerator()).Returns(movieList.GetEnumerator());

        // mock DbContext
        var mockMovieContext = new Mock<IMoviesContext>();
        mockMovieContext.Setup(mock => mock.Movies).Returns(mockDbSetMovies.Object);

        var sut = new MovieFinder(mockMovieContext.Object);

        // Exercise System
        var result = sut.GetTopFiveMovies(year);

        // Verify Outcome
        Assert.AreEqual(5, result.Count());
        Assert.IsTrue(result.All(item => item.Year == year));
        // Fixture Teardown
    }

}
{% endcodeblock %}

First, we are creating test movie data and then a mock `DbSet<Movie>` is created. The value of properties used by LINQ to support querying (`Provider`, `Expression`, `ElementType`) are replaced by the values from test data list `movieList`.
Then, enumerator of DbSet is assigned to the enumerator of test data list `movieList`. Finally, the mock `DbContext` returns the mock `DbSet<Movie>` when Movie property is accessed.

With this setup, we are providing in-memory test data to execute our query without touching EF or database.