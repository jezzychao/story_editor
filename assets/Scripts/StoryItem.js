
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
        this.setSelected(0);
    },

    setSelected: function (state) {
        let color = state ? cc.Color.YELLOW : cc.Color.WHITE;
        this.node.color = color;
    },

    buttonListener: function (event) {
        let tag = event.target;
        if (tag.name === 'BtnSetting') {
            this._openMenu();
        } else if (tag.name === 'BtnStory') {
            this.mOnClickEvent && this.mOnClickEvent(this.mId);
        }
    },

    _openMenu: function () {
        let self = this;
        require('Menu').CreateMenu((menu) => {
            let worldPos = self.node.convertToWorldSpaceAR(cc.v2(0, 0));
            menu.setPosition(worldPos);
            menu.addAct("上移", () => {
                self._moveUp();
            });
            menu.addAct("下移", () => {
                self._moveDown();
            });
            menu.addAct("删除", () => {
                self._delete();
            });
        });
    },

    _moveUp: function () {
        this.mOnMoveEvent && this.mOnMoveEvent(this.mId, 'up');
    },

    _moveDown: function () {
        this.mOnMoveEvent && this.mOnMoveEvent(this.mId, 'down');
    },

    _delete: function () {
        this.mOnDelEvent && this.mOnDelEvent(this.mId);
    },

});
