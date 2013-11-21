# Server for managing web service calls.

require 'rubygems'
require 'sinatra'
require './lib/BioPortal.rb'

get '/' do
  'Onto Server'
end

# Method returns ontologies as nodes in one of the following formats:
# * csv 
# * json
# Params:
# +format+:: desired format of the return value.
get '/getgraphnodes.:format' do
  bioportal = BioPortal.new

  format = params[:format]
  
  # argument true = we ignore some ontologies.
  ontologies = bioportal.restGetOntologyInfo(true)
  
  result = ""
  case format
  when "csv"
    result = "vid,abbreavation,name,version" << "\n"
    ontologies.each do |k, v|
      result << v.to_csv << "\n"
    end
  when "json"
    result = "["
    i = 0
    ontologies.each do |k, v|
      result << v.to_json
      if (i < ontologies.length - 1)
         result << ","
      end
      i +=  1
    end
    result << "]"
  else
    result = "Format not supported." 
  end
  
  return result  
end

# Method returns edges between ontologies in one of the following formats:
# * csv 
# * TODO json
# Params:
# +format+:: desired format of the return value.
get '/getgraphedges.:format' do
  bioportal = BioPortal.new

  format = params[:format]
  
  # argument true = we ignore some ontologies.
  ontologies = bioportal.restGetOntologyInfo(true)
 
  result = ""
  case format
  when "csv"
    mappingData = "Source,Target,Weight\n";
    ontologies.each do |k, v|
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
    result = mappingData
  when "json"
    result << "json not supported yet."
  else
    result = "Format not supported." 
  end
  
  return result  
end


