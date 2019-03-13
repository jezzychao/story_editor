
cc.Class({
    extends: cc.Component,

    properties: {

    },

    onLoad() {
        this.Label = this.node.getChildByName('Label').getComponent(cc.Label);
        this.EditBox = this.node.getChildByName('InputName').getComponent(cc.EditBox);

        this.setFileName('null');
        this.node.on(cc.Node.EventType.MOUSE_DOWN, (event) => { this._onMouseClick(event); });
    },

    onDestroy() {
        // msg.cancelAll(this);
    },

    _onMouseClick: function (event) {
        let self = this;
        let mouseType = event.getButton();
        if (mouseType == 0) {//cc.Event.EventMouse.BUTTON_LEFT
            console.log('click mouse left button');
            // msg.send(msg.key.OPEN_THE_FILE, self.getFileName());
        } else if (mouseType == 1) {//cc.Event.EventMouse.BUTTON_RIGHT
            console.log('click mouse right button');
            require('Menu').CreateMenu((menu) => {
                let worldPos = self.node.convertToWorldSpaceAR(cc.v2(0, 0));
                menu.setPosition(worldPos);
                menu.addAct("打开", () => {
                    msg.send(msg.key.OPEN_THE_FILE, self.getFileName());
                });
                menu.addAct("重命名", () => {
                    self._rename();
                });
                menu.addAct("删除", () => {
                    msg.send(msg.key.DELETE_THE_FILE, self.getFileName());
                });
            });
        }
    },

    _rename: function () {
        this.Label.node.active = false;
        this.EditBox.node.active = true;

        var originalName = this.Label.string;
        this.EditBox.string = this.Label.string;
        this.EditBox.node.targetOff(this);
        this.EditBox.node.on('editing-did-ended', (event) => {
            this.Label.node.active = true;
            this.EditBox.node.active = false;
            msg.send(msg.key.RENAME_THE_FILE, { old: originalName, new: this.EditBox.string });
        }, this);
    },

    markColor: function (isOpened) {
        this.node.color = isOpened ? cc.Color.BLUE : cc.Color.WHITE;
    },

    setFileName: function (name) {
        this.Label.string = name;
    },

    getFileName: function () {
        return this.Label.string;
    }

});
