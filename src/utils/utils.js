import _ from 'lodash';

const print = (m, space = 0) => console.log(JSON.stringify(m, null, space).replace(/"/mg, ""))
const stringify = (m, space = 0) => ({ s:  JSON.stringify(m, null).replace(/"/mg, "'") })

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

export { pruneEmpty, print, stringify };
