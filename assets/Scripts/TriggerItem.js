
cc.Class({
    extends: cc.Component,

    properties: {
        labName: cc.Label,
        labIntro: cc.Label,
        editbox: cc.EditBox,
        nodParam: cc.Node,
        nodCommon: cc.Node,
    },

    onEndInput: null,

    init: function (triggerData, onEvent) {
        this.onEndInput = onEvent;
        if (triggerData) {
            let triggerType = triggerData['type'];
            let param = triggerData['param'];
            if (config.TRIGGER_LIB[triggerType]) {
                var info = config.TRIGGER_LIB[triggerType];
                this.labName.string = info['name'];
                if (info['extraParam']) {
                    this.nodParam.active = true;
                    this.labIntro.string = info['intro'];
                    this.editbox.string = param;
                } else {
                    this.nodParam.active = false;
                }
            }
        } else {
            this.labName.string = 'NULL';
            this.nodParam.active = false;
        }
    },

    //TODO:

});
