import _ from 'lodash';

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
    let a = [], info;
    for (const k in obj) {
        info = {};
        info[key] = k;
        info[value] = obj[k];
        a.push(info);
    }
    return a;
}

function deDuplicate(array) {
    return [...new Set(array)];
}

export { pruneEmpty, obj2Array, deDuplicate };
