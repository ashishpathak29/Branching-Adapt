define(function (require) {

    var ComponentView = require('coreViews/componentView');
    var Adapt = require('coreJS/adapt');

    var AssessmentResults = ComponentView.extend({

        events: {
            'inview': 'onInview',
            'click .assessmentResults-retry-button button': 'onRetry',
            'click .assessmentResults-certificate-button button': 'onCertificateClicked'
        },

        preRender: function () {
            this.setupEventListeners();
            this.setupModelResetEvent();
            this.checkIfComplete();
            this.checkIfVisible();
        },

        checkIfVisible: function () {

            var wasVisible = this.model.get("_isVisible");
            var isVisibleBeforeCompletion = this.model.get("_isVisibleBeforeCompletion") || false;

            var isVisible = wasVisible && isVisibleBeforeCompletion;

            if (!isVisibleBeforeCompletion) {

                var assessmentModel = Adapt.assessment.get(this.model.get("_assessmentId"));
                if (!assessmentModel || assessmentModel.length === 0) return;

                var state = assessmentModel.getState();
                var isComplete = state.isComplete;
                var isAttemptInProgress = state.attemptInProgress;
                var attemptsSpent = state.attemptsSpent;

                isVisible = isVisible || isComplete || (!isAttemptInProgress && attemptsSpent > 0);

            }

            this.model.set('_isVisible', isVisible);
        },

        checkIfComplete: function () {
            var assessmentModel = Adapt.assessment.get(this.model.get("_assessmentId"));
            if (!assessmentModel || assessmentModel.length === 0) return;

            var state = assessmentModel.getState();
            var isComplete = state.isComplete;
            if (isComplete) {
                this.onAssessmentsComplete(state);
            } else {
                this.model.reset('hard', true);
            }
        },

        setupModelResetEvent: function () {
            if (this.model.onAssessmentsReset) return;
            this.model.onAssessmentsReset = function (state) {
                if (this.get("_assessmentId") === undefined ||
                    this.get("_assessmentId") != state.id) return;

                this.reset('hard', true);
            };
            this.model.listenTo(Adapt, 'assessments:reset', this.model.onAssessmentsReset);
        },

        postRender: function () {
            this.setReadyStatus();
        },

        setupEventListeners: function () {
            this.listenTo(Adapt, 'assessments:complete', this.onAssessmentsComplete);
            this.listenToOnce(Adapt, 'remove', this.onRemove);
        },

        removeEventListeners: function () {;
            this.stopListening(Adapt, 'assessments:complete', this.onAssessmentsComplete);
            this.stopListening(Adapt, 'remove', this.onRemove);
        },

        onAssessmentsComplete: function (state) {
            if (this.model.get("_assessmentId") === undefined ||
                this.model.get("_assessmentId") != state.id) return;

            this.model.set("_state", state);
            this.setFeedback();
            this.setImageFeedback();

            //show feedback component
            this.render();
            if (!this.model.get('_isVisible')) this.model.set('_isVisible', true);
            
         this.getValueNextUntil();

        },
        
        
        
        

        onAssessmentComplete: function (state) {
            this.model.set("_state", state);
            this.setFeedback();
            this.setImageFeedback();

            //show feedback component
            if (!this.model.get('_isVisible')) this.model.set('_isVisible', true);
            this.render();
        },

        onInview: function (event, visible, visiblePartX, visiblePartY) {
            if (visible) {
                if (visiblePartY === 'top') {
                    this._isVisibleTop = true;
                } else if (visiblePartY === 'bottom') {
                    this._isVisibleBottom = true;
                } else {
                    this._isVisibleTop = true;
                    this._isVisibleBottom = true;
                }

                if (this._isVisibleTop || this._isVisibleBottom) {
                    this.setCompletionStatus();
                    this.$el.off("inview");
                }
            }
        },

        onRetry: function () {
            var state = this.model.get("_state");
            var assessmentModel = Adapt.assessment.get(state.id);

            assessmentModel.reset();
        },

        onCertificateClicked: function(){
            Adapt.trigger("certificate:show");
            Adapt.once("certificate:close", _.bind(this.onCertificateClosed, this));
        },
        onCertificateClosed: function(){
            Adapt.scrollTo("."+this.model.get("_parentId"));
        },
        
        setImageFeedback: function () {
            var feedbackBand = this.getFeedbackBand();
            
           //console.log("AssessmentResults", "setImageFeedback");
            if(feedbackBand.hasOwnProperty('img')){
                
            }
        },

        setFeedback: function () {

            var completionBody = this.model.get("_completionBody");
            var feedbackBand = this.getFeedbackBand();

            var state = this.model.get("_state");

            this.$el.removeClass('passed').removeClass('failed');
            if (state.isPass) {
                this.$el.addClass('passed');
            } else {
                this.$el.addClass('failed');
            }

           //console.log("AssessmentResults", "setFeedback state", state);
           //console.log("AssessmentResults", "setFeedback state._isPass", state.isPass);
           //console.log("AssessmentResults", "setFeedback $el", this.$el);
            state.feedbackBand = feedbackBand;
            state.feedback = feedbackBand.feedback;
            
           // console.log(state.questions)
            var responsehtml='';
            $(state.questions).each(function(key,val){
                responsehtml+= "/" + ('Q'+(parseInt(key)+1) + '.' + ' ' + ((val._isCorrect==true)?'Correct ':'Incorrect') + ' ');
                console.log(responsehtml);
                //responsehtml ='';
                
                
            })
            

            
            state.questions =responsehtml;// state.questions.join('<li>');
            
            $(".user_response").find()
             

            this.checkRetryEnabled();

            completionBody = this.stringReplace(completionBody, state);

            this.model.set("body", completionBody);

        },

        getFeedbackBand: function() {
            var state = this.model.get("_state");
            var questions = state.questions;
          
           //  allQuiz(questions);
            
       

            var bands = this.model.get("_bands");
            var scoreAsPercent = state.scoreAsPercent;
            // var completionBody = this.model.get("_completionBody");
         
            

            for (var i = (bands.length - 1); i >= 0; i--) {
                if (scoreAsPercent >= bands[i]._score) {
                   // console.log(bands[i]);
                    return bands[i];
                }
            }
           
            return "";
             this.getValueNextUntil();
            
                        
        },
        
        

        checkRetryEnabled: function () {
            var state = this.model.get("_state");

            var assessmentModel = Adapt.assessment.get(state.id);
            if (!assessmentModel.canResetInPage()) return false;

            var isRetryEnabled = state.feedbackBand._allowRetry !== false;
            var isAttemptsLeft = (state.attemptsLeft > 0 || state.attemptsLeft === "infinite");

            var showRetry = isRetryEnabled && isAttemptsLeft;
            this.model.set("_isRetryEnabled", showRetry);

            if (showRetry) {
                var retryFeedback = this.model.get("_retry").feedback;
                retryFeedback = this.stringReplace(retryFeedback, state);
                this.model.set("retryFeedback", retryFeedback);
            } else {
                this.model.set("retryFeedback", "");
            }
        },

        stringReplace: function (string, context) {
            //use handlebars style escaping for string replacement
            //only supports unescaped {{{ attributeName }}} and html escaped {{ attributeName }}
            //will string replace recursively until no changes have occured

            var changed = true;
            while (changed) {
                changed = false;
                for (var k in context) {
                    var contextValue = context[k];

                    switch (typeof contextValue) {
                        case "object":
                            continue;
                        case "number":
                            contextValue = Math.floor(contextValue);
                            break;
                    }

                    var regExNoEscaping = new RegExp("((\\{\\{\\{){1}[\\ ]*" + k + "[\\ ]*(\\}\\}\\}){1})", "g");
                    var regExEscaped = new RegExp("((\\{\\{){1}[\\ ]*" + k + "[\\ ]*(\\}\\}){1})", "g");

                    var preString = string;

                    string = string.replace(regExNoEscaping, contextValue);
                    var escapedText = $("<p>").text(contextValue).html();
                    string = string.replace(regExEscaped, escapedText);

                    if (string != preString) changed = true;

                }
            }

            return string;
        },

        onRemove: function () {
            this.removeEventListeners();
        },
        getValueNextUntil: function(){
            
            var data =$('.user_response').text();
            var arr = data.split('/');
           
            $(".user_response").html('<span class="user-result">' + arr[1] + '</span>');
            $(".user_response").append('<span class="user-result">' + arr[2] + '</span>');
            $(".user_response").append('<span class="user-result">' + arr[3] + '</span>'); 
            $(".user_response").append('<span class="user-result">' + arr[4] + '</span>'); 
            $(".user_response").append('<span class="user-result">' + arr[5] + '</span>'); 
            $(".user_response").append('<span class="user-result">' + arr[6] + '</span>'); 
            $(".user_response").append('<span class="user-result">' + arr[7] + '</span>'); 
            $(".user_response").append('<span class="user-result">' + arr[8] + '</span>'); 
            $(".user_response").append('<span class="user-result">' + arr[9] + '</span>'); 
            $(".user_response").append('<span class="user-result">' + arr[10] + '</span>'); 
            
            $(".user-result").each(function(){                 
                $('.user-result:contains("Incorrect")').addClass("incrct");
            });
            
        }

    });

    Adapt.register("assessmentResults", AssessmentResults);

});
