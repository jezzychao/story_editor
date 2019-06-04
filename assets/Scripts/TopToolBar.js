
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

        var nodBtnPublish = this.node.getChildByName("BtnPublish");
        nodBtnPublish.on(cc.Node.EventType.TOUCH_END, this._onBtnPubloshClick);
    },

    start() {

    },

    _onBtnNewClick: function (event) {
        msg.send(msg.key.CREATE_A_FILE);
    },

    _onBtnSaveClick: function (event) {
        msg.send(msg.key.SAVE);
    },

    _onBtnPubloshClick: function (event) {
        let tCurrFile = FileMgr.getOpened();
        if (tCurrFile) {
            DataCompression.HandleStoryFile.start(tCurrFile);
        }
        DataCompression.HandleConfig.start();
    },
});
