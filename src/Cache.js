import {
  CLEAN_ANY_EVENT_NAME,
  queryId,
  cleanCacheEventName,
  isCacheEventName,
  queriedUniqueId,
  isUndefined
} from "./helpers";

export class Cache {
  constructor(eventEmitter, id) {
    this._eventEmitter = eventEmitter;
    this._reset();
    this._id = id;
  }

  _reset() {
    this._cachedData = {};
    this._eventEmitter.eventNames.forEach(eventName => {
      if (isCacheEventName(eventName)) {
        this._eventEmitter.emit(eventName);
      }
    });
  }

  getAnyData(queryUniqueId, _root) {
    return {
      action: "clean",
      source: {
        _id: queriedUniqueId(this._id, queryUniqueId),
        _queryId: queryUniqueId,
        _root
      }
    };
  }

  clean(query, _root) {
    if (!isUndefined(query)) {
      const queryIdentifier = queryId(query);
      delete this._cachedData[queryIdentifier];
      this._eventEmitter.emit(cleanCacheEventName(query), query);
      this._eventEmitter.emit(CLEAN_ANY_EVENT_NAME, this.getAnyData(queryIdentifier, _root));
    } else {
      this._reset();
      this._eventEmitter.emit(CLEAN_ANY_EVENT_NAME, this.getAnyData(query, _root));
    }
  }

  get(query) {
    return this._cachedData[queryId(query)];
  }

  set(query, data) {
    this._cachedData[queryId(query)] = data;
  }
}
