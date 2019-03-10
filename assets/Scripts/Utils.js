
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
};