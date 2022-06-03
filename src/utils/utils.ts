import _ from 'lodash';
import { Source } from "../types";

function sortByChar(a: string, b: string): number {
  return a.localeCompare(b, 'en', { sensitivity: 'base' });
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

function mergeSorted(a: Source, b: Source): Source {
  if (!a.length) {
    return b;
  } else if (!b.length) {
    return a;
  }

  const merged = [];
  let i = 0;
  let j = 0;
  const lenA = a.length;
  const lenB = b.length;

  while (i < lenA && j < lenB) {
    const ai0 = a[i][0];
    const bj0 = b[j][0];
    merged.push(
      ai0 < bj0 ? a[i++]
        : ai0 > bj0 ? b[j++]
          : [ai0, mergeSorted(a[i++][1], b[j++][1])]
    );
  }

  return merged.concat(a.slice(i)).concat(b.slice(j));
}

function caseOr(a: string, b: string): string {
  const r = [];

  for (let i = 0; i < a.length; i++) {
    r.push(a.charCodeAt(i) | b.charCodeAt(i));
  }

  return String.fromCharCode(...r);
}

export { pruneEmpty, print, stringify, sortByChar, getNode, mergeSorted, caseOr };
