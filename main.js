function allPermutations(n){
    var result = [[]];
    for(var i=0; i<n; i++){ //start the list of permutations with the identity permutation
	result[0][i]=i;
    }
    var length;
    for(var i=0; i<n-1; i++){ //active location within the permutations
	length = result.length;
	for(var j=0;j<length; j++){
	    for(var k=i+1; k<n; k++){//swap the active location with all remaining locations
		var newPerm = copyVect(result[j]);
		newPerm[i] = result[j][k];
		newPerm[k] = result[j][i];
		result.push(newPerm);
	    }
	}
    }
    return result;
}
const WIDTH=50;
const HEIGHT=50;
const size=10;
const states=4;
const colors=["#FF4444","#44EE44","#6688FF","#FFFF44"];
const lightColors=["#BB0000","#00AA00","#0000DD","#BBBB00"];
const textSize=17;
const permutations = allPermutations(states);
//variables
var canvases=[];
var ruleset = [];
var row = []; //the inital cells of the cellular automa
var possible = [];
var ruleUsed=[];//for each cell what rule was used to get it
var countRulesUsed=[]; //how many times each rule was used
var alternateRow = undefined; //shows what would happen if you changed this square
var sliders = [];
var CAhistory = []; //keeps a record of what CAs you"ve seen
var mouse = {x:0,y:0};
var showRule;//shows what would happen if you changed this rule
var indicateRule;
var slidersChanged=true;
var patternSelected = false;
var differential = false;
var grabbed = null;
var grabbedCA = null;

