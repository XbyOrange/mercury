import { cloneDeep, merge, isFunction } from "lodash";

const CACHE_EVENT_PREFIX = "clean-cache-";
const CHANGE_EVENT_PREFIX = "change-";
const ANY_SUFIX = "any";

export const CREATE_METHOD = "create";
export const READ_METHOD = "read";
export const UPDATE_METHOD = "update";
export const DELETE_METHOD = "delete";

export const DISPATCH = "Dispatch";
export const SUCCESS = "Success";
export const ERROR = "Error";

export const VALID_METHODS = [CREATE_METHOD, READ_METHOD, UPDATE_METHOD, DELETE_METHOD];

export const CHANGE_ANY_EVENT_NAME = `${CHANGE_EVENT_PREFIX}${ANY_SUFIX}`;
export const CLEAN_ANY_EVENT_NAME = `${CACHE_EVENT_PREFIX}${ANY_SUFIX}`;

export const isCacheEventName = eventName =>
  eventName.indexOf(CACHE_EVENT_PREFIX) === 0 && eventName !== CLEAN_ANY_EVENT_NAME;

export const cleanCacheEventName = query => `${CACHE_EVENT_PREFIX}${queryId(query)}`;
export const changeEventName = query => `${CHANGE_EVENT_PREFIX}${queryId(query)}`;

export const actions = {
  [CREATE_METHOD]: {
    dispatch: `${CREATE_METHOD}${DISPATCH}`,
    success: `${CREATE_METHOD}${SUCCESS}`,
    error: `${CREATE_METHOD}${ERROR}`
  },
  [UPDATE_METHOD]: {
    dispatch: `${UPDATE_METHOD}${DISPATCH}`,
    success: `${UPDATE_METHOD}${SUCCESS}`,
    error: `${UPDATE_METHOD}${ERROR}`
  },
  [READ_METHOD]: {
    dispatch: `${READ_METHOD}${DISPATCH}`,
    success: `${READ_METHOD}${SUCCESS}`,
    error: `${READ_METHOD}${ERROR}`
  },
  [DELETE_METHOD]: {
    dispatch: `${DELETE_METHOD}${DISPATCH}`,
    success: `${DELETE_METHOD}${SUCCESS}`,
    error: `${DELETE_METHOD}${ERROR}`
  }
};

export const hash = str => {
  return `${str.split("").reduce((a, b) => {
    const c = (a << 5) - a + b.charCodeAt(0);
    return c & c;
  }, 0)}`;
};

export const mergeCloned = (dest, origin) => merge(dest, cloneDeep(origin));

export const removeFalsy = array => array.filter(el => !!el);

export const isUndefined = variable => typeof variable === "undefined";

export const queryId = query => (isUndefined(query) ? query : `(${JSON.stringify(query)})`);

export const dashJoin = arr => arr.filter(val => !isUndefined(val)).join("-");

export const uniqueId = (id, defaultValue) =>
  hash(`${id}${isFunction(defaultValue) ? "" : JSON.stringify(defaultValue)}`);

export const queriedUniqueId = (uuid, queryUniqueId) => dashJoin([uuid, queryUniqueId]);

export const ensureArray = els => (Array.isArray(els) ? els : [els]);

export const seemsToBeSelectorOptions = defaultValueOrOptions => {
  if (!defaultValueOrOptions) {
    return false;
  }
  return (
    defaultValueOrOptions.hasOwnProperty("defaultValue") ||
    defaultValueOrOptions.hasOwnProperty("uuid")
  );
};

export const isSource = objectToCheck => {
  return (
    objectToCheck &&
    (objectToCheck._isSource === true || (objectToCheck.source && objectToCheck.source._isSource))
  );
};

export const areSources = arrayToCheck => {
  let allAreSources = true;
  ensureArray(arrayToCheck).forEach(arrayElement => {
    if (!isSource(arrayElement)) {
      allAreSources = false;
    }
  });
  return allAreSources;
};
