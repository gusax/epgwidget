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
  localizedStrings["No description."] = "Beskrivning saknas.";
  localizedStrings["Click to open description."] = "Klicka för att öppna beskrivning.";
  localizedStrings["Click to open description, use mousewheel/trackpad to scroll description."] = "Klicka för att läsa beskrivning, använd scrollhjul/pekplatta för att scrolla beskrivning.";
  localizedStrings["Duration"] = "Längd";
  localizedStrings["\u00A0left"] = "\u00A0kvar";
  localizedStrings["starts\u00A0in"] = "börjar\u00A0om";
  localizedStrings.ended = "slutade\u00A0för";
  localizedStrings["\u00A0ago"] = "\u00A0sedan";
  localizedStrings["Use mousewheel/trackpad to scroll description"] = "Använd scrollhjul/pekplatta för att scrolla beskrivning";
  localizedStrings.tomorrow = "i morgon";
  localizedStrings.today = "idag";
  localizedStrings["Type four numbers to jump forward up to 24 hours, backspace returns current time. (Examples: 2030 for 20:30, 0615 for 06:15.)"] = "Knappra in fyra siffror för att hoppa upp till 24 tim framåt. Suddtangenten återställer klockan. (Exempel: 2030 för 20:30, 0615 för 06:15).";
  localizedStrings["Click (or press Enter \u21a9) to flip to front."] = "Klicka (eller tryck Enter \u21a9) för att återgå till framsidan.";
  localizedStrings["Click (or press \u2318-,) to flip to backside."] = "Klicka (eller tryck \u2318-,) för att gå till baksidan.";
  localizedStrings["Hide duration (%)."] = "Göm avverkad tid (%).";
  localizedStrings.hr = localizedStrings.hrs = "tim";
  localizedStrings["Update available!"] = "Uppdatering tillgänglig!";
  localizedStrings["Skin:"] = "Utseende:";
  localizedStrings["Plastic"] = "Plast";
  localizedStrings["Click to remove."] = "Klicka för att ta bort";
  localizedStrings["Show [HD] after HD programs."] = "Visa [HD] efter HD-program.";
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
