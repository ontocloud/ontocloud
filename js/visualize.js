var Settings = function() {
	// Global variables
	var g_graphData = null;	// graph data is saved here.
	var transMatrix = null;	// Matrix for zooming/panning. 
	var width = null;
	var height = null;
	// Different versions of the graph.
	var g_loaded_version = null;
	var g_versions = null;
	var g_customNodes =null;
	var g_versions_full = null;
	var g_force = null;	
	// Are we in the shape mode?
	var g_shapeMode = false;
	var g_shapeData = null;
	var g_versions_shape = null
}

var initGlobals = function initGlobals() {
	// Global variables
	Settings.g_graphData = "";	// graph data is saved here.
	Settings.transMatrix = [1,0,0,1,0,0];	// Matrix for zooming/panning. 
	Settings.width  = $("#graph").attr("width");
    Settings.height = $("#graph").attr("height");

	// Different versions of the graph.
	Settings.g_versions = versions;
	for (var i = 0; i < Settings.g_versions.length; i++) {
    	Settings.g_versions[i] = version_domain + Settings.g_versions[i];
	}

	Settings.g_versions_full = versions_full;
	for (var i = 0; i < Settings.g_versions_full.length; i++) {
    	Settings.g_versions_full[i] = version_domain + Settings.g_versions_full[i];
	}

	Settings.g_versions_shape = versions_shape;
	for (var i = 0; i < Settings.g_versions_shape.length; i++) {
    	Settings.g_versions_shape[i] = version_domain + Settings.g_versions_shape[i];
	}
	
	Settings.g_customNodes ="";
	Settings.g_force = null;	
}

function initGraph() {
	initGlobals();
	loadGraph(0);
	document.onkeypress = stopRKey;
}

// Helper function for finding a node with id in a hash.
function getNode(id, hash) {
	for (var i = 0; i < hash.length; ++i) { 
		if(hash[i]["id"] == id) {
        	return hash[i];
        }
	};
}

// Function loads different versions of existing graphs. 
function loadGraph(version) {

	// Turn off the shape mode.
	if (Settings.g_shapeMode)
		hideShapes();
	
	Settings.g_graphData = "";
	clearGraph();

	var graphFile = Settings.g_versions[version];
	
	var graphData = $.getJSON(graphFile, function(
		graphData) {

		// Adding nodes.
		var svg = d3.select("#nodes");
		
		var circles = svg.selectAll("circle")
			.data(graphData.nodes)
			.enter()
			.append("circle");

		circles.attr("id", function(d) { return d.id })
			.attr("cx", function(d) { return d.x; })
			.attr("cy", function(d) { return d.y; })
			.attr("r", function(d) { return d.size;})
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
			.attr("class", "node_text")
			.attr("font-size", function(d) { return d.size/2; })
			.attr("x", function (d) { return d.x; })
			.attr("y", function (d) { return d.y; });
		
		// Adding edges.
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
			.attr("y2", function (d) { return getNode(d.target, graphData.nodes).y; })

		// Adding the node dynamics.
		addNodeDynamics();
		
		/*
		 * TODO: now it's fixed in index.html Adding new group - shapes var
		 * $newgroup = $('<g id="shapes"/>'); $("#graph > g").append($newgroup);
		 */

		/* Shape information popup
		var graph = $("#graph");
		xmlns = "http://www.w3.org/2000/svg";
		var shape_popup = document.createElementNS(xmlns, "g");
		$(shape_popup).attr('id', 'show_shape_information_popup').attr(
				'visibility', 'hidden');

		var shape_popup_bg = document.createElementNS(xmlns, "rect");
		$(shape_popup_bg).attr('id', 'shape_popup_bg').attr('width', 300).attr(
				'height', 320).attr('class', 'shape_information_bg');

		var shape_popup_close_bg = document.createElementNS(xmlns, "rect");
		$(shape_popup_close_bg).attr('id', 'shape_popup_close_bg').attr('x', 290)
				.attr('width', 10).attr('height', 10).attr('class',
						'shape_information_bg');

		// TODO
		text = $("#shape_popup_close_text")[0];
		text_content = $("#shape_popup_text")[0];

		shape_popup.appendChild(shape_popup_bg);
		shape_popup.appendChild(shape_popup_close_bg);
		shape_popup.appendChild(text);
		shape_popup.appendChild(text_content);
		graph.append(shape_popup);

		// End of shape information


		// Shape data will be loaded here.
		var shape_data = {}; */
	

		// Saving the whole graph data into global variable.
		Settings.g_graphData = graphData;

		hideFixedMenu();
	});
	
	Settings.g_loaded_version = version;
}

