/*jslint adsafe:false, 
 bitwise: true, 
 browser:true, 
 cap:false, 
 debug:false,
 eqeqeq: true,
 evil: false,
 forin: false,
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

EPG.settings = function(Debug, growl, file)
{
  // Private Variables
  var that,
  currentUser = {},
  callbacks = {},
  hasBeenInstalledBefore,
  cachedPreferences = {},
  cachedPrograms = {},
  allChannels = {},
  channelLists = [],
  oneDay = 24 * 60 * 60 * 1000,
  timers = [],
  paths = {},
  defaultSkin = "orangehc",
  currentSize = {}; 
  
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
          callback = callbackArray.shift();
          if(callback)
          {
            callback = callback[callbackMethod];
            if(callback)
            {
              callback(callbackContents);
            }
          }
        }
      }
    }
    catch (error)
    {
      Debug.alert("Error in settings.alertCallbackMethods: " + error);
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
      Debug.alert("Error in settings.updateAllChannelsCached: " + error);
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
        allChannels.channels = {};
        
        
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
          //Debug.alert("Storing allChannels.channels[" + index + "]");
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
      Debug.alert("Error in settings.updateAllChannels: " + error);
    }
  }
  
  function resize (fake) 
  {
    var width,
    height,
    body;
    try
    {
      if(window.widget && typeof(currentSize.width) !== "undefined")
      {
        width = Math.ceil(currentSize.width * currentSize.scale);
        height = Math.ceil(currentSize.height * currentSize.scale);
        if(!fake && height > screen.height)
        {
          Debug.alert("settings.resize: The widget is to tall (height = " + height + " px) , downsizing...");
          do
          {
            currentSize.scale -= 0.1;
            width = Math.ceil(currentSize.width * currentSize.scale);
            height = Math.ceil(currentSize.height * currentSize.scale);
          } while (height >= screen.height && currentSize.scale > 0.3) ;
          
          body = document.getElementsByTagName("body")[0];
          body.style.fontSize = body.fontSize * currentSize.scale + "px";
        
        }
        window.resizeTo(width, height);
        Debug.alert("settings.resize: Resized to width " + width + ", height " + height);
      }
    }
    catch (error)
    {
      Debug.alert("Error in settings.resize: " + error);
    }
  }
  
  /**
    * @scope settings
    * @function channelListExported
    * @description Notified when widget.system has written the channel list to disk.
    * @private
    * @param {object} systemResponse Response from widget.system.
    */
  function channelListExported (systemResponse) 
  {
    try
    {
      if(systemResponse)
      {
        if(systemResponse.errorString)
        {
          Debug.alert("settings.channelListExported failed with message " + systemResponse.errorString);
        }
        else
        {
          Debug.alert("settings.channelListExported success!");
        }
      }
      else
      {
        Debug.alert("settings.channelListExported got no response!");
      }
      
    }
    catch (error)
    {
      Debug.alert("Error in settings.channelListExported: " + error + " (systemResponse = " + systemResponse + ")");
    }
  }
  
  /**
    * @scope settings
    * @function exportChannelList
    * @description Exports the channel list to a file. This file is then opened by the grabber and the correct channels are downloaded.
    * @private
    */
  function exportChannelList () 
  {
    var channelid,
    listid,
    list,
    foundChannels = [],
    string;
    try
    {
      for (listid in channelLists)
      {
        if(channelLists.hasOwnProperty(listid))
        {
          list = channelLists[listid].hashed;
          for (channelid in list)
          {
            if(list.hasOwnProperty(channelid))
            {
              foundChannels[channelid] = true;
            }
          }
        }
      }
      for (channelid in foundChannels)
      {
        if(foundChannels.hasOwnProperty(channelid))
        {
          if(!string)
          {
            string = channelid + ";";
          }
          else
          {
            string += channelid + ";"; // php seems to need a ; after the last item
          }
        }
      }
      
      if(window.widget && window.widget.system)
      {
        Debug.alert("settings.exportChannelList exporting...");
        widget.system("/bin/echo '" + string + "' > " + file.getHomePath() + "Library/Xmltv/channels/epg.users.channels.txt", channelListExported);
      }
    }
    catch (error)
    {
      Debug.alert("Error in settings.exportChannelList: " + error);
    }
  }
  
  /**
    * @scope settings
    * @function grabberInstalled
    * @description Run by widget.system after the grabber has been installed.
    * @private
    * @param {object} systemResponse Response from widget.system.
    */
  function grabberInstalled (systemResponse) 
  {
    try
    {
      if(systemResponse)
      {
        if(systemResponse.errorString)
        {
          Debug.alert("settings.grabberInstalled: Error when trying to install grabber! Message was " + systemResponse.errorString);
        }
        else
        {
          Debug.alert("settings.grabberInstalled success!");
        }
      }
      else
      {
        Debug.alert("settings.grabberInstalled got no response!");
      }
    }
    catch (error)
    {
      Debug.alert("Error in settings.grabberInstalled: " + error + " (systemResponse = " + systemResponse + ")");
    }
  }
  
  // Public methods
  return {
    init: function()
    {
      if(!that)
      {
        that = this;
      }
      paths.channelsFolder = "Library/Xmltv/channels/";
      paths.scheduleFolder = "Library/Xmltv/schedules/";
      paths.allChannels = paths.channelsFolder + "tv.jsontv.se.swedb.channels.js";
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
        Debug.alert("Error in settings.isFirstInstall: " + error);
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
            Debug.alert("trying to save key " + key + " = value " + value);
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
        Debug.alert("Error in settings.save: " + error);
      }
    },
    
    getPreference: function(key)
    {
      try
      {
        if(!cachedPreferences[key] && typeof(key) !== "undefined")
        {
          if(window.widget)
          {
            cachedPreferences[key] = window.widget.preferenceForKey(key);
          }
        }
        
        Debug.alert("settings.getPreference(" + key + ") returning " + cachedPreferences[key]);
        return cachedPreferences[key];
      }
      catch (error)
      {
        Debug.alert("Error in settings.getPreference: " + error + "\n(key = " + key + ")");
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
            delete cachedPreferences[key];
          }
        }
      }
      catch (error)
      {
        Debug.alert("Error in settings.deletePreference: " + error);
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
          // re-import channels.js once per day (just assume that the file is there, the download itself is taken care of by the grabber)
          Debug.alert("settings.getAllChannels: Opening channels.js since it was more than one day since it was last opened.");
          file.open(paths.allChannels, updateAllChannels, updateAllChannelsCached);
        }
        else
        {
          Debug.alert("settings.getAllChannels: all channels were cached, returning cached version.");
          timers.push(setTimeout(function(){updateAllChannelsCached();},1));
        }
      }
      catch (error)
      {
        Debug.alert("Error in settings.getAllChannels: " + error);
      }
    },
    /**
      * @scope settings
      * @function getChannel
      * @description Finds and returns the channel with the specified ID.
      * @param {string} channelID ID of the channel that's wanted.
      * @return {object} The requested channel.
      */
    getChannel: function (channelID) 
    {
      var channel;
      try
      {
        if(typeof(channelID) !== "undefined" && allChannels && allChannels.channels)
        {
          return allChannels.channels[channelID];
        } 
        else
        {
          return;
        }
      }
      catch (error)
      {
        Debug.alert("Error in settings.getChannel: " + error);
      }
    },
    
    getChannelList: function (listIndex) 
    {
      var tempList,
      tempListOrdered,
      tempListHashed;
      try
      {
        
        if(typeof(listIndex) !== "undefined")
        {
          tempList = channelLists[listIndex];
          if(!tempList)
          {
            tempListHashed = {};
            tempListOrdered = that.getPreference("channelList" + listIndex);
            if(tempListOrdered)
            {
              tempListOrdered = tempListOrdered.split(";");
              
              for (index in tempListOrdered)
              {
                if(tempListOrdered.hasOwnProperty(index))
                {
                  tempListHashed[tempListOrdered[index]] = index;
                }
              }
              tempList = {};
              tempList.ordered = tempListOrdered;
              tempList.hashed = tempListHashed;
              channelLists[listIndex] = tempList;
            }
            
          }
          Debug.alert("getChannelList returning channelLists[" + listIndex + "] = " + channelLists[listIndex]);
          return channelLists[listIndex];
        }
        else
        {
          Debug.alert("settings.getChannelList got no ID! Returning nothing!");
          return;
        }    
      }
      catch (error)
      {
        Debug.alert("Error in settings.getChannelList: " + error);
      }
    },
    
    saveChannelList: function (channelListID) 
    {
      var activeList;
      try
      {
        if(typeof(channelListID) !== "undefined")
        {
          activeList = channelListID;
        
          if(channelLists[activeList])
          {
            if(channelLists[activeList].ordered.length === 0)
            {
              that.deletePreference("channelList" + activeList);
            }
            else
            {
              that.savePreference("channelList" + activeList, channelLists[activeList].ordered.join(";"));
            }
            exportChannelList();
          }
        }
      }
      catch (error)
      {
        Debug.alert("Error in settings.saveChannelList: " + error);
      }
    },
    
    addChannelToList: function (channelID, channelList) 
    {
      var tempList;
      try
      {
        Debug.alert("addChannelToList(" + channelID + ", " + channelList + ")");
        
        if(channelID && channelList >= 0)
        {
          Debug.alert("both channelID and channelList existed");
          tempList = channelLists[channelList];
          if(!tempList)
          {
            Debug.alert("creating channelLists[" + channelList + "]");
            tempList = {};
            tempList.ordered = [];
            tempList.hashed = {};
            channelLists[channelList] = tempList;
            tempList = channelLists[channelList]; // just to be sure...
          }
          
          // Add channel to list if it's not there already
          if(!tempList.hashed[channelID])
          {
            Debug.alert("Adding " + channelID + " to list " + channelList);
            tempList.hashed[channelID] = ""+tempList.ordered.length;
            tempList.ordered.push(channelID);
            that.saveChannelList(channelList);
            return true;
          }
          else
          {
            that.removeChannelFromList(channelID, channelList);
            return false;
          }
        }
        else
        {
          return false;
        }
      }
      catch (error)
      {
        Debug.alert("Error in settings.addChannelToList: " + error);
      }
    },
    
    removeChannelFromList: function (channelID, listID) 
    {
      var tempList;
      try
      {
        if(channelID && listID >= 0)
        {
          
          tempList = channelLists[listID];
          if(tempList && tempList.hashed[channelID])
          {
            Debug.alert("Removing " + channelID + " from list " + listID);
            tempList.ordered.splice(tempList.hashed[channelID], 1);
            delete tempList.hashed[channelID];
            that.saveChannelList(listID);
          }
        }
      }
      catch (error)
      {
        Debug.alert("Error in settings.removeChannelFromList: " + error);
      }
    },
    
    resizeText: function (amount, skipResize) 
    {
      var body;
      try
      {
        body = document.getElementsByTagName("body")[0];
        
        
        if(typeof(body.fontSize) === "undefined")
        {
          body.fontSize = 10;
        } 
        if(typeof(currentSize.width) == "undefined")
        {
          Debug.alert("settings.resizeText could not resize since currentSize.width and height are undefined!");
        }
        else
        {
          if(amount === 0)
          {
            currentSize.scale = 1;
          }
          else if(amount > 0 && currentSize.height * (currentSize.scale + 0.1) < screen.height)
          {
            currentSize.scale += 0.1;
          }
          else if(amount < 0 && currentSize.scale > 1)
          {
            currentSize.scale -= 0.1;
          }
          
          body.style.fontSize = body.fontSize * currentSize.scale + "px";
          Debug.alert("currentSize.scale = " + currentSize.scale);
          if(!skipResize)
          {
            resize();
          }
        }
      }
      catch (error)
      {
        Debug.alert("Error in settings.resize: " + error);
      }
    },
    
    resizeTo: function (width, height, fake) 
    {
      try
      {
        currentSize.width = width;
        currentSize.height = height;
        if(typeof(currentSize.scale) === "undefined")
        {
          currentSize.scale = 1;
        }
        resize(fake);
        
      }
      catch (error)
      {
        Debug.alert("Error in settings.resizeTo: " + error);
      }
    },
    
    /**
      * @scope settings
      * @function installGrabber
      * @description Installs the grabber service as a cronjob.
      */
    installGrabber: function () 
    {
      try
      {
        if(window.widget && window.widget.system)
        {
          window.widget.system("cd helpers && /usr/bin/php installgrabber.php", grabberInstalled);
        }
      }
      catch (error)
      {
        Debug.alert("Error in settings.installGrabber: " + error);
      }
    },
    
    /**
      * @scope settings
      * @function getProgramsForChannel
      * @description Gets programs for the specified channel.
      * @private
      * @param {string} channelID ID for the specified channel.
      * @param {function} onSuccess Function to call with the requested programs as the first parameter.
      * @param {function} onFailure Function to call in case something goes wrong.
      * @param {number} [numPrograms] Number of programs. Default is 3 (now, next, later).
      * @param {object} [when] Date object for getting program(s) at a specified date and time. Default is now (i e new Date()).
      */
    getProgramsForChannel: function (channelID, onSuccess, onFailure, numPrograms, when) 
    {
      var ymd,
      programsForThisChannelAreCached,
      programsForThisDateAreCached,
      foundPrograms;
      try
      {
        if(typeof(numPrograms) === "undefined" || numPrograms < 1)
        {
          numPrograms = 3; // now next later
        }
        if(!when || (when && !when.getFullYear))
        {
          when = new Date(); // now
        }
        
        ymd = when.getFullYear() + "" + when.getMonth() + "" + when.getDate();
        programsForThisChannelAreCached = cachedPrograms[channelID];
        if(programsForThisChannelAreCached)
        {
          programsForThisDateAreCached = cachedProgramForThisChannel[ymd];
          if(programsForThisDateAreCached)
          {
            foundPrograms = findPrograms(programsForThisDateAreCached, numPrograms, when);
            if(foundPrograms.length === numPrograms)
            {
              // open up tomorrows 
            }
            setTimeout(function(){onSuccess(programsForThisDateAreCached)}, 1);
          }
          else
          {
            
          }
        }
        else
        {
          cachedPrograms[channelID] = {};
        }
       
      }
      catch (error)
      {
        Debug.alert("Error in settings.getProgramsForChannel: " + error + " (channelID = " + channelID + ")");
      }
    }
    
  };
}(EPG.debug, EPG.growl, EPG.file);
EPG.settings.init();