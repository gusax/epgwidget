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

if (EPG.debug)
{
  EPG.debug.alert("EPG.front.js loaded");
}

EPG.front = function()
{
  // Private Variables
  var that,
  internalState = "loading",
  visible = false;
  
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
    
    show: function () 
    {
      try
      {
        visible = true;
      }
      catch (error)
      {
        debug.alert("Error in front.show: " + error);
      }
    },
    
    hide: function () 
    {
      try
      {
        visible = false;
      }
      catch (error)
      {
        debug.alert("Error in front.hide: " + error);
      }
    }
  };
}();
EPG.front.init();
