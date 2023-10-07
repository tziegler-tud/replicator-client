export var getObjectProp = function (obj, str) {
    return str.split(".").reduce(function(o, x) { return o[x] }, obj);
};

export var setObjectProp = (obj, value, propPath) => {
    const [head, ...rest] = propPath.split('.');
    !rest.length ? obj[head] = value : setObjectProp(obj[head], value, rest.join('.'));
}