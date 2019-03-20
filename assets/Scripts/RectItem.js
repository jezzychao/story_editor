
cc.Class({
    extends: cc.Component,

    properties: {
    },

    ctor() {
        this.mIsMove = false;
        this.mArrows = [];

        this.mUid = null;

        this.mFirstUid = null
        this.mOriginalColor = null;
    },

    onLoad() {
        // this.mOriginalColor = this.node.color;
        this.Label = this.node.getChildByName('Label').getComponent(cc.Label);
        this.EditBox = this.node.getChildByName('InputName').getComponent(cc.EditBox);

        let self = this;
        this.node.on(cc.Node.EventType.TOUCH_START, function (e) {
            if (CURR_STATE === OPERATE_STATE.START_LINK) {
                return;
            }
            msg.send(msg.key.UI_DISABLE_CENTER_VIEW_MOVE, true);
        });
        this.node.on(cc.Node.EventType.TOUCH_MOVE, function (event) {
            if (CURR_STATE === OPERATE_STATE.START_LINK) {
                return;
            }
            this.opacity = 100;
            var delta = event.touch.getDelta();
            this.x += delta.x;
            this.y += delta.y;
            self.mArrows.forEach(arrow => { arrow.follow(self.node); });
            this.mIsMove = true;
        }, this.node);
        this.node.on(cc.Node.EventType.TOUCH_END, function () {
            if (CURR_STATE === OPERATE_STATE.START_LINK) {
                return;
            }
            if (this.mIsMove) {
                this.mIsMove = false;
                this.opacity = 255;
            }
            msg.send(msg.key.UI_DISABLE_CENTER_VIEW_MOVE, false);
            msg.send(msg.key.UPDATE_THE_PACKAGE_POS, { uid: self.mUid, pos: utils.convertFromV2(self.node.position) });
        }, this.node);
        this.node.on(cc.Node.EventType.MOUSE_DOWN, (event) => { this._onMouseClick(event); });

        msg.register(this, msg.key.UI_START_LINK_TO_OTHER_RECT, (tag, key, param) => { this._onStartLink(param); }, this);
        msg.register(this, msg.key.UI_END_LINK_TO_OTHER_RECT, (tag, key, param) => { this._onEndLink(param); }, this);
    },

    init: function (uid, pos, remark) {
        this.mArrows.length = 0;
        this.mUid = uid;
        this.node.position = pos;
        this.Label.string = remark;
        console.log(`rect uid: ${uid}, pos: ${pos}`);
    },

    attachArrow: function (arrow) {
        let index = this.mArrows.findIndex(v => v.getId() == arrow.getId());

        if (index == -1) {
            this.mArrows.push(arrow);
        } else {
            console.error(`already exist arrow`)
        }
    },

    detachArrow: function (arrow) {
        let index = this.mArrows.findIndex(v => v.getId() == arrow.getId());
        if (index != -1) {
            this.mArrows.splice(index, 1);
        }
    },

    hide: function () {
        this.node.active = false;
    },

    show: function () {
        this.node.active = true;
    },

    clear: function () {
        this.mIsMove = false;
        this.mArrows.length = 0;

        this.mUid = null;

        this.mFirstUid = null
        this.mOriginalColor = null;
    },

    markAsGlobal: function(state){
        // let color = state?cc.
        //TODO:标记为全局
    },

    _onMouseClick: function (event) {
        let self = this;
        let mouseType = event.getButton();
        if (mouseType == 0) {//cc.Event.EventMouse.BUTTON_LEFT
            console.log('click mouse left button');
            console.log('refresh right inspector');
            if (CURR_STATE === OPERATE_STATE.START_LINK) {
                if (PlotVecCtrl.isCanLink(this.mFirstUid, this.mUid)) {
                    window.CURR_STATE = window.OPERATE_STATE.NONE;
                    msg.send(msg.key.UI_DISABLE_CENTER_VIEW_MOVE, false);
                    msg.send(msg.key.UI_END_LINK_TO_OTHER_RECT, { endUid: self.mUid });
                }
            } else {
                msg.send(msg.key.UI_SWITCH_TO_PACKAGE_INSPECTOR_AND_REFRESH, self.mUid);
            }
        } else if (mouseType == 1) {//cc.Event.EventMouse.BUTTON_RIGHT

            if (CURR_STATE === OPERATE_STATE.START_LINK) {
                return;
            }
            console.log('click mouse right button');
            require('Menu').CreateMenu((menu) => {
                let worldPos = self.node.convertToWorldSpaceAR(cc.v2(0, 0));
                menu.setPosition(worldPos);
                menu.addAct("连接到", () => {
                    window.CURR_STATE = window.OPERATE_STATE.START_LINK;
                    msg.send(msg.key.UI_DISABLE_CENTER_VIEW_MOVE, true);
                    msg.send(msg.key.UI_START_LINK_TO_OTHER_RECT, { rectId: self.mUid });
                });
                menu.addAct("修改备注", () => {
                    self._setRemark();
                });
                menu.addAct("删除", () => {
                    msg.send(msg.key.REMOVE_A_RECT_ITEM, self.mUid);
                });
            });
        }
    },

    _onStartLink: function (param) {
        this.mFirstUid = param['rectId'];
        this.mTempArrowId = param['arrowId'];
        this.mOriginalColor = this.node.color;
        if (PlotVecCtrl.isCanLink(this.mFirstUid, this.mUid)) {
            this._showCanLink();
        } else {
            this._showCanntLink();
        }
    },

    _onEndLink: function (param) {
        this.node.color = this.mOriginalColor;
        if (this.mUid == param['endUid']) {
            if (this.mTempArrowId) {
                //TODO: modify linker
                msg.send(msg.key.MODIFY_THE_END_OF_LINKER, { first: this.mFirstUid, second: this.mUid, arrowId: this.mTempArrowId });
            } else {
                msg.send(msg.key.CREATE_A_NEW_LINKER, { first: this.mFirstUid, second: this.mUid });
            }
        }
    },

    _setRemark: function () {
        this.Label.node.active = false;
        this.EditBox.node.active = true;
        this.EditBox.string = this.Label.string;
        this.EditBox.node.targetOff(this);
        this.EditBox.node.on('editing-did-ended', (event) => {
            this.Label.string = this.EditBox.string;
            this.Label.node.active = true;
            this.EditBox.node.active = false;
            msg.send(msg.key.UPDATE_THE_PACKAGE_REMARK, { uid: this.mUid, remark: this.Label.string });
        }, this);
    },

    _showCanLink: function () {
        this.node.color = cc.Color.YELLOW;
    },

    _showCanntLink: function () {
        this.node.color = cc.Color.GRAY;
    },
});
