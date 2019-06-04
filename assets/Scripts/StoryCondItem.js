
cc.Class({
    extends: cc.Component,

    properties: {
        labFilename: cc.Label,
        labStory: cc.Label,
        labCategory: cc.Label,
        labParam: cc.Label,
    },

    ctor() {
        this.mArrowId = null;
        this.mCond = null;
        this.mOnEvent = null;
        this.mCategory = {
            1: '完成状态',
            2: '完成次数',
            3: '选项状态',
            4: '选项次数',
        }
    },

    init: function (cond, onDeleteEvent, arrowId) {
        this.mArrowId = arrowId;
        this.mCond = cond;
        this.mOnEvent = onDeleteEvent;
        this._refresh();
    },

    getValue: function () {
        return this.mCond['id'];
    },

    buttonListener: function (event) {
        let self = this;
        let tag = event.target;
        if (tag.name === 'BtnDel') {
            this.mOnEvent && this.mOnEvent(this.mCond['id']);
        } else if (tag.name === 'BtnEdit') {
            require('PanelEditStoryCond').show(this.mCond, this.mArrowId, (data) => {
                self._refresh();
            });
        }
    },

    _refresh: function () {
        if (this.mCond) {
            var file = this.mCond['file'];
            var packageId = this.mCond['packageId'];
            var categroy = this.mCond['categroy'];
            var param = this.mCond['param'];

            if (!file) {
                this.labFilename.string = 'NULL';
                this.labStory.string = 'NULL';
                this.labCategory.string = 'NULL';
                this.labParam.string = 'NULL';
                return;
            }

            this.labFilename.string = file;
            let infos = FileCache.getPackagesBrief(file);
            this.labStory.string = `${packageId}:${infos[packageId]}`;

            this.labCategory.string = this.mCategory[categroy];
            if (categroy == 1) {
                this.labParam.string = param == 0 ? '未完成' : '已完成';
            } else if (categroy == 2) {
                let args = param.split(',');
                let tOperator = args[0];
                let tCount = args[1];
                this.labParam.string = '完成次数' + (tOperator == 0 ? '=' : tOperator == 1 ? '>' : '<') + tCount + '次';
            } else if (categroy == 3) {
                let vector = FileCache.getVector(file, packageId)
                let arrow = vector['arrows'][param];
                this.labParam.string = arrow['id'] + ':' + arrow['text'];
            } else if (categroy == 4) {
                let args = param.split(',');
                let arrowId = parseInt(args[0]);
                let operator = args[1] == 0 ? '=' : args[1] == 1 ? '>' : '<';
                let count = args[2];
                let vector = FileCache.getVector(file, packageId)
                let arrow = vector['arrows'][arrowId];
                this.labParam.string = `选项: <${arrow['id']}:${arrow['text']}> 的完成次数 ${operator} ${count}`;
            }
        } else {
            this.labFilename.string = 'NULL';
            this.labStory.string = 'NULL';
            this.labCategory.string = 'NULL';
            this.labParam.string = 'NULL';
        }
    }
});
