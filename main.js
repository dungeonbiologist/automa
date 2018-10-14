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
        var newPerm = copyArray(result[j]);
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
const colors=["#FF4444","#44FF44","#4444FF","#FFFF44"];
const lightColors=["#AA0000","#009900","#0000CC","#AA9900"];
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
var tags = [];
var activeTags = [];
var sliders = [];
var CAhistory = []; //keeps a record of what CAs you've seen
var storedCAs = [];
var storedGroups = [];
var mouse = {x:0,y:0};
var showRule;//shows what would happen if you changed this rule
var indicateRule;
var slidersChanged=true;
var patternSelected = false;
var differential = false;
var grabbed = null;
var grabbedCA = null;

function drawRuleset(context,ruleset){
  for(var i=0; i<states; i++){
    for(var j=0; j<states; j++){
      context.fillStyle = colors[ruleset[i*states+j]];
      context.fillRect(i*size,j*size,size,size);
    }
  } 
}
function drawCounts(context,counts){
  var max = WIDTH*HEIGHT;
  for(var i=0; i<states*states; i++){
    var value = 256-Math.floor(256*counts[i]/max);
    context.fillStyle = 'rgb('+value+','+value+','+value+')';
    context.fillRect(Math.floor(i/states)*size,i%states*size,size,size);
  }
}
function makeThumbnail(image,ruleset,counts){
  var thumbnail = document.createElement("canvas");
  thumbnail.width = 50;
  thumbnail.height = 50;
  thumbnail['data-index'] = storedCAs.length;
  storedCAs.push({ruleset:ruleset, counts:counts});
  thumbnail.addEventListener('mousedown', mouseDownThumbnail, false);
  thumbnail.addEventListener('mouseup', mouseUpThumbnail, false);
  var ctx = thumbnail.getContext('2d');
  drawThumbnail(ctx,image,ruleset);
  return thumbnail;
}
function drawThumbnail(ctx,image,ruleset){
  ctx.save();
    ctx.translate(0,-10*size);
    ctx.scale(1/3, 1/3);
    ctx.drawImage(image,0,0);
  ctx.restore();
  //draw rules onto image
  ctx.save();
    var px = states*size;
    var ratio = 1/2;
    ctx.translate(50-px*ratio,50-px*ratio);
    ctx.scale(ratio, ratio);
    drawRuleset(ctx,ruleset);
  //draw box around rules
    ctx.strokeStyle='#000000';
    ctx.strokeRect(0,0,px,px);
  ctx.restore();
}
function createGroup(){
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
  document.getElementById("left").appendChild(button);
  document.getElementById("left").appendChild(box);
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
function fillBody(context,row){
  for(var i=0; i<row.length; i++){
    for(var j=0; j<row[i].length;j++){
      context.fillStyle= colors[row[i][j]];
      context.fillRect((j+i/2)%WIDTH*size,i*size,size,size);
    }
  }
}
function semifillBody(context,row,ruleUsed,whiteList){
  for(var i=1; i<row.length; i++){
    for(var j=0; j<row[i].length;j++){
      if(whiteList[ ruleUsed[i-1][j] ] != undefined){
        context.fillStyle= colors[row[i][j]];
        context.fillRect((j+i/2)%WIDTH*size,i*size,size,size);
      }
    }
  }
}
function detailBody(context, showRule){
  context.fillStyle = lightColors[ruleset[showRule]];
  for(var i=1; i<row.length; i++){
    for(var j=0; j<row[i].length;j++){
      //show what this particular rule does.
      if( ruleUsed[i-1][j] == showRule){
        context.fillRect((j+i/2)%WIDTH*size,i*size,size,size);
      }
    }
  }
}
function drawBody(context, showRule){
  var place = (showRule==undefined)?states*states: showRule;
  if(canvases[place].stale){
    var context2 = canvases[place].getContext('2d');
    context2.drawImage(canvases[states*states], 0, 0); //draw the default
    detailBody(context2, showRule); //and add the details
    canvases[place].stale = false;
  }
  context.drawImage(canvases[place], 0, 0);
}
function drawPossible(context,possible){
  for(var i=0; i<row.length; i++){
    for(var j=0; j<possible[i].length;j++){
      context.globalAlpha = ""+(1/possible[i][j].length || 1);
      for(var k=0; k<possible[i][j].length; k++){
        context.fillStyle= colors[possible[i][j][k]];
        context.fillRect((j+i/2)%WIDTH*size,i*size,size,size);
      }
    }
  }
  context.globalAlpha = "1";
}
function render() {
  var canvas = document.getElementById('view');
  var context = canvas.getContext('2d');
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
  var context2 = document.getElementById('ruleset').getContext('2d');
  drawRuleset(context2, ruleset);
  if(showRule !== undefined){
    context2.fillStyle = lightColors[ruleset[showRule]];
    context2.fillRect(bit(1,showRule)*size, bit(0,showRule)*size,size,size);
  }
  var context3 = document.getElementById('counts').getContext('2d');
  if(countRulesUsed.length >0){
    drawCounts(context3, countRulesUsed);
  }
  for(var i=0; i<sliders.length; i++){
    sliders[i].update();
  }
  outlineRules(sliders[sliders.active].gradient());
}
function log(message){
  document.getElementById ("log").innerHTML += message + '<br>';
}
function clearLog(){
  document.getElementById ("log").innerHTML = '';
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
  mouse = mouseOf(document.getElementById('view'), e);
  var change = false;
  if(differential !== false && grabbed){
    var x = grabbed;
    var value = clamp(0,differential + mouse.x, 200);
    var str = value + "px";
    x.textContent = value/200;
    x.style.left = str;
    var data = sliders[x.parentNode["data-index"]]
    if(data.desiredVal !== value/200){
      change=true;
    }
    data.desiredVal = value/200;
    data.changeValue(value/200)
    
  } else if(mouse.y<size && mouse.x<WIDTH*size){ 
    //in the first row
    alternateRow = [copyVect(row[0])];
    var x = Math.floor(mouse.x/size);
    alternateRow[0][x] = (row[0][x]+1)%states;
    fillout(alternateRow,ruleset,[],[]);
    showRule=undefined; //if you're over the first row don't show any rule
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
function mouseMoveRuleset(e){
  var m = mouseOf(e.currentTarget, e);
  //moused over ruleset
  var place = states*clamp(0, Math.floor(m.x/size), states-1) + clamp(0, Math.floor(m.y/size), states-1);
  if(showRule!==place){
    showRule=place;
    for(var j=0; j<sliders.length; j++){
      sliders[j].clearChange();
      sliders[j].showChange(place);
    }
  }
  render();
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
function mouseOverSlider(e){
  //moused over slider
  //var slider = sliders[e.target.parentElement["data-index"]];
  //var g = slider.gradient();
  //outlineRules(g);
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
function mouseDownTriadRule(e){
   //over triad
  var triad = e.target;
  var place = states*triad["data-left"] + triad["data-right"];
  if(e.shiftKey){
    sliders[sliders.active].add(place);
  } else {
    var copy = copyArray(ruleset);
    copy[place] = (ruleset[place]+1)%states;
    changeRule(copy);
  }
  render();
}
function mouseDownTriad(e){
   //over triad
  var triad = e.target;
  var place = states*triad["data-left"] + triad["data-right"];
  var t = [triad["data-left"], triad["data-right"], (triad["data-bottom"]+1)%states]
  drawTriad(triad, t);
}
function mouseOutRuleset(e){
  for(var j=0; j<sliders.length; j++){
    sliders[j].clearChange();
  }
  showRule=undefined;
  render();
}
function mouseDownRuleset(e){
  var m = mouseOf(e.currentTarget, e);
   //over ruleset
  var place = states*Math.floor(m.x/size) + Math.floor(m.y/size);
  if(e.shiftKey){
    sliders[sliders.active].add(place);
  } else {
    var copy = copyArray(ruleset);
    copy[place] = (ruleset[place]+1)%states;
    changeRule(copy);
  }
  render();
}
function mouseUpThumbnail(e){
  grabbedCA = null;
  var thumb = e.target;
  var data = storedCAs[parseInt(thumb['data-index'],10)];
  changeRule(data.ruleset,true);
}
function mouseDownThumbnail(e){
  var thumb = e.target;
  grabbedCA = thumb;
}
function mouseDownOriginalThumbnail(e){
  grabbedCA = makeThumbnail(
    canvases[states*states],
    ruleset,
    countsToVector(countRulesUsed,ruleset)
  );
}
function mouseUpGroup(e){
  var box = e.target;
  if(grabbedCA !== null){
    box.appendChild(grabbedCA);
    grabbedCA=null;
    var list = [];
    for(var t=0; t< box.childNodes.length; t++){
      var thumb = storedCAs[parseInt(box.childNodes[t]['data-index'],10)]
      list.push(thumb.counts);
    }
    var pattern = minSharedPattern(list,20);
    var ratio = sumList(pattern)/(WIDTH*HEIGHT);
    pattern= mult(ratio,normMaxPattern(pattern));
    var data = storedGroups[parseInt(box['data-index'],10)];
    data.pattern=pattern;
    var button = data.thumbnail
    var temprow = copyArray(row)
    var semirule = patternToSemirule(pattern);
    var rule = patternToRule(pattern,ruleset);
    var ruleused=[];
    fillout(temprow,rule,ruleused,[]);
    var context = button.getContext('2d');
    context.save();
      context.clearRect(0,0,button.width,button.height);
      context.scale(1/3,1/3);
      semifillBody(context,temprow,ruleused,semirule);
    context.restore();
    context.save();
      var px = states*size;
      var ratio = 1/2;
      context.translate(50-px*ratio,50-px*ratio);
      context.scale(ratio, ratio);
      drawPattern(context, pattern);
    //draw box around rules
      context.strokeStyle='#000000';
      context.strokeRect(0,0,px,px);
    context.restore();
  }
}
function hideGroup(e){
  var button = e.target;
  var box = storedGroups[parseInt(button['data-index'],10)].box;
  if (box.style.display === "none") {
    box.style.display = "inline-block";
  } else {
    box.style.display = "none";
  }
}
function dblclickGroup(e){
  thumbnail = e.target;
  var pattern = storedGroups[parseInt(thumbnail['data-index'],10)].pattern;
  var rule = patternToRule(pattern,ruleset);
  changeRule(rule,false);
  render();
}
function mouseToGrid(x,y){
  var i= clamp(0,Math.floor(y/size)-1,HEIGHT-2);
  var j = Math.floor(x/size-1/2-i/2+WIDTH)%WIDTH;
  clearLog()
  return {i:i,j:j};
}
function mouseDown(e){
  if(mouse.y<size && mouse.x<WIDTH*size){ //in the first row
    var x = Math.floor(mouse.x/size);
    row[0][x] = (row[0][x]+1) % states;
    fillout(row,ruleset,ruleUsed,countRulesUsed);
    for(var i=0; i<states*states; i++){
      canvases[i].stale = true;
    }
    fillBody(canvases[states*states].getContext('2d'),row);
    render();
  } else if(between(mouse.x/size,0,WIDTH) && between(mouse.y/size,1,HEIGHT-1)){
    //over field
    var c = mouseToGrid(mouse.x,mouse.y);
    var place = ruleUsed[c.i][c.j];
    if(e.shiftKey){
        sliders[sliders.active].add(place);
    }
    render();
  }
}
function mouseUp (e){
  differential = false;
  grabbed = null;
  grabbedCA = null;
  render();
}
function previousCA(){
  if(CAhistory.length>1){
    CAhistory.pop();
    changeRule(CAhistory.pop(),true);
  }
  render();
}
function main () {
  if (window.Event) {
    document.captureEvents(Event.MOUSEMOVE);
    document.captureEvents(Event.MOUSEOUT);
    document.captureEvents(Event.MOUSEOVER);
    document.captureEvents(Event.MOUSEDOWN);
    document.captureEvents(Event.MOUSEUP);
    document.captureEvents(Event.INPUT);
  }
  window.addEventListener('mousedown', mouseDown, false);
  window.addEventListener('mousemove', mouseMove, false);
  window.addEventListener('mouseup', mouseUp, false);
  var ruleNode = document.getElementById('ruleset')
    ruleNode.addEventListener('mousemove', mouseMoveRuleset, false);
    ruleNode.addEventListener('mouseout', mouseOutRuleset, false);
    ruleNode.addEventListener('mousedown', mouseDownRuleset, false);
  var rules = document.getElementById("rules");
  for(var j=0; j<states; j++){
    var line = document.createElement("div");
    rules.appendChild(line);
    for(var i=0; i<states; i++){
      var rule = illustrateRule([i,j,0]);
      rule.addEventListener('mousedown', mouseDownTriadRule, false);
      line.appendChild(rule);
    }
  }
  var canvas = document.getElementById('view');
    canvas.addEventListener('mouseout', mouseOutRuleset, false);
    canvas.width  = (WIDTH+1)*size;
    canvas.height = HEIGHT*size;
  canvas = document.getElementById('ruleset');
    canvas.width  = states*size;
    canvas.height = states*size;
  canvas = document.getElementById('counts');
    canvas.width  = states*size;
    canvas.height = states*size;
  canvas = document.getElementById('thumbnail');
    canvas.width  = 50;
    canvas.height = 50;
    canvas.addEventListener('mousedown', mouseDownOriginalThumbnail, false);
  for(var i=0; i<states*states+1; i++){
    canvases[i] = document.createElement('canvas');
    canvases[i].width  = size*(WIDTH+1);
    canvases[i].height = size*HEIGHT;
  }
  init();
  render();
}
function init(){
  tags=docCookies.keys();
  row[0]=[];
  for(var i=0; i<WIDTH; i++){
    row[0][i]= Math.floor(Math.random()*states);
  }
  changeRule(newRule());
  for(var i=0; i<5; i++){
    createSlider(i);
  }
  sliders.active=0;
}
function changeRule(rule,old){
  if(!equal(ruleset,rule)){
    CAhistory.push(rule);
    saveAndClearTags();
    ruleset = rule;
    fillout(row,ruleset,ruleUsed,countRulesUsed);
    for(var i=0; i<states*states; i++){
      canvases[i].stale = true;
    }
    fillBody(canvases[states*states].getContext('2d'),row);
    slidersChanged=true;
    if(!old){
      drawThumbnail(
        document.getElementById('thumbnail').getContext('2d'),
        canvases[states*states],
        rule
      );
    }
  }
}
function drawTriad(canvas, triad, highlight){
  var context = canvas.getContext('2d');
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
  var image = document.createElement('canvas');
  image.width  = size*2;
  image.height = size*2;
  image.addEventListener('mousemove', mouseMoveTriad, false);
  image.addEventListener('mousedown', mouseDownTriad, false);
  image.addEventListener('mouseout', mouseOutRuleset, false);
  drawTriad(image, rule);
  return image;
}
function ruleToTriad(place){
  return [bit(1,place),bit(0,place),ruleset[place]];
}
