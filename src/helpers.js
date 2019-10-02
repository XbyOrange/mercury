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

export const queryId = query => JSON.stringify(query);

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

const dashJoin = arr => arr.join("-");

const omitEmpty = arr => arr.filter(item => item.length > 0);

export const hash = str => {
  return `${str.split("").reduce((a, b) => {
    a = (a << 5) - a + b.charCodeAt(0);
    return a & a;
  }, 0)}`;
};

export const functionId = func => hash(func.toString().replace(/\s/g, ""));

export const functionsId = funcs => dashJoin(funcs.map(functionId));

export const uniqueId = (id, defaultValue) => hash(`${id}${JSON.stringify(defaultValue)}`);

export const queriedUniqueId = (uniqueId, queryUniqueId) => `${uniqueId}-${queryUniqueId}`;

export const selectorUniqueId = (uniqueId, sourcesUniqueIds, selectorMethod, sourcesQueries) =>
  dashJoin(
    omitEmpty([
      uniqueId,
      dashJoin(sourcesUniqueIds),
      functionId(selectorMethod),
      functionsId(sourcesQueries)
    ])
  );
