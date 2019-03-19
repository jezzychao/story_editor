
cc.Class({
    extends: cc.Component,

    properties: {
        labText: cc.Label,
    },

    ctor: function () {
        this.mId = null;
        this.mOnClickEvent = null;
        this.mOnMoveEvent = null;
        this.mOnDelEvent = null;
    },

    init: function (id, cb1, cb2, cb3) {
        this.mId = id;
        this.mOnClickEvent = cb1;
        this.mOnMoveEvent = cb2;
        this.mOnDelEvent = cb3;
        this.labText.string = id;
    },

    show: function () {
        this.node.active = true;
    },

    hide: function () {
        this.node.active = false;
    },

    clear: function () {
        this.mId = null;
        this.mOnClickEvent = null;
        this.mOnMoveEvent = null;
        this.mOnDelEvent = null;
    },

    setSelected: function (state) {
        let color = state ? cc.Color.YELLOW : cc.Color.WHITE;
        this.node.color = color;
    },

    buttonListener: function (event) {
        let tag = event.target;
        if (tag.name === 'BtnSetting') {
            //
        } else if (tag.name === 'BtnStory') {
            
        }
    }



});
