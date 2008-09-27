/*jslint adsafe:false, 
 bitwise: true, 
 browser:true, 
 cap:false, 
 debug:false,
 eqeqeq: true,
 evil: true,
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

if (EPG.debug)
{
  EPG.debug.inform("EPG.settings.js loaded");
}
/**
  * @name EPG.settings
  * @static
  * @type object
  * @description Settings
  * @param {object} Debug EPG.debug.
  * @param {object} growl EPG.growl.
  * @param {object} file EPG.file. 
  */
EPG.settings = function(Debug, growl, file)
{
  // Private Variables
  var that,
  callbacks = {},
  hasBeenInstalledBefore,
  cachedPreferences = {},
  cachedPrograms = {},
  allChannels = {},
  channelLists = [],
  oneDay = 24 * 60 * 60 * 1000,
  timers = [],
  paths = {},
  defaultPathToServer = "http://xmltv.tvsajten.com/json",
  currentSize = {},
  theEmptyProgram = 
  {
    isTheEmptyProgram : true
  },
  currentChannelListIndex = 0,
  transparencyValue = 0.95,
  lastVersionCheck = -1,
  upgradeInfoUrl = "http://epgwidget.googlecode.com/svn/trunk/updateInfo.js";
  
  // Private methods
  function alertCallbackMethods(callbackArrayName, callbackMethod, callbackContents) 
  {
    try
    {
      var index,
      callbackArray,
      callback;
      
      callbackArray = callbacks[callbackArrayName];
      if (callbackArray && callbackMethod)
      {
        for (index in callbackArray)
        {
          if (callbackArray.hasOwnProperty(index))
          {
            callback = callbackArray.shift();
            if (callback)
            {
              callback = callback[callbackMethod];
              if (callback)
              {
                callback(callbackContents);
              }
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
      if (allChannels.channels)
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
    try
    {
      var index,
      reversedIndex,
      cachedChannels,
      orderedChannelIDs;
      
      if (jsonObject && jsonObject.channels)
      {
        cachedChannels = jsonObject.channels;
        orderedChannelIDs = [];
        allChannels.channels = {};
        
        
        for (index in cachedChannels)
        {
          if (cachedChannels.hasOwnProperty(index))
          {
            reversedIndex = index.split(".").reverse().join(".");
            orderedChannelIDs.push(reversedIndex);
          }
        }
        orderedChannelIDs.sort();
        for (reversedIndex in orderedChannelIDs)
        {
          if (orderedChannelIDs.hasOwnProperty(reversedIndex))
          {
            index = orderedChannelIDs[reversedIndex];
            index = index.split(".").reverse().join(".");
            //Debug.alert("Storing allChannels.channels[" + index + "]");
            allChannels.channels[index] = cachedChannels[index];
          }
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
    try
    {
      var width,
      height,
      body;
    
      if (window.widget && typeof currentSize.width !== "undefined")
      {
        
        width = Math.ceil(currentSize.width * currentSize.scale);
        height = Math.ceil(currentSize.height * currentSize.scale);
        if (!fake && height > screen.height)
        {
          Debug.warn("settings.resize: The widget is to tall (height of widget = " + height + " px, but screen height is only " + screen.height + " px)! Downsizing...");
          do
          {
            currentSize.scale -= 0.1;
            width = Math.ceil(currentSize.width * currentSize.scale);
            height = Math.ceil(currentSize.height * currentSize.scale);
          } while (height >= screen.height && currentSize.scale > 0.3) ;
          
          body = document.getElementsByTagName("body")[0];
          if (typeof body.fontSize !== "number")
          {
            body.fontSize = 10;
          }
          body.style.fontSize = body.fontSize * currentSize.scale + "px";
        }
        window.resizeTo(width, height);
        Debug.inform("settings.resize: Resized to width " + width + ", height " + height);
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
      file.hideLoadingImage();
      if (systemResponse)
      {
        if (systemResponse.errorString)
        {
          Debug.alert("settings.channelListExported failed with message " + systemResponse.errorString);
        }
        else
        {
          Debug.inform("settings.channelListExported success!");
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
    try
    {
      var channelid,
      listid,
      list,
      foundChannels = [],
      string;
    
      for (listid in channelLists)
      {
        if (channelLists.hasOwnProperty(listid))
        {
          list = channelLists[listid].hashed;
          for (channelid in list)
          {
            if (list.hasOwnProperty(channelid))
            {
              foundChannels[channelid] = true;
            }
          }
        }
      }
      for (channelid in foundChannels)
      {
        if (foundChannels.hasOwnProperty(channelid))
        {
          if (!string)
          {
            string = channelid + ";";
          }
          else
          {
            string += channelid + ";"; // php seems to need a ; after the last item
          }
        }
      }
      
      if (window.widget && window.widget.system)
      {
        file.showLoadingImage();
        Debug.inform("settings.exportChannelList exporting...");
        widget.system("/bin/echo '" + string + "' > " + file.getHomePath() + "Library/Xmltv/channels/epg.users.channels.txt", channelListExported);
      }
      else
      {
        Debug.inform("settings.exportChannelList: would have run /bin/echo '" + string + "'");
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
      file.hideLoadingImage();
      if (systemResponse)
      {
        if (systemResponse.errorString)
        {
          Debug.alert("settings.grabberInstalled: Error when trying to install grabber! Message was " + systemResponse.errorString);
        }
        else
        {
          that.savePreference("grabberVersion", EPG.grabberVersion);
          Debug.inform("settings.grabberInstalled success!");
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
  
  /**
    * @scope settings
    * @function grabberUpdated
    * @description Run by widget.system after the grabber has been updated.
    * @private
    * @param {object} systemResponse Response from widget.system.
    */
  function grabberUpdated (systemResponse) 
  {
    try
    {
      file.hideLoadingImage();
      if (systemResponse)
      {
        if (systemResponse.errorString)
        {
          Debug.alert("settings.grabberUpdated: Error when trying to update grabber! Message was " + systemResponse.errorString);
        }
        else
        {
          that.savePreference("grabberVersion", EPG.grabberVersion);
          Debug.inform("settings.grabberUpdated success!");
          that.runGrabber(true);
        }
      }
      else
      {
        Debug.alert("settings.grabberUpdated got no response!");
      }
    }
    catch (error)
    {
      Debug.alert("Error in settings.grabberUpdated: " + error + " (systemResponse = " + systemResponse + ")");
    }
  }
  
  
  /**
    * @scope settings
    * @function ranGrabber
    * @description Run by widget.system after the grabber has been updated.
    * @private
    * @param {object} systemResponse Response from widget.system.
    */
  function ranGrabber (systemResponse, onSuccess, onFailure) 
  {
    try
    {
      file.hideLoadingImage();
      if (systemResponse)
      {
        if (systemResponse.errorString)
        {
          Debug.alert("settings.ranGrabber: Error when trying to run grabber! Message was " + systemResponse.errorString);
        }
        else
        {
          Debug.inform("settings.ranGrabber success!");
        }
      }
      else
      {
        Debug.alert("settings.ranGrabber got no response!");
      }
    }
    catch (error)
    {
      Debug.alert("Error in settings.ranGrabber: " + error + " (systemResponse = " + systemResponse + ")");
    }
  }
  
  /**
   * @memberOf EPG.settings
   * @name getFileDateYYYYMMDD
   * @function
   * @description Takes a Date object and returns a string with the date formatted as YYYY-MM-DD (used in filenames).
   * @private
   * @param {object} when Date object used to construct the YYYY-MM-DD string.
   * @return {string} The date formatted as YYYY-MM-DD
   */
  function getFileDateYYYYMMDD (when)
  {
    try
    {
      var year,
      month,
      day;
    
      if (!when)
      {
        when = new Date(); // now
      }
      else
      {
        // Debug.inform("getFileDateYYYYMMDD when = " + when);
      }
      year = when.getUTCFullYear();
      month = 1 + when.getUTCMonth(); // months are between 0 and 11 so we need to add one to whatever getMonth returns
      day = when.getUTCDate();
      if (month < 10)
      {
        month = "0" + month;
      }
      if (day < 10)
      {
        day = "0" + day;
      }
      return year + "-" + month + "-" + day;
    }
    catch (error)
    {
      Debug.alert("Error in settings.getFileDateYYYYMMDD: " + error + " (when = " + when + ")");
    }
  }
  
  /**
   * @memberOf EPG.settings
   * @name findPrograms
   * @function
   * @description Finds the specified number of programs among the cached programs.
   * @private
   * @param {string} channelID ID of the channel that we are interested in.
   * @param {number} numPrograms The number of programs wanted.
   * @param {object} when Date object that is the start of the search. 
   * @param {string} [ymd] Forces findPrograms to look only in the schedule pointed to by ymd.
   * @return {array} An array of programs, the length of numPrograms.
   */
  function findPrograms (channelID, numPrograms, when, ymd, alreadyFoundPrograms, fileDate)
  {
    try
    {
      var foundPrograms = [],
      programs,
      index = -1,
      copyIndex = 0,
      programStart,
      programStop,
      numFound = 0,
      programsLength = 0,
      whenTimestamp,
      noProgram = false;
      
      if (!when)
      {
        when = new Date();
      }
      whenTimestamp = when.getTime();
      if (typeof(ymd) === "undefined")
      {
        ymd = getFileDateYYYYMMDD(fileDate);
      }
      if (alreadyFoundPrograms)
      {
        foundPrograms = alreadyFoundPrograms;
      }
      
      programs = cachedPrograms[channelID][ymd];
      
      if (programs && programs.length > 0)
      {
        programsLength = programs.length;
        while(numFound < numPrograms && index < programsLength - 1)
        {
          index += 1;
          programStart = programs[index].start * 1000;
          programStop = programs[index].stop * 1000;
          if (typeof(programStart) === "number" && typeof(programStop) === "number")
          {
            if (programStart <= whenTimestamp && whenTimestamp < programStop)
            {
              //Debug.alert(channelID + ": " + ymd + " Found program " + programs[index].title.sv + " started at " + (new Date(programs[index].start * 1000)));
              // This is the current program, since it has started this exact second or before, and it has not ended yet. 
              break; // Break here and start copying from this position.
            }
            else if (programStart > whenTimestamp) // This program has not started yet. If we reach it without reaching the above condition first, it must mean that all the following events are in the future. No point looking at them then.
            {
              //Debug.alert(channelID + ": " + ymd + " All programs are in the future, programStart " + programStart + " > whenTimestamp " + whenTimestamp +" :-(");
              noProgram = true;
              break;  // first program is either the empty program or a program from an earlier date.
            }
          }
        }
      }
      else
      {
        Debug.warn(channelID + " : " + ymd + " had no programs :-(");
      }
      
      if (index >= 0)
      {
        if (noProgram)
        {
          if (foundPrograms.length === 0)
          {
            copyIndex = 1;
            foundPrograms[0] = theEmptyProgram;
          }
          else
          {
            copyIndex = foundPrograms.length;
            index = 0;
          }
        }
        else if (whenTimestamp < programStop)
        {
          copyIndex = foundPrograms.length;
        }
        else
        {
          copyIndex = -1;
        }
        if (copyIndex >= 0)
        {
          while(index < programsLength && numPrograms > 0)
          {
            //Debug.inform(channelID + " : " + ymd + " copying program " + index + " to position " + copyIndex + " ( numPrograms = " + numPrograms + ")");
            foundPrograms[copyIndex] = programs[index]; // copy program from the cached list to the list we are returning
            copyIndex += 1;
            index += 1;
            numPrograms -= 1;
          }
        }
      }
      else
      {
        Debug.inform(channelID + ": " + ymd + " Did not find a program on or after " + when);
      }

      return foundPrograms;
    }
    catch (error)
    {
      Debug.alert("Error in settings.findPrograms: " + error + " (channelID = " + channelID + ", numPrograms = " + numPrograms + ", when = " + when + ", ymd = " + ymd + ", fileDate = " + fileDate + ")");
    }
  }
  
  /**
   * @memberOf EPG.settings
   * @name programsDownloadSucceeded
   * @function
   * @description Run if the wanted schedulefile could be opened.
   * @private
   * @param {function} onSuccess Callback function that should be notified when successful.
   * @param {object} schedule Jsontv-object containing the schedule as an array.
   * @param {string} channelID ID of the channel that the schedule belongs to.
   * @param {string} ymd The date of the schedule in YYYY-MM-DD format.
   * @param {number} numPrograms The number of programs wanted.
   * @param {object} fileDate Date object describing the start of the search. 
   */
  function programsDownloadSucceeded (onSuccess, schedule, channelID, ymd, numPrograms, fileDate, alreadyFoundPrograms, onFailure, when)
  {
    try
    {
      var foundPrograms;
      // TODO: perhaps we should also be able to find programs between two dates, and not just find a number of programs.
      if (schedule && schedule.programme && schedule.programme.length >= 0)
      {
        cachedPrograms[channelID][ymd] = {};
        cachedPrograms[channelID][ymd] = schedule.programme;
        
        if (numPrograms >= 0)
        {
          that.getProgramsForChannel(channelID, onSuccess, onFailure, numPrograms, when, alreadyFoundPrograms, fileDate);
        }
        else
        {
          onSuccess(cachedPrograms[channelID][ymd]);
        }
      }
      else if (onFailure)
      {
        Debug.alert("settings.programsDownloadSucceeded failed on channel with ID " + channelID);
        onFailure();
      }
    }
    catch (error)
    {
      Debug.alert("Error in settings.programsDownloadSucceeded: " + error);
    }
  }
  
  /**
   * @memberOf EPG.settings
   * @name downloadSchedules
   * @function
   * @description Downloads schedules and icon for a channel that has just been added. Schedules for yesterday, today and tomorrow will be downloaded.
   * @private
   * @param {string} channelID ID of channel that has just been added.
   */
  function downloadSchedules (channelID)
  {
    try
    {
      var channel, yesterday, today, tomorrow, fileDate, savePath, url, now;
      
      if (channelID)
      {
        channel = that.getChannel(channelID);
        if (channel && channel.baseUrl)
        {
          now = new Date();
          yesterday = new Date(now.getTime() - 86400000);
          tomorrow = new Date(now.getTime() + 86400000);
          
          fileDate = getFileDateYYYYMMDD(yesterday);
          savePath = "Library/Xmltv/schedules/" + channelID + "_" + fileDate + ".js";
          url = channel.baseUrl + "" + channelID + "_" + fileDate + ".js.gz";
          file.downloadFile(url, savePath, function(){Debug.inform("Schedule download success!");}, function(){Debug.alert("Schedule download failure :-(");},true);
          
          fileDate = getFileDateYYYYMMDD(now);
          savePath = "Library/Xmltv/schedules/" + channelID + "_" + fileDate + ".js";
          url = channel.baseUrl + "" + channelID + "_" + fileDate + ".js.gz";
          file.downloadFile(url, savePath, function(){Debug.inform("Schedule download success!");}, function(){Debug.alert("Schedule download failure :-(");},true);
          
          fileDate = getFileDateYYYYMMDD(tomorrow);
          savePath = "Library/Xmltv/schedules/" + channelID + "_" + fileDate + ".js";
          url = channel.baseUrl + "" + channelID + "_" + fileDate + ".js.gz";
          file.downloadFile(url, savePath, function(){Debug.inform("Schedule download success!");}, function(){Debug.alert("Schedule download failure :-(");},true);
          if (channel.icon)
          {
            file.downloadFile(channel.icon, "Library/Xmltv/logos/" + channelID + ".png", function(){Debug.inform("Icon download success!");}, function(){Debug.alert("Icon download failure :-(");},true);
          }
        }
      }
    }
    catch (error)
    {
      Debug.alert("Error in EPGsettings.downloadSchedules: " + error + " (channelID = " + channelID + ")");
    }
  }
  
  /**
   * @memberOf EPG.settings
   * @name programsDownloadFailed
   * @function
   * @description Run if there was an error accessing the schedule file.
   * @private
   * @param {function} callback Callback function that should be notified of the failure.
   */
  function programsDownloadFailed (callback, contents, channelID, ymd)
  {
    try
    {
      // Perhaps the schedule has not been downloaded yet? In that case we should perhaps force an update.
      callback();
    }
    catch (error)
    {
      Debug.alert("Error in settings.programsDownloadSucceeded: " + error + " (callback = " + callback + ")");
    }
  }
  
  /**
   * @memberOf EPG.Settings
   * @name isUpdateAvailable
   * @function
   * @description Checks updateInfo for a new version.
   * @private
   * @param {string} response The contents of updateInfo.
   */
  function isUpdateAvailable(response, callback)
  {
    try
    {
      var jsonObj, now;
      try
      {
        jsonObj = eval("(" + response + ")");
        if (jsonObj && jsonObj.updateInfo)
        {
          now = new Date().getTime();
          lastVersionCheck = now + 86400000; // check again tomorrow
          if (jsonObj.updateInfo.stable && jsonObj.updateInfo.stable.version > EPG.currentVersion)
          {
            callback(jsonObj.updateInfo);
          }
        }
      }
      catch (jsonError)
      {
        // fail silently.
      }
    }
    catch (error)
    {
      Debug.alert("Error in EPG.Settings.isUpdateAvailable: " + error + " (response = " + response + ")");
    }
  }
  
  // Public methods
  return {
    init: function()
    {
      if (!that)
      {
        that = this;
      }
      paths.channelsFolder = "Library/Xmltv/channels/";
      paths.scheduleFolder = "Library/Xmltv/schedules/";
      paths.allChannels = paths.channelsFolder + "tv.jsontv.se.swedb.channels.js";
      delete that.init;
    },
    
    isFirstInstall: function() 
    {
      try
      {
        if (window.widget)
        {
          if (!window.widget.preferenceForKey("hasBeenInstalledBefore"))
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
        if (value)
        {
          key = "" + key;
          value = "" + value;
          if (window.widget)
          {
            //Debug.alert("trying to save key " + key + " = value " + value);
            window.widget.setPreferenceForKey(value, key);
          }
          cachedPreferences[key] = value;
          if (!hasBeenInstalledBefore)
          {
            hasBeenInstalledBefore = true;
            if (window.widget)
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
        if (!cachedPreferences[key] && typeof(key) !== "undefined")
        {
          if (window.widget)
          {
            cachedPreferences[key] = window.widget.preferenceForKey(key);
          }
        }
        
        //Debug.alert("settings.getPreference(" + key + ") returning " + cachedPreferences[key]);
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
        if (key)
        {
          key = "" + key;
          if (window.widget)
          {
            window.widget.setPreferenceForKey(null, key);
          }
          if (cachedPreferences[key])
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
      try
      {
        var now = new Date(),
        callback = {};
      
        callback.onSuccess = onSuccess;
        callback.onFailure = onFailure;
        if (!callbacks.allChannels)
        {
          callbacks.allChannels = [];
        }
        callbacks.allChannels.push(callback);
        
        if (!allChannels.lastUpdate || (now - allChannels.lastUpdate) >= oneDay)
        {
          // re-import channels.js once per day (just assume that the file is there, the download itself is taken care of by the grabber)
          //Debug.inform("settings.getAllChannels: Opening channels.js since it was more than one day since it was last opened.");
          file.open(paths.allChannels, updateAllChannels, updateAllChannelsCached);
        }
        else
        {
          //Debug.alert("settings.getAllChannels: all channels were cached, returning cached version.");
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
      try
      {
        var channel;
        
        if (typeof(channelID) !== "undefined" && allChannels && allChannels.channels)
        {
          return allChannels.channels[channelID];
        } 
        else
        {
          return false;
        }
      }
      catch (error)
      {
        Debug.alert("Error in settings.getChannel: " + error);
      }
    },
    
    getChannelList: function (listIndex) 
    {
      try
      {
        var tempList,
        tempListOrdered,
        tempListHashed,
        i;
        
        if (typeof(listIndex) !== "undefined")
        {
          tempList = channelLists[listIndex];
          if (!tempList)
          {
            tempListHashed = {};
            tempListOrdered = that.getPreference("channelList" + listIndex);
            Debug.inform("channelList" + listIndex + " = " + tempListOrdered);
            if (tempListOrdered)
            {
              tempListOrdered = tempListOrdered.split(";");
              
              for (i = 0; i < tempListOrdered.length; i+=1)
              {
                tempListHashed[tempListOrdered[i]] = i;
                Debug.inform(i + ":" + tempListOrdered[i]);
              }
              tempList = {};
              tempList.ordered = tempListOrdered;
              tempList.hashed = tempListHashed;
              channelLists[listIndex] = tempList;
            }
            
          }
          //Debug.alert("getChannelList returning channelLists[" + listIndex + "] = " + channelLists[listIndex]);
          return channelLists[listIndex];
        }
        else
        {
          Debug.warn("settings.getChannelList got no ID! Returning nothing!");
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
      try
      {
        var activeList;
        
        if (typeof(channelListID) !== "undefined")
        {
          activeList = channelListID;
        
          if (channelLists[activeList])
          {
            if (channelLists[activeList].ordered.length === 0)
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
      try
      { 
        var tempList;
        
        if (channelID && channelList >= 0)
        {
          tempList = channelLists[channelList];
          if (!tempList)
          {
            Debug.inform("creating channelLists[" + channelList + "]");
            tempList = {};
            tempList.ordered = [];
            tempList.hashed = {};
            channelLists[channelList] = tempList;
            tempList = channelLists[channelList]; // just to be sure...
          }
          
          // Add channel to list if it's not there already
          if (typeof tempList.hashed[channelID] === "undefined")
          {
            Debug.inform("Adding " + channelID + " to list " + channelList);
            tempList.hashed[channelID] = tempList.ordered.length;
            tempList.ordered.push(channelID);
            that.saveChannelList(channelList);
            downloadSchedules(channelID);
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
          Debug.inform("addChannelToList returning false!\nchannelID = " + channelID + " channelList = " + channelList);
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
      try
      {
        var tempList, position, i;
        
        if (channelID && listID >= 0)
        {
          
          tempList = channelLists[listID];
          if (tempList)
          {
            position = tempList.hashed[channelID];
            if( typeof position === "number")
            {
              Debug.inform("settings.removeChannelFromList: Removing " + channelID + " at position " + tempList.hashed[channelID] + " from list " + listID);
              tempList.ordered.splice(tempList.hashed[channelID], 1);
              delete tempList.hashed[channelID];
              for (i = position; i < tempList.ordered.length; i += 1)
              {
                Debug.inform("settings.removeChannelFromList: moving " + tempList.ordered[i] + " from position " + tempList.hashed[tempList.ordered[i]] + " to position " + i);
                tempList.hashed[tempList.ordered[i]] = i;
              }
              that.saveChannelList(listID);
            }
            else
            {
              Debug.alert("channelID " + channelID + " was not found in hash!");
            }
          }
          else if (tempList)
          {
            Debug.warn("removeChannelFromList: Could not remove channel with id " + channelID + " from list " + listID + "!\ntypeof( " + tempList.hashed[channelID] + ") = " + typeof tempList.hashed[channelID]);
          }
          else
          {
            Debug.warn("settings.removeChannelFromList: Could not remove channel with id " + channelID + " from list " + listID + "because the list didnt exist!");
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
      try
      {
        var body;
        
        body = document.getElementsByTagName("body")[0];
        
        
        if (typeof body.fontSize === "undefined")
        {
          body.fontSize = 10;
        } 
        if (typeof currentSize.width === "undefined")
        {
          Debug.warn("settings.resizeText could not resize since currentSize.width and height are undefined!");
        }
        else
        {
          if (amount === 0)
          {
            currentSize.scale = 1;
          }
          else if (amount > 0 && currentSize.height * (currentSize.scale + 0.1) < screen.height)
          {
            currentSize.scale += 0.1;
          }
          else if (amount < 0 && currentSize.scale > 1)
          {
            currentSize.scale -= 0.1;
          }
          
          body.style.fontSize = body.fontSize * currentSize.scale + "px";
          //Debug.alert("currentSize.scale = " + currentSize.scale);
          if (!skipResize)
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
        if (width)
        {
          currentSize.width = width;
        }
        if (height)
        {
          currentSize.height = height;
        }
        if (typeof currentSize.scale === "undefined")
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
        if (window.widget && window.widget.system)
        {
          file.showLoadingImage();
          window.widget.system("cd helpers && /usr/bin/php installgrabber.php", grabberInstalled);
        }
      }
      catch (error)
      {
        file.hideLoadingImage();
        Debug.alert("Error in settings.installGrabber: " + error);
      }
    },
    
    /**
      * @scope settings
      * @function updateGrabber
      * @description Installs the grabber service as a cronjob.
      */
    updateGrabber: function (force) 
    {
      try
      {
        var installedGrabberVersion = that.getPreference("grabberVersion");
        if (!installedGrabberVersion || installedGrabberVersion < EPG.grabberVersion || force)
        {
          Debug.inform("Updating grabber");
          if (window.widget && window.widget.system)
          {
            file.showLoadingImage();
            window.widget.system("cd helpers && /usr/bin/php installgrabber.php", grabberUpdated);
          }
        }
        else
        {
          Debug.inform("Grabber was up to date");
        }
      }
      catch (error)
      {
        file.hideLoadingImage();
        Debug.alert("Error in settings.updateGrabber: " + error);
      }
    },
    
    /**
     * @memberOf EPG.settings
     * @function getProgramsForDay
     * @description Gets all programs for a specific day.
     * @param {string} channelID Channel ID
     * @param {function} onSuccess Function to run if successful.
     * @param {function} onFailure Function to run if unsuccessful.
     * @param {object} when Date object representing the day
     */
    getProgramsForDay: function (channelID, onSuccess, onFailure, when) 
    {
      try
      {
        var ymd, 
        programsForThisChannelAreCached,
        programsForThisDateAreCached;
        
        if (!when)
        {
          when = new Date();
        }
        
        ymd = getFileDateYYYYMMDD(when);
        programsForThisChannelAreCached = cachedPrograms[channelID];
        if (programsForThisChannelAreCached)
        {
          programsForThisDateAreCached = programsForThisChannelAreCached[ymd];
          if (programsForThisDateAreCached)
          {
            setTimeout(function(){onSuccess(programsForThisDateAreCached);}, 1);
          }
          else
          {
            file.openSchedule(channelID, ymd, function(schedule, theChannelID){programsDownloadSucceeded(onSuccess, schedule, channelID, ymd);}, function(contents, thechannelID){programsDownloadFailed(onFailure, contents, channelID, ymd);});
          }
        }
        else
        {
          cachedPrograms[channelID] = {};
          file.openSchedule(channelID, ymd, function(schedule, theChannelID){programsDownloadSucceeded(onSuccess, schedule, channelID, ymd, false, false, false, onFailure, when);}, function(contents, thechannelID){programsDownloadFailed(onFailure, contents, channelID, ymd, false);});
        }
      }
      catch (error)
      {
        Debug.alert("Error in EPG.settings.getProgramsForDay: " + error + " (channelID = " + channelID + ", when = " + when + ")");
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
    getProgramsForChannel: function (channelID, onSuccess, onFailure, numPrograms, when, alreadyFoundPrograms, fileDate) 
    {
      try
      {
        var ymd,
        programsForThisChannelAreCached,
        programsForThisDateAreCached,
        foundPrograms,
        callback;
        
        if (typeof(numPrograms) === "undefined")
        {
          Debug.warn("settings.getProgramsForChannel: numPrograms was undefined! Defaulting to 3 (now, next, later)");
          numPrograms = 3; // now next later
        }
        
        if (alreadyFoundPrograms && alreadyFoundPrograms.length)
        {
          //numPrograms -= alreadyFoundPrograms.length;
          if (numPrograms < 0)
          {
            Debug.warn("getProgramsForChannel with id " + channelID + " found too many programs!\nalreadyFoundPrograms.length = " + alreadyFoundPrograms.length + ", numPrograms became " + numPrograms);
            numPrograms = 0;
          }
        }
        if (!when || (when && !when.getFullYear))
        {
          fileDate = new Date(new Date() - 86400000); // Always start searching yesterday
          when = new Date();
        }
        else if (!alreadyFoundPrograms)
        {
          fileDate = new Date(when - 86400000); // Start searching one day before when, just to be sure.
          alreadyFoundPrograms = [];
        }
        
        ymd = getFileDateYYYYMMDD(fileDate);
        programsForThisChannelAreCached = cachedPrograms[channelID];
        if (programsForThisChannelAreCached)
        {
          programsForThisDateAreCached = programsForThisChannelAreCached[ymd];
          if (programsForThisDateAreCached)
          {
            //Debug.inform(channelID + ": " + ymd + " had " + programsForThisDateAreCached.length + " programs cached.");
            foundPrograms = findPrograms(channelID, numPrograms, when, ymd, alreadyFoundPrograms, fileDate);
            //Debug.inform(channelID + ": " + ymd + " found " + foundPrograms.length + " programs");
            // What happens around midnight?
            if (foundPrograms.length < numPrograms)
            {
              //Debug.warn(channelID + " did not find enough programs on date " + ymd + " (wanted " + numPrograms + " but found only " + (foundPrograms.length) + ".) Trying next day.");
              that.getProgramsForChannel(channelID, onSuccess, onFailure, numPrograms, when, foundPrograms, new Date(fileDate.getTime() + 86400000)); // Look for more programs tomorrow
            }
            else
            {
              setTimeout(function(){onSuccess(foundPrograms);}, 1);
            }
          }
          else
          {
            //Debug.inform(channelID + ": No programs for date " + ymd + " cached, running file.openSchedule");
            file.openSchedule(channelID, ymd, function(schedule, theChannelID){programsDownloadSucceeded(onSuccess, schedule, channelID, ymd, numPrograms, fileDate, alreadyFoundPrograms, onFailure, when);}, function(contents, thechannelID){programsDownloadFailed(onFailure, contents, channelID, ymd, alreadyFoundPrograms);});
          }
        }
        else
        {
          //Debug.inform(channelID + ": This is the first time we have seen this channel. Running file.openSchedule");
          cachedPrograms[channelID] = {};
          file.openSchedule(channelID, ymd, function(schedule, theChannelID){programsDownloadSucceeded(onSuccess, schedule, channelID, ymd, numPrograms, fileDate, alreadyFoundPrograms, onFailure, when);}, function(contents, thechannelID){programsDownloadFailed(onFailure, contents, channelID, ymd, alreadyFoundPrograms);});
        }
       
      }
      catch (error)
      {
        Debug.alert("Error in settings.getProgramsForChannel: " + error + " (channelID = " + channelID + ")");
      }
    },
    
    /**
     * @memberOf EPG.settings
     * @function removeOldPrograms
     * @description Removes cached programs older than yesterday.
     */
    removeOldPrograms: function () 
    {
      try
      {
        var channelID,
        cachedChannel,
        index,
        today = new Date(),
        yesterday = "0000-00-00",
        ymd;
        
        if (!cachedPrograms.lastRemove || cachedPrograms.lastRemove < today)
        {
          cachedPrograms.lastRemove = today.getTime();
          for (channelID in cachedPrograms)
          {
            if (cachedPrograms.hasOwnProperty(channelID))
            {
              cachedChannel = cachedPrograms[channelID];
              for (ymd in cachedChannel)
              {
                if (cachedChannel.hasOwnProperty(ymd))
                {
                  if (ymd < yesterday)
                  {
                    delete cachedPrograms[ymd];
                 }
                }
              }
            }
          }
        }
      }
      catch (error)
      {
        Debug.alert("Error in settings.removeOldPrograms: " + error);
      }
    },
    
    /**
     * @memberOf EPG.settings
     * @function getCurrentChannelListID
     * @description Returns the current channel list id.
     * @return {number} ID of the current channel list.
     */
    getCurrentChannelListIndex: function () 
    {
      try
      {
        return currentChannelListIndex;
      }
      catch (error)
      {
        Debug.alert("Error in settings.getCurrentChannelListID: " + error);
      }
    },
    
    /**
     * @memberOf EPG.settings
     * @function getLogoPath
     * @description Returns path to channel logo if it exists.
     */
    getLogoPath: function (channelID) 
    {
      try
      { 
        var channel = that.getChannel(channelID);
        if (channel && channel.icon)
        {
          return file.getHomePath() + "Library/Xmltv/logos/" + channelID + ".png";
        }
        else
        {
          return false;
        }
      }
      catch (error)
      {
        Debug.alert("Error in EPG.settings.getLogoPath: " + error);
      }
    },
    
    /**
     * @memberOf EPG.settings
     * @function getHHMM
     * @description Returns a date formatted as HH:MM.
     */
    getHHMM: function (when) 
    {
      try
      {
        var HHMM = "";
        if (when && when.getHours)
        {
          if (when.getHours() < 10)
          {
            HHMM = "0" + when.getHours() + ":";
          }
          else
          {
            HHMM = when.getHours() + ":";
          }
          if (when.getMinutes() < 10)
          {
            HHMM += "0";
          }
          HHMM += "" + when.getMinutes();
        }
        
        return HHMM;
      }
      catch (error)
      {
        Debug.alert("Error in EPG.settings.getHHMM: " + error);
      }
    },
    /**
     * @memberOf EPG.settings
     * @function downloadChannelList
     * @description Downloads a list of channels from the server, in case the grabber has failed to do so.
     */
    downloadChannelList: function (onSuccess, onFailure) 
    {
      try
      {
        file.downloadFile(defaultPathToServer + "/channels.js.gz", paths.allChannels, onSuccess, onFailure);
      }
      catch (error)
      {
        Debug.alert("Error in EPG.settings.downloadChannels: " + error);
      }
    },
    
    /**
     * @memberOf Epg.settings
     * @function getTransparency
     * @description Returns current transparency value.
     */
    getTransparency: function () 
    {
      try
      {
        return transparencyValue;
      }
      catch (error)
      {
        Debug.alert("Error in Epg.settings.getTransparency: " + error);
      }
    },
    
    /**
     * @memberOf Epg.settings
     * @function runGrabber
     * @description Runs the grabber.
     */
    runGrabber: function (force)
    {
      try
      {
        var command = "cd " + file.getHomePath() + "Library/Xmltv/grabber && /usr/bin/php epg.downloader.php";
        if (force)
        {
          command += " 1";
        }
        Debug.inform("runGrabber command = " + command);
        if (window.widget && window.widget.system)
        {
          file.showLoadingImage();
          window.widget.system(command, ranGrabber);
        }
      }
      catch (error)
      {
        Debug.alert("Error in Epg.settings.runGrabber: " + error);
      }
    },
    
    /**
     * @memberOf EPG.Settings
     * @function checkForNewVersion
     * @description Checks if there is a new version available.
     * @param {function} callback Callback function to run if there is a new version available.
     */
    checkForNewVersion: function (callback) 
    {
      try
      {
        var now = new Date().getTime();
        if (now >= lastVersionCheck)
        {
          file.open(upgradeInfoUrl, 
          function (callback)
          {
            return function (response)
            {
              isUpdateAvailable(response, callback);
            };
          }(callback), 
          function () {},
          false, true, true);
        }
      }
      catch (error)
      {
        Debug.alert("Error in EPG.Settings.checkForNewVersion: " + error);
      }
    }
  };
}(EPG.debug, EPG.growl, EPG.file);
EPG.settings.init();
EPG.PreLoader.resume();