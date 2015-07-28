# OntoCloud  
### Description
OntoCloud aims to visualize mappings between all BioPortal ontologies. Gephi is is used to produce visualization data and D3.js is used to visualize the data.
Application available at: http://bionlp.dbcls.jp:80/ontocloud

### TODO list:
* Adding March 2015 version.
* Recalculate shapes. User should be able to select which types of predicates are used to calculate shape values.
* Add additional shape information to shape pop-up window.
* Add additional functionality to “custom graph” mode:
   - Remove a node from the graph.
   - Add nodes from the same community to the graph.
* Add information about number of mappings.
* Fix the issues.

### Known issues:
* When a custom graph is loaded and the shape mode is turned on, nodes are not attached to layout, so they cannot be dragged. 
* Web Service: It seems that all requests share the same D3 object. When several requests are sent to the server, all requests receive the same result. 

### Directory structure
* /js javascript files
* /json data files (graph and shape data)
* /lib ruby libraries
* /onto_cloud ontoucloud's index file
* /onto_cloud/style the css file
* /server the web service files

### Installation
To make a local copy up and running, you will need to:
* install node modules in the /server directory. d3 and jsdom are needed.
* set the BioPortal API key in /lib/BioPortal.cfg if you plan to use lib files. 
