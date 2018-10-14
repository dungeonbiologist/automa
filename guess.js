function gradient(model,rule,fit){
  var grad = []; //influence on final value
  for(var i=0; i<states*states; i++){
    for(var j=0; j<states; j++){
      grad[i*states+j] = fit + model[i*states+j]-model[i*states+rule[i]]; //find the difference from the current option
    }
  }
  return grad;
}
function drawGradient(grad,bestAt){
  var canvas = document.getElementById('view');
  var context = canvas.getContext('2d');
  for(var i=0; i<states*states; i++){
    for(var j=0; j<states; j++){
      var a = clamp(0, Math.floor(128+128*grad[i*states+j]),255);
      context.fillStyle = 'rgb('+a+','+a+','+a+')';
      context.fillRect((40+j)*size,(HEIGHT+4+i)*size,size,size);
      if(bestAt==i*states+j){
        context.strokeRect((40+j)*size,(HEIGHT+4+i)*size,size,size);
      }
    }
  }
}
function guessToRule(guess,target){ //target between 0 and 1, the target fit
  var rule = ruleset;//newRule();
  var guesses = permutePattern(guess);
  var fit=[];
  for(var j=0; j<guesses.length; j++){
    fit[j] = membershipOf(rule,guesses[j]);
  }
  var bestFit = reduce(Math.max,fit);
  if(Math.abs(bestFit-target)<=0.01){
    return rule;
  }
  var grads = [];
  for(var j=0; j<guesses.length; j++){
    grads[j] = gradient(guesses[j], rule, fit[j]);
  }
  grad = reduce(mapMax,grads);
  var bestAt = similarAt(grad,target,0.01);
  //display the gradient
  globalGrad = grad;
  globalBestAt = bestAt;
  if(grad[bestAt]!== bestFit){
    rule[Math.floor(bestAt/states)] = bestAt%states;
    if(rule == undefined){
      alert("rule undefined");
    }
  }
  return rule;
}
function updateWinnowGuess(data,yes){
  var bad = (yes)?1/4:1;
  var good = (yes)?1:0.5;
  var rules = permute(data);
  var options = [];
  var mag = [];
  for(var i=0; i<rules.length; i++){
    options[i]=[];
    mag[i]=0;
    var patterns = ruleToPattern(rules[i],i);
    for(var j=0; j<bestGuess.length; j++){
      options[i][j] = bestGuess[j] * ((1==patterns[j])?good:bad);
      mag[i] += bestGuess[j] * patterns[j];
    }
    mag[i];
  }
  bestGuess = normalizePattern(options[firstBestAt(mag)]);
}
function newPattern(){
  var result = [];
  for(var i=0; i<states*states*states; i++){
    result[i]=1;
  }
  result.push(3);//unpermuted
  result.push(1);//unflipped
  return result
}
function information(p){
  if(p===0){return 0;}
  return -p*Math.log2(p);
}
function infoInGroup(group){
  var bits= states*states*states;
  var counts=[];
  for(var i=0; i<bits; i++){
    counts[i]=0;
  }
  for(var i=0; i<group.length; i++){
    for(var j=0; j<bits; j++){
      counts[j]+=groups[i][j];
    }
  }
  var info=0;
  for(var i=0; i<bits; i++){
    info+=information(counts[i]/bits);
    info+=information((group.length-counts[i])/bits);
  }
  return info;
}


function teach(yes){
  if(yes){
    /*var variations = permute(ruleset).concat(permute(flip(ruleset)));
    for(var i=0; i<variations.length; i++){
      addUnique(examples,variations[i]);
    }*/
  }
  updateWinnowGuess(ruleset,yes);
  render();
}
function membershipOf(rule,guess){
  var membership = 0;
  var min = 0;
  for(var i=0; i<states*states; i++){
    membership += guess[i*states + rule[i]];
    min +=Math.min(Math.min(guess[i*states],guess[i*states+1]),guess[i*states+2]);
  }
  i*=states;
  for(;i<guess.length; i+=2){
    membership += guess[i];
  }
  return membership-min;
}
function calcMembership(){
  var permutations = permutePattern(bestGuess);
  var best = 0;
  for(var i=0; i<permutations.length; i++){
    best = Math.max(best,membershipOf(ruleset,permutations[i]));
  }
  currentMembership = best;

}