
cc.Class({
    extends: cc.Component,

    properties: {

    },

    ctor() {
        this.mStartRect = null;
        this.mEndRect = null;


    },

    init: function (startRect, endRect) {
        if (!startRect) {
            console.error(`Start Rect Item do not exist!!!`);
            return;
        }
        this.mStartRect = startRect;
        this.mEndRect = endRect;
        this.node.position = this.mStartRect.position;
        if (this.mEndRect) {
            this._updateAngle();
            this._updateLength();
        } else {
            this.node.width = 200;
            this.node.rotation = 45;
        }
    },

    _updateLength: function () {
        if (this.mEndRect) {

        }
    },

    _updateAngle: function () {
        if (this.mEndRect) {

        }
    },

    follow: function (node) {
        if (node == this.mStartRect) {
            this.node.position = this.mStartRect.position;
        }
        this._updateAngle();
        this._updateLength();
    },



});
