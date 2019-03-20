
cc.Class({
    extends: cc.Component,

    properties: {
        nodPool: cc.Node,

        optionToggle: cc.Toggle,
        globalToggle: cc.Toggle,
        btnViewOptions: cc.Button,

        nodPartOne: cc.Node,
        nodPartTwo: cc.Node,
        nodPartThree: cc.Node,

        btnAdd: cc.Button,
        pfbStoryItem: cc.Prefab,
        storyContent: cc.Node,

        labIndex: cc.Label,
        labRole: cc.Label,
        labMusic: cc.Label,
        labSound: cc.Label,
        toggleShake: cc.Toggle,
        editboxCg: cc.EditBox,
        editboxBg: cc.EditBox,
        editboxSpd: cc.EditBox,
        editboxEvents: cc.EditBox,
        editboxText: cc.EditBox,

        // editbox
    },

    ctor() {
        this.mPackageData = null;
        this.mDialogsData = null;

        this.mCurrSelectedStoryId = null;

        this.mPoolItems = [];
        this.mAllItems = {};

        this.mIsViewingOptions = false;
        this.mIsAlreadyRefreshOps = false;
    },

    onLoad() {
        this.node.active = false;
        msg.register(this, msg.key.UI_INIT_OPERATION_MOULES, (tag, key, param) => { this._init(param); }, this);
        msg.register(this, msg.key.UI_CLEAR_OPERATION_MOULES, (tag, key, param) => { this._uninit(param); }, this);

        msg.register(this, msg.key.UI_SWITCH_TO_PACKAGE_INSPECTOR_AND_REFRESH, (tag, key, param) => { this.node.active = true; this._refreshAll(param); }, this);
        msg.register(this, msg.key.UI_SWITCH_TO_ARROW_INSPECTOR_AND_REFRESH, (tag, key, param) => { this.node.active = false; }, this);
    },

    onDestroy() {
        msg.cancelAll(this);
    },

    buttonListener: function (event) {
        let tag = event.target;
        if (tag.name === 'BtnAddStory') {
            let newDialog = DialogModel.createNew();
            this.mPackageData['dialogIds'].push(newDialog['id']);
            this._createItem(newDialog['id']);
            this._onItemClick(newDialog['id']);
        } else if (tag.name === 'BtnViewOption') {
            if (this.mIsViewingOptions) {
                this.nodPartOne.active = true;
                this.nodPartTwo.active = true;
                this.nodPartThree.active = false;
                if (!this.mIsAlreadyRefreshOps) {
                    this.mIsAlreadyRefreshOps = true;
                    this._refreshOptions();
                }
            } else {
                this.nodPartOne.active = false;
                this.nodPartTwo.active = false;
                this.nodPartThree.active = true;
            }
        }
    },

    onOptionToggle: function (event) {
        console.log(this.optionToggle.isChecked);
        //TODO: 创建选项和创建后置连接arrow
    },

    onGlobalToggle: function (event) {
        this.mPackageData['isGlobal'] = this.globalToggle.isChecked ? 1 : 0;
        let param = {
            uid: this.mPackageData['uid'],
            state: this.globalToggle.isChecked,
        };
        msg.send(msg.key.UI_MARK_AS_GLOBAL_RECT, param);
    },

    onShakeToggle: function () {
        let val = this.toggleShake.isChecked ? 1 : 0;
        this.mDialogsData[this.mCurrSelectedStoryId]['shake'] = val;
        this._refreshStoryDetail();
    },

    onClickSelect: function (event) {
        let self = this;
        let tag = event.target;
        if (tag.name === 'BtnSelectRole') {
            require('Menu').CreateMenu((menu) => {
                let worldPos = self.node.convertToWorldSpaceAR(cc.v2(0, 0));
                menu.setPosition(worldPos);
                for (let index in config.CHARACTER_LIB) {
                    let role = config.CHARACTER_LIB[index];
                    menu.addAct(role['name'], () => {
                        self.mDialogsData[self.mCurrSelectedStoryId]['role'] = parseInt(index);
                        self._refreshStoryDetail();
                    });
                }
            });
        } else if (tag.name === 'BtnSelectMusic') {
            require('Menu').CreateMenu((menu) => {
                let worldPos = self.node.convertToWorldSpaceAR(cc.v2(0, 0));
                menu.setPosition(worldPos);
                for (let index in config.MUSIC_LIB) {
                    let music = config.MUSIC_LIB[index];
                    menu.addAct(music['remark'], () => {
                        self.mDialogsData[self.mCurrSelectedStoryId]['music'] = parseInt(index);
                        self._refreshStoryDetail();
                    });
                }
            });
        } else if (tag.name === 'BtnSelectSound') {
            require('Menu').CreateMenu((menu) => {
                let worldPos = self.node.convertToWorldSpaceAR(cc.v2(0, 0));
                menu.setPosition(worldPos);
                for (let index in config.SOUND_LIB) {
                    let sound = config.SOUND_LIB[index];
                    menu.addAct(sound['remark'], () => {
                        self.mDialogsData[self.mCurrSelectedStoryId]['sound'] = parseInt(index);
                        self._refreshStoryDetail();
                    });
                }
            });
        }
    },

    onFinishInput: function () {
        let dialog = this.mDialogsData[this.mCurrSelectedStoryId];
        dialog['cg'] = this.editboxCg.string;
        dialog['bg'] = this.editboxBg.string;
        dialog['spd'] = this.editboxSpd.string;
        dialog['events'] = this.editboxEvents.string.split(';').map(v => parseInt(v));
        dialog['text'] = this.editboxText.string;
        this._refreshStoryDetail();
    },

    _init: function () {
        this.mPackageData = null;
        this.mDialogsData = null;
        this.mCurrSelectedStoryId = null;
        this.node.active = false;
    },

    _uninit: function () {
        this.mPackageData = null;
        this.mDialogsData = null;
        this.mCurrSelectedStoryId = null;
        this.mIsViewingOptions = false;
        this.mIsAlreadyRefreshOps = false;
        this.node.active = false;
        this._removeAllItems();
    },

    _refreshAll: function (uid) {
        this._uninit();

        this.mPackageData = PackageModel.getSingle(uid);
        this.mDialogsData = DialogModel.getModel();

        this.optionToggle.isChecked = this.mPackageData['type'] == 3;
        this.globalToggle.isChecked = this.mPackageData['isGlobal'] ? true : false;

        this.btnViewOptions.node.active = this.optionToggle.isChecked;
        this.mIsViewingOptions = false;
        this.mIsAlreadyRefreshOps = false;
        this.nodPartOne.active = true;
        this.nodPartTwo.active = false;
        this.nodPartThree.active = false;
        this.node.active = true;

        this._refreshBtnView();
        this._refreshStoryItems();
        this._refreshStoryDetail();
    },

    _refreshBtnView: function () {
        if (this.btnViewOptions.node.active) {
            let label = this.btnViewOptions.node.getChildByName('Label').getComponent(cc.Label);
            if (this.mIsViewingOptions) {
                label.string = "查看对话";
            } else {
                label.string = "查看选项";
            }
        }
    },

    _refreshOptions: function () {
        if (this.mPackageData['options'] && this.mPackageData['options'].length) {
            //TODO:
        }
    },

    _refreshStoryItems: function () {
        if (this.mPackageData['dialogIds']) {
            this.mPackageData['dialogIds'].forEach(id => {
                this._createItem(id);
            });
            if (this.mPackageData['dialogIds'].length) {
                this.mCurrSelectedStoryId = this.mPackageData['dialogIds'][0];
                this.mAllItems[this.mCurrSelectedStoryId].setSelected(1);
            }
        }
    },

    _refreshStoryDetail: function () {
        if (this.mCurrSelectedStoryId) {
            this.nodPartTwo.active = true;
            let dialog = this.mDialogsData[this.mCurrSelectedStoryId];
            this.labIndex.string = this.mCurrSelectedStoryId;
            this.labRole.string = dialog['role'] ? config.CHARACTER_LIB[dialog['role']]['name'] : 'NULL';
            this.labMusic.string = dialog['music'] ? config.MUSIC_LIB[dialog['music']]['music'] : 'NULL';
            this.labSound.string = dialog['sound'] ? config.SOUND_LIB[dialog['sound']]['sound'] : 'NULL';
            this.editboxBg.string = dialog['bg'] ? dialog['bg'] : '';
            this.editboxCg.string = dialog['cg'] ? dialog['cg'] : '';
            this.editboxSpd.string = dialog['spd'];
            this.editboxEvents.string = dialog['events'].length ? dialog['events'].join(';') : '';
            this.toggleShake.isChecked = dialog['shake'];
            this.editboxText.string = dialog['text'];
        } else {
            this.nodPartTwo.active = false;
        }
    },

    _removeAllItems: function () {
        for (let id in this.mAllItems) {
            this._removeItem(id);
        }
    },

    _removeItem: function (id) {
        let item = this.mAllItems[id];
        if (item) {
            item.clear();
            item.hide();
            item.node.parent = this.nodPool;
            this.mPoolItems.push(item);
            delete this.mAllItems[id];
        }
    },

    _createItem: function (id) {
        if (this.mPoolItems.length) {
            var item = this.mPoolItems.shift();
        } else {
            var node = cc.instantiate(this.pfbStoryItem);
            var item = node.getComponent(node.name);
        }
        item.node.parent = this.storyContent;
        item.node.setSiblingIndex(this.storyContent.children.length - 2);
        item.init(
            id,
            (id) => { this._onItemClick(id); },
            (id, dir) => { this._onMoveItem(id, dir); },
            (id) => { this._onDelItem(id); }
        );
        item.show();
        this.mAllItems[id] = item;
    },

    _onItemClick: function (id) {
        console.log(`click item id: ${id}`);
        if (id == this.mCurrSelectedStoryId) {
            return;
        }
        if (this.mCurrSelectedStoryId) {
            this.mAllItems[this.mCurrSelectedStoryId].setSelected(0);
        }
        this.mCurrSelectedStoryId = id;
        this.mAllItems[this.mCurrSelectedStoryId].setSelected(1);
        this._refreshStoryDetail();
    },

    _onMoveItem: function (id, direction) {
        let self = this;
        let index = this.mPackageData['dialogIds'].findIndex(v => id == v);
        let swap = function (first, second) {
            let temp = self.mPackageData['dialogIds'][first];
            self.mPackageData['dialogIds'][first] = self.mPackageData['dialogIds'][second];
            self.mPackageData['dialogIds'][second] = temp;
        }
        if (direction == 'up') {
            swap(index, index - 1 < 0 ? 0 : index - 1);
        } else if (direction == 'down') {
            let maxIndex = this.mPackageData['dialogIds'].length - 1;
            swap(index, index + 1 > maxIndex ? maxIndex : index + 1);
        }

        let currSiblingIndex = this.mAllItems[id].node.getSiblingIndex();
        let offsetIndex = direction == 'up' ? -1 : 1;
        let nextSiblingIndex = utils.clamp(currSiblingIndex + offsetIndex, 0, this.storyContent.children.length - 2);
        console.log(`curr index: ${currSiblingIndex}, next index: ${nextSiblingIndex}`);
        this.storyContent.active = false;
        this.mAllItems[id].node.setSiblingIndex(nextSiblingIndex);
        this.storyContent.active = true;
    },

    _onDelItem: function (id) {
        let index = this.mPackageData['dialogIds'].findIndex(v => v == id);
        if (index == -1) {
            return;
        }
        this.mPackageData['dialogIds'].splice(index, 1);
        delete this.mDialogsData[id];

        if (id == this.mCurrSelectedStoryId) {
            this.mCurrSelectedStoryId = null;
            this._refreshStoryDetail();
        }
        this._removeItem(id);
    },
});
