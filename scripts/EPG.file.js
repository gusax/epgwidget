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

if (EPG.debug)
{
  EPG.debug.inform("EPG.file.js loaded");
}

/**
 * @name EPG.file
 * @static
 * @type object
 * @description Handles interaction with the filesystem. Reads local and remote files using XMLHttpRequest.
 */
EPG.file = function(debug, growl)
{
  // Private Variables
  var that,
  HOME,
  gettingPath = false;
  
  // Private methods
  /**
   * @memberOf EPG.file
   * @name fileOpened
   * @function
   * @description Called from XMLHttpRequest when a file has been opened. Evaluates the responseText and calls the onSuccess-method if the responseText could be evaluated to a json-object, otherwise calls the onFailure-method with an error message.
   * @private
   * @param  {object} xhr The XMLHttpRequest object representing the opened file.
   */
  function fileOpened(xhr) 
  {
    try
    {
      var jsonObject;
      
      if (xhr && xhr.readyState === 4)
      {
        if(xhr.responseText)
        {
          try 
          {
            jsonObject = eval("(" + xhr.responseText + ")");
            if(jsonObject && jsonObject.jsontv && xhr.onSuccess)
            {
              xhr.onSuccess(jsonObject.jsontv, xhr.channelID);
            }
            else
            {
              if(xhr.onFailure)
              {
                debug.warn("file.fileOpened: Opened file " + xhr.path + " but it did not contain a jsontv-object! Contents:\n" + xhr.responseText);
                xhr.onFailure(xhr.responseText, xhr.channelID);
              }
            }
          } 
          catch (e)
          {
          	if(xhr.onFailure)
          	{
          	  debug.warn("file.fileOpened: Opened file " + xhr.path + " but it's contents was not valid javascript:\n" + xhr.responseText);
          	  xhr.onFailure(xhr.responseText, xhr.channelID);
          	}
          }
        }
        else
        {
          growl.notifyNow("file.fileOpened: Failure! Did not find " + xhr.path + " :-(");
          if(xhr.onFailure)
          {
            xhr.onFailure(xhr.channelID);
          }
        }
        xhr = null;
      }
    }
    catch (error)
    {
      debug.alert("Error in file.fileOpened: " + error);
      xhr = null;
    }
  }
  /**
   * @memberOf EPG.file
   * @name savePath
   * @function
   * @description Extracts the HOME-path from the systemCall recieved
   * @private
   * @param  {object} systemCall Widget.system-object containing the HOME-path (path to the home folder of the current user).
   */
  function savePath (systemCall) 
  {
    try
    {
      if(window.widget && systemCall)
      {
        HOME = systemCall.outputString;
        if(!HOME)
        {
          HOME = "/Users/gusax840/";
        }
        else
        {
          HOME = HOME.replace(/^\s+|\s+$/g, '') + "/"; // trim response (remove spaces before and after the string) 
        }
        
      }
      else if(window.widget)
      {
        HOME = "/Users/gusax840/";
      }
      else
      {
        HOME = "file:///Users/gusax840/";
      }
      
      //debug.alert("file.savePath: HOME = " + HOME);
    }
    catch (error)
    {
      debug.alert("Error in file.savePath: " + error);
    }
  }
  
  // Public methods
  return /** @scope file */ {
  	
  	/**
  	 * @memberOf EPG.file
  	 * @function init
  	 * @description Saves "this" and initializes the file object.
  	 */
    init: function()
    {
      if(!that)
      {
        that = this;
      }
      delete that.init
    },
    
    /**
     * @memberOf EPG.file
     * @function open
     * @description Opens a file and returns its contents as a json-object to the provided onSuccess-method. In case of a failure, calls the onFailure-method.
     * @param {string} path Relative (from the users home directory) path to the file that we want to open.
     * @param {function} onSuccess Method to call if the file was found. Must accept a json-object as its first argument.
     * @param {function} onFailure Method to call if the file could not be found, or if another error occured. Must accept an error object as its first argument.
     * @param {string} channelID ID of the channel that the file (schedule) belongs to.
     */
    open: function(path, onSuccess, onFailure, channelID) 
    {
      try
      {
        var xhr;
        
        if(!HOME)
        {
          if(!gettingPath)
          {
            gettingPath = true;
            if(window.widget)
            {
              window.widget.system("/bin/echo $HOME", savePath);
            }
            else
            {
              setTimeout(savePath,1);
            }
          }
          //debug.inform("file.open: don't have HOME-path yet. Trying again in 100ms...");
          setTimeout(function(){that.open(path, onSuccess, onFailure, channelID);}, 100);
        }
        else
        {
          if (path)
          {
            path = HOME + "" + path;
            xhr = new XMLHttpRequest();
            xhr.path = path;
            xhr.channelID = channelID;
            xhr.onSuccess = onSuccess;
            xhr.onFailure = onFailure;
            xhr.onreadystatechange = function (){
              fileOpened(xhr);
            };
            xhr.open("GET", path, true);
            xhr.send("");
            //debug.inform("file.open: Opening file at path: " + path);
          }
        }
      }
      catch (error)
      {
        debug.alert("Error in file.open: " + error + "\n(path = " + path + ")");
        if(onFailure)
        { 
          setTimeout(onFailure, 1);
        }
      }
    },
    
    /**
     * @memberOf EPG.file
     * @function getHomePath
     * @description Returns the path to the users home folder (with a trailing slash).
     * @return {string} Path to the users home folder.
     */
    getHomePath: function () 
    {
      try
      {
        return HOME;
      }
      catch (error)
      {
        Debug.alert("Error in file.getHomePath: " + error);
      }
    },
    
    /**
     * @memberOf EPG.file
     * @function openSchedule
     * @description Opens a schedule for a specified channelID.
     * @param {string} channelID Id of the channel whos shedule we are opening.
     * @param {string} ymd Date in YYYY-MM-DD format, specifying which day we are interested in.
     * @param {function} onSuccess Function to call if the file was found.
     * @param {function} onFailure Function to call if an error occured.
     */
    openSchedule: function (channelID, ymd, onSuccess, onFailure) 
    {
      try
      {
        var schedulesPath;
        
        schedulesPath = "Library/Xmltv/schedules/" + channelID + "_" + ymd + ".js";
        that.open(schedulesPath, onSuccess, onFailure, channelID);
      }
      catch (error)
      {
        Debug.alert("Error in file.openSchedule: " + error + " (channelID = " + channelID + ", ymd = " + ymd + ")");
      }
    }
  };
}(EPG.debug, EPG.growl);
EPG.file.init();
