
cc.Class({
    extends: cc.Component,

    properties: {
        content: cc.Node,
        pfbItem: cc.Prefab,
    },

    ctor() {
        this.mId = null;
        this.mItems = {};
    },

    init: function (arrowId) {
        this.content.removeAllChildren();
        this.mItems = {};
        this.mId = arrowId;
        let triggers = ArrowModel.getSingle(arrowId)['triggers'];
        if (triggers && triggers.length) {
            //create items
            triggers.forEach(v => {
                this._createOne(v);
            });
        }
    },

    buttonListener: function (event) {
        let data = ArrowModel.genTrigger(this.mId);
        this._createOne(data);
    },

    _createOne: function (data) {
        let self = this;
        var item = cc.instantiate(this.pfbItem);
        item.parent = this.content;
        item.x = 0;
        var itemscr = item.getComponent(item.name);
        itemscr.init(data, (param) => { self._onModifyEvent(param) }, (param) => { self._onDeleteEvent(param); });
        this.mItems[data['id']] = itemscr;
    },

    _onModifyEvent: function (data) {
        console.log(JSON.stringify(data));
        let id = data['id'], type = data['type'], param = data['param'];
        let trigger = ArrowModel.getTrigger(this.mId, id);
        if (trigger) {
            trigger['type'] = type;
            trigger['param'] = param;
        }
    },

    _onDeleteEvent: function (id) {
        ArrowModel.delTrigger(this.mId, id);
        if (this.mItems[id]) {
            this.mItems[id].node.destroy();
            delete this.mItems[id];
        }
    },

});
