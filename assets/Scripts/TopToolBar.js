
cc.Class({
    extends: cc.Component,

    properties: {

    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        var nodBtnNew = this.node.getChildByName("BtnNew");
        nodBtnNew.on(cc.Node.EventType.TOUCH_END, this._onBtnNewClick);
    },

    start() {

    },

    _onBtnNewClick: function (event) {
        msg.send(msg.key.CREATE_A_FILE);
        // utils.loadPrefab("FileItem", (res) => {
        //     let item = cc.instantiate(res);
        //     item.parent = cc.find('Canvas/FileInspector/view/content');
        //     item.x = 0;
        // });
    },

    // update (dt) {},
});
