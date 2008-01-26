/*jslint adsafe:false, 
 bitwise: true, 
 browser:true, 
 cap:false, 
 debug:false,
 eqeqeq: true,
 evil: false,
 fragment:false, 
 laxbreak:false, 
 nomen:true, 
 passfail:false, 
 plusplus:true, 
 rhino:false, 
 undef:true, 
 white:false, 
 widget:false */

/*extern EPG*/

if(!EPG)
{
  var EPG = {};
}

EPG.translator = function(debug)
{
  // Private Variables
  var that,
  localizedStrings = {};
  
  localizedStrings.Default = "Swedish";
  localizedStrings.Done = "Klar";
  localizedStrings["Downloading channels..."] = "Laddar ner kanaler...";
  localizedStrings.list = "lista";
  localizedStrings.Found = "Hittade";
  localizedStrings.channels = "kanaler";
  localizedStrings["Jippie, you can use Growl together with the EPG widget :-)"] = "Jippie, du kan använda Growl tillsammans med EPG-widgeten :-)";
  localizedStrings["EPG has NOT been installed before!"] = "EPG har INTE varit installerad förut!";
  localizedStrings["EPG has been installed before."] = "EPG har varit installerad förut.";
  localizedStrings["Help & support..."] = "Hjälp & support...";
  localizedStrings["Report a bug..."] = "Rapportera en bugg...";
  localizedStrings["Complaints..."] = "Klagomål...";
  localizedStrings["EPG by"] = "EPG av";
  localizedStrings.overview = "översikt";
  localizedStrings["No program"] = "Sändningsuppehåll";
  localizedStrings["Click to show more programs, press and drag to move."] = "Klicka för att visa fler program, håll nere och dra för att flytta.";
  localizedStrings["Channel with id"] = "Kanalen med id";
  localizedStrings["was not found :-( It might have been renamed."] = "hittades inte :-( Den kanske har döpts om.";
  localizedStrings["No description."] = "Beskrivning saknas."
  localizedStrings["Click to open description, use mousewheel/trackpad to scroll description."] = "Klicka för att läsa beskrivning, använd scrollhjul/pekplatta för att scrolla beskrivning.";
  localizedStrings["Duration"] = "Längd";
  localizedStrings["min left"] = "min kvar";
  localizedStrings["starts in"] = "börjar om";
  localizedStrings.ended = "slutade för";
  localizedStrings["min ago"] = "min sedan";
  localizedStrings["Use mousewheel/trackpad to scroll description"] = "Använd scrollhjul/pekplatta för att scrolla beskrivning";
  // Private methods
  
  
  // Public methods
  return {
    init: function()
    {
      if(!that)
      {
        that = this;
      }
      
      delete that.init;
    },
    
    translate: function (string)
    {
      try
      {
        string = "" + string;
        if(string && localizedStrings[string])
        {
          return localizedStrings[string];
        }
        else
        {
          return string;
        }
      }
      catch (error)
      {
        debug.alert("Error in translator.translate: " + error);
        return string;
      }
    }
  };
}();
EPG.translator.init(EPG.debug);
