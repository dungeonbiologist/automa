function saveAndClearTags(){
	for(var i in activeTags){
		if(activeTags[i]===true || activeTags[i]===false){
			var value = docCookies.getItem(tags[i])||"";
			var rules = value.split("|");
			//I'm not worring about duplicates
			rules[1]=rules[1] || ""; //if there was no value, split returns an array with ONE empty string
			if(activeTags[i]===true){ //positive and negative examples
				rules[0]+= ","+rulesetToInt(ruleset);
			} else {
				rules[1]+= ","+rulesetToInt(ruleset); 
			}
			docCookies.setItem(tags[i],rules[0]+"|"+rules[1]);
		}
		activeTags[i]=undefined;
	}
}

function addNewTag() {
    var name = document.getElementById("addtag").elements[0].value.replace(/\W/g, '');
    document.getElementById("addtag").elements[0].value="";
    var index = tags.indexOf(name);
    if(index==-1){ 
    	index=tags.length; 
    	tags[index]=name;
    }
    activeTags[index]=true;
    render();
}