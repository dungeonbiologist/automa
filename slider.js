var sharedPrototype = {
    makeNew: function(){
    var result = {};
    result.__proto__ = this;
    result.patterns = [];
    result.desiredVal = undefined;
    result.offset=false;
    return result;
  },
  update: function(){
    var actualValue = this.actualValue(ruleset);
    if(this.node){
      var valueNode = findChild(this.node,"value");
      valueNode.textContent = actualValue.toFixed(1);
      valueNode.style.left = actualValue*200;
    }
  },
  value: function(){
    return this.desiredVal || 0;
  },
  gradient: function(){
    if(this.patterns.length == 0){
      return zeroArray(states*states*states);
    }
      var currentFit = this.actualValue(ruleset);
    var grad = possibleScores(this,ruleset);
    for(var j=0; j<grad.length; j++){
      grad[j] = grad[j]-currentFit; //the change in fit for each
    }
    return grad;
  },
    changeValue: function(target){
	if(this.patterns.length>0) {
	    this.desiredVal = target;
	    var oldRuleset = ruleset;
	    for(var i=0; i<9; i++){
		var newRuleset = guessToRule(oldRuleset,this);
		if(equal(newRuleset, oldRuleset)){
		    break;
		}
		oldRuleset = newRuleset;
	    }
	    if(!equal(ruleset,newRuleset)){
		changeRule(newRuleset);
	    }
	}
    },
    errorOf: function (ruleset){
	if(this.desiredVal !== undefined){
	    return Math.abs(this.actualValue(ruleset) - this.desiredVal);
	}
	return 0;
    },
  showChange: function(place){
    var rules = copyVect(ruleset);
    var currentFit = this.actualValue(ruleset);
    if(findChild(this.node, "tempvalue") == null){
      for(var i=0; i<states; i++){
        rules[place] = i;
        var fit = this.actualValue(rules);
        if(fit != currentFit){
          var value = document.createElement("div");
          this.node.appendChild(value);
          value.className = "tempvalue";
          value.style.left = (200*fit)+"px";
          value.style.top = (i*5)+"px";
          value.style.backgroundColor = colors[i];
          //value.textContent = (""+fit).substring(0,3);
        }
      }
    }
  },
  clearChange: function(){
    for(var i=0; i<states; i++){
      var value = findChild(this.node, "tempvalue");
      if(value){
        this.node.removeChild(value);
      }
    }
  },
    actualValue: function(ruleset){
	var length = this.patterns.length;
	var rule = ruleToPattern(ruleset);
	if(length == 0){
	    return 0;
	} else if(length == 1){
	    return predict(rule,this.patterns[0]);
	} else if(this.desiredVal !== undefined){
	    var place = this.desiredVal*(length-1);
	    if(place%1 == 0){//at the instant the desired value crosses over from one segment of the peicewise function to another, it averages the two segments
		var low = this.patterns[clamp(0,place-1,length-1)];
		var high = this.patterns[clamp(0,place+1,length-1)];
		var diff = predict(rule,high)-predict(rule,low);
		var value = (place + diff)/(length-1);
		var result = clamp(0,value,1);
		return result;
	    } else { //returns the value appropriet for the segment of the peicewise function it is in
		var low = this.patterns[Math.floor(place)];
		var high = this.patterns[Math.ceil(place)];
		var diff = (1 + predict(rule,high)-predict(rule,low))/2;
		var result = (Math.floor(place)+diff)/(length-1);
		return result;
	    }
	} else {
	    var sum=0;
	    var maxsum=0;
	    for (var i=0; i<this.patterns.length; i++){
		var weight = predict(rule,this.patterns[i]);
		maxsum += weight;
		sum += weight*i;
	    }
	    return sum/maxsum;
	}
    }
};
function createSlider(){
  var slider = document.createElement("div");
  slider.className="slider";
  document.getElementById("sliders").appendChild(slider);
    var container = document.createElement("span");
    container.className="container";
    container.addEventListener("mouseover", mouseOverSlider, false);
    container.addEventListener("mouseout", mouseOutSlider, false);
    slider.appendChild(container);
      var line = document.createElement("div");
      line.className="line";
      container.appendChild(line);
      
    var value = document.createElement("div");
    value.className="value";
    value.textContent = "0";
    slider.appendChild(value);
    
    var clear = document.createElement("span");
    clear.className="clear";
    slider.appendChild(clear);
    
  clear.addEventListener("mousedown", deleteTarget, false);
  container.addEventListener("mousedown", addTarget, false);
  slider.addEventListener("mousedown", mouseDownSlider, false);
  
  var box = document.createElement("span");
  box.style.display = "inline-block";
  box.style.padding ="20px 10px 0px";
  box.style.valign="middle";
  box.style.border = "solid";
    box.addEventListener("mouseup", mouseUpSliderGroup, false);
  slider.appendChild(box);
  
  var data = sharedPrototype.makeNew();
    data.node = slider;
    slider.slider = data;
    data.box = box;
    box.slider = data;
    sliders.push(data);
}
function mouseDownSlider(e){
  sliders.active.node.style.border = "none";
  sliders.active = this.slider;
  this.style.border = "2px solid black";
}
function mouseUpSliderGroup(e){
    var box = e.target;
    if(grabbedCA !== null){
	box.appendChild(grabbedCA);
	grabbedCA.group = box;
	//collect patterns
	updatePatternList(box.childNodes,box.slider);
	grabbedCA = null;
	if(sliders[sliders.length-1] == box.slider){ //if there are no more empty sliders, add one
	    createSlider();
	}
  }
}
function updatePatternList(thumbnails,slider){
    var list = [];
    for(var t=0; t< thumbnails.length; t++){
	list.push(thumbnails[t].CA.pattern);
    }
    slider.patterns = list;
}
function deleteTarget(e){
  var node = findChild(e.target.parentNode,"target");
  if(node){
    node.parentNode.slider.actualVal=undefined; //delete the target
    node.parentNode.removeChild(node);
  }
}
function addTarget(e){
  sliders.active.node.style.border = "none";
  sliders.active=e.target.parentElement.slider;
  e.target.parentElement.style.border = "2px solid black";
  var already = findChild(e.target.parentNode,"target");
  if(!already){
    var node = document.createElement("span");
    node.setAttribute("contentEditable",true);
    node.className="target grabable";
    node.textContent="0";
    e.target.parentNode.insertBefore(node, e.target); //appendChild would put this element lower down instead of on the same line
    node.addEventListener("mousedown", grabNode, false);
    node.addEventListener("keyup", adjustPosition, false);
    differential = -getPosition(e.target.parentNode).x;
    node.style.left = mouse.x+differential + "px";
    grabbed = node;
    mouseMove(e);
  }
}
function grabNode(e){
  var x = e.target;
  if(x.classList.contains("grabable")){
    differential = (parseInt(x.style.left, 10)||0) - mouse.x;
    grabbed = x;
  }
}
function findChild(node,id){
  for(var i=0; i<node.children.length; i++){
    if(node.children[i].classList.contains(id)){
      return node.children[i];
    }
  }
  return null;
}
function adjustPosition(e){
  e.target.textContent = e.target.textContent.replace(/[^0-9.]/g,"");
  var value = clamp(0, parseFloat(e.target.textContent) || 0, 1);
  e.target.style.left= clamp(0, value*200, 200) + "px";
  var slider = e.target.parentNode.slider;
  slider.changeValue(value);
  render();
}
function getPosition(el){
  var xPos = 0;
  var yPos = 0;
  while (el) {
    if (el.tagName == "BODY") {
      // deal with browser quirks with body/window/document and page scroll
      var xScroll = el.scrollLeft || document.documentElement.scrollLeft;
      var yScroll = el.scrollTop || document.documentElement.scrollTop;
      xPos += (el.offsetLeft - xScroll + el.clientLeft);
      yPos += (el.offsetTop - yScroll + el.clientTop);
    } else {
      // for all other non-BODY elements
      xPos += (el.offsetLeft - el.scrollLeft + el.clientLeft);
      yPos += (el.offsetTop - el.scrollTop + el.clientTop);
    }
    el = el.offsetParent;
  }
  return {
    x: xPos,
    y: yPos
  };
}
