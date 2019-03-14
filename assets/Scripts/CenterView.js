
const OperationState = {
    'NONE': 0,
    'START_LINK': 1,

};

window.OPERATE_STATE = {
    'NONE': 0,
    'START_LINK': 1,
}

window.CURR_STATE = OPERATE_STATE.NONE;

cc.Class({
    extends: cc.Component,

    properties: {
        scrollview: cc.ScrollView,
        content: cc.Node,

        pfbRectItem: cc.Prefab,
        pfbArrowItem: cc.Prefab,

        nodRectRoot: cc.Node,
        nodArrowRoot: cc.Node,
        nodPool: cc.Node,
    },

    ctor() {
        this.mPoolRects = [];

        this.mAllRects = {};//uid 2 rectitem
    },

    onLoad() {
        this.scrollview.enabled = false;
        this.content.position = cc.v2(0, 0);

        msg.register(this, msg.key.UI_DISABLE_CENTER_VIEW_MOVE, (tag, key, param) => { this.scrollview.enabled = !param; }, this);
        msg.register(this, msg.key.UI_REFRESH_All_RECT, (tag, key, param) => { this._refreshAllRects(param); }, this);
    },

    onDestroy() {
        msg.cancelAll(this);
    },

    start() {

    },

    _refreshAllRects: function (model) {
        let self = this;
        if (!model) {
            let uids = Object.keys(model);
            uids.forEach(uid => {
                self._removeARect(uid);
            })
        } else {
            for (let uid in model) {
                let rectData = model;
                let pos = utils.convertToV2(rectData['pos']);
                self._createARect(uid, pos, rectData['remark']);
            }
        }
    },

    _removeARect: function (uid) {
        let rectItem = this.mAllRects[uid];
        if (rectItem) {
            rectItem.hide();
            rectItem.parent = this.nodPool;
            this.mPoolRects.push(rectItem);
            delete this.mAllRects[uid];
        }
    },

    _createARect: function (uid, position, remark) {
        if (this.mPoolRects.length) {
            var rectItem = this.mPoolRects.shift();
        } else {
            var node = cc.instantiate(this.pfbRectItem);
            var rectItem = node.getComponent(node.name);

        }
        rectItem.parent = this.nodRectRoot;
        rectItem.init(uid, position, remark);
        rectItem.show();
        this.mAllRects[uid] = rectItem;
    }
});
