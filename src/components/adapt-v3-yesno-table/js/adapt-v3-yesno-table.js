define(function (require) {
    var QuestionView = require('coreViews/questionView');
    var Adapt = require('coreJS/adapt');

    var YesNoTableV3 = QuestionView.extend({
        _tg: function () {
            return "YesNoTableV3:" + this.model.get('_id');
        },

        events: {
            "click .yesno-table-v3-column-radio-button, click .yesno-table-v3-column-radio-button button": "onRadioButtonClicked"
        },

        setupQuestion: function () {
            //defaults
            if (!this.model.has("_showDontKnow")) {
                this.model.set("_showDontKnow", false);
            }
            if (!this.model.has("_columnLabels")) {
                this.model.set("_columnLabels", { "col0": "Yes", "col1": "Don't know", "col2": "No" });
            }

            //convert 'shouldBeSelected' into '_correctIndex' when '_correctIndex' doesnt exist - backward compatibility with old JSON
            var ci = '_correctIndex',
                sbs = 'shouldBeSelected';
            _.each(this.model.get('_items'), function (item, index) {
                if (!item.hasOwnProperty(ci) && item.hasOwnProperty(sbs)) {
                    //mapping true to column 0 and false to column 2
                    item[ci] = item[sbs] === true ? 0 : 2;
                }
            }, this);
        },

        canSubmit: function () {
            var $selection = this.$('.yesno-table-v3-row.component-item .yesno-table-v3-column-radio.selected'),
                length = $selection.length;
            console.log(this._tg(), "canSubmit", length);
            if (!_.isUndefined($selection) && length > 0) {
                return this.model.get('_items').length === length;
            }
            return false;
        },

        resetQuestionOnRevisit: function (type) {
            this.setAllItemsEnabled(true);
            this.resetQuestion();
        },

        restoreUserAnswers: function () {
            console.log(this._tg(), "restoreUserAnswers");
            if (!this.model.get("_isSubmitted")) return;

            var items = this.model.get("_items"),
                ua = this.model.get("_userAnswer");

            _.each(items, function (items, index) {
                var $row = this.$('.yesno-table-v3-row.component-item.item-' + index),
                    $cell = $row.find('.column-' + ua[index]);

                this.selectItem($row, $cell);
            }, this);


            this.setQuestionAsSubmitted();
            this.markQuestion();
            this.setScore();
            this.showMarking();
            this.setupFeedback();
        },

        setScore: function () {
            var questionWeight = this.model.get('_questionWeight');
            var answeredCorrectly = this.model.get('_isCorrect');
            var score = answeredCorrectly ? questionWeight : 0;
            this.model.set('_score', score);
        },

        storeUserAnswer: function () {
            var ua = this.model.get('_selectedItems') || [];
            console.log(this._tg(), "storeUserAnswer", ua);
            this.model.set('_userAnswer', ua.concat());
        },
        resetUserAnswer: function () {
            this.model.set('_userAnswer', []);
        },

        disableQuestion: function () {
            console.log(this._tg(), "disableQuestion");
            this.setAllItemsEnabled(false);
        },

        resetQuestion: function () {
            console.log(this._tg(), "resetQuestion");
            this.deselectAllItems();

            this.model.set({
                '_selectedItems': [],
                _isAtLeastOneCorrectSelection: false
            });
            this.$('.yesno-table-v3-row.component-item').removeClass('correct incorrect');
        },

        isCorrect: function () {
            var ua = this.model.get('_userAnswer') || [];
            if (ua.length === 0) return false;
            var ca = [];
            _.each(this.model.get('_items'), function (item, index) {
                ca[index] = item["_correctIndex"];
                if (ua[index] === ca[index]) {
                    this.model.set('_isAtLeastOneCorrectSelection', true);
                }
            }, this);

            return ua.join() === ca.join();
        },

        isPartlyCorrect: function () {
            return this.model.get('_isAtLeastOneCorrectSelection');
        },

        showMarking: function () {

            var ua = this.model.get('_userAnswer') || [];
            _.each(this.model.get('_items'), function (item, index) {

                var $row = this.$('.yesno-table-v3-row.component-item.item-' + index),
                    correct = ua[index] == item._correctIndex;

                $row.removeClass('correct incorrect').addClass(correct ? 'correct' : 'incorrect');

            }, this);
        },

        showCorrectAnswer: function () {
            this.deselectAllItems();
            _.each(this.model.get('_items'), function (items, index) {
                var $row = this.$('.yesno-table-v3-row.component-item.item-' + index),
                    $cell = $row.find('.column-' + items._correctIndex);

                $row.removeClass('correct incorrect');
                this.selectItem($row, $cell);
            }, this);
        },

        hideCorrectAnswer: function () {
            this.deselectAllItems();
            var ua = this.model.get('_userAnswer') || [];
            _.each(this.model.get('_items'), function (items, index) {
                var $row = this.$('.yesno-table-v3-row.component-item.item-' + index),
                    $cell = $row.find('.column-' + ua[index]);
                this.selectItem($row, $cell);
            }, this);
            this.showMarking();
        },

        enableQuestion: function () {
            console.log(this._tg(), "enableQuestion");
            this.setAllItemsEnabled(true);
        },

        setAllItemsEnabled: function (isEnabled) {
            _.each(this.model.get('_items'), function (item, index) {
                var $row = this.$('.yesno-table-v3-row.component-item.item-' + index);
                $row.removeClass('disabled').addClass(isEnabled ? '' : 'disabled');
            }, this);
        },


        selectItem: function ($row, $col) {
            var row = this.rowIndex($row),
                col = this.cellIndex($col);
            $row.children('.column-0,.column-1,.column-2').removeClass('selected');
            $col.addClass('selected');
            var selectedItems = this.model.get('_selectedItems') || [];
            selectedItems[row] = col;
            this.model.set('_selectedItems', selectedItems);
        },

        deselectAllItems: function () {
            console.log(this._tg(), "deselectAllItems");
            this.$el.find('.column-0,.column-1,.column-2').removeClass('selected');
        },


        cellIndex: function ($cell) {
            if ($cell) {
                if ($cell.hasClass('column-0')) { return 0; }
                if ($cell.hasClass('column-1')) { return 1; }
                if ($cell.hasClass('column-2')) { return 2; }
            }
            return -1;
        },
        rowIndex: function ($row) {
            if ($row) {
                var m = $row.attr('class').match(/(?:\W|^)item-(\d\d*)(?!\w)/);
                if (_.isUndefined(m)) {
                    return -1;
                }
                return parseInt(m[1]);//$1
            }
            return -1;
        },

        indexColumns: function () {
            _.each(this.model.get('_items'), function (item, index) {
                var $columns = this.$('.item-' + index + ' .yesno-table-v3-column-radio');
                _.each($columns, function (item, index, columns) {
                    $(item).addClass('column-' + index);
                }, this);
            }, this);
        },

        onRadioButtonClicked: function (e) {
            e.preventDefault();
            if (this.model.get('_isEnabled') && !this.model.get('_isSubmitted')) {
                var $cell = this.$(e.currentTarget);
                var $row = $cell.parent('.yesno-table-v3-row.component-item')/*this.$(e.currentTarget.parentNode)*/;

                this.selectItem($row, $cell);
            }
        },
        onQuestionRendered: function () {
            console.log(this._tg(), "onQuestionRendered");

            this.indexColumns();
            this.restoreUserAnswers();

            if ($('html').hasClass('ie8')) {
                this.ie8_assignTableClasses();
            }

            this.setAllItemsEnabled(!this.model.get("_isSubmitted"));
            this.setReadyStatus();
        },
        ie8_assignTableClasses: function () {
            var items = this.model.get('_items'),
                length = items.length;
            $('.yesno-table-v3-row.yesno-table-v3-row-title').addClass('even first');
            _.each(items, function (items, index) {
                var $row = this.$('.yesno-table-v3-row.component-item.item-' + index);

                $row.addClass((index + 1) % 2 ? 'even' : 'odd');
                if (index == length - 1) $row.addClass('last');

            }, this);

        }
    });

    Adapt.register("yesno-table-v3", YesNoTableV3);
    return YesNoTableV3;
});
