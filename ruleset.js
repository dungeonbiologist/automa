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
function drawRuleset(context,ruleset){
  for(var i=0; i<states; i++){
    for(var j=0; j<states; j++){
      context.fillStyle = colors[ruleset[i*states+j]];
      context.fillRect(i*size,j*size,size,size);
    }
  } 
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
  var copy = copyVect(ruleset);
    copy[place] = (ruleset[place]+1)%states;
    changeRule(copy);
  render();
}

function permuteRuleset(ruleset){
  var rulesets = [];
  for(var k=0; k<permutations.length; k++){
    rulesets[k]=[];
    for(var i=0; i<states; i++){
      for(var j=0; j<states; j++){
        var offset = permutations[k];
        rulesets[k][states*offset[i]+offset[j]] = offset[ruleset[states*i+j]]; 
      }
    }
  }
  return rulesets;
}
function permutePattern(pattern){
  var patterns = [];
  for(var k=0; k<permutations.length; k++){
    patterns[k]=[];
    for(var i=0; i<states; i++){
      for(var j=0; j<states; j++){
        var offset = permutations[k];
        for(var l=0; l<states; l++){ //the states within a cell
          patterns[k][states*(states*offset[i]+offset[j])+offset[l]] = pattern[states*(states*i+j)+l];
        }
      }
    }
  }
  return patterns;
}
function flipRuleset(ruleset){
  var flipped = [];
  for(var i=0; i<states; i++){
    for(var j=0; j<states; j++){
      flipped[i+states*j]=ruleset[states*i+j];
    }
  }
  return flipped;
}
function flipPattern(pattern){
  var flipped = [];
  for(var i=0; i<states; i++){
    for(var j=0; j<states; j++){
      for(var k=0; k<states; k++){
        flipped[states*i + states*states*j + k] = pattern[states*states*i + states*j + k];
      }
    }
  }
  return flipped;
}
function permuteRules(){
  changeRule(randomElt(permuteRuleset(ruleset)));
  render();
}
function newRule(){
  var rule = [];
  for(var i=0; i<states*states; i++){
    rule[i] = Math.floor(Math.random()*states);
  }
  return rule;
}
function randomRule(){
  changeRule(newRule());
  render();
}
function ruleToPattern(rule,flipped,permuted){
  var unflipped = flipped?0:1;
  var unpermuted = (permuted==0)?1:0;
  var pattern=zeroArray(states*states*states);
  for(var i=0; i<(states*states); i++){
    pattern[rule[i]+i*states]=1;
  }
  pattern.push(unpermuted);
  pattern.push(unflipped);
  return pattern;
}

function minSharedPattern(patterns,cutoff){
  var result = [];
  for(var i=0;i <states*states*states; i++){
    result[i]=Infinity;
  }
  for(var p=0; p<patterns.length; p++){
    for(var i=0;i <states*states*states; i++){
      result[i] = Math.min(result[i],patterns[p][i]);
    }
  }
  for(var i=0;i <states*states*states; i++){
    if(result[i]<cutoff){
      result[i]=0;
    }
  }
  return result;
}
function patternToSemirule(pattern){
  var result = [];
  for(var i=0; i<states*states; i++){
    var place=0; 
    var best=0;
    for(var j=0; j<states; j++){
      if(pattern[i*states+j]>best){
        best = pattern[i*states+j];
        place=j;
      }
    }
    result[i]=place;
    if(best==0){
      result[i]=undefined;
    }
  }
  return result;
}
function patternToRule(pattern, ruleset){
  var rule = patternToSemirule(pattern);
  for(var i=0; i<states*states; i++){
    if(rule[i] ==undefined){
      rule[i]=ruleset[i];
    }
  }
  return rule;
}
