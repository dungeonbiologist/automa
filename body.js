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
   var context2 = canvases[place].getContext("2d");
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

function mouseToGrid(x,y){
    var i= clamp(0,Math.floor(y/size)-1,HEIGHT-2);
    var j = Math.floor(x/size-1/2-i/2+WIDTH)%WIDTH;
    clearLog();
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
   fillBody(canvases[states*states].getContext("2d"),row);
   mouseMove(e); //fill out alternateRow
   render();
    } else if(between(mouse.x/size,0,WIDTH) && between(mouse.y/size,1,HEIGHT-1)){
   //over field
   var c = mouseToGrid(mouse.x,mouse.y);
   var place = ruleUsed[c.i][c.j];
   render();
    }
}
function mouseUp (e){
    differential = false;
    grabbed = null;
    grabbedCA = null;
    render();
}
function fillout(row,rule,used,counts){
    for(var i=0; i<states*states; i++){
   counts[i]=0;
    }
    if(used===undefined){
   used = [];
    }
    for(var i=1; i<HEIGHT; i++){
   row[i]=[];
   used[i-1]=[];
   for(var j=0;j<WIDTH;j++){
       used[i-1][j] = states*(row[i-1][j])+row[i-1][(j+1)%WIDTH];
       row[i][j]=rule[ used[i-1][j] ];
       counts[ used[i-1][j] ]++;
   }
    }
}
