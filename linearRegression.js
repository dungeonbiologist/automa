//The external interface is guessToRule, predict, goodness
function ruleToPattern(rule){
  var point = [];
  for(var i=0; i<rule.length; i++){
    for(var j=0; j<states; j++){
      point[i*states+j]=0;
    }
    point[i*states+rule[i]]=1;
  }
  return point;
}
function predict(point,model){
  var result = 0;
  for(var i=0; i<point.length; i++){
    result+=point[i]*model[i];
  }
  return result;
}
function guessToRule(ruleset,expr){
  var rule = copyArray(ruleset);
  var scores = leastChange(ruleset);
  var err = sumError(ruleset);
  var thiserr = errorOf(expr,ruleset);
  if(err<=0.05){
    return ruleset;
  }
  var bestAt = randLeastAt(scores);
  rule[Math.floor(bestAt/states)] = bestAt%states;
  if(scores[bestAt] < err || errorOf(expr,rule) < thiserr){
    return rule;
  }
  return ruleset;
}
function errorOf(expr,ruleset){
  if(expr.desiredVal !== undefined){
    return Math.abs(expr.actualValue(ruleset) - expr.desiredVal);
  }
  return 0;
}
function sumError(ruleset){
  var error = 0;
  for(var i=0; i<sliders.length; i++){
    error += errorOf(sliders[i], ruleset);
  }
  return error;
}
function leastChange(ruleset){
  var changes = [];
  for(var i=0; i<sliders.length; i++){
    if(sliders[i].desiredVal !== undefined && sliders[i].pattern.length > 0){
      changes.push(goodness(sliders[i], ruleset, sliders[i].desiredVal));
    }
  }
  if(changes.length == 0){
    return zeroArray(states*states*states);
  }
  var change = reduce(add,changes);
  return change;
}
function goodness(expr,rule,target){
  var grad = possibleScores(expr,rule);
  for(var j=0; j<grad.length; j++){
    grad[j] = Math.abs(grad[j]-target); //smaller is better
  }
  return grad;
}
function possibleScores(expr,rule){
  var grad = [];
  for(var i=0; i<states*states; i++){
    var testRule = copyArray(rule);
    for(var j=0; j<states; j++){
      testRule[i]=j;
      grad[i*states + j] = expr.actualValue(testRule);
    }
  }
  return grad;
}
