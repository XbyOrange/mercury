import { isEqual, cloneDeep, merge } from "lodash";

import { Cache } from "./Cache";

import { EventEmitter } from "./EventEmitter";
import {
  READ_METHOD,
  VALID_METHODS,
  CHANGE_ANY_EVENT_NAME,
  CLEAN_ANY_EVENT_NAME,
  cleanCacheEventName,
  changeEventName,
  queryId,
  actions
} from "./helpers";

export class Origin {
  constructor(id = "", defaultValue) {
    this._eventEmitter = new EventEmitter();
    this._queries = {};
    this._id = id;
    this._cache = new Cache(this._eventEmitter, this._id);
    this._defaultValue =
      typeof defaultValue !== "undefined" ? cloneDeep(defaultValue) : defaultValue;

    this._customQueries = {};
    this.test = {};

    this._createBaseMethods();
  }

  // EVENT HANDLERS

  _emitChange(query, method) {
    this._eventEmitter.emit(changeEventName(query), method);
  }

  _onChange(listener, query) {
    this._eventEmitter.on(changeEventName(query), listener);
  }

  _removeChangeListener(listener, query) {
    this._eventEmitter.removeListener(changeEventName(query), listener);
  }

  _emitChangeAny(details) {
    this._eventEmitter.emit(CHANGE_ANY_EVENT_NAME, details);
  }

  _onChangeAny(listener) {
    this._eventEmitter.on(CHANGE_ANY_EVENT_NAME, listener);
  }

  _removeChangeAnyListener(listener) {
    this._eventEmitter.removeListener(CHANGE_ANY_EVENT_NAME, listener);
  }

  _onceClean(listener, query) {
    this._eventEmitter.once(cleanCacheEventName(query), listener);
  }

  _onClean(listener, query) {
    this._eventEmitter.on(cleanCacheEventName(query), listener);
  }

  _removeCleanListener(listener, query) {
    this._eventEmitter.removeListener(cleanCacheEventName(query), listener);
  }

  _onCleanAny(listener) {
    this._eventEmitter.on(CLEAN_ANY_EVENT_NAME, listener);
  }

  _removeCleanAnyListener(listener) {
    this._eventEmitter.removeListener(CLEAN_ANY_EVENT_NAME, listener);
  }

  // PRIVATE METHODS

  _hasToPublishMethod(methodName) {
    return this[`_${methodName}`];
  }

  _clean(query) {
    this._cache.clean(query);
  }

  _createQueryMethods(query, queryId) {
    const methods = {};

    const updateData = (data, methodName, action, params) => {
      const oldData = {
        value: methods[methodName].value,
        error: methods[methodName].error,
        loading: methods[methodName].loading
      };
      const newData = {
        value: methods[methodName].value,
        error: methods[methodName].error,
        loading: methods[methodName].loading,
        ...data
      };
      if (!isEqual(oldData, newData)) {
        methods[methodName].value = newData.value;
        methods[methodName].loading = newData.loading;
        methods[methodName].error = newData.error;
        this._emitChange(query, methodName);
        this._emitChangeAny({
          source: this._queries[queryId],
          method: methodName,
          action,
          params
        });
      }
    };

    VALID_METHODS.forEach(methodName => {
      if (this._hasToPublishMethod(methodName)) {
        const dispatchMethod = extraParams => {
          const methodPromise = this[`_${methodName}`](query, extraParams);
          if (!methodPromise.isFulfilled) {
            updateData(
              {
                loading: true
              },
              methodName,
              actions[methodName].dispatch,
              extraParams
            );
          }
          return methodPromise
            .then(result => {
              updateData(
                {
                  loading: false,
                  error: null,
                  value: result
                },
                methodName,
                actions[methodName].success,
                extraParams
              );
              methodPromise.isFulfilled = true;
              return Promise.resolve(result);
            })
            .catch(error => {
              updateData(
                {
                  loading: false,
                  error
                },
                methodName,
                actions[methodName].error,
                extraParams
              );
              methodPromise.isFulfilled = true;
              return Promise.reject(error);
            });
        };

        methods[methodName] = dispatchMethod;
        methods[methodName].dispatch = dispatchMethod;
        methods[methodName].value = methodName === READ_METHOD ? this._defaultValue : undefined;
        methods[methodName].error = null;
        methods[methodName].loading = false;
        methods[methodName]._source = methods;
        methods[methodName]._isSourceMethod = true;
        methods[methodName]._methodName = methodName;

        const createGetter = prop => {
          const getter = () => methods[methodName][prop];
          getter.isGetter = true;
          getter.prop = prop;
          getter._isSourceMethod = true;
          getter._method = methods[methodName];
          return getter;
        };

        methods[methodName].getters = {
          error: createGetter("error"),
          loading: createGetter("loading"),
          value: createGetter("value")
        };
      }
    });
    return methods;
  }

  _createBaseMethods() {
    const baseMethods = this.query();

    Object.keys(baseMethods).forEach(baseMethod => {
      if (!this[baseMethod]) {
        this[baseMethod] = baseMethods[baseMethod];
      }
    });
  }

  // PUBLIC METHODS

  query(originalQuery) {
    const query = cloneDeep(originalQuery);
    const queryUniqueId = queryId(query);
    if (this._queries[queryUniqueId]) {
      return this._queries[queryUniqueId];
    }
    const newQuery = this._createQueryMethods(query, queryUniqueId);
    newQuery.onChange = listener => this._onChange(listener, query);
    newQuery.removeChangeListener = listener => this._removeChangeListener(listener, query);
    newQuery.onChangeAny = listener => this._onChangeAny(listener);
    newQuery.removeChangeAnyListener = listener => this._removeChangeAnyListener(listener);
    newQuery.clean = () => this._clean(query);
    newQuery.onceClean = listener => this._onceClean(listener, query);
    newQuery.onClean = listener => this._onClean(listener, query);
    newQuery.removeCleanListener = listener => this._removeCleanListener(listener, query);
    newQuery.onCleanAny = listener => this._onCleanAny(listener);
    newQuery.removeCleanAnyListener = listener => this._removeCleanAnyListener(listener);
    newQuery._queryId = queryUniqueId;
    newQuery._id = `${this._id}${queryUniqueId ? `-${queryUniqueId}` : ""}`;
    newQuery.actions = actions;
    newQuery._isSource = true;

    newQuery.query = queryExtension => this.query(merge(query, queryExtension));

    Object.keys(this._customQueries).forEach(queryKey => {
      newQuery[queryKey] = queryExtension => {
        return newQuery.query(this._customQueries[queryKey](queryExtension));
      };
    });

    this._queries[queryUniqueId] = newQuery;

    return this._queries[queryUniqueId];
  }

  addCustomQueries(customQueries) {
    Object.keys(customQueries).forEach(queryKey => {
      this._customQueries[queryKey] = customQueries[queryKey];
      this.test.customQueries = this.test.customQueries || {};
      this.test.customQueries[queryKey] = customQueries[queryKey];
      this[queryKey] = query => {
        return this.query(customQueries[queryKey](query));
      };
    });
  }

  addCustomQuery(customQuery) {
    this.addCustomQueries(customQuery);
  }
}