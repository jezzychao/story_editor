
cc.Class({
    extends: cc.Component,

    properties: {

    },

    onLoad() {
        this.Label = this.node.getChildByName('Label').getComponent(cc.Label);
        this.EditBox = this.node.getChildByName('InputName').getComponent(cc.EditBox);
        this.node.on(cc.Node.EventType.MOUSE_DOWN, (event) => { this._onMouseClick(event); });
    },

    init: function (uid, remark) {
        this.mUid = uid;
        this.setRemark(remark);
    },

    markAsOpened: function (isOpened) {
        this.node.color = isOpened ? cc.Color.YELLOW : cc.Color.WHITE;
    },

    setRemark: function (name) {
        this.Label.string = name;
    },

    getRemark: function () {
        return this.Label.string;
    },

    _onMouseClick: function (event) {
        let self = this;
        let mouseType = event.getButton();
        if (mouseType == 1) {//cc.Event.EventMouse.BUTTON_RIGHT
            console.log('click mouse right button');
            require('Menu').CreateMenu((menu) => {
                let worldPos = self.node.convertToWorldSpaceAR(cc.v2(0, 0));
                menu.setPosition(worldPos);
                menu.addAct("打开", () => {
                    msg.send(msg.key.OPEN_A_PLOT_VEC, this.mUid);
                });
                menu.addAct("备注名", () => {
                    self._rename();
                });
                menu.addAct("删除", () => {
                    msg.send(msg.key.REMOVE_A_PLOT_VEC, this.mUid);
                });
            });
        }
    },

    _rename: function () {
        this.Label.node.active = false;
        this.EditBox.node.active = true;

        this.EditBox.string = this.Label.string;
        this.EditBox.node.targetOff(this);
        this.EditBox.node.on('editing-did-ended', (event) => {
            this.Label.node.active = true;
            this.EditBox.node.active = false;
            msg.send(msg.key.SET_MARK_A_PLOT_VEC, { uid: this.mUid, remark: this.EditBox.string });
        }, this);
    },
});
