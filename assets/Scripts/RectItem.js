
cc.Class({
    extends: cc.Component,

    properties: {

    },

    ctor() {
        this.mIsMove = false;
        this.mArrows = [];
    },

    onLoad() {
        let self = this;
        this.node.on(cc.Node.EventType.TOUCH_START, function (e) {
            msg.send(msg.key.UI_DISABLE_CENTER_VIEW_MOVE, true);
        });
        this.node.on(cc.Node.EventType.TOUCH_MOVE, function (event) {
            this.opacity = 100;
            var delta = event.touch.getDelta();
            this.x += delta.x;
            this.y += delta.y;
            self.mArrows.forEach(arrow => { arrow.follow(self.node); });
            this.mIsMove = true;
        }, this.node);
        this.node.on(cc.Node.EventType.TOUCH_END, function () {
            if (this.mIsMove) {
                this.mIsMove = false;
                this.opacity = 255;
            }
            msg.send(msg.key.UI_DISABLE_CENTER_VIEW_MOVE, false);
        }, this.node);
        this.node.on(cc.Node.EventType.MOUSE_DOWN, (event) => { this._onMouseClick(event); });
    },

    attachArrow: function (arrow) {
        let index = this.mArrows.findIndex(v => v.__instanceId == arrow.__instanceId);
        if (index == -1) {
            this.mArrows.push(arrow);
        }else{
            console.error(`already exist arrow`)
        }
    },

    detachArrow: function (arrow) {
        let index = this.mArrows.findIndex(v => v.__instanceId == arrow.__instanceId);
        if (index != -1) {
            this.mArrows.splice(i, 1);
        }
    },

    _onMouseClick: function (event) {
        let self = this;
        let mouseType = event.getButton();
        if (mouseType == 0) {//cc.Event.EventMouse.BUTTON_LEFT
            console.log('click mouse left button');
            console.log('refresh right inspector');
            self.onBtnLeftClick();
            msg.send(msg.key.UI_SWITCH_TO_PACKAGE_INSPECTOR_AND_REFRESH);
        } else if (mouseType == 1) {//cc.Event.EventMouse.BUTTON_RIGHT
            console.log('click mouse right button');
            self.onBtnRightClick();
            require('Menu').CreateMenu((menu) => {
                let worldPos = self.node.convertToWorldSpaceAR(cc.v2(0, 0));
                menu.setPosition(worldPos);
                menu.addAct("连接到", () => {
                    msg.send(msg.key.UI_LINK_TO_OTHER_RECT);
                });
                menu.addAct("删除", () => {
                    msg.send(msg.key.REMOVE_A_RECT_ITEM);
                });
            });
        }
    },

    onBtnLeftClick: function () {

    },

    onBtnRightClick: function () {

    },
});
