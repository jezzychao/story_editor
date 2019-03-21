
cc.Class({
    extends: cc.Component,

    properties: {
        editbox: cc.EditBox,
    },

    init: function (id) {
        this.mId = id;
        let text = ArrowModel.getSingle(this.mId)['text'];
        this.editbox.string = text ? text : '';
    },

    onEndInput: function () {
        ArrowModel.getSingle(this.mId)['text'] = this.editbox.string;
    }

});
