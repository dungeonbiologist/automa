var sharedPrototype = {
  makeNew: function(index, pattern){
    var result = {};
    result.__proto__ = this;
    result.clear(); //set variables
    result.min = 0;
    result.dataIndex=index;
    if(pattern.length == 0){
	result.pattern = zeroArray(states*states*states);	    
    }
    else if(pattern){
      for(var i=0; i<pattern.length; i++){
        result.pattern[i] = pattern[i];;
      }
    }
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
  clear: function(){
    this.pattern=[];
    this.desiredVal = undefined;
    this.offset=false;
    this.examples = [];
  },
  value: function(){
    return this.desiredVal || 0;
  },
  gradient: function(){
    if(this.pattern.length == 0){
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
    if(this.pattern.length>0) {
      this.desiredVal = target
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
      return predict(ruleToPattern(ruleset),this.pattern);
  }
};
function createSlider(){
  var index = sliders.length;
  var slider = document.createElement("div");
  slider.className="slider";
  slider["data-index"]=index;
  document.getElementById("sliders").appendChild(slider);
    var container = document.createElement("span");
    container.className="container";
    container.addEventListener('mouseover', mouseOverSlider, false);
    container.addEventListener('mouseout', mouseOutSlider, false);
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
    
  clear.addEventListener('mousedown', deleteTarget, false);
  container.addEventListener('mousedown', addTarget, false);
  slider.addEventListener('mousedown', mouseDownSlider, false);
  
  var box = document.createElement("span");
  box.style.display = "inline-block";
  box.style.padding ="20px 10px 0px";
  box.style.valign="middle";
  box.style.border = "solid";
  box.addEventListener('mouseup', mouseUpGroup, false);
  var button = document.createElement("canvas");
  button.width =50;
  button.height =50;
  button.addEventListener('click', hideGroup, false);
  button.addEventListener('dblclick', dblclickGroup, false);
  button['data-index']=storedGroups.length;
  box['data-index']=storedGroups.length;
  storedGroups.push({box:box, thumbnail:button, pattern:[]});
  slider.appendChild(button);
  slider.appendChild(box);
  
  sliders[index] = sharedPrototype.makeNew(storedGroups.length-1, []);
  sliders[index].node = slider;
}
function mouseDownSlider(e){
  sliders[sliders.active].node.style.border = "none";
  sliders.active = this["data-index"];
  this.style.border = "2px solid black";
}
function deleteTarget(e){
  var node = findChild(e.target.parentNode,"target");
  if(node){
    sliders[node.parentNode["data-index"]].actualVal=undefined; //delete the target
    node.parentNode.removeChild(node);
  }
}
function addTarget(e){
  sliders[sliders.active].node.style.border = "none";
  sliders.active=e.target.parentElement["data-index"];
  e.target.parentElement.style.border = "2px solid black";
  var already = findChild(e.target.parentNode,"target");
  if(!already){
    var node = document.createElement("span");
    node.setAttribute("contentEditable",true);
    node.className="target grabable";
    node.textContent="0";
    e.target.parentNode.insertBefore(node, e.target); //appendChild would put this element lower down instead of on the same line
    node.addEventListener('mousedown', grabNode, false);
    node.addEventListener('keyup', adjustPosition, false);
    differential = -getPosition(e.target.parentNode).x;
    node.style.left = mouse.x+differential + "px"
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
  e.target.textContent = e.target.textContent.replace(/[^0-9.]/g,'')
  var value = clamp(0, parseFloat(e.target.textContent) || 0, 1);
  e.target.style.left= clamp(0, value*200, 200) + "px";
  var place = e.target.parentNode["data-index"];
  sliders[place].changeValue(value);
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
