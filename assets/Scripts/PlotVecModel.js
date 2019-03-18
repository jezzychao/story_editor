/*
vector struct{
    uid;
    remark;
    packages:{
        uid:{
            uid;
            type;
            remark;
            dialogIds:[];
            triggerIds:[];
            arrowIds:[];
            options:[
                {
                    arrowId;
                    text;
                    activecond;
                    displaycond;
                }
            ]
        },
        ...
    } 
    dialogs:{
        id: {
            id;
            role;
            music;
            sound;
            cg;
            bg;
            spd;
            shake;
            events:[]
            text;
        },
        ...
    }
    triggers:{
        id: {
            id;
            type;对应storyPot.xlsx中的类型
            param;根据不同的类型组合而成的string
        },
        ...
    }
    arrows:{
        id:{
            id;
            begin; 起始剧情包 、、//delete
            end; 结束剧情包
            compound: [
                id, operator, id operator, id
            ]
            conds:[
                {
                    id;
                    type;1.配置表中的条件数据

                    if type ==1
                        cond;(string)
                        remark;
                    elif type == 2
                        packageId;
                        categroy; 1.完成状态 2.完成次数 3.选项状态 4.选项次数
                        param;根据不同的 category 自己组合的参数
                },
                ...
            ]
        },
        ...
    }
}

*/



