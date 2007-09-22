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

/*extern EPG,
 widget*/

if(!EPG)
{
  var EPG = {};
}

if (EPG.debug)
{
  EPG.debug.alert("EPG.settings.js loaded");
}

EPG.settings = function(debug, growl, file)
{
  // Private Variables
  var that,
  currentUser = {},
  callbacks = {},
  hasBeenInstalledBefore,
  cachedPreferences = {},
  allChannels = {},
  channelLists = [],
  oneDay = 24 * 60 * 60 * 1000,
  timers = [],
  paths = {}; 
  
  // Private methods
  function alertCallbackMethods(callbackArrayName, callbackMethod, callbackContents) 
  {
    var index,
    callbackArray,
    callback;
    try
    {
      callbackArray = callbacks[callbackArrayName];
      if(callbackArray && callbackMethod)
      {
        for(index in callbackArray)
        {
          callback = (callbackArray[index]);
          callback = callback[callbackMethod];
          if(callback)
          {
            callback(callbackContents);
          }
        }
      }
    }
    catch (error)
    {
      debug.alert("Error in settings.alertCallbackMethods: " + error);
    }
  }
  
  function updateAllChannelsCached() 
  {
    try
    {
      // File did not exist!
      // Try downloading it again?
      if(allChannels.channels)
      {
        // If we already have channels, return them.
        alertCallbackMethods("allChannels","onSuccess", allChannels.channels);
      }
      else
      {
        // We have no channels :-( Return as a failure
        alertCallbackMethods("allChannels", "onFailure", null);
      }
    }
    catch (error)
    {
      debug.alert("Error in settings.updateAllChannelsCached: " + error);
    }
  }
  
  function updateAllChannels(jsonObject) 
  {
    var index,
    reversedIndex,
    cachedChannels,
    orderedChannelIDs;
    try
    {
      if(jsonObject && jsonObject.channels)
      {
        cachedChannels = jsonObject.channels;
        orderedChannelIDs = [];
        if(!allChannels.channels)
        {
          allChannels.channels = {};
        }
        
        for(index in cachedChannels)
        {
          reversedIndex = index.split(".").reverse().join(".");
          orderedChannelIDs.push(reversedIndex);
        }
        orderedChannelIDs.sort();
        for(reversedIndex in orderedChannelIDs)
        {
          index = orderedChannelIDs[reversedIndex];
          index = index.split(".").reverse().join(".");
          //debug.alert("Storing allChannels.channels[" + index + "]");
          allChannels.channels[index] = cachedChannels[index];
        }
        allChannels.channels.orderedChannelIDs = orderedChannelIDs;
        allChannels.channels.length = orderedChannelIDs.length;
        //allChannels.channels = cachedChannels;
        allChannels.lastUpdate = new Date();
        alertCallbackMethods("allChannels","onSuccess", allChannels.channels);
      }
      else
      {
        updateAllChannelsCached();
      }
    }
    catch (error)
    {
      debug.alert("Error in settings.updateAllChannels: " + error);
    }
  }
  
  // Public methods
  return {
    init: function()
    {
      if(!that)
      {
        that = this;
        paths.allChannels = "/Users/gusax840/Library/Xmltv/channels/tv.jsontv.se.swedb.channels.js";
      }
    },
    
    isFirstInstall: function() 
    {
      try
      {
        if(window.widget)
        {
          if(!window.widget.preferenceForKey("hasBeenInstalledBefore"))
          {
            hasBeenInstalledBefore = false;
          }
          else
          {
            hasBeenInstalledBefore = true;
          }
        }
        else
        {
          hasBeenInstalledBefore = false;
        }
        
        return !hasBeenInstalledBefore;
      }
      catch (error)
      {
        debug.alert("Error in settings.isFirstInstall: " + error);
        return false;
      }
    },
    
    savePreference: function(key, value) 
    {
      try
      {
        if(value)
        {
          key = "" + key;
          value = "" + value;
          if(window.widget)
          {
            debug.alert("trying to save key " + key + " = value " + value);
            window.widget.setPreferenceForKey(value, key);
          }
          cachedPreferences[key] = value;
          if(!hasBeenInstalledBefore)
          {
            hasBeenInstalledBefore = true;
            if(window.widget)
            {
              window.widget.setPreferenceForKey("true", "hasBeenInstalledBefore");
            }
          }
        }
      }
      catch (error)
      {
        debug.alert("Error in settings.save: " + error);
      }
    },
    
    getPreference: function(key)
    {
      try
      {
        key = "" + key;
        if(!cachedPreferences[key] && key)
        {
          if(window.widget)
          {
            cachedPreferences[key] = window.widget.preferenceForKey(key);
          }
        }
        return cachedPreferences[key];
      }
      catch (error)
      {
        debug.alert("Error in settings.getPreference: " + error);
      }
    },
    
    deletePreference: function(key) 
    {
      try
      {
        if(key)
        {
          key = "" + key;
          if(window.widget)
          {
            window.widget.setPreferenceForKey(null, key);
          }
          if(cachedPreferences[key])
          {
            cachedPreferences[key] = null;
          }
        }
      }
      catch (error)
      {
        debug.alert("Error in settings.deletePreference: " + error);
      }
    },
    
    getAllChannels: function(onSuccess, onFailure) 
    {
      var now = new Date(),
      callback = {};
      try
      {
        callback.onSuccess = onSuccess;
        callback.onFailure = onFailure;
        if(!callbacks.allChannels)
        {
          callbacks.allChannels = [];
        }
        callbacks.allChannels.push(callback);
        
        if(!allChannels.lastUpdate || (now - allChannels.lastUpdate) >= oneDay)
        {
          // update channellist once per day
          file.open(paths.allChannels, updateAllChannels, updateAllChannelsCached);
        }
        else
        {
          timers.push(setTimeout(function(){updateAllChannelsCached();},1));
        }
      }
      catch (error)
      {
        debug.alert("Error in settings.getAllChannels: " + error);
      }
    },
    
    getChannelList: function (listIndex) 
    {
      try
      {
        if(listIndex)
        {
          return channelLists[listIndex];  
        }
        else
        {
          return null;
        }    
      }
      catch (error)
      {
        debug.alert("Error in settings.getChannelList: " + error);
      }
    }
    
  };
}(EPG.debug, EPG.growl, EPG.file);
EPG.settings.init();