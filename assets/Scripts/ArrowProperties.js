module.exports.getCurrArrowId = function () {
    return cc.find('Canvas/ArrowProperties').getComponent('ArrowProperties').getId();
}
cc.Class({
    extends: cc.Component,

    properties: {
        nodTriggerPro: cc.Node,
        nodTextPro: cc.Node,
        nodCondPro_0: cc.Node,
        nodCondPro_1: cc.Node,

        btnTabs: [cc.Button],
    },

    ctor() {
        this.mId = null;
    },

    onLoad() {
        this.node.active = false;
        msg.register(this, msg.key.UI_INIT_OPERATION_MOULES, (tag, key, param) => { this._init(param); }, this);
        msg.register(this, msg.key.UI_CLEAR_OPERATION_MOULES, (tag, key, param) => { this._uninit(param); }, this);

        msg.register(this, msg.key.UI_SWITCH_TO_PACKAGE_INSPECTOR_AND_REFRESH, (tag, key, param) => { this.node.active = false; }, this);
        msg.register(this, msg.key.UI_SWITCH_TO_ARROW_INSPECTOR_AND_REFRESH, (tag, key, param) => { this._updateAll(param); }, this);
    },

    onDestroy() {
        msg.cancelAll(this);
    },

    getId: function () {
        return this.mId;
    },

    

    _init: function () {
        this.mId = null;
        this.node.active = false;
    },

    _uninit: function () {
        this._init();
    },

    _updateAll: function (id) {
        this.mId = id;
        let data = ArrowModel.getSingle(id);
        this.btnTabs.forEach(v => v.node.active = false);
        if (data['isOption']) {
            this._updateOptionArrow();
        } else {
            this._updateNormalArrow();
        }
        this.node.active = true;
    },

    _updateOptionArrow: function () {
        let self = this;
        let tabstrs = ['选项文本', '显示条件', '点击条件']
        this.btnTabs.forEach((v, idx) => {
            if (v.node.active = idx < 3) {
                v.node.getChildByName('Label').getComponent(cc.Label).string = tabstrs[idx];
                v.node.targetOff(self);
                v.node.on(cc.Node.EventType.TOUCH_END, (event) => {
                    self._onOptionArrowTabClick(idx);
                }, self);
            }
        });
        this._onOptionArrowTabClick(0);

        this.nodTriggerPro.active = false;

        this.nodTextPro.getComponent(this.nodTextPro.name).init(this.mId);
        this.nodCondPro_0.getComponent('CondProperties').init(this.mId, 'displaycond');
        this.nodCondPro_1.getComponent('CondProperties').init(this.mId, 'activecond');
    },

    _updateNormalArrow: function () {
        let self = this;
        let tabstrs = ['条件', '触发器']
        this.btnTabs.forEach((v, idx) => {
            if (v.node.active = idx < 2) {
                v.node.getChildByName('Label').getComponent(cc.Label).string = tabstrs[idx];
                v.node.targetOff(self);
                v.node.on(cc.Node.EventType.TOUCH_END, (event) => {
                    self._onNormalArrowTabClick(idx);
                }, self);
            }
        });
        this._onNormalArrowTabClick(0);

        this.nodTextPro.active = false;
        this.nodCondPro_1.active = false;

        this.nodTriggerPro.getComponent(this.nodTriggerPro.name).init(this.mId);
        this.nodCondPro_0.getComponent('CondProperties').init(this.mId, 'cond');
    },

    _onOptionArrowTabClick: function (idx) {
        this.nodTextPro.active = idx == 0;
        this.nodCondPro_0.active = idx == 1;
        this.nodCondPro_1.active = idx == 2;
        this.btnTabs.forEach((btn, index) => {
            if (btn.node.active) {
                btn.node.color = idx == index ? cc.Color.YELLOW : cc.Color.GRAY;
            }
        });
    },

    _onNormalArrowTabClick: function (idx) {
        this.nodCondPro_0.active = idx == 0;
        this.nodTriggerPro.active = idx == 1;
        this.btnTabs.forEach((btn, index) => {
            if (btn.node.active) {
                btn.node.color = idx == index ? cc.Color.YELLOW : cc.Color.GRAY;
            }
        });
    },
});
