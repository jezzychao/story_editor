
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
        this.mStartRect = startRect.node;
        this.mEndRect = endRect.node;
        this.node.position = this.mStartRect.position;
        if (this.mEndRect) {
            this.follow(this.mStartRect);
        } else {
            this.node.width = 200;
            this.node.rotation = 45;
        }
    },

    _computeEndPos: function () {
        let p, p1 = this.mStartRect.position, p2 = this.mEndRect.position, w2 = this.mEndRect.width, h2 = this.mEndRect.height;
        if (p1.x - p2.x == 0) {
            let sign = p1.y - p2.y > 0 ? 1 : -1;
            p = cc.v2(p2.x, p2.y + sign * h2 / 2);
        } else {
            let k = (p1.y - p2.y) / (p1.x - p2.x);
            let k1 = h2 / w2, k2 = -k1;
            if (k >= k2 && k <= k1) {
                let sign = p1.x - p2.x > 0 ? 1 : -1;
                let x = p2.x + sign * w2 / 2;
                let y = p2.y + sign * k * w2 / 2;
                p = cc.v2(x, y);
            } else {
                let sign = p1.y - p2.y > 0 ? 1 : -1;
                let y = p2.y + sign * h2 / 2;
                let x = p2.x + sign * h2 / k / 2;
                p = cc.v2(x, y);
            }
        }
        return p;
    },

    follow: function (node) {
        if (node == this.mStartRect) {
            this.node.position = this.mStartRect.position;
        }
        if (this.mEndRect) {
            let startPos = this.mStartRect.position;
            let endPos = this._computeEndPos();
            let newvec = cc.v2(endPos.x - startPos.x, endPos.y - startPos.y);
            this.node.width = newvec.mag();
            this.node.rotation = -1 * newvec.signAngle(cc.v2(1, 0)) * 180 / Math.PI;
        }
    },



});
