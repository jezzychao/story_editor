var HandleConfig = {
    start: function () {
        let tConfig = JSON.parse(JSON.stringify(window.config));

        delete tConfig['DATA_FILES_PATH'];
        // delete tConfig['DEFAULT_SPEED'];
        // delete tConfig['DEFAULT_BGM'];
        delete tConfig['TRIGGER_LIB'];

        var MUSIC_LIB = tConfig['MUSIC_LIB'];
        for (let tId in MUSIC_LIB) {
            if (MUSIC_LIB[tId]) {
                delete MUSIC_LIB[tId]['remark'];
            }
        }

        var SOUND_LIB = tConfig['SOUND_LIB'];
        for (let tId in SOUND_LIB) {
            if (SOUND_LIB[tId]) {
                delete SOUND_LIB[tId]['remark'];
            }
        }

        var CHARACTER_LIB = tConfig['CHARACTER_LIB'];
        for (let tId in CHARACTER_LIB) {
            if (CHARACTER_LIB[tId]) {
                delete CHARACTER_LIB[tId]['name'];
            }
        }
        FileHelper.writeJsonToFile("runtime_story_config", tConfig);
    },
}

var HandleStoryFile = {
    start: function (tStoryFile) {
        var tStory = FileHelper.getJsonFromFile(tStoryFile);
        for (let tVecId in tStory) {
            this._handleVectors(tStory[tVecId]);
        }
        FileHelper.writeJsonToFile("runtime_" + tStoryFile, tStory);
    },

    _handleVectors: function (tVector) {
        delete tVector['remark'];
        delete tVector['triggers'];
        for (let tId in tVector['packages']) {
            this._handlePackages(tVector['packages'][tId]);
        }
        for (let tId in tVector['dialogs']) {
            this._handleDialogs(tVector['dialogs'][tId]);
        }

        for (let tId in tVector['arrows']) {
            this._handleArrows(tVector['arrows'][tId]);
        }
    },

    _handlePackages: function (tPackage) {
        delete tPackage['pos'];
        delete tPackage['remark'];
        delete tPackage['inArrowIds'];
        if (tPackage['arrowIds'] && !tPackage['arrowIds'].length) {
            delete tPackage['arrowIds'];
        }

        if (tPackage['triggerIds'] && !tPackage['triggerIds'].length) {
            delete tPackage['triggerIds'];
        }

        if (tPackage['dialogIds'] && !tPackage['dialogIds'].length) {
            delete tPackage['dialogIds'];
        }

        if (!tPackage['isOnce']) {
            delete tPackage['isOnce'];
        }
    },

    _handleDialogs: function (tDialog) {
        if (!tDialog['music']) {
            delete tDialog['music']
        }

        if (!tDialog['sound']) {
            delete tDialog['sound']
        }

        if (!tDialog['cg']) {
            delete tDialog['cg']
        }

        if (!tDialog['bg']) {
            delete tDialog['bg']
        }

        if (tDialog['spd'] == 10) {
            delete tDialog['spd'];
        }

        if (!tDialog['shake']) {
            delete tDialog['shake']
        }

        if (tDialog['events'] && !tDialog['events'].length) {
            delete tDialog['events'];
        }
    },

    _handleArrows: function (tArrow) {
        if (tArrow['end']) {
            tArrow['next'] = tArrow['end'];
        }
        delete tArrow['end'];
        delete tArrow['begin'];

        if (tArrow['subConds'] && !tArrow['subConds'].length) {
            delete tArrow['cond'];
            delete tArrow['displaycond'];
            delete tArrow['activecond'];
        } else {
            if (tArrow['displaycond'] && tArrow['displaycond'].length) {
                let t = tArrow['subConds'].findIndex(v => v['id'] == tArrow['displaycond'][0]);
                tArrow['displaycond'] = t['cond'];
            } else {
                delete tArrow['displaycond'];
            }

            if (tArrow['activecond'] && tArrow['activecond'].length) {
                let t = tArrow['subConds'].findIndex(v => v['id'] == tArrow['activecond'][0]);
                tArrow['activecond'] = t['cond'];
            } else {
                delete tArrow['activecond'];
            }

            if (tArrow['cond'] && tArrow['cond'].length) {
                let t = tArrow['subConds'].findIndex(v => v['id'] == tArrow['cond'][0]);
                tArrow['cond'] = t['cond'];
            } else {
                delete tArrow['cond'];
            }
        }
        delete tArrow['subConds'];
    },
}

window.DataCompression = {
    HandleConfig, HandleStoryFile
};