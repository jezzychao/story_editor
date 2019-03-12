
cc.Class({
    extends: cc.Component,

    properties: {
        fileItem: cc.Prefab,
        nodContainer: cc.Node,
    },

    ctor() {
        this.mAllItems = {};
        this.mCurrOpened = null;
    },

    onLoad() {
        msg.register(this, msg.key.UI_UPDATE_FILES_LIST, (tag, key, param) => { this._updateList(param); }, this);
        msg.register(this, msg.key.UI_UPDATE_ALL_INSPECTORS, (tag, key, param) => { this._markOpenedFile(param); }, this);
        msg.register(this, msg.key.UI_UPDATE_FILE_NAME, (tag, key, param) => { this._updateName(param); }, this);
    },

    onDestroy() {
        msg.cancelAll(this);
    },

    start() {
        var allFiles = fileMgr.getAllFiles();
        if (!allFiles.length) {
            return;
        }
        this._updateList(allFiles);
    },

    _updateName: function (param) {
        let tIsSucc = param['state'], old = param['old'], newname = param['new'];
        if (tIsSucc) {
            var oldItem = this.mAllItems[old];
            this.mAllItems[newname] = oldItem;
            delete this.mAllItems[old];
            if (this.mCurrOpened == old) {
                this.mCurrOpened = newname;
            }
            this.mAllItems[newname].setFileName(newname);
            this._sort();
        } else {
            //TODO:提示更新名称重复
            console.log('TIPS: 提示更新名称重复');
        }
    },

    _markOpenedFile: function (currData) {
        if (currData) {
            let openedFile = Object.keys(currData)[0]
            if (this.mCurrOpened && this.mAllItems[this.mCurrOpened]) {
                this.mAllItems[this.mCurrOpened].markColor(false);
            }
            if (this.mAllItems[openedFile]) {
                this.mCurrOpened = openedFile;
                this.mAllItems[openedFile].markColor(true);
            }
        } else {
            if (this.mCurrOpened && this.mAllItems[this.mCurrOpened]) {
                this.mAllItems[this.mCurrOpened].markColor(false);
            }
            this.mCurrOpened = null;
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
            if (!existInTagArray(oldFiles[i], allFiles)) {
                tDelList.push(oldFiles[i]);
            }
        }
        tDelList.forEach(key => {
            this._deleteOneItem(key);
        });

        let tAddList = [];

        for (let i = 0; i < allFiles.length; ++i) {
            if (!existInTagArray(allFiles[i], oldFiles)) {
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
        if (this.mAllItems[filename]) {
            this.mAllItems[filename].node.destroy();
            delete this.mAllItems[filename];
            return true;
        } else {
            return false;
        }
    },

    _sort: function () {
        let tKeys = Object.keys(this.mAllItems);
        tKeys.sort();
        for (let i = 0; i < tKeys.length; ++i) {
            let tScr = this.mAllItems[tKeys[i]];
            if (tScr) {
                tScr.node.setSiblingIndex(i);
            }
        }
    },
});
