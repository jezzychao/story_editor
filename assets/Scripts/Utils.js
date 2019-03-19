
var utils = {
    loadPrefab: function (name, cb) {
        cc.loader.loadRes(`${name}`, cc.Prefab, (err, res) => {
            if (err) {
                console.error(`${err}, ${name} donot exist!!!`);
                return;
            }
            cb && cb(res);
        })
    },

    deepCopy: function (data) {
        return JSON.parse(JSON.stringify(data));
    },

    countProperty: function (obj) {
        if (!obj) {
            return 0;
        }

        return Object.getOwnPropertyNames(obj).length;
    },

    convertToV2: function (pointStruct) {
        return cc.v2(pointStruct['x'], pointStruct['y']);
    },

    convertFromV2: function (v2) {
        return { 'x': v2.x, 'y': v2.y };
    },

    findIndex: function (arr, predicate) {
        let index = -1;
        for (let i = 0; i < arr.length; ++i) {
            if (predicate(arr[i])) {
                index = i;
                break;
            }
        }
        return index;
    },
};

window.utils = utils;