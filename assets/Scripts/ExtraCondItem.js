
cc.Class({
    extends: cc.Component,

    properties: {

    },

    ctor() {
        this.mCond = null;
        this.mOnEvent = null;
    },

    init: function (cond, onDeleteEvent) {
        this.mCond = cond;
        this.mOnEvent = onDeleteEvent;
        //TODO: refresh
    },

    getValue: function () {
        return this.mCond['id'];
    },

    onDeleteBtnClick: function () {
        this.mOnEvent && this.mOnEvent(this.mCond['id']);
    },
});