/**
 * Function adds node functionality (node menu, hover node) to the graph. 
 * Graph has to be initialized before this function is called.
 */
function addNodeDynamics() {	
	// Adding menu.
	$("#node-labels > text").attr("onclick", "ShowNodeMenu(this)");
	$("#node_menu_close_text").attr("onclick", "HideNodeMenu()");
	// Adding hover/unhover functionality. 
	$("#node-labels > text").attr("onmouseover", "HoverNodeLabel(this)");
	$("#node-labels > text").attr("onmouseout", "UnHoverNodeLabel(this)");
	// We also have to stop all other events in case we are in a layout.
	$("#node-labels > text").attr("onmousedown", function() { 
		d3.event == null ? "" : d3.event.stopPropagation() ; });
}

/**
 * Function adds edge functionality (edge hover) to the graph. 
 * Graph has to be initialized before this function is called.
 */
function addEdgeDynamics() {	
	// Adding hover/unhover functionality. 
	$("#edges > line").attr("onmouseover", "hoverEdge(this)");
	$("#edges > line").attr("onmouseout", "unHoverEdge(this)");
}

/**
 * Function visualizes only a subset of a graph. Parameters are passed through 
 * form fields.
 */
function loadCustomGraphSubmit() {
	var ids = $("#custom_graph_ids")[0].value;
	loadCustomGraph(ids, 0);
}

/**
 * Function visualizes only a subset of a graph.
 * @param {string} nodes a set of ids of nodes that should be visualized. 
 * 				Ids should be separated with comma, e.g., "123,324,435"
 * @param {int} version a number that tells which version of the original 
 * 				graph to use when visualizing.
 */
var loadCustomGraph = function loadCustomGraph(nodes, version) {	
	// Turn off the shape mode.
	if (Settings.g_shapeMode)
		hideShapes();

	Settings.g_graphData = "";
	clearGraph();
	Settings.g_customNodes = nodes;

	var graphFile = Settings.g_versions_full[version];
	
	var graphData = $.getJSON(graphFile, function(
			graphData) {
		
		nodes = Settings.g_customNodes; // Nodes to visualize.
		
		// Fist we have to remove nodes and edges that we wont visualize.
		graphDataTemp = {};
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
		
		var force = d3.layout.force()
		    .nodes(graphData.nodes)
		    .links(graphData.edges)
		    .on("tick", tick)
		    .charge(-1000)
		    .start();
		
		// Saving the layout for other methods that need to manipulate the layout.
		Settings.g_force = force;
		
		var svg = d3.select("#nodes");
		
		var node = svg.selectAll("circle")
		    .data(graphData.nodes)
		    .enter().append("circle")
		    .attr("id", function(d) { return d.id })
			.attr("cx", function(d) { return d.x; })
			.attr("cy", function(d) { return d.y; })
			.attr("r", function(d) { return d.size;})
			.attr("r", function(d) { return d.size; })
			.attr("class", function(d) { return d.label })
			.attr("label", function(d) { return d.label })
			.attr("fill", function(d) { return d.color })
		    .call(force.drag);
		
		// Adding node labels.
		var svg = d3.select("#node-labels");
		
		var node_labels = svg.selectAll("text")
			.data(graphData.nodes)
			.enter()
			.append("text");
		
		node_labels.text(function(d) { return d.label; })
			.attr("label", function(d) { return d.label; })
			.attr("id", function(d) { return d.id; })
			.attr("class", "node_text")
			.attr("font-size", function(d) { return d.size/2; })
			.attr("x", function (d) { return d.x; })
			.attr("y", function (d) { return d.y; });
		
		// Adding edges.
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
			.attr("y2", function (d) { return getNode(d.target, graphData.nodes).y; })

		// Adding the node dynamics.
		addNodeDynamics();
		
		// Adding edge dynamics.
		addEdgeDynamics();
		
		// Saving the whole graph data into global variable.
		Settings.g_graphData = graphData;
		
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
	});
	
	hideFixedMenu();
}


