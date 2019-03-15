var Notify = {
    // 抛出通知事件
    post: function (tag, param) {
        return this._onNotify(tag, param);
    },

    // 注册监听事件
    regObserver: function (target, cb, name, object) {
        // 获取事件的监听列表
        var tm = this._targets[name];
        if (!tm) {
            tm = this._targets[name] = {};
        }

        // 获取该对象对应的通知键值
        var tk;
        if (typeof (target) == "string") {
            tk = target;
            // 初始化事件通知对象
            tm[tk] = tm[tk] || { target: object };
        } else {
            tk = this._getKey(target);
            // 对象不存在或者已失效时不再继续处理
            if (!tk) {
                console.error("target is not a valid node!!!");
                return;
            }
            tm[tk] = tm[tk] || { target: target };
        }
        // 刷新回调事件
        tm[tk].cb = cb;
    },

    // 注册监听事件列表
    regObservers: function (target, cb, names, object) {
        for (let i = 0; i < names.length; ++i) {
            this.regObserver(target, cb, names[i], object);
        }
    },

    // 注销监听事件
    unregObserver: function (target, name) {
        var tm = this._targets[name];
        // 没有该事件的监听列表时不再继续处理
        if (!tm) {
            return;
        }

        // 删除对应的监听
        if (typeof (target) == "string") {
            if (tm[target]) {
                delete tm[target];
            }
        } else {
            var tk = this._getKey(target);
            if (tk && tm[tk]) {
                delete tm[tk];
            }
        }

        // 清空没有通知对象的事件
        if (utils.countProperty(tm) <= 0) {
            delete this._targets[name];
        }
    },

    // 注销监听事件列表
    unregObservers: function (target, names) {
        for (let i = 0; i < names.length; ++i) {
            this.unregObserver(target, names[i]);
        }
    },

    // 移除对象上绑定的所有监听事件
    removeAllObservers: function (target) {
        // 获取该对象对应的通知键值
        var tk;
        if (typeof (target) == "string") {
            tk = target;
        } else {
            tk = this._getKey(target);
            // 对象不存在或者已失效时不再继续处理
            if (!tk) {
                console.error("target is not a valid node!!!");
                return;
            }
        }

        // 遍历监听事件列表，删掉所有事件下与该通知键值一致的对象
        for (var key in this._targets) {
            var item = this._targets[key];
            if (item[tk]) {
                delete item[tk];

                // 清空没有通知对象的事件
                if (utils.countProperty(item) <= 0) {
                    delete this._targets[key];
                }
            }
        }
    },

    // PRIVATE
    // 监听事件列表，格式为：key-字符串，一般为HYKey中定义的字段；value-对象，字符串，一般为HYKey中定义的字段；
    // value对象的key为node对象的__instanceId或者传过来的对象名（一般为类名），
    // value对象的值的内容有：cb-回调事件，target-监听该事件的对象
    _targets: {},
    // 通知事件
    _onNotify: function (name, param) {
        var targets = this._targets[name] || {};

        // 该事件名下注册的所有事件逐一通知
        for (var key in targets) {
            var item = targets[key];
            // 未被销毁的node的_objFlags为偶数，非node无_objFlags
            if (cc.isValid(item.target)) {
                item.cb(item.target, name, param);
            } else { // 删除已无效的通知对象
                delete targets[key];
            }
        }
    },
    _getKey: function (target) {
        if (target.__instanceId) {
            return target.__instanceId;
        } else {
            let tUUID = target.uuid.split(".");
            return tUUID[tUUID.length - 1];
        }
    }
};

var register = function (target, key, func, object) {
    Notify.regObserver(target, func, key, object)
}

var cancel = function (target, key) {
    Notify.unregObserver(target, key);
}

var cancelAll = function (target) {
    Notify.removeAllObservers(target);
}

var send = function (key, param) {
    Notify.post(key, param);
}

window.msg = {
    register: register,
    cancel: cancel,
    cancelAll: cancelAll,
    send: send,
    key: {
        // "MODIFY_FILE_NAME": 1,
        "CREATE_A_FILE": 1,
        "OPEN_THE_FILE": 2,
        "RENAME_THE_FILE": 3,
        "DELETE_THE_FILE": 4,

        "CREATE_A_PLOT_VEC": 5,//新建一张剧情图
        "REMOVE_A_PLOT_VEC": 6,//删除一张剧情图
        "OPEN_A_PLOT_VEC": 7,//打开一张剧情图
        "SET_MARK_A_PLOT_VEC": 8,//标注一张剧情图

        "SAVE": 9,//保存数据

        "REMOVE_A_RECT_ITEM": 10,//删除一个 rect

        "UPDATE_THE_PACKAGE_POS": 11,//更新剧情包所在位置
        "UPDATE_THE_PACKAGE_REMARK": 12,//更新剧情包备注
        "CREATE_A_RECT":13,//创建一个新的剧情包
        "CREATE_A_NEW_LINKER":14,//创建一个新的连接

        "UI_UPDATE_FILE_NAME": 1001,//更新文件名称
        "UI_UPDATE_ALL_INSPECTORS": 1002,//更新所有的界面显示
        "UI_UPDATE_FILES_LIST": 1003,//更新文件列表
        "UI_MARK_THE_FILE_AS_OPENED": 1004,//标记文件为打开

        "UI_UNINIT_ALL_MODULES": 1101,//清理所有的可编辑模块，文件模块除外
        "UI_INIT_ALL_MODULES": 1102,//初始化所有的可编辑模块，文件模块除外

        "UI_ADD_A_PLOT_VEC": 1104,//在剧情图列表中新增一个item
        "UI_DEL_A_PLOT_VEC": 1105,//在剧情图列表中删除一个item
        "UI_UPDATE_PLOT_VEC_INSPECTOR": 1106,//重置剧情图列表
        "UI_OPEN_THE_PLOT_VEC": 1107,//打开一个剧情图
        "UI_MARK_THE_PLOT_VEC": 1108,//设置备注名一个剧情图

        "UI_SWITCH_TO_PACKAGE_INSPECTOR_AND_REFRESH": 1201,//将右侧的监视面板切换到 PACKAGE_INSPECTOR，并且更新界面
        "UI_START_LINK_TO_OTHER_RECT": 1202,//将一个 rect 链接到另一个 rect
        "UI_DISABLE_CENTER_VIEW_MOVE": 1203,//禁用中心视窗的移动

        "UI_REFRESH_All_RECT": 1204,//刷新中心视窗所有的rect
        "UI_END_LINK_TO_OTHER_RECT": 1205,//将一个 rect 链接到另一个 rect

        "UI_INIT_OPERATION_MOULES": 1206,
        "UI_CLEAR_OPERATION_MOULES": 1207,

        "UI_CREATE_A_NEW_RECT":1208,//新建一个rect
        "UI_DRAW_LINK":1209,//
        // "UI_CREATE_A_NEW_RECT":1208,//新建一个rect

        // "UI_REFRESH_CENTER_VIEW":1205,//刷新中心视窗
    }
}