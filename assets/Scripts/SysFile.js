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
            let path = `${relaPath}/${filename}.json`;
            if (isFileExist(path)) {
                var str = jsb.fileUtils.getStringFromFile(path);
                return JSON.parse(str);
            } else {
                console.error(`${path} do not exist`);
            }
        },

        writeJsonToFile: function (filename, json) {
            jsb.fileUtils.writeStringToFile(JSON.stringify(json), `${relaPath}/${filename}.json`);
        },

        removeFile: function (filename) {
            return jsb.fileUtils.removeFile(`${relaPath}/${filename}.json`);
        },

        renameFile: function (oldName, newName) {
            jsb.fileUtils.renameFile(relaPath + '/', oldName + '.json', newName + '.json');
        },

        listFiles: function () {
            var files = jsb.fileUtils.listFiles(relaPath);
            var filenames = files.map(v => { let t = v.split('/'); return (t[t.length - 1]).split('.')[0]; });
            for (let i = filenames.length - 1; i >= 0; --i) {
                if (filenames[i] === '' || filenames[i] === '.' || filenames[i] === '..') {
                    filenames.splice(i, 1);
                }
            }
            console.log('listFiles----------------------------------------------');
            console.log(JSON.stringify(filenames));
            return filenames;
        },

        fileExist: function (fileName) {
            let path = `${relaPath}/${fileName}.json`;
            return isFileExist(path);
        },
    };

    return ret;
})(config.DATA_FILES_PATH);

var FileMgr = (function (helper) {

    // var currFileData = {};
    var openedFilename = null;
    var allFiles = [];

    var ret = {
        init: function () {
            _updateFiles();
            console.log(allFiles.join(', '));

            msg.register('FileMgr', msg.key.CREATE_A_FILE, (tag, key, param) => { _craete(param); }, this);
            msg.register('FileMgr', msg.key.OPEN_THE_FILE, (tag, key, param) => { _open(param); }, this);
            msg.register('FileMgr', msg.key.RENAME_THE_FILE, (tag, key, param) => { _rename(param['old'], param['new']); }, this);
            msg.register('FileMgr', msg.key.DELETE_THE_FILE, (tag, key, param) => { _delete(param); }, this);
        },

        uninit: function () {
            msg.cancellAll('FileMgr');
        },

        getAllFiles: function () {
            return allFiles;
        },

        getOpened: function () {
            return openedFilename;
        }

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
        _logInfo();
    }

    function _rename(oldName, newName) {
        if (helper.fileExist(oldName)) {
            let succ = true;
            for (let i = 0; i < allFiles.length; ++i) {
                if (allFiles[i] != oldName && allFiles[i] == newName) {
                    succ = false;
                    break;
                }
            }
            if (succ) {
                helper.renameFile(oldName, newName);
                if (oldName == openedFilename) {
                    openedFilename = newName;
                }
                _updateFiles();
                console.log(`rename file: ${oldName} -> ${newName} successfully`);
            }
            msg.send(msg.key.UI_UPDATE_FILE_NAME, { state: succ, old: oldName, new: newName });
        } else {
            console.error(`This do not exist: ${oldName}`);
        }
        _logInfo();
    };

    function _open(filename) {
        if (helper.fileExist(filename)) {
            if (openedFilename == filename) {
                return;
            }
            msg.send(msg.key.SAVE);

            openedFilename = filename;
            plotVecModel.uninit();
            plotVecModel.init(openedFilename);

            msg.send(msg.key.UI_MARK_THE_FILE_AS_OPENED, openedFilename);
            console.log(`open file: ${filename} successfully`);
        } else {
            console.error(`This do not exist: ${filename}`);
        }
        _logInfo();
    };

    function _delete(filename) {
        if (helper.fileExist(filename)) {
            if (helper.removeFile(filename)) {
                if (openedFilename == filename) {
                    plotVecModel.uninit();
                    msg.send(msg.key.UI_MARK_THE_FILE_AS_OPENED, openedFilename);
                    openedFilename = null;
                }
                _updateFiles();
                msg.send(msg.key.UI_UPDATE_FILES_LIST, utils.deepCopy(allFiles));
                console.log(`delete file: ${filename} successfully`);
            } else {
                console.log(`delete file: ${filename} failurly`);
            }
        } else {
            console.error(`This do not exist: ${filename}`);
        }
        _logInfo();

    };

    function _logInfo() {
        console.log('');
        console.log("FileInfo:----------------------------------------------------------")
        console.log("openedFilename: " + JSON.stringify(openedFilename));
        console.log("allFilenames: " + JSON.stringify(allFiles));
        console.log("FileInfo:----------------------------------------------------------")
        console.log('');
    }

    ret.init();
    return ret;
})(FileUtils);

window.fileMgr = FileMgr;
window.fileHelper = FileUtils;