/**
 * Function clears the graph.
 */
function clearGraph ()
{
	// removing nodes.
	var svg = $("#nodes").empty();

	// Removing node labels.
	var svg = $("#node-labels").empty();
		
	// Removing  edges.
	var svg = $("#edges").empty();

	// Removing shapes.
	var svg = $("#shapes").empty();

	// Saving the whole graph data into global variable.
	Settings.g_graphData = "";
}

// Select nodes that belong to the same community.
function showCommunity() {
	// Turn off the shape mode.
	if (Settings.g_shapeMode)
		hideShapes();

	// Are we using the force layout? Then we pause it.
	if (Settings.g_force != null)
		Settings.g_force.stop();
	
	// Reseting colours.
	if (Settings.g_graphData != null) {
		for (i = 0; i < Settings.g_graphData.nodes.length; i++) 
			$("#nodes > circle[id='" + Settings.g_graphData.nodes[i]["id"] + "']").attr("fill",
				Settings.g_graphData.nodes[i]["color"]);
	}

	var selected_color = $("circle[id='" + searched_node_id + "']")
			.attr("fill");

	d3.selectAll($("circle[fill!='" + selected_color + "']")).attr("fill",
			"#e9ebe4");
	d3.selectAll($("path[stroke!='" + selected_color + "']")).attr("stroke",
			"#e9ebe4");

	HideNodeMenu();
 	
 // Are we using the force layout? Then we resume it.
	if (Settings.g_force != null)
		Settings.g_force.resume();
}

// Menus.

function HideNodeMenu() {
	$("#node_menu_content").attr("visibility", "hidden");
	$("#node_menu_bg").attr("visibility", "hidden");
	$("#node_menu_close_bg").attr("visibility", "hidden");
	$("#node_menu_close_text").attr("visibility", "hidden");
	$("#node_menu_entry_shape").attr("visibility", "hidden");
}

function ShowNodeMenu(selected_ontology) {	
	hideShapeInformation();

	searched_node_id = $(selected_ontology).attr("id");
	searched_node_name = $(selected_ontology).attr("label");
	
	// First we hide menu - to reset all values to original.
	HideNodeMenu();

	$("#node_menu_content").attr("x", parseInt($(selected_ontology).attr("x")) + 5);
	$("#node_menu_content").attr("y", parseInt($(selected_ontology).attr("y")) + 17);
	$("[class='node_menu_entry']").attr("x", parseInt($(selected_ontology).attr("x")) + 5);
	$("#node_menu_content").attr("visibility", "visible");

	$("#node_menu_bg").attr("x", $(selected_ontology).attr("x"));
	$("#node_menu_bg").attr("y", $(selected_ontology).attr("y"));
	$("#node_menu_bg").attr("visibility", "visible");

	$("#node_menu_close_bg").attr("x",
			parseInt($(selected_ontology).attr("x")) + 140);
	$("#node_menu_close_bg")
			.attr("y", parseInt($(selected_ontology).attr("y")));
	$("#node_menu_close_bg").attr("visibility", "visible");

	$("#node_menu_close_text").attr("x",
			parseInt($(selected_ontology).attr("x")) + 141);
	$("#node_menu_close_text").attr("y", parseInt($(selected_ontology).attr("y")) + 10);
	$("#node_menu_close_text").attr("visibility", "visible");

	// Show shape information is visible only when in shape mode.	
	if(Settings.g_shapeMode)
		$("#node_menu_entry_shape").attr("visibility", "visible");
	else
		$("#node_menu_entry_shape").attr("visibility", "hidden");
}

