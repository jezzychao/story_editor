
var PlotVecCtrl = {

    init: function () {
        msg.register('PlotVecCtrl', msg.key.CREATE_A_NEW_LINKER, (tag, key, param) => { this._createLink(param['first'], param['second']); }, this);
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
        msg.send(msg.key.UI_DRAW_LINK, { id: newArrowId, begin: firstUid, end: secondUid });
    },
}
window.PlotVecCtrl = PlotVecCtrl;