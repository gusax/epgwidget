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

EPG.skin = function(debug, growl, settings)
{
  // Private Variables
  var that,
  currentSkin,
  skinElement;
  
  // Private methods
  
  
  // Public methods
  return {
    init: function()
    {
      if(!that)
      {
        that = this;
      }
      skinElement = document.getElementById("skin");
      currentSkin = settings.getPreference("currentSkin");
      if(!currentSkin)
      {
        currentSkin = "orangehc";
      }
      that.setSkin(currentSkin);
    },
    
    setSkin: function (skinFolder) 
    {
      try
      {
        if(skinFolder)
        {
          currentSkin = skinFolder;
          skinElement.setAttribute("href","skins/" + currentSkin + "/skin.css");
          debug.alert("setSkin: Changed skin to \"" + currentSkin + "\"");
        }
      }
      catch (error)
      {
        debug.alert("Error in skin.setSkin: " + error);
      }
    },
    
    getCurrentSkin: function ()
    {
      try
      {
        return currentSkin;
      }
      catch (error)
      {
        debug.alert("Error in skin.getCurrentSkin: " + error);
      }
    }
  };
}(EPG.debug, EPG.growl, EPG.settings);
EPG.skin.init();
