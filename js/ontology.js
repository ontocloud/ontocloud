SPARQL = function(o) {
  this.query = function(q) {
    return $.ajax({
      url: o.endpoint,
      accepts: {json: "application/sparql-results+json"},
      data: {query: q, apikey: o.apikey},
      dataType: "json"
    });
  };
};

var apiKey = "2ed303d9-8e80-4f57-9dfa-7343ab61cc3c";
 
function getPredicatesStat(ontAbbr) {
	var bioportal = new SPARQL({ 
        apikey: apiKey, 
        endpoint: "http://sparql.bioontology.org/sparql/"
      });
	
	var query_string = "SELECT ?s, ?p, ?o, (COUNT(?p) as ?countP) \n\
						WHERE {\n\
						GRAPH <http://bioportal.bioontology.org/ontologies/" + ontAbbr + "> {\n\
						?s ?p ?o .\n\
						}\n\
						}\n\
						GROUP BY ?p ORDER by DESC(?countP)";
	// If error.
	function onFailure(xhr, status) {
	    document.getElementById("debug").innerHTML = status + " (See console.)";
	    console.log("error");
	    console.log(xhr);
	    
	}

	// If success.
	function onSuccess(json) {
		
		// Hash table will be used to save statistics about predicates. 
		var numberOf = {};
		numberOf['subclass'] = 0;
		numberOf['type'] = 0;
		numberOf['label'] = 0;
		numberOf['prefLabel'] = 0;
		numberOf['altLabel'] = 0;
		numberOf['hiddLabel'] = 0;
		//numberOf['partof'] = 0;
		numberOf['all'] = 0;
		
		// Hashes save first top predicates.
		var predicateNames = {};
		var predicateValues = {};
		
		var index = 0;
		
		for (var b in json.results.bindings) {  
			var subject = json.results.bindings[b][json.head.vars[0]];
			var predicate = json.results.bindings[b][json.head.vars[1]];
			var object = json.results.bindings[b][json.head.vars[2]];
	        var number = json.results.bindings[b][json.head.vars[3]];
	        
	        // Getting domain strings for subject and object. 
	        var subject_domain_index = subject.value.lastIndexOf("/") > subject.value.lastIndexOf("#") 
	        	? subject.value.lastIndexOf("/") : subject.value.lastIndexOf("#");
	        var subject_domain = subject.value.substring(0, subject_domain_index);
	        var object_domain_index = object.value.lastIndexOf("/") > object.value.lastIndexOf("#") 
        		? object.value.lastIndexOf("/") : object.value.lastIndexOf("#");
        	var object_domain = object.value.substring(0, object_domain_index);
	        
        	//console.log(object_domain);
        	//console.log(subject_domain);
	        //console.log(predicate);
	       // console.log(number);
        	
        	var doCount = true;
	        if (object.type == "uri" && predicate.type == "uri" && number.type == "literal") {
	        	
	        	numberOf['all'] += parseInt(number.value);
	        	
	          	if (predicate.value.indexOf("subClassOf") !== -1)
	          		numberOf['subclass'] = parseInt(number.value);
	          	else if (predicate.value.indexOf("type") !== -1)
	          		numberOf['type'] =  parseInt(number.value);
	          	else if (predicate.value.indexOf("label") !== -1)
		          	numberOf['label'] =  parseInt(number.value);
	          	else if (predicate.value.indexOf("prefLabel") !== -1)
		          	numberOf['prefLabel'] =  parseInt(number.value);
	          	else if (predicate.value.indexOf("altLabel") !== -1)
		          	numberOf['altLabel'] =  parseInt(number.value);
	          	else if (predicate.value.indexOf("hiddenLabel") !== -1)
		          	numberOf['hiddLabel'] =  parseInt(number.value);
	          	else if (object_domain == subject_domain)
	          	{	          		
	          		// First five predicate.
	          		if (index < 5)
	          		{
	          			predicateNames[index] = predicate.value.substring(predicate.value.lastIndexOf("/") + 1);
	          			predicateValues[index] = number.value;
	          			index++;
	          		}
	          	}
	          	else 
	          		numberOf['all'] -= parseInt(number.value);
	        }      
		}
		
		var shape = (numberOf['all'] - 
			(numberOf['subclass'] + numberOf['type'] + numberOf['label'] + numberOf['prefLabel'] + numberOf['altLabel'] + numberOf['hiddLabel']))
			/numberOf['all'];
		
		console.log(ontAbbr + " " + shape.toFixed(3) + " " + numberOf['all'] + " " +
				predicateNames[0] + " " + predicateNames[1] + " " + predicateNames[2] + " " + predicateNames[3] + " " + predicateNames[4]);
		//console.log(numberOf);
		return numberOf;
	}
	
	// Performing the query.
	return bioportal.query(query_string).done(onSuccess).error(onFailure);
}

