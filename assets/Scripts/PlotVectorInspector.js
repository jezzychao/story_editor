
cc.Class({
    extends: cc.Component,

    properties: {
        fileItem: cc.Prefab,
        nodContainer: cc.Node,
    },

    ctor() {
        this.mAllItems = {};
        this.mOpenedUid = null;
    },

    onLoad() {
        msg.register(this, msg.key.UI_OPEN_THE_PLOT_VEC, (tag, key, param) => { this._openAPlot(param); }, this);
        msg.register(this, msg.key.UI_MARK_THE_PLOT_VEC, (tag, key, param) => { this._updateMark(param); }, this);
        msg.register(this, msg.key.UI_UPDATE_PLOT_VEC_INSPECTOR, (tag, key, param) => { this._updateList(param); }, this);
        msg.register(this, msg.key.UI_ADD_A_PLOT_VEC, (tag, key, param) => { this._createOneItem(param); }, this);
        msg.register(this, msg.key.UI_DEL_A_PLOT_VEC, (tag, key, param) => { this._deleteOneItem(param); }, this);
    },

    onDestroy() {
        msg.cancelAll(this);
    },

    _init: function (plotData) {
        this.node.targetOff(this);
        this.node.on(cc.Node.EventType.MOUSE_DOWN, (event) => { this._onMouseClick(event); }, this);
    },

    _openAPlot: function (uid) {
        if (this.mOpenedUid) {
            this.mAllItems[this.mOpenedUid].markAsOpened(false);
        }
        this.mAllItems[uid].markAsOpened(true);
        this.mOpenedUid = uid;
    },

    _updateMark: function (param) {
        let uid = param['uid'], remark = param['remark'];
        this.mAllItems[uid].setRemark(remark);
    },

    _updateList: function (param) {
        if (!param) {
            this.node.targetOff(this);
            if (this.nodContainer.children.length) {
                this.nodContainer.removeAllChildren();
            }
            this.mAllItems = {};
            this.mOpenedUid = null;
            return;
        }

        this._init();

        let opened = param['opened'], list = param['list'];
        if (this.nodContainer.children.length) {
            this.nodContainer.removeAllChildren();
        }
        this.mAllItems = {};
        this.mOpenedUid = opened;
        for (let uid in list) {
            let remark = list[uid];
            this._createOneItem({ uid: uid, remark: remark });
            if (uid == opened) {
                this.mAllItems[uid].markAsOpened(true);
            }
        }
    },

    _createOneItem: function (param) {
        let uid = param['uid'], remark = param['remark'];
        let node = cc.instantiate(this.fileItem);
        this.nodContainer.addChild(node);
        node.x = 0;
        let item = node.addComponent('PlotItem');
        item.init(uid, remark);
        this.mAllItems[uid] = item;
    },

    _deleteOneItem: function (uid) {
        if (this.mAllItems[uid]) {
            if (this.mOpenedUid == uid) {
                this.mOpenedUid = null;
            }
            this.mAllItems[uid].node.destroy();
            delete this.mAllItems[uid];
            return true;
        } else {
            return false;
        }
    },

    _onMouseClick: function (event) {
        let self = this;
        console.log(event);
        let mouseType = event.getButton();
        if (mouseType == 1) {//cc.Event.EventMouse.BUTTON_RIGHT
            console.log('click mouse right button');
            require('Menu').CreateMenu((menu) => {
                let worldPos = self.node.convertToWorldSpaceAR(cc.v2(0, 0));
                menu.setPosition(worldPos);
                menu.addAct("新建剧情图", () => {
                    msg.send(msg.key.CREATE_A_PLOT_VEC);
                });
            });
        }
    },
});