// When we clickon the fixed "Menu" botton, we either hide or show the fixed menu content
function showOrHideFixedMenu() {
	if ($("#fixed_menu_content_div").attr("style").indexOf("visible") != -1)
		hideFixedMenu();
	else
		$("#fixed_menu_content_div").attr("style", "visibility: visible");
}
function hideFixedMenu () {
	$("#fixed_menu_content_div").attr("style", "visibility: hidden");
	hideFixedSubMenu();
}

// Submenu
function showOrHideFixedSubMenu() {
	if ($("#fixed_submenu_content_div").attr("style").indexOf("visible") != -1) 
		hideFixedSubMenu();
	else 
		$("#fixed_submenu_content_div").attr("style", "visibility: visible");
}
function hideFixedSubMenu () {
	$("#fixed_submenu_content_div").attr("style", "visibility: hidden");
	hideLoadCustomGraphDiv();
}

/**
 * Function shows the custom graph input field
 */
function showLoadCustomGraphDiv() {
	$("#custom_graph_div").attr("style", "visibility: visible");
}

/**
 * Function hides the custom graph input field
 */
function hideLoadCustomGraphDiv() {
	$("#custom_graph_div").attr("style", "visibility: hidden");
}

// When we are over a node text label with the mouse, we enlarge the node.
function HoverNodeLabel(over_ontology)
{
	// Are we using the force layout? Then we pasue it.
	if (Settings.g_force != null)
		Settings.g_force.stop();
		
	var id = $(over_ontology).attr("id");
	var currentNodeSize = parseFloat($("#" + id).attr("r"));
	$("#" + $(over_ontology).attr("id")).attr("r", currentNodeSize + 10.0);
	
}
function UnHoverNodeLabel(over_ontology)
{
	var id = $(over_ontology).attr("id");
	var currentNodeSize = parseFloat($("#" + id).attr("r"));
	$("#" + $(over_ontology).attr("id")).attr("r", currentNodeSize - 10.0);
	
	// Are we using the force layout? Then we resume it.
	if (Settings.g_force != null)
		Settings.g_force.resume();
}

/**
 * TODO: Function displays number of edges when we hover over an edge.
 * @param edge the edge over which we hover.
 */
function hoverEdge(edge) {
		  
}

/**
 * TODO: Function hides number of edges when we unhover over an edge.
 * @param edge the edge over which we hover/unhover.
 */
function unHoverEdge(edge) {
	
}

/**
 * Function opens a new tab with information about selected ontology
 * (External link to BioPortal).
 */
function ShowOntology() {
	var url = "http://bioportal.bioontology.org/ontologies/" + searched_node_id;
	window.open(url, '_blank');

	HideNodeMenu();
}

/**
 * Function opens a new tab with information about mappings of selected ontology
 * (External link to BioPortal).
 */
function ShowMappingsPage() {
	var url = "http://bioportal.bioontology.org/ontologies/" + searched_node_id + "/?p=mappings";
	window.open(url, '_blank');

	HideNodeMenu();
}

function ReloadPage() {
	clearGraph();
	loadGraph(0);
	init_compass();
	hideFixedMenu();
}

// Zoom and pan functions.
             
function init_compass() {
	Settings.transMatrix = [1,0,0,1,0,0];
	
	$("#map-matrix").attr("transform", Settings.transMatrix);

    mapMatrix = $("#map-matrix");
    Settings.width  = $("#graph").attr("width");
    Settings.height = $("#graph").attr("height");
}

/**
 * Function transforms the svg coordinates according to current
 * compass matrix.
 */
function apply_compass() {
	var newMatrix = "matrix(" +  Settings.transMatrix.join(' ') + ")";
  	$("#map-matrix").attr("transform", newMatrix);
}

function Zoom(scale) {
  for (var i=0; i < Settings.transMatrix.length; i++)
  {
    Settings.transMatrix[i] *= scale;
  }

  Settings.transMatrix[4] += (1-scale)*Settings.width/2;
  Settings.transMatrix[5] += (1-scale)*Settings.height/2;
           
  var newMatrix = "matrix(" +  Settings.transMatrix.join(' ') + ")";
  $("#map-matrix").attr("transform", newMatrix);
}

