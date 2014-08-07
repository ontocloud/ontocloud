// Domain where verjson sion files are saved.
var version_domain = "http://bionlp.dbcls.jp/ontocloud/json/";
//var version_domain = "http://localhost:9090/json/"

// Light versions of grapohs (edges are filtered). 
var versions = 
	[
		"graph_july_2014.json",
		"graph_december_12_2013.json",	
		"graph_august_16_v3_2013.json", 
		"graph_february_16_2013_v2.json"
	];

// Full versions of graphs
var versions_full = 
	[
		"graph_december_12_2013.json",
        "graph_august_16_v_full.json"
    ];

// Shape versions.
var versions_shape = 
	[
		"shape_data_august.json",
	 	"shape_data_august.json" // Due to code changes both versions use the same file.
	];

// We make some functions visible to Node.js (the server). 
// However, when we are using the library in the browser an exception is thrown (since exports is not defined)
try {
  	exports.versions = versions;
	exports.versions_full = versions_full;
	exports.version_domain = version_domain;
}
catch(err) {
}