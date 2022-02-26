import _ from 'lodash';

const esrever = require('../components/esrever.js')
const reverse = (str) => esrever.reverse(str);
const print = (m, space = 0) => console.log(JSON.stringify(m, null, space).replace(/"/mg, ""))
const stringify = (m, space = 0) => JSON.stringify(m, null, space)

function pruneEmpty(obj, mutate = true) {
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

function obj2Array(obj, key = 'key', value = 'value') {
    return Object.entries(obj).map(([k, v]) => ({ [key]: k, [value]: [v._, v['#']] }))
}

function deDuplicate(array) {
    return [...new Set(array)];
}

export { pruneEmpty, obj2Array, deDuplicate, print, stringify };
