var FileUtils = (function (relativePath) {
    const relaPath = relativePath;

    (function init() {
        if (cc.sys.isNative) {
            if (!isDirExist(relaPath)) {
                jsb.fileUtils.createDirectory(relaPath);
            }
        }
    })();

    function isDirExist(fullPath) {
        return jsb.fileUtils.isDirectoryExist(fullPath);
    };

    function isFileExist(fullPath) {
        return jsb.fileUtils.isFileExist(fullPath);
    };

    var ret = {
        getJsonFromFile: function (filename, cb) {
            let path = `${relaPath}\\${filename}.json`;
            if (isFileExist(path)) {
                var str = jsb.fileUtils.getStringFromFile(path);
                return JSON.parse(str);
            } else {
                console.error(`${path} do not exist`);
            }
        },

        writeJsonToFile: function (filename, json) {
            jsb.fileUtils.writeStringToFile(JSON.stringify(json), `${relaPath}\\${filename}.json`);
        },

        removeFile: function (filename) {
            return jsb.fileUtils.removeFile(`${relaPath}\\${filename}.json`);
        },

        renameFile: function (oldName, newName) {
            jsb.fileUtils.renameFile(relaPath, oldName + '.json', newName + '.json');
        },

        listFiles: function () {
            return jsb.fileUtils.listFiles(relaPath);
        },

        fileExist: function (fileName) {
            let path = `${relaPath}\\${fileName}.json`;
            return isFileExist(path);
        },
    };

    return ret;
})(config.DATA_FILES_PATH);

var FileMgr = (function (helper) {

    var currFileData = null;
    var allFiles = [];

    var ret = {
        init: function () {
            _updateFiles();
            console.log(allFiles.join(', '));

            msg.register('FileMgr', msg.key.CREATE_A_FILE, (tag, key, (param) => { _craete(param); }), this);
            msg.register('FileMgr', msg.key.OPEN_THE_FILE, (tag, key, (param) => { _open(param); }), this);
            msg.register('FileMgr', msg.key.RENAME_THE_FILE, (tag, key, (param) => { _rename(param['old'], param['new']); }), this);
            msg.register('FileMgr', msg.key.DELETE_THE_FILE, (tag, key, (param) => { _delete(param); }), this);
        },

        uninit: function () {
            msg.cancellAll('FileMgr');
        },

        getAllFiles: function () {
            return allFiles;
        },

    };

    function _updateFiles() {
        allFiles = helper.listFiles() || [];
        allFiles.sort();
    };

    function _craete() {
        let filename = "story_null";
        let index = 1, name = filename;
        while (true) {
            if (helper.fileExist(name)) {
                name = filename + "_" + index;
            } else {
                break;
            }
            ++index;
        }
        helper.writeJsonToFile(name, {});
        _updateFiles();
        msg.send(msg.key.UI_UPDATE_FILES_LIST, utils.deepCopy(allFiles));
    }

    function _rename(oldName, newName) {
        if (helper.fileExist(oldName)) {
            helper.renameFile(oldName, newName);

            _updateFiles();

            msg.send(msg.key.UI_UPDATE_FILES_LIST, utils.deepCopy(allFiles));
            console.log(`rename file: ${oldName} -> ${newName} successfully`);
        } else {
            console.error(`This do not exist: ${oldName}`);
        }
    };

    function _open(filename) {
        if (helper.fileExist(filename)) {
            currFileData = helper.getJsonFromFile(filename);
            msg.send(msg.key.UI_UPDATE_ALL_INSPECTORS, currFileData);
            console.log(`open file: ${filename} successfully`);
        } else {
            console.error(`This do not exist: ${filename}`);
        }
    };

    function _delete(filename) {
        if (helper.fileExist(filename)) {
            if (helper.removeFile(filename)) {
                currFileData = null;

                _updateFiles();
                msg.send(msg.key.UI_UPDATE_ALL_INSPECTORS, currFileData);
                console.log(`delete file: ${filename} successfully`);
            } else {
                console.log(`delete file: ${filename} failurly`);
            }
        } else {
            console.error(`This do not exist: ${filename}`);
        }
    };

    ret.init();
    return ret;
})(FileUtils);

window.fileMgr = FileMgr;