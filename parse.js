const arity = {"and":2, "or":2, "not":1, "&leftright":1, "|leftright":1, "+leftright":1, "&colors":1, "|colors":1, "+colors":1};
const operator = {"and":AndPrototype, "or":OrPrototype, "not":NotPrototype, 
"&leftright":andFlipPrototype, "|leftright":orFlipPrototype, "+leftright":addFlipPrototype, 
"&colors":andPermutePrototype, "|colors":orPermutePrototype, "+colors":addPermutePrototype};

function parseScript(e){
  var textarea = e.target;
  var selection = saveSelection(textarea);
  var line = textarea.textContent.split(/(\s+|[)(=])/);
  line.place=0;
  textarea.textContent="";
  //parseName(line, textarea);
  var expr = parseExpr(line, textarea);
  textarea.normalize();
  restoreSelection(textarea,selection);
  if(expr.length > 0){
    sliders[textarea.parentElement["data-index"]].pattern[0] = expr[0];
  }
  //add new slider if needed
  if(textarea.parentElement["data-index"] == sliders.length -1){
    createSlider();
  }
  //make sure that it stays clickable if empty
  if(textarea.textContent == ""){
    var filler = document.createElement("div"); 
    filler.className="filler";
    textarea.appendChild(filler);
  }
}
function parseName (line,source){
  var name = "";
  while(line.place < line.length){
    var token = line[line.place];
    line.place++;
    if(/^s*$/.test(token)){
      source.appendChild(document.createTextNode(token));
    } else {
      
    }
  }
}
function parseExpr(line,source){
  var expr = [];
  while(line.place < line.length){
    var token = line[line.place];
    line.place++;
    if(token == "("){
      source.appendChild(document.createTextNode(token));
      expr = expr.concat(parseExpr(line, source));
    } else if(token == ")"){
      source.appendChild(document.createTextNode(token));
      return expr;
    } else if(operator[token]){
      var word = document.createElement("span");
      word.className = "reserved-word";
      word.textContent = token;
      source.appendChild(word);
      
      var ar = arity[token];
      if(ar == 2){
        expr = [operator[token].makeNew(source, expr.concat( parseExpr(line, source)))];
        return expr;
      } else if(ar == 1){
        expr.push(operator[token].makeNew(source, parseExpr(line, source)));
      }
    } else if(parseRule(token)){
      line.place--;
      expr.push(parseRuleset(line, source));
      
    } else {
      source.appendChild(document.createTextNode(token));
    }
  }
  return expr;
}
function parseRuleset(line, source){
  var rules = [];
  var nodes = []
  while(line.place<line.length){
    var token = line[line.place];
    var rule = parseRule(token);
    if(rule){
      nodes.push(illustrateRule( rule));
      var ruleNode = document.createElement("span");
      ruleNode.className = "ruleset";
      ruleNode.textContent = token;
      nodes.push(ruleNode);
      
      rules.push(rule);
    } else if(token == "(" || token == ")" || operator[token]){
      break;
    }  else {
      nodes.push(document.createTextNode(token));
    }
    line.place++;
  }
  var ruleset = zeroArray(states*states*states);
  for(var i=0; i<rules.length; i++){
    var a = rules[i][0]; //primary axis
    var b = rules[i][1]; //secondary axis
    var c = rules[i][2];
    if(a>=0 && b>=0 && c>=0 && a<states && b<states && c<states){
      ruleset[states*states*a + states*b + c] = 1;
    }
  }
  for(var i=0; i<nodes.length; i++){
    source.appendChild(nodes[i]);
  }
  var rulesetModel = BasePrototype.makeNew(source, [ruleset]);
  rulesetModel.source = nodes;
  return rulesetModel;
}
function parseRule(string){
  if(!/^\d+,\d+,\d+$/.test(string)){
    return false;
  }
  var thing = string.split(/,/);
  for(var i=0; i<3; i++){
    thing[i] = parseInt(thing[i],10);
  }
  return thing;
}
var saveSelection, restoreSelection;
saveSelection = function(containerEl) {
  var range = window.getSelection().getRangeAt(0);
  var preSelectionRange = range.cloneRange();
  preSelectionRange.selectNodeContents(containerEl);
  preSelectionRange.setEnd(range.startContainer, range.startOffset);
  var start = preSelectionRange.toString().length;

  return {
    start: start,
    end: start + range.toString().length
  };
};
restoreSelection = function(containerEl, savedSel) {
  var charIndex = 0, range = document.createRange();
  range.setStart(containerEl, 0);
  range.collapse(true);
  var nodeStack = [containerEl], node, foundStart = false, stop = false;

  while (!stop && (node = nodeStack.pop())) {
    if (node.nodeType == 3) {
      var nextCharIndex = charIndex + node.length;
      if (!foundStart && savedSel.start >= charIndex && savedSel.start <= nextCharIndex) {
        range.setStart(node, savedSel.start - charIndex);
        foundStart = true;
      }
      if (foundStart && savedSel.end >= charIndex && savedSel.end <= nextCharIndex) {
        range.setEnd(node, savedSel.end - charIndex);
        stop = true;
      }
      charIndex = nextCharIndex;
    } else {
      var i = node.childNodes.length;
      while (i--) {
        nodeStack.push(node.childNodes[i]);
      }
    }
  }

  var sel = window.getSelection();
  sel.removeAllRanges();
  sel.addRange(range);
}
function findRule(rule, list){
  for(var i=0; i<list.length; i++){
    if(list[i].textContent == rule){
      return list[i];
    }
  }
  return null;
}