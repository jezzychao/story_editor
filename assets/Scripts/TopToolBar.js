
cc.Class({
    extends: cc.Component,

    properties: {

    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        var nodBtnNew = this.node.getChildByName("BtnNew");
        nodBtnNew.on(cc.Node.EventType.TOUCH_END, this._onBtnNewClick);

        var nodBtnNew = this.node.getChildByName("BtnSave");
        nodBtnNew.on(cc.Node.EventType.TOUCH_END, this._onBtnSaveClick);
    },

    start() {

    },

    _onBtnNewClick: function (event) {
        msg.send(msg.key.CREATE_A_FILE);
    },

    _onBtnSaveClick: function (event) {
        msg.send(msg.key.SAVE);
    },
});
