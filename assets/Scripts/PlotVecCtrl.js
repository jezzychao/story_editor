
var PlotVecCtrl = {

    init: function () {
        msg.register('PlotVecCtrl', msg.key.CREATE_A_NEW_LINKER, (tag, key, param) => { this._createLink(param['first'], param['second']); }, this);
        msg.register('PlotVecCtrl', msg.key.REMOVE_A_RECT_ITEM, (tag, key, param) => { this._removeARect(param); }, this);
        msg.register('PlotVecCtrl', msg.key.MODIFY_THE_END_OF_LINKER, (tag, key, param) => { this._resetAArrow(param); }, this);
        msg.register('PlotVecCtrl', msg.key.REMOVE_A_ARROW_ITEM, (tag, key, param) => { this._removeAArrow(param); }, this);
    },

    uninit: function () {
        msg.cancelAll('PlotVecCtrl');
    },

    isCanLink: function (firstUid, secondUid) {
        if (firstUid == secondUid || secondUid == PackageModel.getBeginUid()) {
            return false;
        }

        let frontUids = [];
        let rect = PackageModel.getSingle(firstUid);
        if (rect['inArrowIds'] && rect['inArrowIds'].length) {
            rect['inArrowIds'].forEach(id => {
                let arrow = ArrowModel.getSingle(id);
                frontUids.push(arrow['begin']);
            });
        }
        let index = frontUids.findIndex(v => v == secondUid);
        if (index != -1) {
            return false;
        }

        let nextUids = [];
        if (rect['arrowIds'] && rect['arrowIds'].length) {
            rect['arrowIds'].forEach(id => {
                let arrow = ArrowModel.getSingle(id);
                nextUids.push(arrow['end']);
            });
        }
        index = nextUids.findIndex(v => v == secondUid);
        return index == -1;
    },

    _createLink: function (firstUid, secondUid) {
        firstUid = parseInt(firstUid), secondUid = parseInt(secondUid);
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
            // deleteInfo['dialogIds'] = [];
            rect['dialogIds'].forEach(id => {
                delete allDialogs[id];
                // deleteInfo['dialogIds'].push(id);
            });
        }
        if (rect['triggerIds'] && rect['triggerIds'].length) {
            let allTriggers = TriggerModel.getModel();
            // deleteInfo['triggerIds'] = [];
            rect['triggerIds'].forEach(id => {
                delete allTriggers[id];
                // deleteInfo['triggerIds'].push(id);
            });
        }

        if (rect['inArrowIds'] && rect['inArrowIds'].length) {
            deleteInfo['inArrows'] = {};
            let allArrows = ArrowModel.getModel();
            rect['inArrowIds'].forEach(id => {
                if (allArrows[id]['end']) {
                    delete allArrows[id]['end'];
                    deleteInfo['inArrows'][id] = allArrows[id]['begin'];
                }
            });
        }
        if (rect['arrowIds'] && rect['arrowIds'].length) {
            deleteInfo['outArrows'] = {};
            let allArrows = ArrowModel.getModel();
            rect['arrowIds'].forEach(id => {
                let outUid = allArrows[id]['end'];
                if (outUid) {
                    PackageModel.delInArrow(outUid, id);
                    deleteInfo['outArrows'][id] = outUid;
                }
                delete allArrows[id];
            });
        }
        delete packages[uid];
        deleteInfo['rectUid'] = uid;
        msg.send(msg.key.UI_REMOVE_A_RECT, deleteInfo);
        //TODO: refresh right inspector
    },

    _resetAArrow: function (param) {
        let first = param['first'], second = parseInt(param['second']), arrowId = parseInt(param['arrowId']);
        var prevEndUid = null;
        let arrow = ArrowModel.getSingle(arrowId);
        if (arrow) {
            prevEndUid = arrow['end'];
            arrow['end'] = second;
        }
        PackageModel.addInArrows(second, arrowId);
        if (prevEndUid) {
            PackageModel.delInArrow(prevEndUid, arrowId);
        }
        msg.send(msg.key.UI_RELINK_A_ARROW, arrow);
    },

    _removeAArrow: function (arrowId) {
        let arrow = ArrowModel.getSingle(arrowId);
        if (arrow) {
            let param = { id: arrowId };
            param['begin'] = arrow['begin'];
            PackageModel.delArrow(arrow['begin'], arrowId);
            if (arrow['end']) {
                param['end'] = arrow['end'];
                PackageModel.delInArrow(arrow['end'], arrowId);
            }
            ArrowModel.delSingal(arrowId);
            msg.send(msg.key.UI_REMOVE_A_ARROW, param);
        }
    }
}
window.PlotVecCtrl = PlotVecCtrl;