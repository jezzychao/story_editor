
cc.Class({
    extends: cc.Component,

    properties: {
        nodSelectStory: cc.Node,
        nodSelectType: cc.Node,
        nodParam: cc.Node,

        nodType1: cc.Node,
        nodType2: cc.Node,
        nodType3: cc.Node,

        togDone: cc.Toggle,
        togUndo: cc.Toggle,

        togEqual: cc.Toggle,
        togLess: cc.Toggle,
        togGreat: cc.Toggle,
        editboxNum: cc.EditBox,

        togOpA: cc.Toggle,
        togOpB: cc.Toggle,
        togOpC: cc.Toggle,
        togOpD: cc.Toggle,

        labFilename: cc.Label,
        labStory: cc.Label,
        labCategory: cc.Label,
    },

    ctor() {
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
    },

    init: function (cond, onDeleteEvent) {
        this.mCond = cond;
        this.mOnEvent = onDeleteEvent;
        //TODO: refresh
        if (this.mCond['file']) {
            this.mFileName = this.mCond['file'];
            this.labFilename.string = this.mFileName;
        }
        if (this.mCond['packageId']) {
            this.mPackageId = this.mCond['packageId'];
            let infos = FileCache.getPackagesBrief(this.mFileName);
            this.labStory.string = `${this.mPackageId}:${infos[this.mPackageId]}`;
        }
        if (this.mCond['categroy']) {
            let t = this.mCond['category'];
            this.mCurrCategory = t;
            this.labCategory.string = this.mCategory[t];
            if (t == 1) {
                this.togDone.isChecked = this.mCond['param'] == 1;
                this.togUndo.isChecked = this.mCond['param'] == 0;
            } else if (t == 2) {
                
            } else if (t == 3) {

            } else if (t == 4) {

            }
        }
    },

    getValue: function () {
        return this.mCond['id'];
    },

    onDeleteBtnClick: function () {
        this.mOnEvent && this.mOnEvent(this.mCond['id']);
    },

    onBtnSelectFileClick: function (event) {
        let self = this;
        require('Menu').CreateMenu((menu) => {
            let worldPos = self.node.convertToWorldSpaceAR(cc.v2(0, 0));
            menu.setPosition(worldPos);
            let allFiles = FileCache.getfiles();
            for (let i = 0; i < allFiles.length; ++i) {
                menu.addAct(allFiles[i], () => {
                    self._onSelectFile(allFiles[i]);
                });
            }
        });
    },

    onBtnSelectStory: function () {
        let self = this;
        require('Menu').CreateMenu((menu) => {
            let worldPos = self.node.convertToWorldSpaceAR(cc.v2(0, 0));
            menu.setPosition(worldPos);
            let allUids = FileCache.getPackagesBrief(self.mFileName);
            for (let uid in allUids) {
                let name = `${uid}:${allUids[uid]}`;
                menu.addAct(name, () => {
                    self._onSelectStory(uid, name);
                });
            }
        });
    },

    onBtnSelectType: function (event) {
        let self = this;
        require('Menu').CreateMenu((menu) => {
            let worldPos = self.node.convertToWorldSpaceAR(cc.v2(0, 0));
            menu.setPosition(worldPos);

            let data = FileCache.getPackage(this.mFileName, this.mPackageId);
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
    },

    onBtnSaveClick: function (event) {
        //先递减原先被引用的剧情包计数
        if (this.mCond['file'] && this.mCond['packageId']) {
            if (this.mCond['file'] != FileMgr.getOpened()) {
                let data = FileCache.getPackage(this.mCond['file'], this.mCond['packageId']);
                if (data['isGlobal']) {
                    --data['isGlobal'];
                    FileCache.savedata(this.mCond['file']);
                }
            }
        }

        //递增被引用的剧情包计数
        if (this.mFileName != FileMgr.getOpened()) {
            let data = FileCache.getPackage(this.mFileName, this.mPackageId);
            data['isGlobal'] = (data['isGlobal'] || 0) + 1;
            FileCache.savedata(this.mFileName);
        }

        this.mCond['packageId'] = this.mPackageId;
        this.mCond['file'] = this.mFileName;
        this.mCond['param'] = this._compoundParam();
        this.mCond['category'] = this.mCurrCategory;
    },

    _onSelectFile: function (filename) {
        this.mFileName = filename;
        this.labFilename.string = filename;
        this.nodSelectStory.active = true;
        this.nodSelectType.active = false;
        this.nodParam.active = false;
    },

    _onSelectStory: function (packageUid, info) {
        this.mPackageId = packageUid;
        this.labStory.string = info;
        this.nodSelectType.active = true;
        this.nodParam.active = false;
    },

    _onSelectCategory: function (category) {
        this.mCurrCategory = category;
        this.nodParam.active = true;
        this.nodType1.active = false;
        this.nodType2.active = false;
        this.nodType3.active = false;
        if (category == 1) {
            this.nodType1.active = true;
            this.togDone.isChecked = true;
            this.togUndo.isChecked = false;
        } else if (category == 2) {
            this.nodType3.active = true;
            this._resetType3();
        } else if (category == 3) {
            this.nodType2.active = true;
            this._resetType2();
        } else if (category == 4) {
            this.nodType2.active = true;
            this.nodType3.active = true;
            this._resetType2();
            this._resetType3();
        }
    },

    _resetType1: function () {
        this.togDone.isChecked = true;
        this.togUndo.isChecked = false;
    },

    _resetType2: function () {
        this.togOpA.isChecked = true;
        this.togOpB.isChecked = false;
        this.togOpC.isChecked = false;
        this.togOpD.isChecked = false;

        let ops = [this.togOpA, this.togOpB, this.togOpC, this.togOpD];
        let vector = FileCache.getVector(this.mFileName, this.mPackageId)
        let data = FileCache.getPackage(this.mFileName, this.mPackageId);
        let arr = data['arrowIds'] || [];
        ops.forEach((val, idx) => {
            if (val.node.active = idx < arr.length) {
                let arrow = vector['arrows'][arr[idx]];
                let label = val.node.getChildByName('Lab').getComponent(cc.Label);
                label.string = arrow['id'] + ':' + arrow['text'];
            }
        })
    },

    _resetType3: function () {
        this.togEqual.isChecked = true;
        this.togGreat.isChecked = false;
        this.togLess.isChecked = false;
        this.editboxNum.string = '';
    },

    _getParamType2: function () {
        let op = 0;
        if (this.togEqual.isChecked) {
            op = 0;
        } else if (this.togLess.isChecked) {
            op = -1;
        } else if (this.togGreat.isChecked) {
            op = 1;
        }
        return `${op},${this.editboxNum.string}`;
    },

    _getParamType3: function () {
        let ops = [this.togOpA, this.togOpB, this.togOpC, this.togOpD];
        let selected;
        ops.forEach((val, idx) => {
            if (val.node.active) {
                if (val.isChecked) {
                    selected = val;
                }
            }
        });
        let option = selected.getChildByName('Lab').getComponent(cc.Label).string;
        let id = option.split(':')[0];
        return `${id}`;
    },

    _compoundParam: function () {
        let param;
        if (this.mCategory == 1) {
            param = this.togDone.isChecked ? 1 : 0;
        } else if (this.mCategory == 2) {
            param = this._getParamType2();
        } else if (this.mCategory == 3) {
            param = this._getParamType3();
        } else if (this.mCategory == 4) {
            let optionId = this._getParamType3();
            let operation = this._getParamType2();
            param = `${optionId},${operation}`;
        }
        return param;
    }

});
