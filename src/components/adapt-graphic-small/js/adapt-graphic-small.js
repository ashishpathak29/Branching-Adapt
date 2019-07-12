define(function (require) {
    var ComponentView = require('coreViews/componentView');
    var Adapt = require('coreJS/adapt');
    var GraphicSmall = ComponentView.extend({
        preRender: function () {
            this.listenTo(Adapt, 'device:changed', this.resizeImage);
        },
        postRender: function () {

            this.$('.graphic-widget').imageready(_.bind(function () {
                console.log("GraphicSmall", "imageready", "setReadyStatus");
                this.setReadyStatus();
            }, this));

            this.resizeImage(Adapt.device.screenSize);
            this.$('.component-widget').on('inview', _.bind(this.inview, this));
            var scrollToModel = this.model.get('_scrollTo');
            if (scrollToModel) {
                this.$('a').click(_.bind(this.handleScrollTo, this));
            }
        },
        handleScrollTo: function (e) {
            console.log("GraphicSmall", "handleScrollTo", arguments);

            var scrollToModel = this.model.get('_scrollTo');
            var options = _.isUndefined(scrollToModel.duration) ? undefined : { duration: scrollToModel.duration };

            if (scrollToModel.hasOwnProperty("_delegateToNavButtons") && scrollToModel._delegateToNavButtons) {
                //trigger event so the nav buttons can handle this   
                Adapt.trigger("nav-buttons:action", new Backbone.Model({ "action": "next" }));
            }
            else {
                //old way
                Adapt.scrollTo("." + scrollToModel._id, options);
            }
            e.preventDefault();
        },
        inview: function (event, visible, visiblePartX, visiblePartY) {
            if (visible) {
                if (visiblePartY === 'top') {
                    this._isVisibleTop = true;
                } else if (visiblePartY === 'bottom') {
                    this._isVisibleBottom = true;
                } else {
                    this._isVisibleTop = true;
                    this._isVisibleBottom = true;
                }
                if (this._isVisibleTop && this._isVisibleBottom) {
                    this.$('.component-widget').off('inview');
                    console.log("GraphicSmall", "inview", "setCompletionStatus");
                    this.setCompletionStatus();
                }
            }
        },
        resizeImage: function (width) {
            var imageWidth = width === 'medium' ? 'small' : width;
            this.$('.graphic-widget img').attr('src', this.model.get('_graphic')[imageWidth]);

            var minW = 50, maxW = 214, actW = minW + ($(window).width() / 6), calW = parseInt(actW > maxW ? maxW : actW);
            this.$('.graphic-widget img').width(calW);
        }
    });
    Adapt.register('graphic-small', GraphicSmall);
    return GraphicSmall;
});