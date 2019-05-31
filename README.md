[![pipeline status](https://gitlab.com/OrangeX/frontend/libs/mercury/badges/master/pipeline.svg)](https://gitlab.com/OrangeX/frontend/libs/mercury/commits/master)
[![coverage report](https://gitlab.com/OrangeX/frontend/libs/mercury/badges/master/coverage.svg)](https://gitlab.com/OrangeX/frontend/libs/mercury/commits/master)
[SonarQube](https://sonarqube.apps.pre.xbyorange.com/dashboard?id=mercury%3Amaster)

# Reactive CRUD data abstraction layer

![Mercury Logo](assets/logos/mercury_name_black_500.png)

## Overview

__Mercury__ provides an asynchronous CRUD data abstraction layer that can be used to isolate your code from specific methods of different data origins.

Provides:

* __"Origin"__ class from which your own specific origin implementation should extend.
	* __CRUD__. Define different methods for `read`, `create`, `update`, `delete` actions.
	* __Asynchronous__. Three properties are available for each method: `value`, `loading`, `error`.
	* __Queryable__. Applies queries to your CRUD methods using the built-in `query` method.
	* __Chainable__. Queries can be chained, the resultant query will be the extension of all.
	* __Customizable__. Custom queries can be added to the instances.
	* __Cache__. Use built-in cache to avoid the same query being executed more than once if not necessary.
	* __Clean__ cache on demand with the built-in `clean` method.
	* __Events__ emitter.You can add listeners to changes and cache events.
	* __Extensible__. Implement your own origins connectors, or use one of the already existant:
		* [Api][mercury-api-url]
		* [Memory Storage][mercury-memory-url]
		* [Local Storage][mercury-browser-storage-url]
		* [Session Storage][mercury-browser-storage-url]
		* [Prismic CMS][mercury-prismic-url]
* __"Selector"__ constructor for combining or transforming the result of one or many origins.
	* __Declarative__. Declare which Origins your Selector needs to consume. Mercury will do the rest for you.
	* __Composable__. Can fetch data from Origins or from another Selectors.
	* __Homogeneus__. Provides exactly the same interface than origins. Consumers don't need to know if they are consuming an Origin or a Selector.
	* __Cache__. Implements a cache that avoids the execution of the same Selector and query more than once.
	* __Reactive__. When one of the related sources cache is cleaned, the Selector cache is cleaned too.
	* __Switchable__. Consumed "source" can be changed programatically.
	* __Parallellizable__. Can fetch data from declared sources in series or in parallel.
	* __Queryable__. Queries can be applied as in Origins. You can pass the `query` data to sources, or use it in the `parser` function, after all related sources data have been fetched.

## Install

```bash
npm i @nex/mercury --save
```

## A simple example

```js
import { Selector } from "@nex/mercury";
import { Api } from "@nex/mercury-api";

const booksCollection = new Api("http://api.library.com/books");
const authorsCollection = new Api("http://api.library.com/authors");

const booksWithAuthors = new Selector(
  booksCollection,
  authorsCollection,
  (booksResults, authorsResults) =>
      booksResults.map(book => ({
      ...book,
      authorName: authorsResults.find(author => author.id === book.author)
    }))
);

// Each book now includes an "authorName" property.
const results = await booksWithAuthors.read();

```

> This example uses the Api origin, which is not distributed in this package, but can clearly illustrate the usage of an Origin, and the intention of the library.

## Origins

### Examples

> All examples in next docs will use the Api origin for a better comprehension of the library intention. Please refer to the [mercury-api][mercury-api-url] documentation for further info about an API origin usage.

* [Query](docs/origin/query.md)
* [Events](docs/origin/events.md)

### For especific implementation of Origins, please refer to each correspondant docs:

* [Api][mercury-api-url]
* [Memory Storage][mercury-memory-url]
* [Local Storage][mercury-browser-storage-url]
* [Session Storage][mercury-browser-storage-url]
* [Prismic CMS][mercury-prismic-url]

### Creating a new Origin implementation.

Please read the full [Origin api docs](docs/origin/api.md) to learn how to create origins.

## Selectors

### Usage Examples

> All examples in next docs will use the Api origin for a better comprehension of the library intention. Please refer to the [mercury-api][mercury-api-url] documentation for further info about an API origin usage.

* [Asynchronous mutable properties](docs/selector/asynchronous-mutable-properties.md)
* [Default value](docs/selector/default-value.md)
* [Cache](docs/selector/cache.md)
* [Query](docs/selector/query.md)
* [Parallel sources](docs/selector/parallel-sources.md)
* [Sources error handling](docs/selector/sources-error-handling.md)
* [Selectors returning sources](docs/selector/selectors-returning-sources.md)

### Api

Read the full [Selector API documentation](docs/selector/api.md).

### Unit testing

Some utilities are provided to make easier the task of testing Selectors. Please red the [testing selectors docs](docs/selector/testing.md).

## Usage with frameworks

### React

Please refer to the [react-mercury][react-mercury-url] documentation to see how simple is the data-binding between React Components and the Mercury Sources.

Connect a source to all components that need it. Mercury will fetch data only when needed, and will avoid making it more than once, no matter how many components need the data.

Components will became reactive to CRUD actions automatically (dispatch a `create` action over a collection, and Mercury will refresh it automatically on any rendered binded component)

[mercury-api-url]: https://gitlab.com/OrangeX/frontend/libs/mercury-api
[mercury-memory-url]: https://gitlab.com/OrangeX/frontend/libs/mercury-memory
[mercury-browser-storage-url]: https://gitlab.com/OrangeX/frontend/libs/mercury-browser-storage
[mercury-prismic-url]: https://gitlab.com/OrangeX/frontend/libs/mercury-prismic
[react-mercury-url]: https://gitlab.com/OrangeX/frontend/libs/react-mercury
