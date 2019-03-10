
cc.Class({
    extends: cc.Component,

    properties: {

    },

    onLoad() {
        // let tPath = "E:\\Projects\\cocos\\datafiles";
        // jsb.fileUtils.createDirectory(tPath);
        // cc.log("writeStringToFile:" + jsb.fileUtils.writeStringToFile('{"a":"b","c":"d"}', tPath + '\\kk.json'));

        // let josn = SysFile.getJsonFromFile("test");
        // cc.find("Canvas/LabPath").getComponent(cc.Label).string = JSON.stringify(josn);
        // josn.name = "chao";
        // SysFile.writeJsonToFile("test", { age: 1111 });
        // let json = ret.rename("test", "new-test");
        // json.name = "chao";
        // ret.writeJsonToFile("new-test", json);
        // ret.renameFile("test", "old-test");

        this.Label = this.node.getChildByName('Label').getComponent(cc.Label);
        this.EditBox = this.node.getChildByName('InputName').getComponent(cc.EditBox);

        this._setFileName('null');
        this.node.on(cc.Node.EventType.MOUSE_DOWN, (event) => { this._onMouseClick(event); });
        msg.register(key.MODIFY_FILE_NAME, (param) => { this._setFileName(param); });
    },

    onDestroy() {
        msg.cancel(key.MODIFY_FILE_NAME);
    },

    _onMouseClick: function (event) {
        let self = this;
        let mouseType = event.getButton();
        if (mouseType === cc.Event.EventMouse.BUTTON_LEFT) {
            console.log('click mouse left button');
            msg.send(key.OPEN_THE_FILE, self._getFileName());
        } else if (mouseType === cc.Event.EventMouse.BUTTON_RIGHT) {
            console.log('click mouse right button');
            require('Menu').CreateMenu((menu) => {
                let worldPos = self.node.convertToWorldSpaceAR(cc.v2(0, 0));
                menu.setPosition(worldPos);
                menu.addAct("重命名", () => {
                    self._rename();
                });
                menu.addAct("删除", () => {
                    self.node.destroy();
                    msg.send(key.DELETE_THE_FILE, self._getFileName());
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
            this.Label.string = this.EditBox.string;
            this.Label.node.active = true;
            this.EditBox.node.active = false;

            SysFile.renameFile("test", this._getFileName());

            msg.send(key.RENAME_THE_FILE, { old: originalName, new: this._getFileName() });
        }, this);
    },

    _setFileName: function (name) {
        this.Label.string = name;
    },

    _getFileName: function () {
        return this.Label.string;
    }

});
