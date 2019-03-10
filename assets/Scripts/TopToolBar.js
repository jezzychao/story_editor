
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
        utils.loadPrefab("FileItem", (res) => {
            let item = cc.instantiate(res);
            item.parent = cc.find('Canvas/FileList/view/content');
            item.x = 0;
            //TODO: 更新所有界面显示，将新建项作为选中项
        });
    },

    // update (dt) {},
});
