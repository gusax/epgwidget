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
  localizedStrings.Done = "Klart";
  localizedStrings["Downloading channels..."] = "Laddar ner kanaler...";
  localizedStrings.list = "lista";
  localizedStrings.Found = "Hittade";
  localizedStrings.channels = "kanaler";
  localizedStrings["Jippie, you can use Growl together with the EPG widget :-)"] = "Jippie, du kan använda Growl tillsammans med EPG-widgeten :-)";
  localizedStrings["EPG has NOT been installed before!"] = "EPG har INTE varit installerad förut!";
  localizedStrings["EPG has been installed before."] = "EPG har varit installerad förut.";
  localizedStrings["Help & support..."] = "Hjälp & support...";
  localizedStrings["Complaints..."] = "Klagomål...";
  // Private methods
  
  
  // Public methods
  return {
    init: function()
    {
      if(!that)
      {
        that = this;
      }
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
