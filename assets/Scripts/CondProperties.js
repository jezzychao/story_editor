
cc.Class({
    extends: cc.Component,

    properties: {
        pfbJointItem: cc.Prefab,
        pfbStoryCondItem: cc.Prefab,
        pfbExtraCondItem: cc.Prefab,

        content: cc.Node,
    },

    ctor() {
        this.mArrowId = null;
        this.mCompoundCond = null;
        this.mAllItems = null;
        this.mKey = null;
    },

    init: function (arrowId, key) {
        this.content.removeAllChildren();
        this.mAllItems = [];
        this.mKey = key;
        this.mArrowId = arrowId;
        var arrowData = ArrowModel.getSingle(arrowId);
        this.mCompoundCond = arrowData[key] || [];
        console.log(JSON.stringify(this.mCompoundCond));
        for (let i = 0; i < this.mCompoundCond.length; ++i) {
            let val = this.mCompoundCond[i];
            if (val === '&' || val === '|') {
                this._createJoint(val);
            } else {
                this._createCond(ArrowModel.getSubCond(this.mArrowId, val));
            }
        }
    },

    buttonListener: function (event) {
        let self = this;
        let tag = event.target;
        if (tag.name === 'BtnAddCondStory') {
            this._addCond(2);
        } else if (tag.name === 'BtnAddCondExtra') {
            this._addCond(1);
        }
    },

    _addCond: function (type) {
        let cond = ArrowModel.genSubCond(this.mArrowId, type);
        if (this.mAllItems.length) {
            this._createJoint('&');
        }
        this._createCond(cond);
    },

    _createCond: function (cond) {
        console.log('createcond: ' + JSON.stringify(cond));
        if (cond['type'] == 1) {
            var item = cc.instantiate(this.pfbExtraCondItem);
        } else if (cond['type'] == 2) {
            var item = cc.instantiate(this.pfbStoryCondItem);
        }
        item.parent = this.content;
        item.x = 0;
        var scr = item.getComponent(item.name);
        scr.init(cond, (id) => { this._deleteCond(id); });
        this.mAllItems.push(scr);
        this._updateData();
    },

    _createJoint: function (operator) {
        var item = cc.instantiate(this.pfbJointItem);
        item.parent = this.content;
        item.x = 0;
        var scr = item.getComponent(item.name);
        scr.init(operator, () => { this._updateData(); });
        this.mAllItems.push(scr);
    },

    _updateData: function () {
        var compound = this.mAllItems.map(scr => scr.getValue());
        var arrowData = ArrowModel.getSingle(this.mArrowId);
        arrowData[this.mKey] = compound;
    },

    _deleteCond: function (condId) {
        ArrowModel.delSubCond(this.mArrowId, condId);
        let index = this.mAllItems.findIndex(v => v.getValue() == condId);
        if (index != -1) {
            let jointIndex = index == 0 ? 1 : index - 1;
            if (jointIndex >= 0 && this.mAllItems.length > jointIndex) {
                var joint = this.mAllItems[jointIndex];
                joint.node.destroy();
                this.mAllItems.splice(jointIndex, 1);
            }
            let newidx = this.mAllItems.findIndex(v => v.getValue() == condId);
            this.mAllItems[newidx].node.destroy();
            this.mAllItems.splice(newidx, 1);
            this._updateData();
        }
    },
});