const config = {
    // DATA_FILES_PATH: "E:/Projects/cocos/story_editor/datafiles",
    DATA_FILES_PATH: "E:/Workspace/HY2/story_editor/datafiles",

    DEFAULT_SPEED: 10,

    DEFAULT_BGM: 1,

    MUSIC_LIB: {
        1: {
            music: 'xxx',
            remark: '默认音乐',
        },
    },

    SOUND_LIB: {
        1: {
            sound: 'xxxxx',
            remark: '未知音效'
        },
    },

    CHARACTER_LIB: {
        1: {
            id: 1001,
            name: '约瑟',
            bust: 'icon_test',
        },
    },

    TRIGGER_LIB: {
        1: {
            name: '自动',
            extraParam: true,//是否需要额外参数
            intro: '这是该触发器类型的介绍',
        },
        2: {
            name: '回家',
            extraParam: false,
            intro: '这是该触发器类型的介绍',
        },
    },
};

window.config = config;