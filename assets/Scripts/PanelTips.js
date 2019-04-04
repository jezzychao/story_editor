
module.exports = {
    showTips: function (msg) {
        cc.loader.loadRes('PanelTips', cc.Prefab, (err, res) => {
            var tPanel = cc.instantiate(res);
            cc.find('Canvas').addChild(tPanel);
            tPanel.position = cc.v2(0, 0);
            tPanel.getComponent(tPanel.name).init(msg);
        });
    },
}

cc.Class({
    extends: cc.Component,

    properties: {

    },

    init: function (msg) {
        let nodBtn = cc.find('BtnClose', this.node);
        let label = cc.find('Label', nodBtn).getComponent(cc.Label);
        label.string = msg;
        nodBtn.on(cc.Node.EventType.TOUCH_END, (event) => {
            this.node.destroy();
        });
    },
});
