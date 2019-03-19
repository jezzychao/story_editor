
cc.Class({
    extends: cc.Component,

    properties: {

    },

    ctor() {
        this.mId = null;
        this.mStartRect = null;
        this.mEndRect = null;
    },

    onLoad() {
        this.node.on(cc.Node.EventType.MOUSE_DOWN, (event) => { this._onMouseClick(event); });
    },

    init: function (id, startRect, endRect) {
        this.mId = id;
        if (!startRect) {
            console.error(`Start Rect Item do not exist!!!`);
            return;
        }
        this.mStartRect = startRect.node;
        if (endRect) {
            this.mEndRect = endRect.node;
        }
        this.node.position = this.mStartRect.position;
        if (this.mEndRect) {
            this.follow(this.mStartRect);
        } else {
            this.node.width = 200;
            this.node.rotation = 45;
        }
    },

    // setBegin: function(){

    // },
    hide: function () {
        this.node.active = false;
    },

    getId: function(){
        return this.mId;
    },

    show: function () {
        this.node.active = true;
    },

    clear: function () {
        this.mId = null;
        this.mStartRect = null;
        this.mEndRect = null;
    },

    setEnd: function (endRect) {
        if (endRect) {
            this.mEndRect = endRect.node;
            this.follow(this.mStartRect);
        } else {
            this.mEndRect = null;
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

    _onMouseClick: function (event) {
        let self = this;
        if (CURR_STATE === OPERATE_STATE.START_LINK) {
            return;
        }
        let mouseType = event.getButton();
        if (mouseType == 0) {//cc.Event.EventMouse.BUTTON_LEFT
            msg.send(msg.key.UI_SWITCH_TO_ARROW_INSPECTOR_AND_REFRESH, this.mId);
        } else if (mouseType == 1) {//cc.Event.EventMouse.BUTTON_RIGHT

            console.log('click mouse right button');
            require('Menu').CreateMenu((menu) => {
                let clickpos = event.getLocation();
                menu.setPosition(clickpos);
                menu.addAct("重新连接", () => {
                    CURR_STATE = OPERATE_STATE.START_LINK;
                    msg.send(msg.key.UI_DISABLE_CENTER_VIEW_MOVE, true);
                    let rectId = ArrowModel.getSingle(this.mId)['begin'];
                    let param = { rectId: rectId, arrowId: self.mId };
                    msg.send(msg.key.UI_START_LINK_TO_OTHER_RECT, param);
                });
                menu.addAct("删除", () => {
                    msg.send(msg.key.REMOVE_A_ARROW_ITEM, self.mId);
                });
            });
        }
    },




});
