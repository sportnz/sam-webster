define([
  'jquery','underscore','backbone',  
  'views/FramesView',
  'text!templates/tacticsFramesTemplate.html',
  'text!templates/tacticsIndividualFrameTemplate.html'
], function($, _, Backbone, FramesView, template, frameTemplate){

  var TacticsFramesView = FramesView.extend({
    initialize : function(){
      this.render();
    },       
    events: function(){
       return _.extend({},FramesView.prototype.events,{});
    },    
    render: function(){         
      this.$el.html(template);   
      this.initTactics();
      return this;      
    },
    initTactics: function(){
    
      var args={ 
        speed : [0, 15, 16, 20,  26,  33,   51,   60,   68,   71],
        power : [0, 15, 30, 76, 217, 282, 1394, 1889, 1798, 1467],
        lap   : ["Start","Lap 1","Lap 1","Lap 1","Lap 2","Lap 2","Lap 2","Lap 3","Lap 3","Lap 3"],
        title : [ 
    "Lining up",
    "Starting slow",
    "Going high",
    "Keeping Jason behind",
    "More speed",
    "Matching Jason's track height",
    "Holding back a little",
    "The attack",
    "Bringing it home",
    "Winning Gold"
        ],
        narrative : [     
    "Sam and Jason line up for the third and last race of the final.",
    "Sam avoids letting Jason gain too much speed at the start. He’s careful to avoid being attacked from behind.",
    "Sam goes high on the straights, gaining potential energy to counter the coming attack.",
    "Sam continues to dictate the race, moving up and down the track, making sure Jason follows him closely.",
    "While keeping the speed low at the start of lap 2, Sam puts some power down coming out of the first turn.",
    "Jason climbs and so does Sam, who looks back frequently.",
    "Getting out of his seat in turn 2, Sam rides close to his limit, holding back only a little entering the final lap.",
    "With just over 200m to go, Sam takes one last look back then attacks, dropping into the back straight.",
    "Head down and driving for home, Sam knows his opponent will try to use his slipstream to slingshot past him in the final metres.",
    "Sam finishes less than a bike's length ahead of Jason."
        ]
      };
      
      for (i = 0; i < args.lap.length; i++) { 
        this.$('.frame'+i).html(_.template(frameTemplate)({index:i, data:args}));
      } 
    }

  });

  return TacticsFramesView;
  
});