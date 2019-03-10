var SysFile = (function (relativePath) {
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
            jsb.fileUtils.removeFile(`${relaPath}\\${filename}.json`);
        },

        renameFile: function (oldName, newName) {
            jsb.fileUtils.renameFile(relaPath, oldName + '.json', newName + '.json');
        },
    };

    return ret;
})(config.DATA_FILES_PATH);
window.SysFile = SysFile;