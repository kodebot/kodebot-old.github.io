---
layout: post
title: "Unit Testing Entity Framework async Queries"
date: 2015-08-13 18:53:24 +0100
comments: true
categories: ["programming"]
tags: [unit-testing, entity-framework]
---

## Introduction
In my [last article](/2015/08/10/unit-testing-entity-framework-queries/), we have seen how to unit test Entity Framework queries. Now, let's look at how to unit test asyn queries.
When using async tasks, if we don't use it all the way then we are not using async tasks properly. For example, if you have async action method in your controller which queries database synchronously to send some data to the requester, then we are NOT using async properly as the thread is blocked during database operation. So, to take full advantage of async tasks, we have to use async tasks all the way wherever it is applicable. Fortunately, we get async query support starting from [Entity Framework 6](https://msdn.microsoft.com/en-us/data/jj819165.aspx).

## Async Queries
Let's take the query we have written last time and convert it into async.

{% codeblock lang:csharp %}
public IQueryable<Movie> GetTopFiveMovies(int year)
{
    return _moviesContext.Movies
        .Where(movie => movie.Year == year)
        .OrderByDescending(movie => movie.Rating)
        .Take(5);
}
{% endcodeblock %}

The above method takes the top five movies for a given year synchronously. To change this to run asynchronously, we need to force the query execution using `ToListAsync()` extension method. The async version of the method would look like this

{% codeblock lang:csharp %}
public async Task<List<Movie>> GetTopFiveMovies(int year)
{
    return await _moviesContext.Movies
        .Where(movie => movie.Year == year)
        .OrderByDescending(movie => movie.Rating)
        .Take(5)
        .ToListAsync();
}
{% endcodeblock %}

## Unit Testing
In order to replace underlying data source with in-memory list, the list should implement `IDbAsyncEnumerable` and `IQueryable`. We can simply convert `List` into `IQueryable` using `AsQueryable()` extension method. But it is not straight forward to implement `IDbAsyncEnumerable`. The easiest way to acheive this is by wrapping our `List` data in a class which implements `IDbAsyncEnumerable`.

The class we create implementing `IDbAsyncEnumerable` should have `GetAsyncEnumerator()` method returning an enumerator implementing `IDbAsyncEnumerator` and `Provider` property should return a QueryProvider which implements `IDbAsyncQueryProvider`. So we need three fake/test-double classes as follows

{% codeblock lang:csharp FakeDbAsyncEnumerable %}
public class FakeDbAsyncEnumerable<T> : EnumerableQuery<T>, IDbAsyncEnumerable<T>, IQueryable<T>
{
    public FakeDbAsyncEnumerable(IEnumerable<T> enumerable)
        : base(enumerable)
    { }

    public FakeDbAsyncEnumerable(Expression expression)
        : base(expression)
    { }

    public IDbAsyncEnumerator<T> GetAsyncEnumerator()
    {
        return new FakeDbAsyncEnumerator<T>(this.AsEnumerable().GetEnumerator());
    }

    IDbAsyncEnumerator IDbAsyncEnumerable.GetAsyncEnumerator()
    {
        return GetAsyncEnumerator();
    }

    IQueryProvider IQueryable.Provider
    {
        get { return new FakeDbAsyncQueryProvider<T>(this); }
    }
}
{% endcodeblock %}

{% codeblock lang:csharp FakeDbAsyncEnumerator %}
 public class FakeDbAsyncEnumerator<T> : IDbAsyncEnumerator<T>
{
    private readonly IEnumerator<T> _localEnumerator;

    public FakeDbAsyncEnumerator(IEnumerator<T> localEnumerator)
    {
        _localEnumerator = localEnumerator;
    }

    public void Dispose()
    {
        _localEnumerator.Dispose();
    }

    public Task<bool> MoveNextAsync(CancellationToken cancellationToken)
    {
        return Task.FromResult(_localEnumerator.MoveNext());
    }

    public T Current
    {
        get { return _localEnumerator.Current; }
    }

    object IDbAsyncEnumerator.Current
    {
        get { return Current; }
    }
}
{% endcodeblock %}

{% codeblock lang:csharp FakeDbAsyncQueryProvider %}
public class FakeDbAsyncQueryProvider<T> : IDbAsyncQueryProvider
{
    private readonly IQueryProvider _localQueryProvider;

    internal FakeDbAsyncQueryProvider(IQueryProvider localQueryProvider)
    {
        _localQueryProvider = localQueryProvider;
    }

    public IQueryable CreateQuery(Expression expression)
    {
        return new FakeDbAsyncEnumerable<T>(expression);
    }

    public IQueryable<TElement> CreateQuery<TElement>(Expression expression)
    {
        return new FakeDbAsyncEnumerable<TElement>(expression);
    }

    public object Execute(Expression expression)
    {
        return _localQueryProvider.Execute(expression);
    }

    public TResult Execute<TResult>(Expression expression)
    {
        return _localQueryProvider.Execute<TResult>(expression);
    }

    public Task<object> ExecuteAsync(Expression expression, CancellationToken cancellationToken)
    {
        return Task.FromResult(Execute(expression));
    }

    public Task<TResult> ExecuteAsync<TResult>(Expression expression, CancellationToken cancellationToken)
    {
        return Task.FromResult(Execute<TResult>(expression));
    }
}
{% endcodeblock %}

Now, we just need to create our data list and wrap it in `FakeDbAsyncEnumerable` instance and replace all the properties used by LINQ in `DbSet` instance with the one from `FakeDbAsyncEnumerable`.
Note, because we are using async query, we need to setup create setup to replace `GetAsyncEnumerator` rather than `GetEnumerator`.

The completed unit test would look like this

{% codeblock lang:csharp %}
[TestMethod]
public async Task GetTopFiveMoviesShouldReturnTopFiveMoviesSuccessfully()
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

    var fakeAsynEnumerable = new FakeDbAsyncEnumerable<Movie>(movieList);

    var mockDbSetMovies = new Mock<IDbSet<Movie>>();
    mockDbSetMovies.As<IQueryable>()
        .Setup(mock => mock.Provider)
        .Returns(fakeAsynEnumerable.AsQueryable().Provider);

    mockDbSetMovies.As<IQueryable>()
        .Setup(mock => mock.Expression)
        .Returns(fakeAsynEnumerable.AsQueryable().Expression);
    mockDbSetMovies.As<IQueryable>()
        .Setup(mock => mock.ElementType)
        .Returns(fakeAsynEnumerable.AsQueryable().ElementType);

    mockDbSetMovies.As<IDbAsyncEnumerable>()
        .Setup(mock => mock.GetAsyncEnumerator())
        .Returns(((IDbAsyncEnumerable<Movie>)fakeAsynEnumerable).GetAsyncEnumerator());

    // mock DbContext
    var mockMovieContext = new Mock<IMoviesContext>();
    mockMovieContext.Setup(mock => mock.Movies).Returns(mockDbSetMovies.Object);

    var sut = new MovieFinder(mockMovieContext.Object);

    // Exercise System
    var result = await sut.GetTopFiveMovies(year);

    // Verify Outcome
    Assert.AreEqual(5, result.Count());
    Assert.IsTrue(result.All(item => item.Year == year));
    // Fixture Teardown
}
{% endcodeblock %}