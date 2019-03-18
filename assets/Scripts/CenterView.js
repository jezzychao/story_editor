

window.OPERATE_STATE = {
    'NONE': 0,
    'START_LINK': 1,
}

window.CURR_STATE = OPERATE_STATE.NONE;

cc.Class({
    extends: cc.Component,

    properties: {
        scrollview: cc.ScrollView,
        pfbRectItem: cc.Prefab,
        pfbArrowItem: cc.Prefab,

        nodContent: cc.Node,
        nodRectRoot: cc.Node,
        nodArrowRoot: cc.Node,
        nodPool: cc.Node,

    },

    ctor() {
        this.mPoolRects = [];
        this.mPoolArrows = [];
        this.mAllRects = {};//uid 2 rectitem
        this.mAllArrows = {};
    },

    onLoad() {
        this.scrollview.enabled = false;
        this.nodContent.position = cc.v2(0, 0);

        msg.register(this, msg.key.UI_DISABLE_CENTER_VIEW_MOVE, (tag, key, param) => { this.scrollview.enabled = !param; }, this);
        msg.register(this, msg.key.UI_INIT_OPERATION_MOULES, (tag, key, param) => { this._init(param); }, this);
        msg.register(this, msg.key.UI_CLEAR_OPERATION_MOULES, (tag, key, param) => { this._clear(param); }, this);
        msg.register(this, msg.key.UI_CREATE_A_NEW_RECT, (tag, key, param) => {
            this._createARect(param['uid'], utils.convertToV2(param['pos']), param['remark']);
        }, this);
        msg.register(this, msg.key.UI_DRAW_LINK, (tag, key, param) => {
            this._link2Rects(param);
        }, this);
        msg.register(this, msg.key.UI_REMOVE_A_RECT, (tag, key, param) => {
            this._deleteARect(param);
        }, this);
    },

    onDestroy() {
        msg.cancelAll(this);
    },

    _init: function () {
        this.nodContent.position = cc.v2(0, 0);
        this.scrollview.enabled = true;
        this._refreshAllRects(PackageModel.getModel());
        this._refreshAllArrows(ArrowModel.getModel());
        this.node.on(cc.Node.EventType.MOUSE_DOWN, (event) => { this._onMouseClick(event); }, this);
    },

    _clear: function () {
        this.node.targetOff(this);
        this.scrollview.enabled = false;
        this._removeAllRects();
    },

    _refreshAllRects: function (model) {
        let self = this;
        console.log('refresh all rects===========================================');
        console.log(JSON.stringify(model));
        if (!model) {
            let uids = Object.keys(this.mAllRects);
            uids.forEach(uid => {
                self._removeARect(uid);
            })
        } else {
            for (let uid in model) {
                let rectData = model[uid];
                let pos = utils.convertToV2(rectData['pos']);
                self._createARect(uid, pos, rectData['remark']);
            }
        }
    },

    _removeARect: function (uid) {
        let rectItem = this.mAllRects[uid];
        if (rectItem) {
            rectItem.hide();
            rectItem.node.parent = this.nodPool;
            this.mPoolRects.push(rectItem);
            delete this.mAllRects[uid];
        }
    },

    _removeAllRects: function () {
        for (let uid in this.mAllRects) {
            this._removeARect(uid);
        }
    },

    _createARect: function (uid, position, remark) {
        if (this.mPoolRects.length) {
            var rectItem = this.mPoolRects.shift();
        } else {
            var node = cc.instantiate(this.pfbRectItem);
            var rectItem = node.getComponent(node.name);
        }
        rectItem.node.parent = this.nodRectRoot;
        rectItem.init(uid, position, remark);
        rectItem.show();
        this.mAllRects[uid] = rectItem;
    },

    _onMouseClick: function (event) {
        if (CURR_STATE !== OPERATE_STATE.NONE) {
            return;
        }
        let self = this;
        let mouseType = event.getButton();
        if (mouseType == 1) {//cc.Event.EventMouse.BUTTON_RIGHT
            let clickpos = event.getLocation();
            console.log(`click position: ${event.getLocation()}`);
            console.log('click mouse right button');
            // let lcpos = self.nodContent.convertToNodeSpaceAR(clickpos);
            require('Menu').CreateMenu((menu) => {
                menu.setPosition(clickpos);
                menu.addAct("创建", () => {
                    let lcpos = self.nodContent.convertToNodeSpaceAR(clickpos);
                    msg.send(msg.key.CREATE_A_RECT, lcpos);
                });
            });
        }
    },

    _refreshAllArrows: function (model) {
        if (model) {
            for (let arrowId in model) {
                this._link2Rects(model[arrowId]);
            }
        }
    },

    _createAArrow: function (id, beginRect, endRect) {
        if (this.mPoolArrows.length) {
            var arrowItem = this.mPoolArrows.shift();
        } else {
            var node = cc.instantiate(this.pfbArrowItem);
            var arrowItem = node.getComponent(node.name);
        }
        arrowItem.node.parent = this.nodArrowRoot;
        arrowItem.init(id, beginRect, endRect);
        arrowItem.show();
        this.mAllArrows[id] = arrowItem;
    },

    _removeAArrow: function (id) {
        let arrowItem = this.mAllArrows[id];
        if (arrowItem) {
            arrowItem.hide();
            arrowItem.node.parent = this.nodPool;
            this.mPoolArrows.push(arrowItem);
            delete this.mAllArrows[id];
        }
    },

    _removeAllArrows: function () {
        for (let id in this.mAllArrows) {
            this._removeAArrow(id);
        }
    },

    _link2Rects: function (param) {
        var arrowId = param['id']
        var beginRect = this.mAllRects[param['begin']];
        var endRect = this.mAllRects[param['end']];
        this._createAArrow(arrowId, beginRect, endRect);
        beginRect.attachArrow(this.mAllArrows[arrowId]);
        if (endRect) {
            endRect.attachArrow(this.mAllArrows[arrowId]);
        }
    },

    _deleteARect: function (deleteInfo) {
        let self = this;
        self._removeARect(deleteInfo['rectUid']);
        if (deleteInfo['arrowIds']) {
            deleteInfo['arrowIds'].forEach(arrowId => {
                self._removeAArrow(arrowId);
            });
        }
    },
});
