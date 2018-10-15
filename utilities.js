function zeroArray(length){
  var ar =[];
  for(var i=0; i<length; i++){
    ar[i]=0;
  }
  return ar;
}
function within(x,y,x2,y2,width,height){
  return x2<=x && x<=x2+width && y2<=y && y<=y2+height;
}

function truncateNumbers(nums){
  for(var i=0; i<nums.length; i++){
    nums[i] = (100*nums[i]).toFixed();
  }
  return nums;
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

function reducemap(fn, list){
  if(list.length ==0){
    return new Error("reducemapmax can't take an empty list");
  }
  var results = copyArray(list[0]);
  for(var i=1; i<list.length; i++){
    for(var j=0; j<list[i].length; j++){
      results[j] = fn(results[j],list[i][j]);
    }
  }
  return results;
}
function bit(n,num){
  return Math.floor(num / Math.pow(states,n))%states;
}
function reducemapmin(list){
  if(list.length ==0){
    return new Error("reducemapmin can't take an empty list");
  }
  var results = copyArray(list[0]);
  for(var i=0; i<list.length; i++){
    for(var j=1; j<list[i].length; j++){
      results[j] = Math.min(results[j],list[i][j]);
    }
  }
  return results;
}
function mostScore(points,fn){
  if(points.length == 0){
    return 0;
  }
  var oldpoints = points;
  var points = map(points,copyArray); //don't clobber points
  var chosen = [];
  var costs = zeroArray(points.length);
  for(var k=0; k<states*states; k++){
    var sum = reduce(add,points);
    sum = normBy(sum, states); //so that the ratio of lowest to highest matters rather than the absolute magnitude
    var place=0;
    var best = Infinity;
    for(var i=0; i<sum.length; i++){
      if(contains(chosen, Math.floor(i/states))){ //skip if you've already looked at it
        i+=states-1;
        continue;
      }
      if( fn(best, sum[i]) ){
        best=sum[i];
        place=i;
      }
    }
    chosen.push(Math.floor(place/states));
    for(var i=0; i<points.length; i++){ //adjust a points weights
      best = oldpoints[i][place];
      for(var j=0; j<points[i].length; j++){
        points[i][j]+=best;
      }
      costs[i]+=best;
    }
  }
  var cost = costs.sort(fn).pop();
  return cost;
}
worstScore = function(points){ return mostScore(points,function(a,b){return a > b}); };
bestScore  = function(points){ return mostScore(points,function(a,b){return a < b}); };
function ruleToPattern(rule,place,flipped){
  var unflipped = flipped?0:1;
  if(place==undefined){alert("ruleToPattern place undefined");}
  var pattern=zeroArray(states*states*states);
  for(var i=0; i<(states*states); i++){
    pattern[rule[i]+i*states]=1;
  }
  var unpermuted = (0==place)?1:0;
  pattern.push(unpermuted);
  pattern.push(unflipped);
  return pattern;
}
function filter(thing,things,mask){
  var result = [];
  for(var i=0; i<things.length; i++){
    if(same(thing,things[i],mask)){
      result.push(things[i]);
    }
  }
  return result;
}
function copyArray(a){
  var result = [];
  for(var i=0; i<a.length; i++){
    result[i]=a[i];
  }
  return result;
}
function equal(a,b){
  if(!Array.isArray(a) || !Array.isArray(b)){
    return a === b;
  }
  if(a.length != b.length){ return false; }
  for(var i=0; i<a.length; i++){
    if(!equal(a[i],b[i])){
      return false;
    }
  }
  return true;
}
function mult(a,list){
  for(var i=0; i<list.length; i++){
    list[i]=a*list[i];
  }
  return list;
}
function add(a,b){
  var result = [];
  b.length;
  for(var i=0; i<a.length && i<b.length; i++){
    result[i] = a[i]+b[i];
  }
  return result;
}
function square(a){
  for(var i=0; i<a.length; i++){
    a[i] = a[i]*a[i];
  }
  return a;
}
function countAt(array,place){
  var counts = [0,0,0];
  for(var i=0; i<array.length; i++){
    counts[array[i][place]]++;
  }
  return counts;
}
function randomElt(list){
  return list[Math.floor(Math.random()*list.length)];
}
function normalize(array,newsum){
  if(!newsum){newsum=1;}
  var total = sum(array);
  var result = [];
  for(var i=0; i<array.length; i++){
    result[i] = newsum*array[i]/total;
  }
  return result;
}
function sumList(array){
  var sum = 0;
  for(var i=0; i<array.length; i++){
    sum+=array[i];
  }
  return sum;
}
function average(array){
  var sum = 0;
  for(var i=0; i<array.length; i++){
    sum+=array[i];
  }
  return sum/array.length || 0;
}
function normBy(vect,n){
  for(var i=0; i<Math.floor(vect.length); i++){
    var total =0;
    for(var j=0; j<n; j++){
      total+=vect[n*i+j];
    }
    if(total>0){
      for(var j=0; j<n; j++){
        vect[n*i+j]/=total;
      }
    }
  }
  return vect;
}
function normalizePattern(pattern){
  var max = 0;
  var min = 0;
  for(var i=0; i<states*states; i+=states){
    var mmax=0;
    var mmin=0;
    for(var j=0; j<states; j++){
      mmax = Math.max(mmax, pattern[i+j]);
      mmin = Math.min(mmin, pattern[i+j]);
    }
    max+=mmax;
    min+=mmin;
  }
  for(;i<pattern.length; i++){
    max+=pattern[i];
  }
  var d = 1/(max-min);
  if(d==0){d=1;}
  for(var i=0; i<pattern.length; i++){
    pattern[i]*=d;
  }
  return pattern;
}
function normPattern(pattern){
  var sum=0;
  for(var i=0; i<states*states; i++){
    var max=0;
    for(var j=0; j<states; j++){
      max = Math.max(max,pattern[i*states+j]);
    }
    sum+=max;
  }
  sum=sum || 1;
  var result = [];
  for(var i=0; i<states*states*states; i++){
    result[i]=pattern[i]/sum;
  }
  return result;
}
function normMaxPattern(pattern){
  var max=0;
  for(var i=0; i<states*states; i++){
    for(var j=0; j<states; j++){
      max = Math.max(max,pattern[i*states+j]);
    }
  }
  sum=max || 1;
  var result = [];
  for(var i=0; i<states*states*states; i++){
    result[i]=pattern[i]/sum;
  }
  return result;
}
function map(seq,fn){
  var result = [];
  for(var i=0; i<seq.length; i++){
    result[i] = fn(seq[i],i);
  }
  return result;
}
function mapMax(a,b){
  var result = [];
  for(var i=0; i<a.length; i++){
    result[i] = Math.max(a[i],b[i]);
  }
  return result;
}
function reduce(fn,seq){
  var a = seq[0];
  for(var i=1; i<seq.length; i++){
    a=fn(a,seq[i]);
  }
  return a;
}
function copyVect(vect){
  var copy = [];
  for(var i=0; i<vect.length; i++){
    copy[i]=vect[i];
  }
  return copy;
}
function contains(a, obj) {
    for(var i = 0; i < a.length; i++) {
        if (a[i] === obj) {
            return true;
        }
    }
    return false;
}
function firstBestAt(weights){
  var w = -Infinity;
  var index=false;
  for(var i=0; i<weights.length; i++){
    if(weights[i] > w){
      index = i;
      w = weights[i];
    }
  }
  return index;
}
function randBestAt(weights){
  var w = 0;
  var index=false;
  count=1;
  for(var i=0; i<weights.length; i++){
    if(weights[i] > w){
      index = i;
      count=1;
      w = weights[i];
    } else if(weights[i] == w && Math.random()*(++count) < 1 ){
      index = i;
      w = weights[i];
    }
  }
  return index;
}
function randLeastAt(weights){
  var w = Infinity;
  var index=false;
  count=1;
  for(var i=0; i<weights.length; i++){
    if(weights[i] < w){
      index = i;
      count=1;
      w = weights[i];
    } else if(weights[i] == w && Math.random()*(++count) < 1 ){
      index = i;
      w = weights[i];
    }
  }
  return index;
}
function mostAt(fn,weights,initialValue){
  var w = initialValue;
  var index=false;
  count=1;
  for(var i=0; i<weights.length; i++){
    if(fn(weights[i], w)){
      index = i;
      count=1;
      w = weights[i];
    } else if(weights[i] == w && Math.random()*(++count) < 1 ){
      index = i;
      w = weights[i];
    }
  }
  return index;
}
function least(list){
  var c = 0;
  for(var i=0; i<list.length; i++){
    if(list[i]<list[c]){
      c=i;
    }
  }
  return c;
}
function clamp(lower,mid,up){
  return Math.max(lower,Math.min(mid,up));
}
function between(x,low,high){
  return x>low && x<high;
}
function sign(a){
  if(a<0) return -1;
  else if(a>0) return 1;
  return 0;
}
function findAt(thing, list){
  for(var i=0; i<list.length; i++){
    if(thing == list[i]){
      return i;
    }
  }
  return -1;
}
function factorial(n){
  var result = 1;
  while(n>1){
    result *= n--; 
  }
  return result;
}
function insertAfter(el, referenceNode) {
  referenceNode.parentNode.insertBefore(el, referenceNode.nextSibling);
}
function countsToVector(counts,ruleset){
  var vect = [];
  for (var i =0; i<states*states; i++){
    for(var j=0; j<states; j++){
      vect[i*states+j]=0;
    }
    vect[i*states+ruleset[i]]=counts[i];
  }
  return vect;
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
