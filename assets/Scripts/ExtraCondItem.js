
cc.Class({
    extends: cc.Component,

    properties: {
        ebRemark: cc.EditBox,
        ebCond: cc.EditBox,
    },

    ctor() {
        this.mCond = null;
        this.mOnEvent = null;
    },

    init: function (cond, onDeleteEvent) {
        this.mCond = cond;
        this.mOnEvent = onDeleteEvent;
        if (this.mCond['remark']) {
            this.ebRemark.string = this.mCond['remark'];
        }
        if (this.mCond['cond']) {
            this.ebCond.string = this.mCond['cond'];
        }
    },

    getValue: function () {
        return this.mCond['id'];
    },

    onDeleteBtnClick: function () {
        this.mOnEvent && this.mOnEvent(this.mCond['id']);
    },

    onEndInput: function () {
        if (this.ebRemark.string) {
            this.mCond['remark'] = this.ebRemark.string;
        }
        if (this.ebCond.string) {
            this.mCond['cond'] = this.ebCond.string;
        }
    },
});