var MsgContainer = {};

var register = function (key, func) {
    if (MsgContainer[key]) {
        console.error(`message container already exist key: ${key}`);
        return;
    }
    if (!func) {
        console.error('func is undefined');
        return;
    }
    MsgContainer[key] = func;
}

var cancel = function (key) {
    if (MsgContainer[key]) {
        delete MsgContainer[key];
    }
}

var send = function (key, param) {
    if (MsgContainer[key]) {
        MsgContainer[key](param);
    }
}

window.msg = {
    register: register,
    cancel: cancel,
    send: send,
}

window.key = {
    "MODIFY_FILE_NAME": 1,
    "OPEN_THE_FILE": 2,
    "RENAME_THE_FILE": 3,
    "DELETE_THE_FILE": 4,
};