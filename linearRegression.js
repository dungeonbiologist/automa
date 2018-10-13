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
	
	/*for(var i=0; i<grad.length; i++){
		grad[i] = err - grad[i]; //amount of improvement
	}
	var scores = [];
	for(var i=0; i<grad.length && i<costs.length; i++){
		if(grad[i] > 0){
			if(costs[i] == 0){
				scores[i] = 10*grad[i];
			} else {
				scores[i] = grad[i] / costs[i];
			}
		} else {
			scores[i] = -1;
		}
	}*/
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
/*function goodness(expr,rule,target){
	var grad = possibleScores(expr,rule);
	//to give it hints on places to improve, when scores are equal
	var scores = averageImprovement(grads, fit, target); //for averageing, when every improvement is worth 1 this exactly cancells out
	for(var j=0; j<grad.length; j++){
		grad[j] = Math.max(0, Math.abs(grad[j]-target) - scores[j]); //smaller is better, so better can only make it smaller
	}
	return grad;
}*/
function goodness(expr,rule,target){
	var grad = possibleScores(expr,rule);
	for(var j=0; j<grad.length; j++){
		grad[j] = Math.abs(grad[j]-target); //smaller is better
	}
	return grad;
}
/*function averageImprovement(grads, fit, target){
	var counts = zeroArray(states*states*states);
	if(typeof grads[0] ===  "number"){
		for(var j=0; j<states*states*states; j++){
			counts[j] += sign(Math.abs(fit-target) - Math.abs(grads[j]-target)); //improvement is positive
		}
		return counts;
	} else {
		for(var i=0; i<grads.length; i++){//how many models does this improve?
			counts = add(counts, averageImprovement(grads[i], fit[i], target));
		}
		for(var j=0; j<states*states*states; j++){
			counts[j] /=grads.length*states*states;
		}
		return counts;
	}
}*/
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
/*
buglog
copies and pasted but did not rename an obsolete variable
copied and pasted but forgot to return the value;
0*Infinity
left out space in variable definition and then used a similarly named var instead
passed an empty array in and then tried to reduce it;
left out "var"
iterated over emty array and used its values;
I used map instead of reduce, so I got an an aay with an empty array

gradients could mask each other when the the measure of improvement needed to be number 
improved because improvement is recessive
I added the lexical score instead of subtracting, which made the extimate end up negative and not worth it
Infinitizeing the scores, hid the lexical adjustment
it kept changing rules that didn't bring it closer, so I the lexical score to (improvements-worsenings)
now it is changeing more rules than necessary because I didn't realize that it could not move without being stuck
so I changed it to improvements-worsenings of fit, not just towards or away from target
allowing the results to go negative caused problems when I divided with them

What am I doing?
I am refactoring the code so that instead of applying to an array of patterns it can apply to a tree of patterns 
each with its own combineing function.  As part of that I pulled out a section gave it a name and made it 
map over the tree.  In understanding how that would work I needed to visualize the tree traversal.
*/