// Helper function for normalizing values.
function normalize(normMe, low, high, normLow, normHigh) {
	n = normLow + (normMe - low)*(normHigh - normLow)/(high - low);
	return Math.round(n);

}

function showTop5(top5) {
	$("#top5").html(top5);
}

function hideTop5(top5) {
	$("#top5").text("I");
}

// Function draws shape of the ontology (needs D3js to be loaded).
function drawShape(ontAbbr, shape, size, top5) {
	var width =  size*100 + 10;
	var height = size*100 + 10;

	var svg = d3.select("#drawings").append("svg")
	.attr("width", width)
	.attr("height", height);
	
	// Circle.
	if (shape == 3){
			svg.append("circle")
		   .attr("cx", (width - 10)/2)
		   .attr("cy", (height - 10)/2)
		   .attr("r", size*95/2)
		   .attr("fill", "#2A75A9")
		   .attr("stroke", "#2A75A9")
		   .attr("onmouseover", "showTop5(top5)")
	       .attr("onmouseout", "hideTop5(top5)");
	
	}
	else if (shape == 2) { // Between.
		var lineData = [ { "x": (width - 10)/2,   "y": 10},  { "x": width - 10,  "y": (height - 10)},
		                 {"x": 10,   "y": (height - 10)}, {"x": (width - 10)/2,   "y": 10}];
		
		var lineFunction = d3.svg.line()
								 .x(function(d) { return d.x; })
		                         .y(function(d) { return d.y; })
		                         .interpolate("basis");
		
		svg.append("path")
                    .attr("d", lineFunction(lineData))
                    .attr("stroke", "#2A75A9")
                    .attr("stroke-width", 2)
                    .attr("fill", "#2A75A9")
                    .attr("onmouseover", "showTop5(top5)")
	                .attr("onmouseout", "hideTop5(top5)");
	}
	else { // Triangle.
		var lineData = [ { "x": (width - 10)/2,   "y": 10},  { "x": width - 10,  "y": (height - 10)},
		                 {"x": 10,   "y": (height - 10)}, {"x": (width - 10)/2,   "y": 10}];
		
		var lineFunction = d3.svg.line()
								 .x(function(d) { return d.x; })
		                         .y(function(d) { return d.y; })
		                         .interpolate("linear");
		
		svg.append("path")
                    .attr("d", lineFunction(lineData))
                    .attr("stroke", "#2A75A9")
                    .attr("stroke-width", 2)
                    .attr("fill", "#2A75A9")
                    .attr("onmouseover", "showTop5(top5)")
	                .attr("onmouseout", "hideTop5(top5)");
		
	}	
	
	// Text 
	svg.append("text")
	   .attr("x", (width - 50)/2)
	   .attr("y", (height - 10)/2)
	   .attr("font-family", "sans-serif")
	   .attr("font-size", "20px")
	   .attr("fill", "white")
	   .attr("stroke", "black")
	   .attr("stroke-width", "0.5")
	   .attr("onmouseover", "showTop5(top5)")
	   .attr("onmouseout", "hideTop5(top5)")
	   .text(ontAbbr);
}

function drawShapes(ontologies, numOfGroups) {
	
	$.getJSON("http://localhost:9090/json/shape_data_top.json", function(data) {
		
		newData = new Array();
		for (i = 0; i < data.length; ++i) {
			if ($.inArray(data[i]["abbr"], ontologies) > -1)
				newData.push(data[i]); 
		}
	
		data = newData;
		
		// Finding maximum/minimum size and shape.
		maxShape = data[0]["shape"];
		minShape = data[0]["shape"]
		maxSize = data[0]["size"];
		minSize = data[0]["size"];
		for (i = 1; i < data.length; ++i) {
			if (data[i]["shape"] > maxShape) maxShape = data[i]["shape"];
			if (data[i]["shape"] < minShape) minShape = data[i]["shape"];
			if (data[i]["size"] > maxSize) maxSize = data[i]["size"];
			if (data[i]["size"] < minSize) minSize = data[i]["size"];	
		}
		
		// Drawing.
		for (i = 0; i < data.length; ++i) {
			
			drawShape(data[i]["abbr"], normalize(data[i]["shape"], minShape, maxShape, 1, numOfGroups[0]['shape']), 
					normalize(data[i]["size"], minSize, maxSize, 1, numOfGroups[0]['size']),
					data[i]["top5"]);
			
			if ((i+1)%3==0)
				d3.select("#drawings").append("br");
		}
	});
	
}



