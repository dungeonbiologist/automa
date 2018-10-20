function drawTriad(canvas, triad, highlight){
  var context = canvas.getContext("2d");
  context.fillStyle = colors[triad[0]];
  context.fillRect(0,0,size,size);
  context.fillStyle = colors[triad[1]];
  context.fillRect(size,0,size,size);
  context.fillStyle = (highlight)? lightColors[triad[2]] : colors[triad[2]];
  context.fillRect(size/2,size,size,size);
  canvas["data-left"]=triad[0];
  canvas["data-right"]=triad[1];
  canvas["data-bottom"]=triad[2];
}
function illustrateRule(rule){
  var image = document.createElement("canvas");
  image.width  = size*2;
  image.height = size*2;
  image.addEventListener("mousemove", mouseMoveTriad, false);
  image.addEventListener("mousedown", mouseDownTriad, false);
  image.addEventListener("mouseout", mouseOutRuleset, false);
  drawTriad(image, rule);
  return image;
}
function bit(n,num){
  return Math.floor(num / Math.pow(states,n))%states;
}
function ruleToTriad(place){
  return [bit(1,place),bit(0,place),ruleset[place]];
}
function outlineRules(g){
  var styles = ["2px solid white", "2px solid green", "2px solid red", "2px solid yellow"];
  var style = [];
  for(var i=0; i<states*states; i++){
    var more=0;
    var less=0;
    for(var j=0; j<states; j++){
      if(g[states*i+j] > 0){
        more=2;
      } else if(g[states*i+j] < 0){
        less=1;
      }
    }
    style[i]=more+less;
  }
  var children = document.getElementById("rules").childNodes;
  for(var j=0; j<children.length; j++){
    var rules = children[j].childNodes;
    for(var i=0; i<rules.length; i++){
      var place = states*i + j;
      rules[i].style.border = styles[style[place]];
    }
  }
}

function drawRules(ruleset){
  var children = document.getElementById("rules").childNodes;
  for(var j=0; j<children.length; j++){
    var rules = children[j].childNodes;
    for(var i=0; i<rules.length; i++){
      var rule = drawTriad(rules[i], [i, j, ruleset[states*i + j]], showRule == states*i+j );
    }
  }
}

function mouseMoveTriad(e){
  //moused over triad
  var triad = e.target;
  var place = states*triad["data-left"] + triad["data-right"];
  if(ruleset[place] == triad["data-bottom"]){
    showRule=place;for(var j=0; j<sliders.length; j++){
      sliders[j].showChange(place);
    }
  }
  render();
}
function mouseDownTriadRule(e){
   //over triad
  var triad = e.target;
  var place = states*triad["data-left"] + triad["data-right"];
  var copy = copyVect(ruleset);
  copy[place] = (ruleset[place]+1)%states;
  changeRule(copy);
  render();
}
function mouseDownTriad(e){
   //over triad
  var triad = e.target;
  var place = states*triad["data-left"] + triad["data-right"];
  var t = [triad["data-left"], triad["data-right"], (triad["data-bottom"]+1)%states];
  drawTriad(triad, t);
}
