
cc.Class({
    extends: cc.Component,

    properties: {
        scrollview: cc.ScrollView,
        content: cc.Node,
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

    },
});
