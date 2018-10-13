var globalNeurons= [];
var globalSources= [];
var scaleoutputs = [];
var learningRate = [0.02, 0.5]; //each layer has a different learning rate
function sigmoid(x){
	return 1/(1+Math.exp(-x));
}
function halfsigmoid(x){
	return 1/(1+Math.pow(20,1.5-x));
}
function none(x){
	return x;
}
scaleoutputs = [none,halfsigmoid,sigmoid,sigmoid];

function drawNetwork(context){
	var outputs = [];
	outputs[0] = patternToInputs(ruleset);
	for(var l=0; l<globalNeurons.length; l++){
		outputs[l+1]=[];
		for(var j=0; j<globalNeurons[l].length; j++){
			outputs[l+1][j]=forward(outputs[l],globalNeurons[l][j],globalSources[l][j],scaleoutputs[l+1]);
		}
	}
	drawNeurons(context,globalNeurons[0],globalSources[0],outputs[1],scaleoutputs[1],0,2,1,15);
	drawNeurons(context,globalNeurons[1],globalSources[1],outputs[2],scaleoutputs[2],38,30,5,7);
	//drawNeurons(context,globalNeurons[2],globalSources[2],outputs[3],scaleoutputs[3],58,7,5,7);
	context.fillStyle = "#000000";
	context.fillText(outputs[outputs.length-1][0],30*size,(HEIGHT+8)*size);
	drawWeights(context,30*size,(HEIGHT+9)*size, 9, patternToInputs(ruleset), [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26],scaleoutputs[0]);
}
function drawWeights(context,x,y,max,weights,connections,scale){
	for(var j=0; j<weights.length; j++){
		var color = 255-Math.floor(255*2*Math.abs(scale(weights[j])-0.5));
		context.fillStyle = (weights[j]>0)? "rgb("+color+",255,"+color+")":
		"rgb(255,"+color+","+color+")";
		context.fillRect(x+(j%max)*size,y+Math.floor(j/max)*size,size,size);
	}
	context.strokeStyle= "#000000";
	context.strokeRect(x,y,max*size, Math.ceil(connections.length/max)*size);
}
function drawNeurons(context,neurons,connections,outputs,scale,yoffset,max1,yheight,max2){
	for(var i=0; i<neurons.length; i++){
		var x = (WIDTH+1+(max1+1)*(i%max2))*size;
		var y = (yoffset+Math.floor(i/max2)*yheight)*size;
		drawWeights(context,x,y,max1,neurons[i],connections[i],scale);
		context.fillStyle = "#000000";
		context.fillText(Math.round(outputs[i]*1000)/1000,x,y+size);
	}
}