function Pan(dx, dy) {      
  Settings.transMatrix[4] += dx;
  Settings.transMatrix[5] += dy;          
  var newMatrix = "matrix(" +  Settings.transMatrix.join(' ') + ")";
  $("#map-matrix").attr("transform", newMatrix);
}

// Search field
function SearchOntology() {
	// Disable link.
	$("#search_button").attr("href", "#");

	searched_node_name = $("#search_for")[0].value;
	var text_element = $("text[label='" + searched_node_name + "']");
	if (text_element.length == 0)
	{
		alert("Ontology '" + searched_node_name + "' cannot be found.");
		// Enable link.
	 	$("#search_button").attr("href", "javascript:SearchOntology()");
		return;
	}

	searched_node = d3.select("circle[label='" + searched_node_name + "']");

	var old_r = parseInt(searched_node.attr("r"));
	var old_colour = searched_node.attr("fill");

	// This is in case we are in "shape mode". If yes, circles are hidden, so we have to make it visible.
	var visibility = d3.select("circle[label='" + searched_node_name + "']").attr("visibility");
	d3.select("circle[label='" + searched_node_name + "']").attr("visibility", "visible");

	searched_node.transition().duration(1000).attr("r", old_r + 10).attr("fill", "red")
	 .each("end",function() { 
    searched_node       
     .transition()       
     .duration(1000).attr("r",old_r).attr("fill", old_colour).attr("visibility", visibility);    
   });

	 // Enable link.
	 $("#search_button").attr("href", "javascript:SearchOntology()");
}

// Disabling enter key.
function stopRKey(evt) {
  var evt = (evt) ? evt : ((event) ? event : null);
  var node = (evt.target) ? evt.target : ((evt.srcElement) ? evt.srcElement : null);
  if ((evt.keyCode == 13) && (node.type=="text"))  {return false;}
}

// -- SHAPES -- //

// Helper function for normalizing values.
function normalize(normMe, low, high, normLow, normHigh) {
	n = normLow + (normMe - low)*(normHigh - normLow)/(high - low);
	return Math.round(n);
}

function shapesOnOff() {
	HideNodeMenu();

	if (Settings.g_shapeMode)
		hideShapes();
	else 
		showShapes();
}

function hideShapes() {
	try {
		// Removing shapes.
		var svg = $("#shapes").empty();
		$("#nodes").attr("visibility", "visible");
		$("#show_shapes_link").html("Show shapes");
		Settings.g_shapeMode = false;
		hideFixedMenu();

		Settings.g_shapeData = null;
	}
	catch (e) {
	}
	
}

/**
 * Function turns on the shape mode.
 */
