import { once, isFunction, isArray } from "lodash";
import isPromise from "is-promise";

import { Origin } from "./Origin";
import {
  READ_METHOD,
  CREATE_METHOD,
  UPDATE_METHOD,
  DELETE_METHOD,
  selectorUniqueId
} from "./helpers";

export class Selector extends Origin {
  constructor() {
    const args = Array.from(arguments);
    let lastIndex = args.length - 1;
    let defaultValue;

    // Check if last argument is default value
    if (!isFunction(args[lastIndex])) {
      defaultValue = args[lastIndex];
      lastIndex = args.length - 2;
    }

    const sources = args.slice(0, lastIndex);

    const sourceIds = [];
    const sourceUniqueIds = [];
    const allQueries = [];
    const allCatches = [];

    const getTestQueries = sourcesOfLevel => {
      const queries = [];
      sourcesOfLevel.forEach(source => {
        if (isArray(source)) {
          queries.push(getTestQueries(source));
        } else {
          const hasQueryOrCatch = !!source.source;
          sourceIds.push(hasQueryOrCatch ? source.source._id : source._id);
          sourceUniqueIds.push(hasQueryOrCatch ? source.source._uniqueId : source._uniqueId);
          if (hasQueryOrCatch && source.query) {
            queries.push(source.query);
            allQueries.push(source.query);
          }
          if (hasQueryOrCatch && source.catch) {
            // TODO, get catches to expose them for testing purposes. Issue #14
            allCatches.push(source.catch);
          }
        }
      });
      return queries;
    };

    const testQueries = getTestQueries(sources);

    super(`select:${sourceIds.join(":")}`, defaultValue);
    // override constructor uniqueId: It is more consistant to generate it based on uniqueIds of all provided sources
    this._resultsParser = args[lastIndex];
    this._uniqueId = selectorUniqueId(
      this._uniqueId,
      sourceUniqueIds,
      this._resultsParser,
      allQueries,
      allCatches
    );

    this._sources = sources;
    this.test.queries = testQueries;
    this.test.selector = this._resultsParser;
  }

  _readAllSourcesAndDispatch(query, extraParams, methodToDispatch) {
    const sourcesResults = [];
    const sources = [];
    let selectorResult;
    let selectorResultIsSource;
    const cleanQuery = once(() => {
      this.clean(query);
    });

    const readSource = sourceToRead => {
      if (isArray(sourceToRead)) {
        return Promise.all(sourceToRead.map(readSource));
      }
      const isQueried = !!sourceToRead.source;
      const hasToQuery = !!sourceToRead.query;
      const hasToCatch = !!sourceToRead.catch;
      const source = isQueried
        ? hasToQuery
          ? sourceToRead.source.query(sourceToRead.query(query, sourcesResults))
          : sourceToRead.source
        : sourceToRead;
      sources.push(source);
      return source[READ_METHOD].dispatch().catch(error => {
        if (hasToCatch) {
          const catchResult = sourceToRead.catch(error, query);
          if (catchResult._isSource) {
            sources.push(catchResult);
            return catchResult[READ_METHOD].dispatch();
          }
          return catchResult;
        }
        return Promise.reject(error);
      });
    };

    const readSourceIndex = sourceIndex => {
      return readSource(this._sources[sourceIndex]).then(sourceResult => {
        sourcesResults.push(sourceResult);
        if (sourceIndex < this._sources.length - 1) {
          return readSourceIndex(sourceIndex + 1);
        }
        const result = this._resultsParser.apply(null, sourcesResults.concat(query));
        return isPromise(result) ? result : Promise.resolve(result);
      });
    };

    const addCleanQueryListeners = () => {
      sources.forEach(source => {
        source.onceClean(cleanQuery);
      });
      if (selectorResultIsSource) {
        selectorResult.onceClean(cleanQuery);
      }
    };

    return readSourceIndex(0)
      .then(result => {
        selectorResult = result;
        selectorResultIsSource = selectorResult && selectorResult._isSource;
        if (methodToDispatch !== READ_METHOD && !selectorResultIsSource) {
          return Promise.reject(new Error("CUD methods can be used only when returning sources"));
        }
        return selectorResultIsSource
          ? selectorResult[methodToDispatch].dispatch(extraParams)
          : Promise.resolve(selectorResult);
      })
      .then(result => {
        addCleanQueryListeners();
        return Promise.resolve(result);
      })
      .catch(error => {
        addCleanQueryListeners();
        this._cache.set(query, null);
        return Promise.reject(error);
      });
  }

  _read(query, extraParams) {
    const cached = this._cache.get(query);
    if (cached) {
      return cached;
    }
    const resultPromise = this._readAllSourcesAndDispatch(query, extraParams, READ_METHOD);
    this._cache.set(query, resultPromise);
    return resultPromise;
  }

  _cleanAfter(query, extraParams, method) {
    return this._readAllSourcesAndDispatch(query, extraParams, method).then(responseData => {
      this._clean(query);
      return Promise.resolve(responseData);
    });
  }

  _update(query, extraParams) {
    return this._cleanAfter(query, extraParams, UPDATE_METHOD);
  }

  _create(query, extraParams) {
    return this._cleanAfter(query, extraParams, CREATE_METHOD);
  }

  _delete(query, extraParams) {
    return this._cleanAfter(query, extraParams, DELETE_METHOD);
  }
}
