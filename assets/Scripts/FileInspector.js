
cc.Class({
    extends: cc.Component,

    properties: {
        fileItem: cc.Prefab,
        nodContainer: cc.Node,
    },

    ctor() {
        this.mAllItems = {};
    },

    onLoad() {
        msg.register(this, msg.key.UI_UPDATE_FILES_LIST, (tag, key, (param) => { this._updateList(param); }), this);
        msg.register(this, msg.key.UI_UPDATE_ALL_INSPECTORS, (tag, key, (param) => { this._updateList(param); }), this);
    },

    onDestroy() {
        msg.cancelAll(this);
    },

    start() {
        var allFiles = FileMgr.getAllFiles();
        if (!allFiles.length) {
            return;
        }
    },

    _updateList: function (allFiles) {
        let oldFiles = Object.keys(this.mAllItems);
        let existInTagArray = function (oldFile, tagArray) {
            for (let i = 0; i < tagArray.length; ++i) {
                if (tagArray[i] == oldFile) {
                    return true;
                }
            }
            return false;
        };

        let tDelList = [];
        for (let i = 0; i < oldFiles.length; ++i) {
            if (!existInTagArray(oldFiles[i]), allFiles) {
                tDelList.push(oldFiles[i]);
            }
        }
        tDelList.forEach(key => {
            this._deleteOneItem(key);
        });

        let tAddList = [];
        for (let i = 0; i < allFiles.length; ++i) {
            if (!existInTagArray(allFiles[i]), oldFiles) {
                tAddList.push(allFiles[i]);
            }
        }
        tAddList.forEach(key => {
            this._createOneItem(key);
        });

        this._sort();
    },

    _createOneItem: function (filename) {
        let node = cc.instantiate(this.fileItem);
        this.nodContainer.addChild(node);
        node.x = 0;
        let item = node.getComponent('FileItem');
        item.setFileName(filename);
        this.mAllItems[filename] = item;
    },

    _deleteOneItem: function (filename) {
        for (let name in this.mAllItems) {
            if (name == filename) {
                this.mAllItems[name].node.destroy();
                delete this.mAllItems[name];
                return true;
            }
        }
        return false;
    },

    _sort: function () {
        let index = 0;
        for (let key in this.mAllItems) {
            let tNode = this.mAllItems[key].node;
            if (tNode.getSiblingIndex() != index) {
                tNode.setSiblingIndex(index++);
            }
        }
    },
});
