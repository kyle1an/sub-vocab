import _ from 'lodash';

function sortByChar(a: any, b: any): boolean {
  return a.w.localeCompare(b.w, 'en', { sensitivity: 'base' });
}

const print = (m: any, space = 0) => console.log(JSON.stringify(m, null, space).replace(/"/mg, ""))
const stringify = (m: any, space = 0) => ({ s: JSON.stringify(m, null).replace(/"/mg, "'") })

function pruneEmpty(obj: any, mutate = true) {
  const co = mutate ? obj : _.cloneDeep(obj);
  return function prune(current) {
    _.forOwn(current, function (value, key) {
      if (_.isUndefined(value) || _.isNull(value) || _.isNaN(value)
        || (_.isString(value) && _.isEmpty(value))
        || (_.isObject(value) && _.isEmpty(prune(value)))
      ) {
        delete current[key];
      }
    });
    // remove any leftover undefined values from the delete operation on an array
    if (_.isArray(current)) _.pull(current, undefined);
    return current;
  }(co);  // Do not modify the original object, create a clone instead
}

function getNode(word: string, node: Record<string, Record<string, any>>) {
  for (const c of word.split('')) node = node[c] ??= {};
  return node;
}

export { pruneEmpty, print, stringify, sortByChar, getNode };
