# Class for ontology data
class Ontology
  def initialize
    @name = ""
    @abbrevation = ""
    @vid = ""
    @versionStatus = "" # production, alpha, ...
    
  end
  
  # Accessors
  attr_accessor :name, :abbrevation, :vid, :versionStatus
  
  # Method returns json representation of Ontology class
   def to_json
        {'abbrevation' => @abbrevation, 'vid' => @vid, 'name' => @name, 'versionStatus' => @versionStatus}.to_json
   end
   
   # Method returns array representation of Ontology class
   def to_a
        return [@vid, @abbrevation, @name, @versionStatus]
   end
   
   # Method returns string representation of Ontology class
   def to_s
     return "#{@vid}, #{@abbrevation}, #{@name}, #{@versionStatus}"
   end
   
   # Method returns csv representation of Ontology class
   def to_csv
     return "#{@vid},#{@abbrevation},#{@name},#{@versionStatus}"
   end
end