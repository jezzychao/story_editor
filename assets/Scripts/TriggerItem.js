
cc.Class({
    extends: cc.Component,

    properties: {
        labIndex: cc.Label,
        labName: cc.Label,
        labIntro: cc.Label,
        editbox: cc.EditBox,
        nodParam: cc.Node,
        nodCommon: cc.Node,
    },

    onDeleteEvent: null,
    onEndInput: null,
    mId: null,
    mType: null,

    init: function (triggerData, onEvent, onDelete) {
        this.mId = triggerData['id'];
        this.mType = triggerData['type'];
        this.onEndInput = onEvent;
        this.onDeleteEvent = onDelete;

        this.labIndex.string = `触发器${this.mId}号`;

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
    },

    onFinishInput: function () {
        let param = {
            id: this.mId,
            type: this.mType,
        }
        if (this.nodParam.active) {
            param['param'] = this.editbox.string;
        }
        this.onEndInput && this.onEndInput(param);
    },

    buttonListener: function (event) {
        let self = this;
        let tag = event.target;
        if (tag.name === 'BtnDel') {
            this.onDeleteEvent && this.onDeleteEvent(self.mId);
        } else if (tag.name === 'BtnSelect') {
            require('Menu').CreateMenu((menu) => {
                let worldPos = self.node.convertToWorldSpaceAR(cc.v2(0, 0));
                menu.setPosition(worldPos);
                for (let index in config.TRIGGER_LIB) {
                    let data = config.TRIGGER_LIB[index];
                    menu.addAct(data['name'], () => {
                        self.mType = index;
                        if (self.nodParam.active = data['extraParam']) {
                            self.labIntro.string = data['intro'];
                            self.editbox.string = '';
                        }
                        self.labName.string = data['name'];
                        self.onFinishInput();
                    });
                }
            });
        }
    },

});
