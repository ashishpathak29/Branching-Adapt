define(function(require) {

    var ComponentView = require('coreViews/componentView');
    var Adapt = require('coreJS/adapt');
    var branch1  = false;
    var branch2  = false;
    var branch3  = false;
    var branch4  = false;
    var branch5  = false;
    var branch6  = false;
    var branch7  = false;
    
    var onPageVisit1 = false;
    var onPageVisit2 = false;
    var onPageVisit3 = false;
    
    


    var Text = ComponentView.extend({
        
        events: {
           
            'click .branching3.img1': 'oncustomButtonView1',
            'click .branching3.img2': 'oncustomButtonView2',
            'click .branching3.img3': 'oncustomButtonView3',
			
			'click .branching3.img01': 'oncustomButtonView4',
            'click .branching3.img02': 'oncustomButtonView5',
            
            'click .branching3.img001': 'oncustomButtonView6',
            'click .branching3.img002': 'oncustomButtonView7'
           
            
            
        },
        
        initialize: function() {
            this.listenTo(Adapt, 'remove', this.remove);
            this.render();
        },
        
      
        oncustomButtonView1: function(event){branch1 = true;onPageVisit1 = true;}, 
        oncustomButtonView2: function(event){branch2 = true;onPageVisit1 = true;}, 
        oncustomButtonView3: function(event){branch3 = true;onPageVisit1 = true;},
		
		oncustomButtonView4: function(event){branch4 = true;onPageVisit2 = true;}, 
        oncustomButtonView5: function(event){branch5 = true;onPageVisit2 = true;},
        
        oncustomButtonView6: function(event){branch6 = true;onPageVisit3 = true;}, 
        oncustomButtonView7: function(event){branch7 = true;onPageVisit3 = true;},
        
        scrollToPageElement: function(event) {
            var currentComponentSelector1 = '.c-60-02';//.c-70-01
            var currentComponentSelector2 = '.c-70-01';
            var currentComponentSelector3 = '.c-100-01';
            var $currentComponent1 = $(currentComponentSelector1);
            var $currentComponent2 = $(currentComponentSelector2);
            var $currentComponent3 = $(currentComponentSelector3);
           // alert("onPageVisit1 "+onPageVisit1 +"    onPageVisit2 "+onPageVisit2);
            if(onPageVisit2 ){
                Adapt.scrollTo(currentComponentSelector2, { duration:400 });
               
                
            }
            
            if(onPageVisit3 ){
                Adapt.scrollTo(currentComponentSelector3, { duration:400 });
               
            }
            
            
            
            if(onPageVisit1){
                Adapt.scrollTo(currentComponentSelector1, { duration:400 });
               
                /*onPageVisit1 = false;*/
            }
            
        },
        
        

        preRender: function() {
            this.checkIfResetOnRevisit();
        },
        
        
        

        postRender: function() {
            this.setReadyStatus();
            this.setupInview();
            this.scrollToPageElement();               
                
            if(branch1){
                this.$(".branching3.img1").addClass("visited");
            }
            if(branch2){   
                this.$(".branching3.img2").addClass("visited");
            }
            if(branch3){   
                this.$(".branching3.img3").addClass("visited");
            }
			
			if(branch4){   
                this.$(".branching3.img01").addClass("visited");
            }
            if(branch5){   
                this.$(".branching3.img02").addClass("visited");
            }
            
            
            if(branch6){   
                this.$(".branching3.img001").addClass("visited");
            }
            if(branch7){   
                this.$(".branching3.img002").addClass("visited");
            }
            
            
            
        },

        setupInview: function() {

            var selector = this.getInviewElementSelector();

            if (!selector) {
                this.setCompletionStatus();
            } else {
                this.model.set('inviewElementSelector', selector);
                this.$(selector).on('inview', _.bind(this.inview, this));
            }
        },

        /**
         * determines which element should be used for inview logic - body, instruction or title - and returns the selector for that element
         */
        getInviewElementSelector: function() {
            if(this.model.get('body')) return '.component-body';

            if(this.model.get('instruction')) return '.component-instruction';
            
            if(this.model.get('displayTitle')) return '.component-title';

            return null;
        },

        checkIfResetOnRevisit: function() {
            var isResetOnRevisit = this.model.get('_isResetOnRevisit');
            
            // If reset is enabled set defaults
            if (isResetOnRevisit) {
                this.model.reset(isResetOnRevisit);
            }
        },

        inview: function(event, visible, visiblePartX, visiblePartY) {
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
                    this.$(this.model.get('inviewElementSelector')).off('inview');
                    this.setCompletionStatus();
                }
            }
        },

        remove: function() {
            
            if(this.model.has('inviewElementSelector')) {
                this.$(this.model.get('inviewElementSelector')).off('inview');
            }
            
            ComponentView.prototype.remove.call(this);
        }
    },
    {
        template: 'text'
    });

    Adapt.register('text', Text);

    return Text;
});

