function ChineseCheckers() {
  this.version = '1.0.0';

  return this;
}


ChineseCheckers.prototype = (function() {

  var state, bgStage, mainStage, animationStage,
      bgStageEl, mainStageEl, animationStageEl, gameWrap;

  // UI scale
  var scale;
  var stageWidth;
  var stageHeight;

  // 
  var positions = [];

  // 
  var pieces = [];
  
  var fromPos, toPos;

  function Board() {};

  Board.prototype =  {
    mapping: (function () {
      var result = [];
  
      var l = 1;
      var direction = 1;
      for(var i = 0; i < 17; i++) {

	if(i >= 8) direction = -1;

	var start = direction > 0 ? (l - 1) * 9 : 72 + i - 8;
	result.push(start);
	for(var j = 0; j < l - 1; j++) {
	  result.push(start - 8 * (j + 1)); 
	}
	l += direction;
      }

      return result;

    })(),
    transform: function(src, type) {
      var map = this.mapping;

      var result = (function () {
	var r = [];
	for(var i = 0; i < 81; i++) {
	  r.push(0);
	}
	return r;
      })();

      if(!type) {
        //layout to matrix
	$(src.split('')).each(function(index, el) {
	  result[map[index]] = +el;
	});
        
      } else {
        //matrix to layout
	$(src.split('')).each(function(index, el) {
          result[map.indexOf(index)] = el;
        });
      }
      return result;
    },
    // list all available moves
    // state: state string
    // turn: curr turn
    // type: indicate the input type(matrix or layout)
    // from: start position
    // rType: output type(matrix or layout)

    // default: both input and output are of type layout
    // set type/rType to true if type matrix is prefered
    // position are 0 based;

    listMoves: function(state, turn, from, type, rType) {

      var result = [];
      var matrix;
      var _self = this;


      matrix = type ? state.split('') : _self.transform(state);
      matrix = matrix.map(function (e) {return +e; });
      from = type ? from : _self.mapping[from];

      if(matrix[from] !== turn + 1) return [];

      var x = from % 9;
      var y = parseInt(from / 9);

      // single move
      (function () {

	//tr
	if(x < 8 && y > 0 && matrix[from - 8] === 0) {
	  result.push(from - 8);
	}

	//r
	if(x < 8 && matrix[from + 1] === 0) {
	  result.push(from + 1);
	}

	//l
	if(x > 0 && matrix[from - 1] === 0) {
	  result.push(from - 1);
	}

	//t
	if(y > 0 && matrix[from - 9] === 0) {
	  result.push(from - 9);
	}

	//bl
	if(y < 8 && x > 0 && matrix[from + 8] === 0) {
	  result.push(from + 8);
	}
	
	//b
	if(y < 8 && matrix[from + 9] === 0) {
	  result.push(from + 9);
	}
      
      })();

      // jump

      function listJumps(matrix, from) {
      
	var x = from % 9;
	var y = from / 9;

	//tr
	if(x < 7 && y > 1 && matrix[from - 16] === 0 && matrix[from - 8] > 0 && result.indexOf(from - 16) < 0) {
	  result.push(from - 16);
	  listJumps(matrix, from - 16);
	}
	
	//t
	if(y > 1 && matrix[from - 18] === 0 && matrix[from - 9] > 0 && result.indexOf(from - 18) < 0) {
	  result.push(from - 18);
	  listJumps(matrix, from - 18);
	}
	
	//r
	if(x < 7 && matrix[from + 2] === 0 && matrix[from + 1] > 0 && result.indexOf(from + 2) < 0) {
	  result.push(from + 2);
	  listJumps(matrix, from + 2);
	}

	//b
	if(y < 7 && matrix[from + 18] === 0 && matrix[from + 9] > 0 && result.indexOf(from + 18) < 0) {
	  result.push(from + 18);
	  listJumps(matrix, from + 18);
	}
	
	//bl
	if(y < 7 && x > 1 && matrix[from + 16] === 0 && matrix[from + 8] > 0 && result.indexOf(from + 16) < 0) {
	  result.push(from + 16);
	  listJumps(matrix, from + 18);
	}

	//l
	if(x > 1 && matrix[from - 2] === 0 && matrix[from - 1] > 0 && result.indexOf(from - 2) < 0) {
	  result.push(from - 2);
	  listJumps(matrix, from - 2); 
	}

      }

      listJumps(matrix, from);

      result =  rType ? result : result.map(function (e) {
	return _self.mapping.indexOf(+e) + 1;
      });

      return result;
    }
  }

  function init(s) {
    //TODO
    //allow user to init game with a custom state

    state = "111111111100000000000000000000000000000000000000000000000000000000000002222222222".split('').map(function(e) { return +e;});
    curr = 1;

    var boardInstance = new Board();

    gameWrap = $('.game');
    bgStageEl = $('#bg-stage');
    mainStageEl = $('#main-stage');
    animationStageEl = $('#animation-stage');

    bgStage = new createjs.Stage('bg-stage');
    mainStage = new createjs.Stage('main-stage');
    animationStage = new createjs.Stage('animation-stage');

    // flag: if set true, update mainStage at next time tick
    var update = true;

    function restart() {
      state = "111111111100000000000000000000000000000000000000000000000000000000000002222222222".split('').map(function(e) { return +e;});
      curr = 1;
      renderState();
    }

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

	//add text
	var text = new createjs.Text("turn", scale * 12 +"px Arial", "#333");

	text.x = positions[43].x + r;
	text.y = positions[0].y;

	text.textBaseline = "alphabetic";

	bgStage.addChild(text);

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
    createjs.Touch.enable(mainStage);
    createjs.Touch.enable(animationStage);

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

	  // use local version instead;
	  /*
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
	      highlightMove(targets);
	      console.log(targets);
	      console.log(boardInstance.listMoves(stringify(), curr, current.checkerIndex - 1));
	    }
	  });
	  */

	  highlightMove(boardInstance.listMoves(stringify(), curr, current.checkerIndex - 1));

	  fromPos = this.checkerIndex;
	  update = true;

	});
	
	circle.x = positions[i].x;
	circle.y = positions[i].y;
	mainStage.addChild(circle);

      }
      mainStage.update();


      if(bgStage.curr) {
	bgStage.removeChild(bgStage.curr);
	bgStage.curr = null;
      }

      var c = new createjs.Shape();
      c.graphics.beginFill((function () {

	if(+curr === 0) {
	  return "blue";
	} else {
	  return "red";
	}

      })()).drawCircle(0, 0, r);

      c.x = positions[44].x;
      c.y = positions[2].y;

      bgStage.addChild(c);
      bgStage.update();
    }

    function highlightMove(targets) {
      
      var _self = this;
      if(this.currentHightlight) {
	$.each(this.currentHightlight, function (index, value) {
	  mainStage.removeChild(value);
	});
	this.currentHightlight = [];
      }

      $.each(targets, function(index, value) {
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

      console.log("Player " + (curr ? "red" : "blue") + " move from " + from + " to " + to + ".");

      curr = curr ? 0 : 1;

      renderState();
      detectWinner();
    }

    function detectWinner() {

      var flagA = 0;
      var flagB = 0;
      var countA = 0;
      var countB = 0;

      for(var i = 0, l = state.length; i < l; i++) {

	if(i < 10) {
	  if(state[i] > 0) {
	    countA ++;
	    flagA = flagA | (state[i] === 1 ? 1 : 2); 
	  }
	} else if(i > 70) {
	  //todo
	  if(state[i] > 0) {
	    countB ++;
	    flagB = flagB | (state[i] === 1 ? 1 : 2);
	  }
	}
      }

      if(countA === 10 && flagA === 3) {
	//player red win
	console.log("player red win");
	alert("player red win");
	restart();

      } else if(countB === 10 && flagB === 3) {
	//player blue win
	console.log("player blue win");
	alert("player blue win");
	restart();
      }

      return; 
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
