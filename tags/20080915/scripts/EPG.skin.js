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
/**
  * @name EPG.skin
  * @static
  * @type object
  * @description Handles skins.
  * @param {object} sebug EPG.debug.
  * @param {object} growl EPG.growl.
  * @param {object} settings EPG.settings.
  */
EPG.skin = function(debug, growl, settings, File)
{
  // Private Variables
  var that,
  currentSkin = {},
  skinElement,
  defaultSkin = "orangehc",
  backSkin = "back",
  skinList;
  
  // Private methods
  
  
  // Public methods
  return {
    init: function()
    {
      var skin;
      if(!that)
      {
        that = this;
      }
      skinElement = document.getElementById("skin");
      skinList = [];
      
      skin = skinList[skinList.length] = {};
      skin.id = "orangehc";
      skin.title = "Orange HC";
      skin.author = "Mathias Andersson";
      skin.bgOpacity = "0.8";
      
      skin = skinList[skinList.length] = {};
      skin.id = "plastic";
      skin.title = "Plastic";
      skin.author = "Mathias Andersson";
      skin.bgOpacity = "1";
      
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
          debug.inform("skin.saveSkinForList " + channelListID + " skin "+ skin);
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
            skin = defaultSkin;
          }
          debug.inform("skin.getSkinForList returning " + skin);
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
    },
    
    /**
     * @memberOf EPG.skin
     * @function getAllSkins
     * @description Returns all available skins.
     */
    getAllSkins: function () 
    {
      try
      {
        return skinList;
      }
      catch (error)
      {
        Debug.alert("Error in EPG.skin.getAllSkins: " + error);
      }
    }
  };
}(EPG.debug, EPG.growl, EPG.settings, EPG.file);
EPG.skin.init();
EPG.PreLoader.resume();