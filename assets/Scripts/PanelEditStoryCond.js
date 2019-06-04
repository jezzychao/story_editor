module.exports = {
    show: function (cond, arrowId, onClose) {
        utils.loadPrefab('PanelEditStoryCond', (res) => {
            var panel = cc.instantiate(res);
            panel.parent = cc.find('Canvas');
            panel.position = cc.v2(0, 0);
            panel.getComponent(panel.name).init(cond, arrowId, onClose);
        });
    },
}


cc.Class({
    extends: cc.Component,

    properties: {
        labFilename: cc.Label,
        labStory: cc.Label,
        labCategory: cc.Label,

        nodCategories: [cc.Node],
        nodParam: cc.Node,

        togDone: cc.Toggle,
        togUndo: cc.Toggle,

        togEqual: cc.Toggle,
        togLess: cc.Toggle,
        togGreater: cc.Toggle,
        editBoxCnt: cc.EditBox,

        togOptions: [cc.Toggle],

        togOptions2: [cc.Toggle],
        togCompares: [cc.Toggle],//== < >
        editBoxCnt2: cc.EditBox,
    },

    ctor: function () {
        this.mCurrArrowId = null;
        this.mCond = null;
        this.mOnEvent = null;

        this.mLastStoryId = null;
        this.mLastFile = null;

        this.mFileName = null;
        this.mPackageId = null;
        this.mCurrCategory = null;

        this.mCategory = {
            1: '完成状态',
            2: '完成次数',
            3: '选项状态',
            4: '选项次数',
        }

        this.mOnClose = null;
    },

    init: function (condData, arrowId, onClose) {
        this.mCurrArrowId = arrowId;
        this.mCond = condData;
        this.mOnClose = onClose;
        if (this.mCond['file']) {
            this.mFileName = this.mCond['file'];
            if (this.mCond['packageId']) {
                this.mPackageId = this.mCond['packageId'];
            }
            if (this.mCond['categroy']) {
                this.mCurrCategory = this.mCond['categroy'];
                let parseFuncName = '_parseParam_' + this.mCond['categroy'];
                var data = this[parseFuncName](this.mCond['param']);
            }
        }
        this._refreshFileName();
        this._refreshSelectedStory();
        this._refreshCategory(data);
    },

    onDestroy() {
        this.mOnClose && this.mOnClose(this.mCond);
    },

    buttonListener: function (event) {
        let self = this;
        let tag = event.target;
        if (tag.name === 'BtnSelectFile') {
            self._createMenu((menu) => {
                let allFiles = FileCache.getfiles();
                for (let i = 0; i < allFiles.length; ++i) {
                    menu.addAct(allFiles[i], () => {
                        self._onSelectFile(allFiles[i]);
                    });
                }
            });
        } else if (tag.name === 'BtnSelectStory') {
            self._createMenu((menu) => {
                let allUids = FileCache.getPackagesBrief(self.mFileName);
                for (let uid in allUids) {
                    let name = `${uid}:${allUids[uid]}`;
                    menu.addAct(name, () => {
                        self._onSelectStory(uid);
                    });
                }
            });
        } else if (tag.name === 'BtnSelectType') {
            self._createMenu((menu) => {
                let data = FileCache.getPackage(self.mFileName, self.mPackageId);
                let showCategory = null;
                if (data['type'] == 2) {
                    showCategory = [1, 2];
                } else if (data['type'] == 3) {
                    showCategory = Object.keys(self.mCategory);
                }
                showCategory.forEach(k => {
                    menu.addAct(self.mCategory[k], () => {
                        self._onSelectCategory(k);
                    });
                });
            });
        } else if (tag.name === 'BtnSure') {
            if (!self._checkInput()) {
                return;
            }
            let data = self._genCondData();
            if (this.mCond['file'] && this.mCond['packageId']) {
                FileCache.decreaseReferenceCount(this.mCond['file'], this.mCond['packageId'], FileMgr.getOpened(), this.mCurrArrowId);
            }
            this._set(data);
            FileCache.incrreaseReferenceCount(this.mCond['file'], this.mCond['packageId'], FileMgr.getOpened(), this.mCurrArrowId);
            msg.send(msg.key.SAVE);
            this.node.destroy();
        } else if (tag.name === 'BtnCancel') {
            this.node.destroy();
        }
    },

    _onSelectFile: function (filename) {
        this.mFileName = filename;
        this.mPackageId = null;
        this.mCurrCategory = null;
        this._refreshFileName();
        this._refreshSelectedStory();
        this._refreshCategory();
    },

    _onSelectStory: function (packageUid) {
        this.mPackageId = packageUid;
        this.mCurrCategory = null;
        this._refreshSelectedStory();
        this._refreshCategory();
    },

    _onSelectCategory: function (categroy) {
        this.mCurrCategory = categroy;
        this._refreshCategory();
    },

    _parseParam_1: function (param) {
        let ret = {
            state: parseInt(param)
        }
        return ret;
    },

    _parseParam_2: function (param) {
        let args = param.split(',');
        let ret = {
            operator: parseInt(args[0]),//0=equal, 1=greater, -1=less
            count: parseInt(args[1]),
        }
        return ret;
    },

    _parseParam_3: function (param) {
        let ret = {
            arrowId: parseInt(param),
        }
        return ret;
    },

    _parseParam_4: function (param) {
        let args = param.split(',');
        return {
            arrowId: parseInt(args[0]),
            operator: parseInt(args[1]),
            count: parseInt(args[2]),
        };
    },

    _toStringParam: function () {
        let param = null;
        if (this.mCurrCategory == 1) {
            param = this.togDone.isChecked ? '1' : '0';
        } else if (this.mCurrCategory == 2) {
            let op = this.togEqual.isChecked ? 0 : this.togLess.isChecked ? -1 : 1;
            param = `${op},${this.editBoxCnt.string}`;
        } else if (this.mCurrCategory == 3) {
            let selected;
            this.togOptions.forEach((val) => {
                if (val.node.active) {
                    if (val.isChecked) {
                        selected = val;
                    }
                }
            });
            let option = selected.getChildByName('Lab').getComponent(cc.Label).string;
            let id = option.split(':')[0];
            param = id;
        } else if (this.mCurrCategory == 4) {
            let operator = this.togCompares[0].isChecked ? 0 : this.togCompares[1].isChecked ? -1 : 1;

            let selected;
            this.togOptions2.forEach((val) => {
                if (val.node.active) {
                    if (val.isChecked) {
                        selected = val;
                    }
                }
            });
            let option = selected.getChildByName('Lab').getComponent(cc.Label).string;
            let id = option.split(':')[0];
            param = `${id},${operator},${this.editBoxCnt2.string}`;
        }
        return param;
    },

    _refreshFileName: function () {
        this.labFilename.string = this.mFileName || 'NULL';
    },

    _refreshSelectedStory: function () {
        if (this.mPackageId) {
            let infos = FileCache.getPackagesBrief(this.mFileName);
            this.labStory.string = `${this.mPackageId}:${infos[this.mPackageId]}`;
        } else {
            this.labStory.string = 'NULL';
        }
    },

    _refreshCategory: function (data) {
        let self = this;
        if (this.mCurrCategory) {
            this.labCategory.string = this.mCategory[this.mCurrCategory];

            this.nodCategories.forEach((node, idx) => {
                node.active = idx == self.mCurrCategory - 1;
            });

            let funcName = '_refreshCategory_' + this.mCurrCategory;
            this[funcName](data);
            this.nodParam.active = true;
        } else {
            this.labCategory.string = 'NULL';
            this.nodParam.active = false;
        }
    },

    _refreshCategory_1: function (data) {
        if (!data) {
            this.togDone.isChecked = true;
            this.togUndo.isChecked = false;
        } else {
            this.togDone.isChecked = data['state'] == 1;
            this.togUndo.isChecked = data['state'] == 0;
        }
    },

    _refreshCategory_2: function (data) {
        if (!data) {
            this.togEqual.isChecked = true;
            this.togLess.isChecked = false;
            this.togGreater.isChecked = false;
            this.editBoxCnt.string = '';
        } else {
            this.togEqual.isChecked = data['operator'] == 0;
            this.togLess.isChecked = data['operator'] == -1;
            this.togGreater.isChecked = data['operator'] == 1;
            this.editBoxCnt.string = data['count'];
        }
    },

    _refreshCategory_3: function (data) {
        let vector = FileCache.getVector(this.mFileName, this.mPackageId)
        let packageData = FileCache.getPackage(this.mFileName, this.mPackageId);
        let arr = packageData['arrowIds'] || [];
        this.togOptions.forEach((val, idx) => {
            if (val.node.active = idx < arr.length) {
                let arrow = vector['arrows'][arr[idx]];
                let label = val.node.getChildByName('Lab').getComponent(cc.Label);
                label.string = arrow['id'] + ':' + arrow['text'];
                if (data) {
                    val.isChecked = data['arrowId'] == arrow['id'];
                } else {
                    val.isChecked = idx == 0;
                }
            }
        });
    },

    _refreshCategory_4: function (data) {
        if (!data) {
            this.togCompares.forEach(tog => { tog.isChecked = false; });
            this.togCompares[0].isChecked = true;
            this.editBoxCnt2.string = '';
        } else {
            this.togCompares[0].isChecked = data['operator'] == 0;
            this.togCompares[1].isChecked = data['operator'] == -1;
            this.togCompares[2].isChecked = data['operator'] == 1;
            this.editBoxCnt2.string = data['count'];
        }

        let vector = FileCache.getVector(this.mFileName, this.mPackageId)
        let packageData = FileCache.getPackage(this.mFileName, this.mPackageId);
        let arr = packageData['arrowIds'] || [];
        this.togOptions2.forEach((val, idx) => {
            if (val.node.active = idx < arr.length) {
                let arrow = vector['arrows'][arr[idx]];
                let label = val.node.getChildByName('Lab').getComponent(cc.Label);
                label.string = arrow['id'] + ':' + arrow['text'];
                if (data) {
                    val.isChecked = data['arrowId'] == arrow['id'];
                } else {
                    val.isChecked = idx == 0;
                }
            }
        });
    },

    _createMenu: function (cb) {
        let self = this;
        require('Menu').CreateMenu((menu) => {
            let worldPos = self.node.convertToWorldSpaceAR(cc.v2(0, 0));
            menu.setPosition(worldPos);
            cb && cb(menu);
        });
    },

    _checkInput: function () {
        let errmsg = '';
        if (!this.mFileName) {
            errmsg += '没有选定剧情文件\n';
        }
        if (!this.mPackageId) {
            errmsg += '没有选定剧情包\n';
        }
        if (!this.mCurrCategory) {
            errmsg += '没有选定判定类型\n';
        }
        if (this.mCurrCategory == 2) {
            if (!this.editBoxCnt.string) {
                errmsg += '没有输入比较数量\n';
            } else {
                try {
                    parseInt(this.editBoxCnt.string);
                } catch (err) {
                    errmsg += '输入的比较数量无效\n';
                }
            }
        }

        if (this.mCurrCategory == 4) {
            if (!this.editBoxCnt2.string) {
                errmsg += '没有输入比较数量\n';
            } else {
                try {
                    parseInt(this.editBoxCnt2.string);
                } catch (err) {
                    errmsg += '输入的比较数量无效\n';
                }
            }
        }

        if (errmsg) {
            require('PanelTips').showTips(errmsg);
            return false;
        }
        return true;
    },

    _genCondData: function () {
        let tCond = {};
        tCond['file'] = this.mFileName;
        tCond['packageId'] = this.mPackageId;
        tCond['categroy'] = this.mCurrCategory;
        tCond['param'] = this._toStringParam();
        return tCond;
    },

    _set: function (target) {
        this.mCond['file'] = target['file'];
        this.mCond['packageId'] = target['packageId'];
        this.mCond['categroy'] = target['categroy'];
        this.mCond['param'] = target['param'];
    },
});