function initNetwork(){
	var sizes = [27,27*26,1];
	var connections = [2,27*26]
	globalNeurons=[]; //weights
	globalSources=[]; //from where
	scaleoutputs = [none,halfsigmoid,sigmoid,sigmoid];
	for(var i=0; i<sizes.length-1; i++){
		globalNeurons[i]=[];
		globalSources[i]=[];
		for(var j=0; j<sizes[i+1];j++){ //number of neurons in THIS layer
			globalNeurons[i][j]=[];
			globalSources[i][j]=pick(connections[i],sizes[i], j);
			for(var k=0; k<connections[i];k++){ //one weight for each link
				globalNeurons[i][j][k]=1;
			}
		}
	}
	normalizeWeights(globalNeurons);
}
function pick(x,n,index){
	var picks = [];
	for(var i=0; i<x;i++){//I would prefer no duplicates.
		//turns index into the nth set of unique numbers drawn from n
		picks[i]=i + index%(n-i); 
	}
	return picks;
}
function makeNeuron(){
	var neuron = []
	for(var i=0; i<states*states*states; i++){
		neuron[i] = 1;//100*(Math.random()-0.5);
	}
	return neuron;
}
function backPropagate(inputs,weights,connections,error){
	var blame=[];
	for(var i=0; i<weights.length; i++){
		blame[i] = error*inputs[connections[i]]*weights[i];
	}
	return blame;
}
function updateWeights(inputs,weights,connections,error,learningRate){
	for(var i=0; i<weights.length; i++){
		weights[i] +=learningRate*inputs[connections[i]]*error;
	}
}
function forward(inputs,weights,connections,scale){
	var sum=0;
	for(var g=0; g<connections.length; g++){
		sum += weights[g]*inputs[connections[g]];
	}
	return scale(sum);
}
function zeroArray(length){
	var arry=[];
	for(var i=0; i<length; i++){
		arry[i]=0;
	}
	return arry;
}
function feedback(patterns,target,layers,connections,dlayers){
	for(var i=0; i<patterns.length; i++){
		var alternations = permute(patterns[i]);
		for(var k=0;k<1 /*6*/;k++){
			var outputs=[];
			outputs[0] = patternToInputs(alternations[k]);
			for(var l=0; l<layers.length; l++){
				outputs[l+1]=[];
				for(var j=0; j<layers[l].length; j++){
					outputs[l+1][j]=forward(outputs[l],layers[l][j],connections[l][j],scaleoutputs[l+1]);
				}
			}
			var blame=[]
			for(var j=0; j<outputs.length; j++){
				blame[j]=zeroArray(outputs[j].length);
			} //blame should match outputs
			blame[outputs.length-1][0] = target-outputs[outputs.length-1][0]; //tell the final output the error
			for(var jj=layers.length-1; jj>=0; jj--){
				for(var j=0; j<layers[jj].length; j++){
					var tempblames = backPropagate(outputs[jj], layers[jj][j], connections[jj][j], blame[jj+1][j]);
					for(var l=0; l<blame[jj].length; l++){
						blame[jj][l]+=tempblames[l];
					}
					updateWeights(outputs[jj], dlayers[jj][j], connections[jj][j], blame[jj+1][j],learningRate[jj]);
				}
			}
		}
	}
	return dlayers;	
}
function learn (pos,neg,layers,connections){
	var dlayers=[];
	for(var j=0; j<layers.length; j++){
		dlayers[j]=[];
		for(var i=0;i<layers[j].length; i++){
			dlayers[j][i] = zeroArray(layers[j][0].length);
		}
	}
	feedback(pos,1,layers,connections,dlayers);
	feedback(neg,0,layers,connections,dlayers);
	for(var k=0;k<layers.length; k++){
		for(var i=0;i<layers[k].length; i++){
			for(var j=0; j<layers[k][i].length;j++){
				layers[k][i][j]+=dlayers[k][i][j];
			}
		}
	}
	//normalizeWeights(layers);
}
function normalizeWeights(layers){ //so that learning rate remains high
	for(var i=0; i<layers.length; i++){
		for(var j=0; j<layers[i].length; j++){
			var total = 0;
			for(var k=0; k<layers[i][j].length; k++){
				total+=layers[i][j][k]*layers[i][j][k];
			}
			//var average = Math.sqrt(total/layers[i][j].length) | 1;//in case total is 0;
			for(var k=0; k<layers[i][j].length; k++){
				layers[i][j][k]/=total;//average;
			}
		}
	}
}
function train(){
	var data = docCookies.getItem("serpenski").split("|");
	data = [split(data[0],","),split(data[1],",")];
	for(var i=0; i<data.length; i++){
		for(var j=0; j<data[i].length; j++){
			data[i][j] = intToRuleset( parseInt(data[i][j]) );
		}
	}
	for(var i=0; i<1; i++){
		learn(data[0],data[1],globalNeurons,globalSources);
	}
	render();
}
function guess(){
	saveAndClearTags()
}
//function teach(yes){
	if(yes){
		learn([ruleset],[],globalNeurons,globalSources);
	} else {
		learn([],[ruleset],globalNeurons,globalSources);
	}
	render();
}

