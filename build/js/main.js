function ChineseCheckers() {
  this.version = '1.0.0';

  return this;
}


ChineseCheckers.prototype = (function() {

  var state, bgStage, mainStage, animationStage,
      bgStageEl, mainStageEl, animationStageEl, gameWrap;

  var currentTurn;

  // UI scale
  var scale;
  var stageWidth;
  var stageHeight;

  // 
  var positions = [];

  // 
  var pieces = [];
  var curr = 1;
  
  var fromPos, toPos;

  function init() {
    state = "111111111100000000000000000000000000000000000000000000000000000000000002222222222".split('');
    currentTurn = 1;

    gameWrap = $('.game');
    bgStageEl = $('#bg-stage');
    mainStageEl = $('#main-stage');
    animationStageEl = $('#animation-stage');


    bgStage = new createjs.Stage('bg-stage');
    mainStage = new createjs.Stage('main-stage');
    animationStage = new createjs.Stage('animation-stage');

    var update = true;

    function updateStageWH() {
      var bWidth = $(window).width();
      var bHeight = $(window).height();

      //width over height
      var ratio = 1/1.7;

      var browserRatio = bWidth/bHeight;
      
      if(browserRatio > ratio) {
	stageHeight = bHeight * 0.8;
	stageWidth = stageHeight * ratio;
      } else {
	stageWidth = bWidth * 0.8;
	stageWidth = stageWidth / ratio;
      }

      scale = stageHeight/254;

      gameWrap.width(stageWidth);
      gameWrap.height(stageHeight);

      gameWrap.find('canvas').each(function () {
	this.width = stageWidth;
	this.height = stageHeight;
      });

      animationStageEl.hide();

      
      // generate positions

      (function () {

	var direction = 1;
	var r = scale * 15;
	var startPos = {
	  x: (8 / 2 + 1) * r,
	  y: r
	};
	var eachLine = 1;
	var index = 1;

	positions = [];

	for(var i = 0; i < 17; i++) {
	  

	  for(var j = 0; j < eachLine; j++) {
	    positions.push({
	      x: startPos.x + j * r,
	      y: startPos.y
	    });
	  }
	  
	  if(i >= 8) direction = -1;

	  eachLine += direction;
	  startPos.x += -direction / 2 * r;
	  startPos.y += r / 2 * Math.sqrt(3);
	}
      
      })();


      //init pieces
      (function () {

	// clear previus pieces;
	pieces = [];
	bgStage.removeAllChildren();
	bgStage.clear();
	var r = scale * 4;

	for(var i = 0, l = positions.length; i < l; i++) {

	  var pos = positions[i];
	  pieces.push((function () {

	    var circle = new createjs.Shape();
	    circle.graphics.beginStroke((function () {
	      if(i < 10) return "blue";
	      if(l - i <= 10) return "red";
	      return "#999";
	    })()).drawCircle(0, 0, r);
	    circle.x = pos.x;
	    circle.y = pos.y;
	    bgStage.addChild(circle);
	  
	  })());
	}

	bgStage.update();

      })();

      renderState();
    };

    function tick(evnet) {
      if(update) {
	update = false;
	mainStage.update(event);
      }
    }

    createjs.Ticker.addEventListener("tick", tick);

    function renderState() {

      var r = scale * 6;

      var current = null;

      mainStage.removeAllChildren(); 
      mainStage.clear();

      for(var i = 0, l = state.length; i < l; i++) {

	if(+state[i] === 0) continue;

	var circle = new createjs.Shape();
	circle.graphics.beginFill((function () {
	
	  if(+state[i] === 1) {
	    return "blue";
	  } else {
	    return "red";
	  }
	
	})()).drawCircle(0, 0, r);

	circle.checkerIndex = i + 1;

	circle.on('mousedown', function (e) {

	  if(curr !== state[this.checkerIndex - 1] - 1) return;

	  if(current) current.scaleX = current.scaleY = 1;

	  this.scaleX = this.scaleY = 1.2;

	  current = this;

	  $.ajax({
	    url: "http://movingai.com/cc/cc.cgi",
	    data: {
	      board: stringify(),
	      piece: this.checkerIndex,
	      curr: curr
	    },
	    dataType: 'jsonp',
	    error: function () {
	      // this is a hack
	      console.log(targets);
	      highlightMove(targets);
	    }
	  });

	  fromPos = this.checkerIndex;



	  update = true;
	});
	
	circle.x = positions[i].x;
	circle.y = positions[i].y;
	mainStage.addChild(circle);
      }

      mainStage.update();

    }

    function highlightMove(targets) {
      
      var _self = this;
      if(this.currentHightlight) {
	$.each(this.currentHightlight, function (index, value) {
	  console.log(value);
	  mainStage.removeChild(value);
	});
	this.currentHightlight = [];
      }

      $.each(targets, function(index, value) {
	console.log(value); 
	var r = scale * 5;

	var circle = new createjs.Shape();

	circle.graphics.beginFill((function () {
	  return 'green';	
	})()).drawCircle(0, 0, r);

	circle.x = positions[+value - 1].x;
	circle.y = positions[+value - 1].y;

	circle.checkerIndex = +value;

	if(! _self.currentHightlight) _self.currentHightlight = [];
	_self.currentHightlight.push(circle);

	circle.on('mousedown', function (e) {
	  toPos = this.checkerIndex;
	  performMove(fromPos, toPos);
	});

	mainStage.addChild(circle);
      });
      update = true;
    }

    function performMove(from, to) {

      state[to - 1] = state[from - 1];
      state[from - 1] = 0;

      curr = curr ? 0 : 1;
      renderState();
    }
  
    updateStageWH();
    $(window).resize(updateStageWH); 
    
  }

  function stringify() {
    return state.join('');
  }

  return {
    test: function () {
	    console.log(this);
	  },
    tringify: stringify, 
    run: function () {
	   init();
	   console.log("i'm running!");
	 }
  }

})();



$(document).ready(function() {
  new ChineseCheckers().run();
});
