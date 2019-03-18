
var PlotVecCtrl = {

    init: function () {
        msg.register('PlotVecCtrl', msg.key.CREATE_A_NEW_LINKER, (tag, key, param) => { this._createLink(param['first'], param['second']); }, this);
        msg.register('PlotVecCtrl', msg.key.REMOVE_A_RECT_ITEM, (tag, key, param) => { this._removeARect(param); }, this);
    },

    uninit: function () {
        msg.cancelAll('PlotVecCtrl');
    },

    isCanLink: function (firstUid, secondUid) {
        if (firstUid == secondUid || secondUid == PackageModel.getBeginUid()) {
            return false;
        }
        //TODO: 直接前置的 rect 不可再次连接
        return true;
    },

    _createLink: function (firstUid, secondUid) {
        let newArrowId = ArrowModel.createNew(firstUid, secondUid);
        PackageModel.addArrows(firstUid, newArrowId);
        if (secondUid) {
            PackageModel.addInArrows(secondUid, newArrowId);
        }
        msg.send(msg.key.UI_DRAW_LINK, { id: newArrowId, begin: firstUid, end: secondUid });
    },

    _removeARect: function (uid) {
        let packages = PackageModel.getModel();
        let rect = packages[uid];
        if (!rect) {
            return;
        }
        let deleteInfo = {};

        if (rect['dialogIds'] && rect['dialogIds'].length) {
            let allDialogs = DialogModel.getModel();
            deleteInfo['dialogIds'] = [];
            rect['dialogIds'].forEach(id => {
                delete allDialogs[id];
                deleteInfo['dialogIds'].push(id);
            });
        }
        if (rect['triggerIds'] && rect['triggerIds'].length) {
            let allTriggers = TriggerModel.getModel();
            deleteInfo['triggerIds'] = [];
            rect['triggerIds'].forEach(id => {
                delete allTriggers[id];
                deleteInfo['triggerIds'].push(id);
            });
        }
        if (rect['inArrowIds'] && rect['inArrowIds'].length) {
            let allArrows = ArrowModel.getModel();
            rect['inArrowIds'].forEach(id => {
                if (allArrows[id]['end']) {
                    delete allArrows[id]['end'];
                }
            });
        }
        if (rect['arrowIds'] && rect['arrowIds'].length) {
            deleteInfo['arrowIds'] = [];
            let allArrows = ArrowModel.getModel();
            rect['arrowIds'].forEach(id => {
                let outUid = allArrows[id]['end'];
                let nextPackage = packages[outUid];
                if (nextPackage) {
                    for (let i = 0; i < nextPackage['inArrowIds'].length; ++i) {
                        if (nextPackage['inArrowIds'][i] == id) {
                            nextPackage['inArrowIds'].splice(i, 1);
                            break;
                        }
                    }
                }
                delete allArrows[id];
                deleteInfo['arrowIds'].push(id);
            });
        }
        delete packages[uid];
        deleteInfo['rectUid'] = uid;
        msg.send(msg.key.UI_REMOVE_A_RECT, deleteInfo);
        //TODO: refresh right inspector
    },
}
window.PlotVecCtrl = PlotVecCtrl;