function drawCounts(context,counts){
    var max = WIDTH*HEIGHT;
    for(var i=0; i<states*states; i++){
	var value = 256-Math.floor(256*counts[i]/max);
	context.fillStyle = "rgb("+value+","+value+","+value+")";
	context.fillRect(Math.floor(i/states)*size,i%states*size,size,size);
    }
}
function drawPattern(context,pattern){
    context.clearRect(0,0,size*states, size*states);
    for(var i=0; i<states; i++){
	for(var j=0; j<states; j++){
	    for(var k=0; k<states; k++){
		context.fillStyle = colors[k];
		context.globalAlpha = ""+pattern[i*states*states+j*states+k];
		context.fillRect(i*size,j*size,size,size);
	    }
	}
    }
    context.globalAlpha = "1";
}
function render() {
    var canvas = document.getElementById("view");
    var context = canvas.getContext("2d");
    //  context.clearRect(0,0,canvas.width,canvas.height);
    context.clearRect(0,0,size*(WIDTH+1), size*HEIGHT);
    context.strokeStyle = "#000000";
    context.lineWidth = 2;
    drawBody(context, showRule);
    if(alternateRow){
	for(var i=0; i<row.length; i++){
	    for(var j=0; j<row[i].length;j++){
		if(alternateRow[i][j] !== row[i][j]){
		    //show what it would look like if the initial conditions were changed
		    context.fillStyle= lightColors[row[i][j]];
		    context.fillRect((j+i/2)%WIDTH*size,i*size,size,size);
		}
	    }
	}
    }
    drawRules(ruleset);
    var context2 = document.getElementById("ruleset").getContext("2d");
    drawRuleset(context2, ruleset);
    if(showRule !== undefined){
	context2.fillStyle = lightColors[ruleset[showRule]];
	context2.fillRect(bit(1,showRule)*size, bit(0,showRule)*size,size,size);
    }
    var context3 = document.getElementById("counts").getContext("2d");
    if(countRulesUsed.length >0){
	drawCounts(context3, countRulesUsed);
    }
    for(var i=0; i<sliders.length; i++){
	sliders[i].update();
    }
    outlineRules(sliders.active.gradient());
}
function mouseOf(object,e){
    var m = {};
    if (window.Event) {
	m.x = e.pageX;
	m.y = e.pageY;
    } else {
	m.x = event.clientX + (document.documentElement.scrollLeft ? document.documentElement.scrollLeft : document.body.scrollLeft);
	m.y = event.clientY + (document.documentElement.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop);
    }
    var position = getPosition(object);
    m.x-=position.x;
    m.y-=position.y;
    return m;
}
function mouseMove(e) {
    mouse = mouseOf(document.getElementById("view"), e);
    var change = false;
    if(differential !== false && grabbed){
	var x = grabbed;
	var value = clamp(0,differential + mouse.x, 200);
	var str = value + "px";
	x.textContent = value/200;
	x.style.left = str;
	var data = x.parentNode.slider;
	if(data.desiredVal !== value/200){
	    change=true;
	}
	data.desiredVal = value/200;
	data.changeValue(value/200);
	
    } else if(mouse.y<size && mouse.x<WIDTH*size){ 
	//in the first row
	alternateRow = [copyVect(row[0])];
	var x = Math.floor(mouse.x/size);
	alternateRow[0][x] = (row[0][x]+1)%states;
	fillout(alternateRow,ruleset,[],[]);
	showRule=undefined; //if you"re over the first row don"t show any rule
	change=true;
    } else if(alternateRow !== undefined){
	alternateRow=undefined;
	change=true;
    } 
    if(between(mouse.x/size,0,WIDTH) && between(mouse.y/size, 1, HEIGHT)){
	//moused over field 
	var c = mouseToGrid(mouse.x,mouse.y);
	var oldShow = showRule;
	showRule = ruleUsed[c.i][c.j];
	if(oldShow!==showRule){
	    change=true;
	}
    }
    if(change){
	render();
    }
}
function mouseOverSlider(e){
    //moused over slider
    //var slider = e.target.parentElement.slider;
    //var g = slider.gradient();
    //outlineRules(g);
}
function mouseOutSlider(e){
    //moused out from slider
    /*var children = document.getElementById("rules").childNodes;
      for(var j=0; j<children.length; j++){
      var rules = children[j].childNodes;
      for(var i=0; i<rules.length; i++){
      rules[i].style.border = "2px solid white";
      }
      }
    */
}
function previousCA(){
    if(CAhistory.length>1){
	CAhistory.pop();
	changeRule(CAhistory.pop(),true);
    }
    render();
}
function changeRule(rule,old){
    if(!equal(ruleset,rule)){
	CAhistory.push(rule);
	ruleset = rule;
	fillout(row,ruleset,ruleUsed,countRulesUsed);
	for(var i=0; i<states*states; i++){
	    canvases[i].stale = true;
	}
	fillBody(canvases[states*states].getContext("2d"),row);
	slidersChanged=true;
	if(!old){
	    drawThumbnail(
		document.getElementById("thumbnail").getContext("2d"),
		canvases[states*states],
		rule
	    );
	}
    }
}
function main (){
    if (window.Event) {
	document.captureEvents(Event.MOUSEMOVE);
	document.captureEvents(Event.MOUSEOUT);
	document.captureEvents(Event.MOUSEOVER);
	document.captureEvents(Event.MOUSEDOWN);
	document.captureEvents(Event.MOUSEUP);
	document.captureEvents(Event.INPUT);
    }
    window.addEventListener("mousedown", mouseDown, false);
    window.addEventListener("mousemove", mouseMove, false);
    window.addEventListener("mouseup", mouseUp, false);
    var ruleNode = document.getElementById("ruleset");
    ruleNode.addEventListener("mousemove", mouseMoveRuleset, false);
    ruleNode.addEventListener("mouseout", mouseOutRuleset, false);
    ruleNode.addEventListener("mousedown", mouseDownRuleset, false);
    var rules = document.getElementById("rules");
    for(var j=0; j<states; j++){
	var line = document.createElement("div");
	rules.appendChild(line);
	for(var i=0; i<states; i++){
	    var rule = illustrateRule([i,j,0]);
	    rule.addEventListener("mousedown", mouseDownTriadRule, false);
	    line.appendChild(rule);
	}
    }
    var canvas = document.getElementById("view");
    canvas.addEventListener("mouseout", mouseOutRuleset, false);
    canvas.width  = (WIDTH+1)*size;
    canvas.height = HEIGHT*size;
    canvas = document.getElementById("ruleset");
    canvas.width  = states*size;
    canvas.height = states*size;
    canvas = document.getElementById("counts");
    canvas.width  = states*size;
    canvas.height = states*size;
    canvas = document.getElementById("thumbnail");
    canvas.width  = 50;
    canvas.height = 50;
    canvas.addEventListener("mousedown", mouseDownOriginalThumbnail, false);
    for(var i=0; i<states*states+1; i++){
	canvases[i] = document.createElement("canvas");
	canvases[i].width  = size*(WIDTH+1);
	canvases[i].height = size*HEIGHT;
    }
    init();
    render();
}
function init(){
    row[0]=[];
    for(var i=0; i<WIDTH; i++){
	row[0][i]= Math.floor(Math.random()*states);
    }
    changeRule(newRule());
    for(var i=0; i<1; i++){
	createSlider();
    }
    sliders.active=sliders[0];
}