function showShapes() {

	// Extending jQuery with new functions (http://stackoverflow.com/questions/7456435/how-can-i-run-a-custom-function-on-a-jquery-element)
	jQuery.fn.replaceWithTriangle = function() {
		var circleRadius = parseInt($(this).attr("r"));
		var circleX =  parseInt($(this).attr("cx"));
		var circleY = parseInt($(this).attr("cy"));

		// TODO: check why it happens.
		if (isNaN(circleRadius))
			return;

		var lineData = [ 
						{"x": circleX , "y": circleY - circleRadius},  { "x": circleX + circleRadius, "y": circleY + circleRadius},
		                {"x": circleX - circleRadius, "y": circleY + circleRadius}, {"x": circleX , "y": circleY - circleRadius}
		               ];
		
		var lineFunction = d3.svg.line()
								 .x(function(d) { return d.x; })
		                         .y(function(d) { return d.y; })
		                         .interpolate("linear");
		
		var xmlns = "http://www.w3.org/2000/svg";
		var newPath = document.createElementNS(xmlns,"path");
		$(newPath)
					.attr("id", $(this).attr("id"))
					.attr("d", lineFunction(lineData))
                    .attr("stroke", $(this).attr("fill"))
                    .attr("stroke-width", 2)
                    .attr("fill", $(this).attr("fill"))
                    .attr("centerX", circleX)
                    .attr("centerY", circleY)
                    .attr("shape", "triangle"); // TODO; temporary for shape popup. Same bellow. 

        document.getElementById("shapes").appendChild(newPath);
	};

	jQuery.fn.replaceWithDrop = function() {
		var circleRadius = parseInt($(this).attr("r"));
		var circleX =  parseInt($(this).attr("cx"));
		var circleY = parseInt( $(this).attr("cy"));

		// TODO: check why it happens.
		if (isNaN(circleRadius))
			return;

		var lineData = [ 
						{"x": circleX , "y": circleY - circleRadius},  { "x": circleX + circleRadius, "y": circleY + circleRadius},
		                {"x": circleX - circleRadius, "y": circleY + circleRadius}, {"x": circleX , "y": circleY - circleRadius}
		               ];
		
		var lineFunction = d3.svg.line()
								 .x(function(d) { return d.x; })
		                         .y(function(d) { return d.y; })
		                         .interpolate("basis");
		
		var xmlns = "http://www.w3.org/2000/svg";
		var newPath = document.createElementNS(xmlns,"path");
		$(newPath)
					.attr("id", $(this).attr("id"))
					.attr("d", lineFunction(lineData))
                    .attr("stroke", $(this).attr("fill"))
                    .attr("stroke-width", 2)
                    .attr("fill", $(this).attr("fill"))
                    .attr("centerX", circleX)
                    .attr("centerY", circleY)
                    .attr("shape", "drop"); // TODO; temporary for shape popup. 

        document.getElementById("shapes").appendChild(newPath);

	};

	jQuery.fn.copyCircle = function() {
		var xmlns = "http://www.w3.org/2000/svg";
		var newCircle = document.createElementNS(xmlns,"circle");
		$(newCircle)
					.attr("id", $(this).attr("id"))
					.attr("cx", $(this).attr("cx"))
					.attr("cy", $(this).attr("cy"))
					.attr("centerX", (this).attr("cx"))
                    .attr("centerY", $(this).attr("cy"))
                    .attr("r", $(this).attr("r"))
                    .attr("class", $(this).attr("class"))
                    .attr("label", $(this).attr("label"))
                    .attr("fill", $(this).attr("fill"))
                    .attr("shape", "circle"); // TODO; temporary for shape popup

      		document.getElementById("shapes").appendChild(newCircle); 
	};

		// If this is not first call.
	if ($("#shapes").children().length < 1) {

		$.getJSON(Settings.g_versions_shape[Settings.g_loaded_version], function(data) {

			// We save the shape data for future references.
			Settings.g_shapeData = data;

	   		// Normalized shapes - how many?
	   		var minNormShape = 1;
	   		var maxNormShape = 3;

	   		// Finding maximum/minimum shape.
			var minShape = 0;
			var maxShape = 1;

			/*for (var i = 0; i < Settings.g_graphData.nodes.length; ++i) {

				// Id of the current node.
				var node_id = Settings.g_graphData.nodes[i].id;
				if (node_id in data) {
					if (data[node_id]['shape'] < minShape)
						minShape = data[node_id]['shape'];
					if (data[node_id]['shape'] >maxShape)
						maxShape = data[node_id]['shape'];
				}
			}*/

			// Drawing.
			for (var i = 0; i < Settings.g_graphData.nodes.length; ++i) {
				// Id of the current node.
				var node_id = Settings.g_graphData.nodes[i].id;

				if (node_id in data) {
					// calculating shape TODO, this has to be done much better.
					data[node_id]['shape'] = (data[node_id]['all'] - 
          					(data[node_id]['subclass'] + data[node_id]['type'] + data[node_id]['label'] 
          						+ data[node_id]['preflabel'] + data[node_id]['altlabel'] + data[node_id]['hiddlabel'] 
          						+ data[node_id]['isa'] + data[node_id]['is_a'] + data[node_id]['part_of'] 
          						+ data[node_id]['disjoint_with'] + data[node_id]['domain'] + data[node_id]['range'] 
          						+ data[node_id]['inverse_of'] + data[node_id]['subproperty_of'] 
          						+ data[node_id]['equivalentproperty'] + data[node_id]['functionalproperty'] 
          					    + data[node_id]['inversefunctionalproperty'] + data[node_id]['transitiveproperty'] 
          					    + data[node_id]['symmetricproperty']))/
          							(data[node_id]['all'] - (data[node_id]['label'] + data[node_id]['preflabel'] 
          								+ data[node_id]['altlabel'] + data[node_id]['hiddlabel'] 
          								+ data[node_id]['isa'] + data[node_id]['is_a'] 
          								+ data[node_id]['part_of'] + data[node_id]['disjoint_with'] 
          								+ data[node_id]['domain'] + data[node_id]['range'] 
          								+ data[node_id]['inverse_of'] + data[node_id]['subproperty_of'] 
          								+ data[node_id]['equivalentproperty'] + data[node_id]['functionalproperty'] 
          								+ data[node_id]['functionalproperty'] + data[node_id]['inversefunctionalproperty'] 
          								+ data[node_id]['transitiveproperty'] + data[node_id]['symmetricproperty']));
     
  					// Normalizing the shape
					var normShape = normalize(data[node_id]['shape'],  minShape, maxShape, minNormShape, maxNormShape);

					if (normShape == maxNormShape)
						$("circle#" + node_id).copyCircle();
					else if (normShape == minNormShape)
						$("circle#" + node_id).replaceWithTriangle();
					else
						$("circle#" + node_id).replaceWithDrop();
				}
				else {
					// We just make a copy of the circle.
	 				$("circle#" + node_id).copyCircle();
				}
					
			}
		});
	}

	$("#nodes").attr("visibility", "hidden");
	$("#shapes").attr("visibility", "visible");
	$("#show_shapes_link").html("Hide shapes");
	Settings.g_shapeMode = true;
	hideFixedMenu();
}


