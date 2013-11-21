require 'net/http'
require 'rexml/document'
require './lib/Ontology'
require 'parseconfig'
require 'json'
require 'open-uri'
require 'cgi'

class BioPortal
  @config  = ParseConfig.new('./lib/BioPortal.cfg')
  
  @@apiKey = @config['apiKey']
  @@sparqlOntEndpoint = @config['sparql_onto_endpoint']
  
  ## Methods that use the SPARQL endpoint.
  
  # Helper method for dispalying error message.
  # Params:
  # +method+:: name of the method where error occurred.
  # +message+:: error message.
  def displayErrorMessage(method, message)
    puts "Error in BioPortal, #{method}(): #{message}"
  end
  
  # Helper method for performing a query.
  # Params: TODO
  def sparqlQuery(query, endpoint, accept = "application/json")
   json = open("#{endpoint}?query=#{CGI.escape(query)}&apikey=#{@@apiKey}", "Accept" => accept).read
   JSON.parse(json)
  end
  
  # TODO
  def sparqlOntAbbrevationToVid(abbrevation)
    query = ""
  end
  # TODO
  def sparqlOntVidToAbbrevation(vid)
    
  end
  
  # Method counts number of object predicates. We ignore:
  # * data predicates (i.e., predicates where object is literal),
  # * predicates where subject and object do not belong to the same domain.
  # Params:
  # +abbr+:: abbrevation of the ontology (or file name if readFromFile=true.)
  # +readFromFile+:: used in case that we want to use local json file (true)
  #
  # Returns an array of number of predicates where the key represents type of the predicate:
  #  numberOf['subclass'] 
  #  numberOf['type'] 
  #  numberOf['label'] 
  #  numberOf['preflabel'] 
  #  numberOf['altlabel'] 
  #  numberOf['hiddlabel'] 
  #  numberOf['is_a']
  #  numberOf['isa']
  #  numberOf['part_of']
  #  numberOf['disjoint_with']
  #  numberOf['domain']
  #  numberOf['range']
  #  numberOf['inverse_of']
  #  numberOf['subproperty_of'] 
  #  numberOf['equivalentproperty']
  #  numberOf['functionalproperty']
  #  numberOf['functionalproperty']
  #  numberOf['inversefunctionalproperty']
  #  numberOf['transitiveproperty']
  #  numberOf['symmetricproperty']
  #  numberOf['all']
  def sparqlCountInterObjectPredicates(abbr, readFromFile = false)
    begin
      query = %Q|
      SELECT  ?s, ?o, ?p 
      WHERE {
        GRAPH <http://bioportal.bioontology.org/ontologies/#{abbr}> {
         ?s ?p ?o .
        FILTER isIri(?o)
        }
      }
      |
      
      if (!readFromFile)
        jsonResult = sparqlQuery(query, @@sparqlOntEndpoint)
        File.open("json/_#{abbr}.json", 'w') { |file| file.write(jsonResult) }
        else 
          json = File.read(abbr)
          jsonResult = JSON.parse(json)
      end
          
      # Results hash
      numberOf = {}
      numberOf['subclass'] = 0.0
      numberOf['type'] = 0.0
      numberOf['label'] = 0.0
      numberOf['preflabel'] = 0.0
      numberOf['altlabel'] = 0.0
      numberOf['hiddlabel'] = 0.0
      numberOf['is_a'] = 0.0
      numberOf['isa'] = 0.0
      numberOf['part_of'] = 0.0
      # Properties.
      numberOf['disjoint_with'] = 0.0
      numberOf['domain'] = 0.0
      numberOf['range'] = 0.0
      numberOf['inverse_of'] = 0.0
      numberOf['subproperty_of'] = 0.0
      numberOf['equivalentproperty'] = 0.0
      numberOf['functionalproperty'] = 0.0
      numberOf['functionalproperty'] = 0.0
      numberOf['inversefunctionalproperty'] = 0.0
      numberOf['transitiveproperty'] = 0.0
      numberOf['symmetricproperty'] = 0.0
      numberOf['all'] = 0.0
      
      jsonResult['results']['bindings'].each { |b|
        subject = b['s']['value']
        predicate = b['p']['value']
        object = b['o']['value']
        
        # Domains for subject and object. 
        if (object.rindex("/") == nil || subject.rindex("/") == nil)
          puts "nil"
          next
        end 
        subject_domain_index = subject.rindex("#") != nil && (subject.rindex("/") < subject.rindex("#")) ? subject.rindex("#") : subject.rindex("/")
        object_domain_index = object.rindex("#") != nil && (object.rindex("/") < object.rindex("#")) ? object.rindex("#") : object.rindex("/")   
        
        subject_domain = subject[0, subject_domain_index]
        object_domain = object[0, object_domain_index]
        
        if (subject_domain == object_domain)
          # We count them. 
          numberOf['all'] += 1.0  
          if (predicate.include?("subClassOf")) 
            numberOf['subclass'] += 1.0 
            elsif (predicate.include?("type")) 
              numberOf['type'] += 1.0 
            elsif (predicate.include?("label")) 
              numberOf['label'] += 1.0 
            elsif (predicate.include?("prefLabel")) 
              numberOf['preflabel'] += 1.0 
            elsif (predicate.include?("altLabel")) 
              numberOf['altlabel'] += 1.0 
            elsif (predicate.include?("hiddenLabel")) 
              numberOf['hidlabel'] += 1.0
            elsif (predicate.include?("is_a")) 
              numberOf['is_a'] += 1.0
            elsif (predicate.include?("isa")) 
              numberOf['isa'] += 1.0
            elsif (predicate.include?("part_of")) 
              numberOf['part_of'] += 1.0
            elsif (predicate.include?("disjointWith")) 
              numberOf['disjoint_with'] += 1.0
            elsif (predicate.include?("rdf-schema#domain")) 
              numberOf['domain'] += 1.0
            elsif (predicate.include?("rdf-schema#range")) 
              numberOf['range'] += 1.0
            elsif (predicate.include?("owl#inverseOf")) 
              numberOf['inverse_of'] += 1.0
            elsif (predicate.include?("rdf-schema#subPropertyOf")) 
              numberOf['subproperty_of'] += 1.0
            elsif (predicate.include?("equivalentProperty")) 
              numberOf['equivalentproperty'] += 1.0
            elsif (predicate.include?("FunctionalProperty")) 
              numberOf['functionalproperty'] += 1.0
            elsif (predicate.include?("InverseFunctionalProperty")) 
              numberOf['inversefunctionalproperty'] += 1.0
            elsif (predicate.include?("TransitiveProperty")) 
              numberOf['transitiveproperty'] += 1.0
            elsif (predicate.include?("SymmetricProperty")) 
              numberOf['symmetricproperty'] += 1.0
            elsif (numberOf.has_key?(predicate))
                  numberOf[predicate] += 1.0
            else
              numberOf[predicate] = 1.0
          end   
        end
      }
      numberOf.sort_by {|_key, value| value}
      return numberOf
   end
   rescue => err
    displayErrorMessage("sparqlCountInterObjectPredicates", err)   
  end

  ## Methods that use the REST service.

  # Method returns a hash of ontologies, their names, abbrevations and virtual ids. 
  # Key is ontology's virtual id.
  # Params:
  # +ignore+:: when true, we do not return ontologies with status alpha/retired or the word "test" in the name
  def restGetOntologyInfo(ignore = false)
    ontologies = Hash.new
    
    searchUrl = "http://rest.bioontology.org/bioportal/ontologies?apikey=#{@@apiKey}"
     
    # Get the XML data as a string.
    xml_data = Net::HTTP.get_response(URI.parse(searchUrl)).body
    
    # Extract event information.
    doc = REXML::Document.new(xml_data)
           
    doc.elements.each("success/data/list/ontologyBean") { |element|
      begin         
        singleOnt = Ontology.new
        singleOnt.vid = "#{element.elements['ontologyId'].text.strip}"
        singleOnt.abbrevation = "#{element.elements['abbreviation'].text.strip}"
        singleOnt.name = "#{element.elements['displayLabel'].text.strip}"
        if (element.elements['versionStatus'] != nil && element.elements['versionStatus'].text != nil)
          singleOnt.versionStatus = "#{element.elements['versionStatus'].text.strip}"
        end 
        
        # Do we ignore some ontologies?
        if (ignore)
          if (singleOnt.name.downcase.include? "test" or singleOnt.versionStatus.downcase.include? "alpha" or singleOnt.versionStatus.downcase.include? "retired")
            next
          end
        end
          
        ontologies[singleOnt.vid] = singleOnt
       
        rescue => err
         displayErrorMessage("restGetOntologyInfo", err)
      end
      }
      
    return ontologies
   end  
   
   # Method gets mappings info for an ontology
   # Params:
   # +vId+:: virtual id for the ontology.
   # 
   # Returns an array of mapping statistics where single entry contains an array where [<vid of mapped to>, <number of mappings>]
   def restGetMappingsStatistics(vId)
     begin
      esearch = "http://rest.bioontology.org/bioportal/virtual/mappings/stats/ontologies/#{vId}?apikey=#{@@apiKey}"
      xml_data = Net::HTTP.get_response(URI.parse(esearch)).body
      doc = REXML::Document.new(xml_data)
      
      mappings = Array.new
      doc.elements.each("success/data/list/ontologyMappingStatistics") { |element| 
        mappedTo = "#{element.elements['ontologyId'].text}"
        numOfMappings =  "#{element.elements['sourceMappings'].text}"
          
        mappingsEntry = [mappedTo, numOfMappings]
        mappings.push mappingsEntry
      }
        
      return mappings     
     end
   end
     
   # Method is used to download all ontologies in RDF/XML format.
   # More info: 
   # http://www.bioontology.org/wiki/index.php/BioPortal_REST_services#RDF_Download_Service
   def restDownloadRdfOnologies(path)
     ontologies = getOntologyInfo()
       
     ontologies.each do |key, value|
       url = "http://rest.bioontology.org/bioportal/virtual/ontology/rdf/download/#{key}?#{@@apiKey}"
       # Get the XML data as a string.
       xml_data = Net::HTTP.get_response(URI.parse(searchUrl)).body
         
       File.open("#{path}#{key}.xml", 'w') { |file| file.write(xml_data) }
     end
   rescue => err
     displayErrorMessage("restDownloadRdfOnologies", err)
   end      
end

# TODO: get size,