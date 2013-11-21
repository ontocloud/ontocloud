require './BioPortal'
require './Ontology'
require 'json'
require 'csv'

# An example of getting information about ontologies and writting it to a file.
def getOntologies()
  bioportal = BioPortal.new
  
  puts "Getting info for ontologies..."
  
  ontologies = bioportal.restGetOntologyInfo()
  
  puts ontologies
  
  puts "Finished. Writting to file."
    
  CSV.open("ontologies.csv", "wb") {|csv| ontologies.to_a.each { |elem| csv << elem[1].to_a }}
end

# An example of getting information about ontologies and their mappings. 
# The method saves information to two csv files compatible with the Gephi tool. 
def prepareGephiInput()
  bioportal = BioPortal.new
  
  puts "Getting info for ontologies..."
  
  # argument true = we ignore some ontologies.
  ontologies = bioportal.restGetOntologyInfo(true)
  
  puts "Finished. Getting mappings information"
  
  mappingData = "Source,Target,Weight\n";
  ontologies.each do |k, v|
    puts "Getting mapping information for ontology #{v}"
    mappings = bioportal.restGetMappingsStatistics(k)
    
    mappings.each {|entry| 
      mappedToVid = entry[0] # vid of ontology current ontology is mapped to.
      numOfMappings = entry[1] # Number of mappings between the two ontologies.

      if (ontologies[mappedToVid] != nil)
        mappingDataLine = "#{k},#{mappedToVid},#{numOfMappings}\n"
        mappingData = "#{mappingData}#{mappingDataLine}" 
      end
      }
  end
   
  begin
    puts "Writting nodes to a file"
    CSV.open("nodes.csv", "wb") {|csv| ontologies.to_a.each { |elem| csv << elem[1].to_a }}
    
    puts "Writting edges to a file"
    File.open("edges.csv", 'w') {|results| results.write(mappingData) }
    
    rescue => err
      puts "Something went wrong when writting to file: #{err}" 
  end  
end


if __FILE__ == $0
  getOntologies
end