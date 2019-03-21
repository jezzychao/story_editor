
cc.Class({
    extends: cc.Component,

    properties: {
        andToggle: cc.Toggle,
        orToggle: cc.Toggle,
    },

    ctor() {
        this.mOnEvent = null;
        this.mOperator = null;
    },

    init: function (operator, onSelectEvent) {
        this.mOperator = operator;
        this.mOnEvent = onSelectEvent;
        this.andToggle.isChecked = operator === '&';
        this.orToggle.isChecked = operator === '|';
    },

    onSelectAnd: function () {
        this.mOperator = '&';
        this.mOnEvent && this.mOnEvent();
    },

    onSelectOr: function () {
        this.mOperator = '|';
        this.mOnEvent && this.mOnEvent();
    },

    getValue: function () {
        return this.mOperator;
    }
});
