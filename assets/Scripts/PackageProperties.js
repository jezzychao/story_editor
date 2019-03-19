
cc.Class({
    extends: cc.Component,

    properties: {
        nodPool: cc.Node,

        optionToggle: cc.Toggle,
        btnAdd: cc.Button,
        pfbStoryItem: cc.Prefab,
        storyContent: cc.Node,

    },

    ctor() {
        this.mPackageData = null;
        this.mCurrSelectedStoryId = null;

        this.mPoolItems = [];
        this.mAllItems = {};
    },

    onLoad() {
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
        if (tag.name === 'btnAddStory') {
            let newDialog = DialogModel.createNew();
            this._createItem(newDialog['id']);
            this._onItemClick(newDialog['id']);
        }
    },

    _init: function () {
        this.mPackageData = null;
        this.mCurrSelectedStoryId = null;
        this.node.active = false;
    },

    _uninit: function () {
        this.mPackageData = null;
        this.mCurrSelectedStoryId = null;
        this.node.active = false;
        this._removeAllItems();
    },

    _refreshAll: function (uid) {
        this.mPackageData = PackageModel.getSingle(uid);
        this._refreshStoryItems();
        this._refreshStoryDetail();
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
        //TODO:refresh detail;
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
            (dir) => { this._onMoveItem(dir); },
            (id) => { this._onDelItem(id); }
        );
        item.show();
        this.mAllItems[id] = item;
    },

    _onItemClick: function (id) {
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

    _onMoveItem: function (direction) {

    },

    _onDelItem: function(id){

    },
});
