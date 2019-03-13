var PlotVecModel = (function () {

    var allPlotVec = null;
    var openedUid = null;
    var allUids = null;

    /**
     
    {
        uid:{
            uid: 
            remark:剧情图名称
            data: {具体的剧情图数据结构}
        }，
        ...
    }

     */

    var ret = {
        init: function (opened) {
            msg.register('PlotVecModel', msg.key.OPEN_A_PLOT_VEC, (tag, key, param) => { _open(param); }, this);
            msg.register('PlotVecModel', msg.key.SET_MARK_A_PLOT_VEC, (tag, key, param) => { _remark(param); }, this);
            msg.register('PlotVecModel', msg.key.REMOVE_A_PLOT_VEC, (tag, key, param) => { _delete(param); }, this);
            msg.register('PlotVecModel', msg.key.CREATE_A_PLOT_VEC, (tag, key, param) => { _create(param); }, this);
            msg.register('PlotVecModel', msg.key.SAVE, (tag, key, param) => { _save(param); }, this);

            allPlotVec = fileHelper.getJsonFromFile(opened);
            allUids = Object.keys(allPlotVec);
            if (allUids.length > 0) {
                openedUid = allUids[0];
            }
            if (openedUid) {
                msg.send(msg.key.UI_INIT_ALL_MODULES, allPlotVec[openedUid]);
            } else {
                msg.send(msg.key.UI_UNINIT_ALL_MODULES);
            }
            msg.send(msg.key.UI_UPDATE_PLOT_VEC_INSPECTOR, _getBriefInfo());
            _logInfo();
        },

        uninit: function () {
            allPlotVec = null;
            openedUid = null;
            allUids = null;
            msg.send(msg.key.UI_UPDATE_PLOT_VEC_INSPECTOR, null);
            msg.send(msg.key.UI_UNINIT_ALL_MODULES);
            msg.cancelAll('PlotVecModel')
            _logInfo();
        },
    };

    function _save() {
        if (allPlotVec) {
            let filename = fileMgr.getOpened();
            console.log('save filename: ' + filename);
            if (filename) {

                fileHelper.writeJsonToFile(filename, allPlotVec);
            }
        }
    }

    function _create() {
        //get next uid
        let newuid = 1;
        if (allUids.length) {
            allUids.sort();
            let tMaxUid = allUids[allUids.length - 1];
            newuid = (typeof (tMaxUid) === 'string' ? parseInt(tMaxUid) : tMaxUid) + 1;
        }
        allPlotVec[newuid] = { uid: newuid, remark: '新的剧情图' };
        allUids = Object.keys(allPlotVec);
        msg.send(msg.key.UI_ADD_A_PLOT_VEC, { uid: newuid, remark: allPlotVec[newuid]['remark'] });
        if (!openedUid) {
            _open(newuid);
        }
        _logInfo();
    }

    function _delete(uid) {
        if (allPlotVec[uid]) {
            if (uid == openedUid) {
                openedUid = null;
                delete allPlotVec[uid];
                allUids = Object.keys(allPlotVec);
                msg.send(msg.key.UI_UNINIT_ALL_MODULES);
                msg.send(msg.key.UI_DEL_A_PLOT_VEC, uid);
            } else {
                delete allPlotVec[uid];
                allUids = Object.keys(allPlotVec);
                msg.send(msg.key.UI_DEL_A_PLOT_VEC, uid);
            }
        }
        _logInfo();
    }

    function _open(uid) {
        if (uid == openedUid) {
            return;
        }
        if (!allPlotVec[uid]) {
            console.error(`uid: ${uid} do not exist`);
            return;
        }
        openedUid = uid;
        msg.send(msg.key.UI_OPEN_THE_PLOT_VEC, openedUid);
        msg.send(msg.key.UI_INIT_ALL_MODULES, allPlotVec[openedUid]);
        _logInfo();
    }

    function _remark(param) {
        let uid = param['uid'], remark = param['remark'];
        if (allPlotVec[uid]) {
            allPlotVec[uid]['remark'] = remark;
            msg.send(msg.key.UI_MARK_THE_PLOT_VEC, param);
        }
        _logInfo();
    }

    function _getBriefInfo() {
        let info = null;
        for (let uid in allPlotVec) {
            let plot = allPlotVec[uid];
            info = info || {};
            info[uid] = plot['remark'];
        }

        return {
            opened: openedUid,
            list: info,
        };
    }

    function _logInfo() {
        console.log("PlotVecInfo:----------------------------------------------------------")
        console.log("allPlotVec: " + JSON.stringify(allPlotVec));
        console.log("openedUid: " + JSON.stringify(openedUid));
        console.log("allUids: " + JSON.stringify(allUids));
        console.log("PlotVecInfo:----------------------------------------------------------")
    }

    return ret;
})();

window.plotVecModel = PlotVecModel;