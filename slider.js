function singleCombine(source){
	this.circle = true;
	if( ! source.checkCircle() ){
		this.pattern = [source];
	}
	this.circle = false;
}
function AndCombiner(parent){
	var child = {};
	child.__proto__ = parent;
	child.add = function(place){
		for(var i=0; i<this.length; i++){
			var p = this.transformPlace(i,place);
			this.transform(i).add(p);
		}
	};
	child.remove = function(place){
		if(this.length==0){ return;}
		var fit = [];
		for(var i=0; i<this.length; i++){
			var rule = this.transformRuleset(i,ruleset);
			fit[i] = this.transform(i).actualValue(rule);
		}
		var best = firstBestAt(fit);
		var p = this.transformPlace(best,place);
		this.transform(best).remove(p);
	};
	child.actualValue = function(ruleset){
		var fit = [];
		for(var i=0; i<this.length; i++){
			var rule = this.transformRuleset(i,ruleset);
			fit[i] = this.transform(i).actualValue(rule);
		}
		return reduce(Math.min,fit);
	};
	return child;
};
function OrCombiner(parent) {
	var child = {};
	child.__proto__ = parent;
	child.add = function(place){
		if(this.length==0){ return;}
		var fit = [];
		for(var i=0; i<this.length; i++){
			var rule = this.transformRuleset(i,ruleset);
			fit[i] = this.transform(i).actualValue(rule);
		}
		var best = firstBestAt(fit);
		var p = this.transformPlace(best,place);
		this.transform(best).add(p);
	};
	child.remove = function(place){
		for(var i=0; i<this.length; i++){
			var p = this.transformPlace(i,place);
			this.transform(i).remove(p);
		}
	};
	child.actualValue = function(ruleset){
		var fit = [];
		for(var i=0; i<this.length; i++){
			var rule = this.transformRuleset(i,ruleset);
			fit[i] = this.transform(i).actualValue(rule);
		}
		return reduce(Math.max, fit);
	};
	return child
};
function AddCombiner(parent) {
	var child = {};
	child.__proto__ = parent;
	child.add = function(place){
		for(var i=0; i<this.length; i++){
			var p = this.transformPlace(i,place);
			this.transform(i).add(p);
		}
	};
	child.remove = function(place){
		for(var i=0; i<this.length; i++){
			var p = this.transformPlace(i,place);
			this.transform(i).remove(p);
		}
	};
	child.actualValue = function(ruleset){
		var fit = [];
		for(var i=0; i<this.length; i++){
			var rule = this.transformRuleset(i,ruleset);
			fit[i] = this.transform(i).actualValue(rule);
		}
		return average(fit);
	};
	return child
};
var AndPrototype = {
	kind: "And",
	add: function(place){
		for(var i=0; i<this.pattern.length; i++){
			this.pattern[i].add(place);
		}
	},
	remove: function(place){
		if(this.pattern.length==0){ return;}
		var fit = [];
		for(var i=0; i<this.pattern.length; i++){
			fit[i] = this.pattern[i].actualValue(ruleset);
		}
		var best = firstBestAt(fit);
		this.pattern[best].remove(place);
	},
	actualValue: function(ruleset){
		if(this.pattern.length==0){ return 0; }
		var fit = [];
		for(var i=0; i<this.pattern.length; i++){
			fit[i] = this.pattern[i].actualValue(ruleset);
		}
		return reduce(Math.min,fit);
	}
};
var OrPrototype = {
	kind: "Or",
	add: function(place){
		if(this.pattern.length==0){ return;}
		var fit = [];
		for(var i=0; i<this.pattern.length; i++){
			fit[i] = this.pattern[i].actualValue(ruleset);
		}
		var best = firstBestAt(fit);
		this.pattern[best].add(place);
	},
	remove: function(place){
		for(var i=0; i<this.pattern.length; i++){
			this.pattern[i].remove(place);
		}
	},
	actualValue: function(ruleset){
		if(this.pattern.length==0){ return 0; }
		var fit = [];
		for(var i=0; i<this.pattern.length; i++){
			fit[i] = this.pattern[i].actualValue(ruleset);
		}
		var  a = reduce(Math.max,fit);
		/*if(this.min<1){
			var q = 1-this.min;
			a = (a-this.min)/q;
		}*/
		return a;
	}
};
var NotPrototype = {
	kind: "Not",
	add: function(place){
		if(this.pattern.length==0){ return;}
		this.pattern[0].remove(place);
	},
	remove: function(place){
		if(this.pattern.length==0){ return;}
		this.pattern[0].add(place);
	},
	actualValue: function(ruleset){
		if(this.pattern.length==0){ return 0; }
		return 1 - this.pattern[0].actualValue(ruleset);
	},
	combine: singleCombine
};
var FlipMixin = {
	length: 2,
	transform: function(location){
		return this.pattern[0];
	},
	transformRuleset: function(location, ruleset){
		if(location == 0){
			return ruleset;
		} else {
			return flip(ruleset);
		}
	},
	transformPlace: function(location, place){
		if(location == 0){
			return place;
		} else {
			return states*bit(2,place) + states*states*bit(1,place);
		}
	},
	combine: singleCombine
};
var PermuteMixin = {
	length: factorial(4),
	transform: function(location){
		return this.pattern[0];
	},
	transformRuleset: function(location, ruleset){
		return permute(ruleset)[location];
	},
	transformPlace: function(location, place){
		var p = permutations[location];
		return states*states*p[bit(2,place)] + states*p[bit(1,place)] + p[bit(0,place)];
	},
	combine: singleCombine
};
var BasePrototype = {
	makeNew: function(source, pattern){
		var result = {};
		result.__proto__ = this;
		result.clear(); //set variables
		result.min = 0;
		result.circle = false;
		result.field = source;
		result.source = [];
		 if(pattern){
			for(var i=0; i<pattern.length; i++){
				result.pattern[i] = pattern[i];;
			}
		}
		return result;
	},
	add: function(place){
		if(this.pattern.length==0){
			this.pattern[0]=zeroArray(states*states*states);
		}
		this.pattern[0][states*place+ruleset[place]]=1;
		var rule = ruleToTriad(place);
		var space = document.createTextNode(" ");
		var ruleNode = document.createElement("span");
		ruleNode.className = "ruleset";
		ruleNode.textContent = rule.toString();
		var picture = illustrateRule( rule);
		if(this.source.length == 0){
			this.field.appendChild(space);
		} else if(findRule(rule.toString(),this.source) == null){
			var last = this.source[this.source.length-1];
			this.field.insertBefore(space, last.nextSibling);
		} else {
			return;
		}
		this.field.insertBefore(picture, space);
		this.field.insertBefore(ruleNode, space);
		this.source.push(picture);
		this.source.push(ruleNode);
		this.source.push(space);
	},
	remove: function(place){
		if(this.pattern.length==0){
			this.pattern[0]=zeroArray(states*states*states);
		}
		this.pattern[0][states*place+ruleset[place]]=0;
		var rule = [bit(0,place),bit(1,place),ruleset[place]];
		var removeable = findRule(rule.toString(),this.source)
		if(removeable != null){
			removeable.parentNode.removeChild(removeable.previousSibling); //remove image
			removeable.parentNode.removeChild(removeable);
		}
		this.source.splice(findAt(removeable, this.source) -1, 2); //remove things
	},
	actualValue: function(ruleset){
		if(this.pattern.length==0){ return 0; }
		return clamp(0, predict(ruleToPattern(ruleset), normPattern(this.pattern[0]) ), 1);
	},
	combine: function(source){/*do nothing*/},
	checkCircle: function(){ return false; }
};
var SliderPrototype = {
	add: function(place){
		var fit = [];
		for(var i=0; i<this.pattern.length; i++){
			fit[i] = this.pattern[i].actualValue(ruleset);
		}
		var best = firstBestAt(fit);
		this.pattern[best].add(place);
	},
	remove: function(place){
		for(var i=0; i<this.pattern.length; i++){
			this.pattern[i].remove(place);
		}
	},
	actualValue: function(ruleset){
		if(this.pattern.length==0){ return 0; }
		var fit = [];
		for(var i=0; i<this.pattern.length; i++){
			fit[i] = this.pattern[i].actualValue(ruleset);
		}
		var  a = reduce(Math.max,fit);
		/*if(this.min<1){
			var q = 1-this.min;
			a = (a-this.min)/q;
		}*/
		return a;
	}
};
var sharedPrototype = {
	makeNew: function(source, pattern){
		var result = {};
		result.__proto__ = this;
		result.clear(); //set variables
		result.min = 0;
		result.circle = false;
		result.field = source;
		if(pattern.length == 0){
			var rulesetModel = BasePrototype.makeNew(source,[]);
			rulesetModel.source = [];
			result.pattern.push(rulesetModel);
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
	combine: function(source){
		this.circle = true;
		if( ! source.checkCircle() ){
			this.pattern.push(source);
		}
		this.circle = false;
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
	checkCircle: function(){
		var circle = this.circle;
		for(var i=0; i<this.pattern.length; i++){
			circle = circle || this.pattern[i].checkCircle();
		}
		return circle;
	},
	showChange: function(place){
		var rules = copyArray(ruleset);
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
	}
};
var orFlipPrototype;
var orPermutePrototype;
var andFlipPrototype;
var andPermutePrototype;
var addFlipPrototype;
var addPermutePrototype;
(function(){
	OrPrototype.__proto__ = sharedPrototype;
	AndPrototype.__proto__ = sharedPrototype;
	NotPrototype.__proto__ = sharedPrototype;
	FlipMixin.__proto__ = sharedPrototype;
	PermuteMixin.__proto__ = sharedPrototype;
	BasePrototype.__proto__ = sharedPrototype;
	SliderPrototype.__proto__ = sharedPrototype;
	
	orFlipPrototype = OrCombiner(FlipMixin);
	orPermutePrototype = OrCombiner(PermuteMixin);
	andFlipPrototype = AndCombiner(FlipMixin);
	andPermutePrototype = AndCombiner(PermuteMixin);
	addFlipPrototype = AddCombiner(FlipMixin);
	addPermutePrototype = AddCombiner(PermuteMixin);
})();

/*
Bug Log
copied loop, didn't copy definition of data looped on
typed worstFit instead of worstScore


todo
be able to add rule to an empty slider (all operators must create)
make 'not' work properly
autocomplete
*/
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
		
		var code = document.createElement("div");
		code.setAttribute("contentEditable",true);
		code.className="code1";
		slider.appendChild(code);
		
		var filler = document.createElement("div");
		filler.className="filler";
		code.appendChild(filler);
		
	code.addEventListener('input', parseScript, false);
	clear.addEventListener('mousedown', deleteTarget, false);
	container.addEventListener('mousedown', addTarget, false);
	slider.addEventListener('mousedown', mouseDownSlider, false);
	
	sliders[index] = SliderPrototype.makeNew(code, []);
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