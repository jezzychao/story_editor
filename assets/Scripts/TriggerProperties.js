
cc.Class({
    extends: cc.Component,

    properties: {
        content: cc.Node,
        pfbItem: cc.Prefab,
    },

    mId: null,

    init: function (arrowId) {
        this.mId = arrowId;
        let triggers = ArrowModel.getSingle(arrowId)['triggers'];
        if (triggers && triggers.length) {
            //create items
        }
    },

    buttonListener: function(event){
        //add item
        let arrow = ArrowModel.getSingle(arrowId);
        arrow['triggers'] = arrow['triggers'] || [];
        arrow['triggers'].push({})
        //TODO: gen trigger in ArrowModel
    },


});
