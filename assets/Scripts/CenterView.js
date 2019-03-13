
cc.Class({
    extends: cc.Component,

    properties: {
        scrollview: cc.ScrollView,
        content: cc.Node,

        testArrow: require("ArrowItem"),
        testRect1: require("RectItem"),
        testRect2: require("RectItem"),
    },

    onLoad() {
        this.scrollview.enabled = false;
        this.content.position = cc.v2(0, 0);

        msg.register(this, msg.key.UI_DISABLE_CENTER_VIEW_MOVE, (tag, key, param) => { this.scrollview.enabled = !param; }, this);
    },

    onDestroy() {
        msg.cancelAll(this);
    },

    start() {
        this.testArrow.init(this.testRect1, this.testRect2);
        this.testRect1.attachArrow(this.testArrow);
        this.testRect2.attachArrow(this.testArrow);
    },
});