var PlotVecModel = (function () {

    var allPlotVec = null;
    var openedUid = null;
    var allUids = null;

    /**
     
    {
        uid:{
           vector struct
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
                _initSubModules();
                msg.send(msg.key.UI_INIT_ALL_MODULES, allPlotVec[openedUid]);
            } else {
                msg.send(msg.key.UI_UNINIT_ALL_MODULES);
            }
            msg.send(msg.key.UI_UPDATE_PLOT_VEC_INSPECTOR, _getBriefInfo());
            _logInfo();
        },

        uninit: function () {
            _uninitSubModules();

            allPlotVec = null;
            openedUid = null;
            allUids = null;
            msg.send(msg.key.UI_UPDATE_PLOT_VEC_INSPECTOR, null);
            msg.send(msg.key.UI_UNINIT_ALL_MODULES);
            msg.cancelAll('PlotVecModel')
            _logInfo();
        },
    };

    function _initSubModules() {
        if (openedUid) {
            PackageModel.init(allPlotVec[openedUid]['packages'], openedUid);
            DialogModel.init(allPlotVec[openedUid]['dialogs']);
            TriggerModel.init(allPlotVec[openedUid]['triggers']);
            ArrowModel.init(allPlotVec[openedUid]['arrows']);
            PlotVecCtrl.init();
            msg.send(msg.key.UI_INIT_OPERATION_MOULES);

        }
    }

    function _uninitSubModules() {
        if (openedUid) {
            PlotVecCtrl.uninit();
            PackageModel.uninit();
            DialogModel.uninit();
            TriggerModel.uninit();
            ArrowModel.uninit();
            msg.send(msg.key.UI_CLEAR_OPERATION_MOULES);
        }
    }

    function _mergeSubModules() {
        if (openedUid) {
            allPlotVec[openedUid]['packages'] = PackageModel.get();
            allPlotVec[openedUid]['dialogs'] = DialogModel.get();
            allPlotVec[openedUid]['triggers'] = TriggerModel.get();
            allPlotVec[openedUid]['arrows'] = ArrowModel.get();
        }
    }

    function _save() {
        if (allPlotVec) {
            let filename = fileMgr.getOpened();
            console.log('save filename: ' + filename);
            if (filename) {
                _mergeSubModules();
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
                _uninitSubModules();
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
        _uninitSubModules();
        _initSubModules();

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

/*
packages:{
        uid:{

            pos:node.position delete

            uid;
            type;
            remark;
            dialogIds:[];
            triggerIds:[];
            inArrowIds:[] delete
            arrowIds:[];
            options:[
                {
                    arrowId;
                    text;
                    activecond;
                    displaycond;
                }
            ]
        },
        ...
    } 
*/
var PackageModel = (function () {
    var model = null;
    var maxUid = null;
    var ret = {
        init: function (param, baseuid) {
            model = param;
            console.log('model data===========================================');
            console.log(JSON.stringify(model));
            maxUid = _getMaxUid(baseuid);
            if (!model) {
                model = {};
                _createNew(1, "开始", cc.v2(0, 300));
            }
            console.log('model data===========================================');
            console.log(JSON.stringify(model));
            msg.register('PackageModel', msg.key.UPDATE_THE_PACKAGE_POS, (tag, key, param) => { _updatePos(param['uid'], param['pos']); }, this);
            msg.register('PackageModel', msg.key.UPDATE_THE_PACKAGE_REMARK, (tag, key, param) => { _updateRemark(param['uid'], param['remark']); }, this);
            msg.register('PackageModel', msg.key.REMOVE_A_RECT_ITEM, (tag, key, param) => { _remove(param); }, this);
            msg.register('PackageModel', msg.key.CREATE_A_RECT, (tag, key, param) => {
                let newrect = _createNew(2, "新的剧情包", param);
                msg.send(msg.key.UI_CREATE_A_NEW_RECT, newrect);
            }, this);
        },

        uninit: function () {
            model = null;
            maxUid = null;
            msg.cancelAll('PackageModel')
        },

        get: function () {
            return utils.deepCopy(model);
        },

        getBeginUid: function () {
            if (model) {
                for (let uid in model) {
                    if (model[uid]['type'] == 1) {
                        return uid;
                    }
                }
            }
            return null
        },

        getModel: function () {
            return model;
        },

        addArrows: function (uid, arrowId) {
            model[uid]['arrowIds'].push(arrowId);
        },

        //添加入度箭头
        addInArrows: function (uid, arrowId) {
            model[uid]['inArrowIds'].push(arrowId);
        },
    };

    function _getMaxUid(baseuid) {
        if (maxUid) {
            return maxUid;
        }
        if (model) {
            let tks = Object.keys(model).map(v => parseInt(v));
            tks.sort();
            return tks[tks.length - 1];
        } else {
            return baseuid;
        }
    }

    function _createNew(type, remark, v2) {
        let obj = {};
        obj['pos'] = { x: v2.x, y: v2.y };

        obj['uid'] = maxUid++;
        obj['type'] = type;
        obj['remark'] = remark;
        obj['arrowIds'] = [];
        obj['inArrowIds'] = [];
        if (type == 1) {
            //create begin point
            model[obj['uid']] = obj;
            return obj;
        }
        obj['dialogIds'] = [];
        obj['triggerIds'] = [];
        if (type == 2) {
            //create normal package
            model[obj['uid']] = obj;
            return obj;
        }
        obj['options'] = [];
        if (type == 3) {
            model[obj['uid']] = obj;
            return obj;
        }
        console.error('ERROR------------------------->> this type is undefined!!! type: ' + type);
    }

    function _remove(uid) {
        if (model[uid]) {
            //TODO:删除所有的关联的 dialogs, triggers, arrows
        }
    }

    function _updatePos(uid, pos) {
        if (model[uid]) {
            model[uid]['pos'] = pos;
        }
    }

    function _updateRemark(uid, remark) {
        if (model[uid]) {
            model[uid]['remark'] = remark;
        }
    }

    return ret;
})();

var DialogModel = (function () {
    var model = null;
    var ret = {
        init: function (param) {
            model = param || {};

        },

        uninit: function () {
            model = null;

        },

        get: function () {
            return utils.deepCopy(model);
        },

        getModel: function () {
            return model;
        }
    };

    return ret;
})();

var TriggerModel = (function () {
    var model = null;
    var ret = {
        init: function (param) {
            model = param || {};
        },

        uninit: function () {
            model = null;
        },

        get: function () {
            return utils.deepCopy(model);
        },

        getModel: function () {
            return model;
        },
    };

    return ret;
})();

/*
arrows:{
        id:{
            id;
            begin; 起始剧情包 、、//delete
            end; 结束剧情包
            compound: [
                id, operator, id operator, id
            ]
            conds:[
                {
                    id;
                    type;1.配置表中的条件数据

                    if type ==1
                        cond;(string)
                        remark;
                    elif type == 2
                        packageId;
                        categroy; 1.完成状态 2.完成次数 3.选项状态 4.选项次数
                        param;根据不同的 category 自己组合的参数
                },
                ...
            ]
        },
        ...
    }
*/

var ArrowModel = (function () {
    var model = null;
    var ret = {
        init: function (param) {
            model = param || {};
        },

        uninit: function () {
            model = null;

        },

        get: function () {
            return utils.deepCopy(model);
        },

        createNew: function (begin, end) {
            return _createSimple(begin, end)['id'];
        },

        getModel: function () { return model; },
    };

    function _createSimple(begin, end) {
        var arrow = {};
        arrow['id'] = _genId();
        arrow['begin'] = begin;
        if (end) {
            arrow['end'] = end;
        }
        model[arrow['id']] = arrow;
        return arrow;
    }

    function _genId() {
        let allIds = Object.keys(model);
        allIds.sort();
        if (!allIds.length) {
            return 1;
        }
        return allIds[allIds.length - 1] + 1;
    }

    return ret;
})();

window.PlotVecModel = PlotVecModel;
window.PackageModel = PackageModel;
window.ArrowModel = ArrowModel;
window.DialogModel = DialogModel;
window.TriggerModel = TriggerModel;