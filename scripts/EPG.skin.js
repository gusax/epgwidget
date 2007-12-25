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

if (EPG.debug)
{
  EPG.debug.inform("EPG.skin.js loaded");
}

EPG.skin = function(debug, growl, settings)
{
  // Private Variables
  var that,
  currentSkin = {},
  skinElement,
  defaultSkin = "orangehc",
  backSkin = "back";
  
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
      delete that.init;
    },
    
    changeToSkinFromList: function (listID) 
    {
      var skin;
      try
      {
        if(typeof(listID) !== "undefined")
        {
          if(listID === "back")
          {
            skin = backSkin;
          }
          else
          {
            skin = that.getSkinForList(listID);
          }
          skinElement.setAttribute("href","skins/" + skin + "/skin.css");
          debug.inform("skin.changeToSkinFromList: Changed skin for list " + listID + " to \"" + skin + "\"");
        }
      }
      catch (error)
      {
        debug.alert("Error in skin.setSkin: " + error);
      }
    },
    
    saveSkinForList: function (channelListID, skin) 
    {
      try
      {
        if(typeof(channelListID) !== "undefined" && skin && skin !== backSkin)
        {
          settings.savePreference(channelListID + "skin", skin);
        }
      }
      catch (error)
      {
        debug.alert("Error in skin.saveSkinForList: " + error);
      }
    },
    
    getSkinForList: function (channelListID) 
    {
      var skin;
      try
      {
        if(typeof(channelListID) !== "undefined")
        {
          if(channelListID === "back")
          {
            skin = backSkin;
          }
          else
          {
            skin = settings.getPreference(channelListID + "skin");
          }
          if(typeof(skin) === "undefined")
          {
            that.saveSkinForList(channelListID, defaultSkin);
            skin = settings.getPreference(channelListID + "skin");
          }
          return skin;
        }
        else
        {
          debug.warn("skin.getSkinForList: channelListID was undefined!\nReturning null!");
          return null;
        }
      }
      catch (error)
      {
        debug.alert("Error in skin.getSkinForList: " + error);
      }
    }
  };
}(EPG.debug, EPG.growl, EPG.settings);
EPG.skin.init();