/**
 * Function gets URL parameter
 * @param name of the parameter
 * @returns
 */
function getURLParameter(name) {
    return decodeURI(
        (RegExp(name + '=' + '(.+?)(&|$)').exec(location.search)||[,null])[1]
    );
}

// Methods displays shape information.
function showShapeInformation() {

	if (!Settings.g_shapeMode)
		return;

	// We hide node menu
	HideNodeMenu();

	// Getting parameters

	// selected node element.
	var node = $("#shapes").find("#" + searched_node_id);
	// Cordinates of our rectangle
	var x =  $(node).attr("centerX");
	var y =  $(node).attr("centerY");
	// What kind of shape.
	var shape = $(node).attr("shape");
	// Stroke and fil colours 
	var stroke_colour = $(node).attr("stroke");
	var fill_colour = $(node).attr("fill");

	// Opening pop up ;
    $("#shape_information_popup")
		.attr('transform', 'translate(' + x + ',' + y + ')')
		.attr('visibility', 'visible');
	$("#shape_information_popup_close_bg")
		.attr('x', 158)
		.attr('visibility', 'visible');		
	$("#shape_information_popup_close_text")
		.attr('x', 159)
		.attr('y', 10)
		.attr('visibility', 'visible');
	
	
	// Shape value.	
	if(searched_node_id in Settings.g_shapeData) {
		$("#shape_information_popup_content_shape_value").html(Settings.g_shapeData[searched_node_id]['shape']);
		$("#shape_information_popup_content_numofallpredicates").html(Settings.g_shapeData[searched_node_id]['all']);
			
	}
    else {
    	$("#shape_information_popup_content_shape_value").html("N/A");
    	$("#shape_information_popup_content_numofallpredicates").html("N/A");
    }
    	


} 

// Methods hides shape information.
function hideShapeInformation() {
	$("#shape_information_popup")
			.attr('visibility', 'hidden');
	$("#shape_information_popup_close_bg")
			.attr('visibility', 'hidden');
	$("#shape_information_popup_close_text")
			.attr('visibility', 'hidden');
}
