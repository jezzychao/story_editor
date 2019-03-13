
window.utils = {
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
};