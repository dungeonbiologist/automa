
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
function mouseUpThumbnail(e){//when you click on a thumbnail it sets the current rule to it
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
      var thumb = storedCAs[parseInt(box.childNodes[t]['data-index'],10)];
      list.push(thumb.counts);
    }
    //redraw the group summary thumbnail
    var pattern = minSharedPattern(list,20);
    var ratio = sumList(pattern)/(WIDTH*HEIGHT);
    pattern= mult(ratio,normMaxPattern(pattern));
    var data = storedGroups[parseInt(box['data-index'],10)];
    data.pattern=pattern;
    var button = data.thumbnail;
    var temprow = copyVect(row);
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
