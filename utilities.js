function zeroArray(length){
  var ar =[];
  for(var i=0; i<length; i++){
    ar[i]=0;
  }
  return ar;
}
function copyVect(vect){
  var copy = [];
  for(var i=0; i<vect.length; i++){
    copy[i]=vect[i];
  }
  return copy;
}
function randomElt(list){
  return list[Math.floor(Math.random()*list.length)];
}
function within(x,y,x2,y2,width,height){
  return x2<=x && x<=x2+width && y2<=y && y<=y2+height;
}
function between(x,low,high){
  return x>low && x<high;
}
function clamp(lower,mid,up){
  return Math.max(lower,Math.min(mid,up));
}
function sign(a){
  if(a<0) return -1;
  else if(a>0) return 1;
  return 0;
}

function truncateNumbers(nums){
  for(var i=0; i<nums.length; i++){
    nums[i] = (100*nums[i]).toFixed();
  }
  return nums;
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

function filter(thing,things,mask){
  var result = [];
  for(var i=0; i<things.length; i++){
    if(same(thing,things[i],mask)){
      result.push(things[i]);
    }
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
function countAt(array,place){
  var counts = [0,0,0];
  for(var i=0; i<array.length; i++){
    counts[array[i][place]]++;
  }
  return counts;
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
function findAt(thing, list){
  for(var i=0; i<list.length; i++){
    if(thing == list[i]){
      return i;
    }
  }
  return -1;
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
function mult(a,list){
  for(var i=0; i<list.length; i++){
    list[i]=a*list[i];
  }
  return list;
}
function log(message){
  document.getElementById ("log").innerHTML += message + '<br>';
}
function clearLog(){
  document.getElementById ("log").innerHTML = '';
}
