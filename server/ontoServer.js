var express = require('express');

// Server variable.
var app = express();

// Handling '/getgraph' request
app.get('/getgraph', function(req, res){

	// Helper function for finding a node with id in a hash.
	function getNode(id, hash) {
		for (var i = 0; i < hash.length; ++i) { 
			if(hash[i]["id"] == id) {
	        	return hash[i];
	        }
		};
	}

	// Function sends error.
	function sendErr(response, message) {
		response.send("Error: " + message);  
	}

	// Logging.
	function writeLog(req) {
		console.log('%s %s', req.method, req.url);
	}

	writeLog(req);

	// Getting url parameters
	var url = require('url');
	var url_parts = url.parse(req.url, true);
	var query = url_parts.query;

	// Nodes to visualize.Exanple: "1023,1035,1009,1353,1007,3021,1019,1053,1427,1351,1032"
	var nodes = query.ids; 
	if (typeof nodes == 'undefined') {
		sendErr(res, "No parameter 'ids' has been given. No ontologies to visualize.");
		return;
	}

	// Verson of the graph data to be used.
	var version = 0;
	if (typeof query.version != 'undefined')
		version = query.version;

	// Importing graph data that is going to be used.
	var versions = require("../js/versions.js");
	var graphName = versions.versions_full[version];
	var graphData = require("../json/" + graphName);

	// Fist we have to remove nodes and edges that we wont visualize.
	var graphDataTemp = {};
	graphDataTemp['nodes'] = new Array();
	graphDataTemp['edges'] = new Array();
		
	for (i = 0; i < graphData.nodes.length; i++) 
		if (nodes.indexOf(graphData.nodes[i].id) != -1) // Id found
			graphDataTemp['nodes'].push(graphData.nodes[i]);
	for (i = 0; i < graphData.edges.length; i++) 
		if (nodes.indexOf(graphData.edges[i].source) != -1
				&& nodes.indexOf(graphData.edges[i].target) != -1) 
			graphDataTemp['edges'].push(graphData.edges[i]);
			
	graphData = graphDataTemp;

	var jsdom = require('jsdom'),
	    scripts = ["../js/d3.v3.min.js"],
	    htmlStub = '<!DOCTYPE html><html><body></body></html>';

	jsdom.env({features:{QuerySelector:true}, html:htmlStub, scripts:scripts, done:function(errors, window) {
	    d3 = window.d3;

		// Creating svg stub
		var graphContainer = d3.select("body")
			.append("svg") 
		    .attr("id", "graph") 
		    .attr("width", 1500) 
		    .attr("height", 850)
		    .attr("xmlns", "http://www.w3.org/2000/svg")
		    .attr("version", "1.1")
		    .attr("viewBox", "-500 -550 1680 1050");

		var edgesContainer = graphContainer.append("g")
		    .attr("id", "edges");
		var nodesContainer = graphContainer.append("g")
		    .attr("id", "nodes");
		var nodesLabelcontainer = graphContainer.append("g")
		    .attr("id", "node-labels");

		// Layout is used to bring nodes together.
		var force = d3.layout.force()
		    .nodes(graphData.nodes)
		    .links(graphData.edges)
		    .on("tick", tick)
		    .charge(-1000)
		    .alpha(0.01)
		    // IMPORTANT: here the function returns the result. After the layout calculates everyting, htnl is returned.
		    .on('end', function() { 
		    	res.type('html');
		    	res.send(window.document.innerHTML);  
		    })
	    	.start();

		var svg = d3.select("#nodes");
		var node = svg.selectAll("circle")
		    .data(graphData.nodes)
		    .enter().append("circle")
		    .attr("id", function(d) { return d.id })
			.attr("r", function(d) { return d.size;})
			.attr("cx", function(d) { return d.x; })
			.attr("cy", function(d) { return d.y; })
			.attr("class", function(d) { return d.label })
			.attr("label", function(d) { return d.label })
			.attr("fill", function(d) { return d.color });
			
		// Adding node labels.
		var svg = d3.select("#node-labels");
			
		var node_labels = svg.selectAll("text")
			.data(graphData.nodes)
			.enter()
			.append("text");
		
		node_labels.text(function(d) { return d.label; })
			.attr("label", function(d) { return d.label; })
			.attr("id", function(d) { return d.id; })
			.attr("style", "dominant-baseline: central; text-anchor: middle;")
			.attr("font-size", function(d) { return d.size/2; })
			.attr("x", function (d) { return d.x; })
			.attr("y", function (d) { return d.y; });
			
		// Adding edges..
		var svg = d3.select("#edges");
			
		var edges = svg.selectAll("line")
			.data(graphData.edges)
			.enter()
			.append("line");
			
		edges
			.style("stroke", "#ccc")
			.style("stroke-width", 0.5)
			.attr("x1", function (d) { return getNode(d.source, graphData.nodes).x; })
			.attr("y1", function (d) { return getNode(d.source, graphData.nodes).y; })
			.attr("x2", function (d) { return getNode(d.target, graphData.nodes).x; })
			.attr("y2", function (d) { return getNode(d.target, graphData.nodes).y; });
		
		function tick(e) {			
			edges
				.attr("x1", function (d) { return getNode(d.source, graphData.nodes).x; })
				.attr("y1", function (d) { return getNode(d.source, graphData.nodes).y; })
				.attr("x2", function (d) { return getNode(d.target, graphData.nodes).x; })
				.attr("y2", function (d) { return getNode(d.target, graphData.nodes).y; })
					
			node.attr("cx", function(d) { return d.x; })
		    	.attr("cy", function(d) { return d.y; })
			
			node_labels.text(function(d) { return d.label; })
				.attr("x", function (d) { return d.x; })
				.attr("y", function (d) { return d.y; }); 	
		}

	}});
});

// Starting the server.
try
{
	var port = 3000;
	// Getting port if it was passed.
	if (typeof process.argv[2] != 'undefined')
		port = process.argv[2];

	// Starting server.
	app.listen(port);
	console.log("Server started on port: " + port);
}
catch(err)
{
	console.log("Could not start the server. Usage: node ontoServer.js [port-number]")
	console.log("Error message: " + err);
}