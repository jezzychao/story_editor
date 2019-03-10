
module.exports = {
    CreateMenu: function (cb) {
        utils.loadPrefab("Menu", (res) => {
            let node = cc.instantiate(res);
            node.parent = cc.find('Canvas');
            let menu = node.getComponent('Menu');
            // menu.setPosition(worldPos);
            cb && cb(menu);
        });
    }
}

cc.Class({
    extends: cc.Component,

    properties: {

    },

    ctor: function () {
        this.mContainer = {};
    },

    onLoad() {
        this.BtnClose = this.node.getChildByName("BtnClose");
        this.BtnClose.on(cc.Node.EventType.TOUCH_END, (event) => { this.node.destroy(); });

        this.Actions = this.node.getChildByName('Actions');
        this.BtnAction = this.node.getChildByName('BtnAction');
        this.BtnAction.active = false;
    },

    setPosition: function (worldPos) {
        this.Actions.position = worldPos;
    },

    addAct: function (name, func) {
        if (name && func) {
            this._makeOneAction(name, func);
        } else {
            console.error('param is invalid!!!');
        }
    },

    delAct: function (name) {
        if (this.mContainer[name]) {
            this.mContainer[name].destroy();
            delete this.mContainer[name];
        }
    },

    _makeOneAction: function (name, func) {
        let node = cc.instantiate(this.BtnAction);
        node.parent = this.Actions;
        node.x = 0;
        node.children[0].getComponent(cc.Label).string = name;
        node.on(cc.Node.EventType.TOUCH_END, (event) => {
            this.node.destroy();
            func && func(event);
        });
        node.active = true;
        this.mContainer[name] = node;
        return node;
    }

});
