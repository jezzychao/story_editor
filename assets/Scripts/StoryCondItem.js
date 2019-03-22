
cc.Class({
    extends: cc.Component,

    properties: {
        nodSelectStory: cc.Node,
        nodSelectType: cc.Node,
        nodParam: cc.Node,

        labFilename: cc.Label,
    },

    ctor() {
        this.mCond = null;
        this.mOnEvent = null;

        this.mJson = null;
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

    onBtnSelectFileClick: function (event) {
        let self = this;
        require('Menu').CreateMenu((menu) => {
            let worldPos = self.node.convertToWorldSpaceAR(cc.v2(0, 0));
            menu.setPosition(worldPos);
            let allFiles = FileMgr.getAllFiles();
            for (let i = 0; i < allFiles.length; ++i) {
                menu.addAct(allFiles[i], () => {
                    self._onSelectFile(allFiles[i]);
                });
            }
        });
    },

    onBtnSelectType: function(event){
        
    },

    _onSelectFile: function (filename) {
        this.mJson = FileHelper.getJsonFromFile(filename);
        if (!this.mJson) {
            console.error('read json from ' + filename + ' failurely');
            return;
        }
        this.labFilename.string = filename;
        this.nodSelectStory.active = true;
        this.nodSelectType.active = false;
        this.nodParam.active = false;
    },


});
