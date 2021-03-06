//The external interface is guessToRule, predict, goodness
function predict(point,model){
    var result = 0;
    for(var i=0; i<point.length && i<model.length; i++){
   result+=point[i]*model[i];
    }
    return result;
}
function guessToRule(ruleset,expr){
    var rule = copyVect(ruleset);
    var scores = leastChange(ruleset);
    var err = sumError(ruleset);
    var thiserr = expr.errorOf(ruleset);
    if(err<=0.05){
   return ruleset;
    }
    var bestAt = randLeastAt(scores);
    rule[Math.floor(bestAt/states)] = bestAt%states;
    if(scores[bestAt] < err || expr.errorOf(rule) < thiserr){
   return rule;
    }
    return ruleset;
}
function sumError(ruleset){
    var error = 0;
    for(var i=0; i<sliders.length; i++){
   error += sliders[i].errorOf( ruleset);
    }
    return error;
}
function leastChange(ruleset){
    var changes = [];
    for(var i=0; i<sliders.length; i++){
   if(sliders[i].desiredVal !== undefined && sliders[i].patterns.length > 0){
       changes.push(goodness(sliders[i], ruleset, sliders[i].desiredVal));
   }
    }
    if(changes.length == 0){
   return zeroArray(states*states*states);
    }
    var change = reduce(add,changes);
    return change;
}

function add(a,b){
    var result = [];
    for(var i=0; i<a.length && i<b.length; i++){
   result[i] = a[i]+b[i];
    }
    return result;
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
   var testRule = copyVect(rule);
   for(var j=0; j<states; j++){
       testRule[i]=j;
       grad[i*states + j] = expr.actualValue(testRule);
   }
    }
    return grad;
}
