define([
  'jquery','underscore','backbone', // helper
  'skrollr',
  'views/IntroView','views/TacticsView','views/TimelineView',
  'views/PrepView','views/AdviceView',//'views/WinView',//subviews
  'text!templates/appTemplate.html'//templates
], function(
  $, _, Backbone,
  skrollr,
  IntroView, TacticsView, TimelineView, PrepView, AdviceView,
  template
){

  var AppView = Backbone.View.extend({    
    initialize : function(options){
      this.options = options || {};      
           
      this.img_loaded = false;
      this.totalImg = 0;
      this.skroll_data = [];
      this.render();  
                
      // bind to window
      $(window).scroll(_.debounce(_.bind(this.scrolled, this),10));
      $(window).resize(_.debounce(_.bind(this.resized, this),1000));
      if (Modernizr.touch){
        $(window).on('touchstart touchmove touchend', _.debounce(_.bind(this.scrolled, this),10));      
      }   
      
      
    },
    events : {
      "updateRouteEvent" : "updateRoute",    
      "scrollEvent" : "scrollEvent",    
      "click .resetApp" : "resetApp",      
      "click .toggle-share" : "toggleShare",      
      "click .nav a" : "goToChapter",      
      "click .navbar-toggle" : "navbarToggle",      
      "resetAppEvent" : "resetApp"
    },      
    render: function(){     
      
      this.$el.html(template);      
      this.$('.fill-screen').each(function(){
        $(this).css('min-height',$(window).height());
      });   
      if ($(window).height() < 800) {
        this.$el.addClass('low-screen');
      } else {
        this.$el.removeClass('low-screen');
      } 
      // init subviews
      this.model.addChapter(this.$('#intro-view').data('id'),new IntroView({
        el:this.$('#intro-view')
      }));         
      this.model.addChapter(this.$('#timeline-view').data('id'),new TimelineView({
        el:this.$('#timeline-view')
      }));               
      this.model.addChapter(this.$('#tactics-view').data('id'),new TacticsView({
        el:this.$('#tactics-view'),
        auto_play:(Modernizr.touch) ? false : true,
        play_tolerance:$(window).height()/4
      }));       
      this.model.addChapter(this.$('#prep-view').data('id'),new PrepView({
        el:this.$('#prep-view')
      }));
      this.model.addChapter(this.$('#advice-view').data('id'),new AdviceView({
        el:this.$('#advice-view')     
      }));
//      this.model.addChapter(this.$('#win-view').data('id'),new WinView({
//        el:this.$('#win-view')  
//      }));  
      
      this.initSkrollr();
      this.skrollr = skrollr.init({
        forceHeight : false
      }); 
      
      // re-run this once all images have been loaded
      var $img = this.$('img');      
      this.totalImg = $img.length;
      var that = this;
      $img.each(function() {
          $(this)
              .load(_.bind(that.waitImgDone,that))
              .error(_.bind(that.waitImgDone,that));
      });        
      
      this.activateChapter(this.getChapterByPosition());
      // Load Sharing
      $('head').append('<script type="text/javascript" src="//s7.addthis.com/js/300/addthis_widget.js#pubid=ra-54d1b9271ac1634b" async="async"></script>');          

      // Load YouTube API
      if (typeof YT === 'undefined') {
        $('head').append('<script src="//www.youtube.com/iframe_api" type="text/javascript"></script>');    
      }      
      
      var that = this;
      if (typeof YT !== 'undefined') {
        that.model.getChapterByID('prep').view.initPlayers();
        that.model.getChapterByID('tactics').view.initPlayers();  
      } else {      
        window.onYouTubeIframeAPIReady = function() {
          that.model.getChapterByID('prep').view.initPlayers();
          that.model.getChapterByID('tactics').view.initPlayers();          
        };
      }
 
    },
    waitImgDone : function() {
        this.totalImg--;
        if ((this.totalImg===0) && (!this.img_loaded)) {

          this.img_loaded = true;
          this.initSkrollr(); 
          this.skrollr.refresh();           
        }
    },            
    initSkrollr: function(){     

      this.$('.fill-screen').each(function(){
        $(this).css('min-height',$(window).height());
      });        
      
      var offset_top = 0;
      _.each(this.model.getChapters(), function(chapter){
        offset_top = chapter.view.offsetSkroll(offset_top);
      });    

      // offset footer
      offset_top = this.offsetSkroll(this.$('footer'),this.$('footer').outerHeight(),offset_top);    
      
      $('body').css('height',offset_top);
 
    },
    offsetSkroll: function($item,offset,offset_top){
      this.removeSkrollData($item);
      $item.attr('data-0','top:'+ offset_top +'px');
      this.skroll_data.push('data-0');
      $item.attr('data-'+offset_top,'top:0px;');
      this.skroll_data.push('data-'+offset_top);
      offset_top += offset;  
      $item.attr('data-'+offset_top,'top:-'+offset+'px');   
      this.skroll_data.push('data-'+offset_top);      
      return offset_top;
    },     
    removeSkrollData : function($item){
      _.each(this.skroll_data,function(sd){
        $item.removeAttr(sd);
        $item.removeData(sd);
      });
      this.skroll_data = [];      
    },               
    // NAV HANDLERS ///////////////////////////////                

  
    scrolled : function(){
      this.activateChapter(this.getChapterByPosition());
    },
    activateChapter:function(chapterID){
      this.$('.nav li').removeClass('active');
      this.$('.nav li#nav-'+chapterID).addClass('active');      
      this.$el.removeClass (function (index, css) {
        return (css.match (/(^|\s)chapter-\S+/g) || []).join(' ');
      });
      this.$el.addClass('chapter-'+chapterID);
      window._gaq.push(['_trackEvent', 'chapter', 'chapter-'+chapterID, '']);
      
    },
    getChapterByPosition : function(){ 
      var chapterID = this.model.get('chapter-id');
      var that = this;
      this.$('section.chapter').each(function(index){
        var scrollTolerance = $(window).height()/4;
        if (that.skrollr.getScrollTop() >= $(this).attr('data-0').split('top:')[1].split('px')[0] - scrollTolerance) {          
          // chapter is in view  
          chapterID = $(this).data('id');  
        }
      });            
      return chapterID;
    },
    
    resized : function(){
      this.$('.fill-screen').each(function(){
        $(this).css('min-height',$(window).height());
      });          
      if ($(window).height() < 800) {
        this.$el.addClass('low-screen');
      } else {
        this.$el.removeClass('low-screen');
      }      
      this.initSkrollr();
      this.skrollr.refresh();      
      this.activateChapter(this.getChapterByPosition());           
    },
  
    
    // EVENT HANDLERS ////////////////////////////////////////////////////////////////
    goToChapter : function (e){
      e.preventDefault();
      this.model.set('userScrolling', false);
      this.$('aside').removeClass('open'); 
      this.$('.share-buttons').removeClass('active');  
      if (typeof $(e.originalEvent.target).attr('href') !== 'undefined') {
        var chapter_id = $(e.originalEvent.target).attr('href').split('#')[1];
      } else {
        var chapter_id = $(e.originalEvent.target).parent().attr('href').split('#')[1];
      }
      var chapter = this.model.getChapterByID(chapter_id);

      this.skrollr.setScrollTop(chapter.view.$el.attr('data-0').split('top:')[1].split('px')[0]);
      this.activateChapter(chapter_id);
      this.model.set('userScrolling', true);
    },
    scrollEvent : function (e, args) {
      var default_options = {
        duration : 0,
        callback : function(){}        
      };
      var options = $.extend(true, default_options, args);       
      this.skrollr.setScrollTop(options.offset);   
      options.callback;
    },    
    updateRoute : function (e, args) {
      this.model.get('router').navigate(args.route,{trigger:true});
    },            
    toggleShare : function(e){
      e.preventDefault();
      this.$('.share-buttons').toggleClass('active');
      this.$('.toggle-share').toggleClass('active');
    },    
    navbarToggle : function(e){
      e.preventDefault();
      this.$('aside').toggleClass('open');  
      this.$('.share-buttons').toggleClass('active');      
    },    
    
  });
  return AppView;
  
});
