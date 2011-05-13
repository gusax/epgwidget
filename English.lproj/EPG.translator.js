/*global EPG*/

if (!EPG)
{
  var EPG = {};
}

EPG.translator = function(debug)
{
  // Private Variables
  var that,
  localizedStrings = {};
  
  localizedStrings.Default = "English";
  // Private methods
  
  
  // Public methods
  return {
    init: function()
    {
      if (!that)
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
        if (string && localizedStrings[string])
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
