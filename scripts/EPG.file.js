/*jslint adsafe:false, 
 bitwise: true, 
 browser:true, 
 cap:false, 
 Debug:false,
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
EPG.file = function(Debug, growl, currentVersion)
{
  // Private Variables
  var that,
  HOME,
  gettingPath = false,
  userAgent,
  loadingImage,
  XHRTIMEOUT = 5000;
  
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
        if (xhr.stopTimeout)
        {
          clearTimeout(xhr.stopTimeout);
        }
        if(xhr.responseText)
        {
          try 
          {
            if(xhr.dontEval)
            {
              if(xhr.onSuccess)
              {
                xhr.onSuccess(xhr.responseText);
              }
            }
            else
            {
              jsonObject = eval("(" + xhr.responseText + ")");
              if(jsonObject && jsonObject.jsontv && xhr.onSuccess)
              {
                //Debug.inform("file.fileOpened: Successfully opened file " + xhr.path);
                xhr.onSuccess(jsonObject.jsontv, xhr.channelID);
              }
              else
              {
                if(xhr.onFailure)
                {
                  Debug.warn("file.fileOpened: Opened file " + xhr.path + " but it did not contain a jsontv-object! Contents:\n" + xhr.responseText);
                  xhr.onFailure(xhr.responseText, xhr.channelID);
                }
              }
            }
          } 
          catch (e)
          {
            Debug.warn("Error in file.fileOpened when evaluating javascript: " + e);
          	if(xhr.onFailure)
          	{
          	  Debug.warn("file.fileOpened: Opened file " + xhr.path + " but it's contents was not valid javascript:\n");
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
        xhr = false;
      }
      that.hideLoadingImage();
    }
    catch (error)
    {
      Debug.alert("Error in file.fileOpened: " + error);
      xhr = false;
      that.hideLoadingImage();
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
      that.hideLoadingImage();
      //Debug.alert("file.savePath: HOME = " + HOME);
    }
    catch (error)
    {
      that.hideLoadingImage();
      Debug.alert("Error in file.savePath: " + error);
    }
  }
  
  /**
   * @memberOf EPG.file
   * @name fileDownloaded
   * @function
   * @description Run by widget.system after a file (hopefully) has been downloaded.
   * @private
   * @param {object} systemCall Widget system call.
   */
  function fileDownloaded (systemCall, onSuccess, onFailure, url, localPath, dontEval)
  {
    try
    {
      if(systemCall)
      {
        if(systemCall.errorString)
        {
          switch(systemCall.status)
          {
             case 0: // status seems to always be 0...
               Debug.inform("file.fileDownloaded: Successfully downloaded " + url + "!");
               if(localPath && localPath.search(/(.png)+$/i) > 0) // a file that ends in .png (case insensitive)
               {
                 // This is an icon.
                 if(onSuccess)
                 {
                   onSuccess();
                 }
               }
               else
               {
                 that.open(localPath, onSuccess, onFailure, dontEval);
               }
             break;
             case 1: // Unsupported protocol. This build of curl has no support for this protocol.
             case 2: // Failed to initialize.
             case 3: // URL malformat. The syntax was not correct
             case 4: // URL user malformatted. The user-part of the URL syntax  was  not correct.
             case 5: // Couldn't  resolve  proxy.  The  given  proxy  host  could not be resolved.
             case 6: // Couldn't resolve host. The given remote host was not resolved.
               // No internet connection?
             case 7: // Failed to connect to host.
               Debug.alert("file.fileDownloaded: error with status " + systemCall.status + ". errorString = \n" + systemCall.errorString + "\nwhen trying to download " + url);
               if(onFailure)
               {
                 onFailure();
               }
             break;
             case 23: // Could not create file, perhaps grabber has been removed?
               Debug.alert("file.fileDownloaded: error with status " + systemCall.status + ". errorString = \n" + systemCall.errorString + "\nwhen trying to download " + url + ". Perhaps grabber folder has been removed?");
               if (onFailure)
               {
                 onFailure("couldNotCreateFile");
               }
             break;
             default:
               Debug.alert("file.fileDownloaded: error with status " + systemCall.status + ". errorString = \n" + systemCall.errorString + "\nwhen trying to download " + url);
               if(onFailure)
               {
                 onFailure();
               }
             break;
          }
        }
        else
        {
          Debug.inform("file.fileDownloaded: Successfully downloaded " + url + "!");
          that.open(localPath, onSuccess, onFailure, dontEval);
        }
        systemCall.close();
      }
      else 
      {
        Debug.alert("file.fileDownloaded: Error when trying to download " + url);
      }
      that.hideLoadingImage();
    }
    catch (error)
    {
      that.hideLoadingImage();
      Debug.alert("Error in EPG.file.fileDownloaded: " + error + " (systemCall = " + systemCall + ")");
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
        if(typeof(currentVersion) !== "undefined")
        {
          userAgent = "se.swedb.tv.widget/" + currentVersion + "W";
        }
        else
        {
          userAgent = "se.swedb.tv.widget/W";
        }
        
        loadingImage = document.createElement("div");
        loadingImage.style.position = "absolute";
        loadingImage.style.left = "23.2em";
        loadingImage.style.top = "0.6em";
        loadingImage.style.visibility = "visible";
        loadingImage.style.zIndex = "999";
        loadingImage.style.fontSize = "1em";
        loadingImage.showCount = 0;
        loadingImage.appendChild(document.createElement("span"));
        loadingImage.lastChild.setAttribute("id", "loadingImage");
        loadingImage.lastChild.appendChild(document.createTextNode("\u231B"));
        document.getElementsByTagName("body")[0].appendChild(loadingImage);
      }
      delete that.init
    },    
   
   /**
     * @memberOf EPG.file
     * @name showLoadingImage
     * @function
     * @description Shows loading image and increments loading image counter.
     * @private
     */
    showLoadingImage: function () 
    {
      try
      {
        loadingImage.showCount += 1;
        if(loadingImage.showCount === 1)
        {
          loadingImage.style.visibility = "visible";
        }
      }
      catch (error)
      {
        Debug.alert("Error in EPG.file.showLoadingImage: " + error);
      }
    },
  
    /**
     * @memberOf EPG.file
     * @name hideLoadingImage
     * @function
     * @description Hides the loading image if loading image counter is 0.
     * @private
     */
    hideLoadingImage: function() 
    {
      try
      {
        loadingImage.showCount -= 1;
        if(loadingImage.showCount <= 0)
        {
          loadingImage.showCount = 0;
          loadingImage.style.visibility = "hidden";
        }
      }
      catch (error)
      {
        Debug.alert("Error in EPG.file.hideLoadingImage: " + error);
      }
    },
    
    /**
     * @memberOf EPG.file
     * @function open
     * @description Opens a file and returns its contents as a json-object to the provided onSuccess-method. In case of a failure, calls the onFailure-method.
     * @param {string} path Relative (from the users home directory) path to the file that we want to open.
     * @param {function} onSuccess Method to call if the file was found. Must accept a json-object as its first argument.
     * @param {function} onFailure Method to call if the file could not be found, or if another error occured. Must accept an error object as its first argument.
     * @param {string} channelID ID of the channel that the file (schedule) belongs to.
     * @param {boolean} dontEval True to skip json evaluation at the end.
     */
    open: function(path, onSuccess, onFailure, channelID, dontEval, isUrl) 
    {
      try
      {
        var xhr;
        that.showLoadingImage();
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
          //Debug.inform("file.open: don't have HOME-path yet. Trying again in 100ms...");
          setTimeout(function(){that.open(path, onSuccess, onFailure, channelID);}, 100);
        }
        else
        {
          if (path)
          {
            if (!isUrl)
            {
              path = HOME + "" + path;
            }
            xhr = new XMLHttpRequest();
            xhr.path = path;
            xhr.channelID = channelID;
            xhr.onSuccess = onSuccess;
            xhr.onFailure = onFailure;
            xhr.dontEval = dontEval;
            xhr.onreadystatechange = function (){
              fileOpened(xhr);
            };
            xhr.stopTimeout = setTimeout(
            function()
            {
              this.abort();
              if (this.onFailure)
              {
                Debug.alert("file.open: XHR timeout for file " + this.path);
                this.onFailure("Timeout");
              }
            }, XHRTIMEOUT);
            xhr.open("GET", path, true);
            xhr.send("");
            //Debug.inform("file.open: Opening file at path: " + path);
          }
        }
      }
      catch (error)
      {
        Debug.alert("Error in file.open: " + error + "\n(path = " + path + ")");
        if(onFailure)
        { 
          that.hideLoadingImage();
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
        var schedulesPath = "Library/Xmltv/schedules/" + channelID + "_" + ymd + ".js";
        that.open(schedulesPath, onSuccess, onFailure, channelID);
      }
      catch (error)
      {
        Debug.alert("Error in file.openSchedule: " + error + " (channelID = " + channelID + ", ymd = " + ymd + ")");
      }
    },
    
    /**
     * @memberOf EPG.file
     * @function downloadFile
     * @description Downloads a file.
     */
    downloadFile: function (url, savePath, onSuccess, onFailure, dontEval) 
    {
      try
      {
        var systemCall,
        pathOnly,
        command;
        if(window.widget && window.widget.system)
        {
          if(url && savePath)
          {
            if (savePath.match("/"))
            {
              if (savePath.match("."))
              {
                if (savePath.lastIndexOf("/") > 0)
                {
                  pathOnly = savePath.substr(0, savePath.lastIndexOf("/")-1);
                }
                else
                {
                  pathOnly = savePath;
                }
              }
              else
              {
                pathOnly = savePath;
              }
            }
            that.showLoadingImage();
            if (pathOnly)
            {
              command = '/bin/mkdir -p ' + HOME + '' + pathOnly + ' && /usr/bin/curl -S -R --user-agent '+userAgent+' --compressed ' + url + ' -o ' + HOME + '' + savePath + ' -z ' + HOME + '' + savePath;
            }
            else
            {
              command = '/usr/bin/curl -S -R --user-agent '+userAgent+' --compressed ' + url + ' -o ' + HOME + '' + savePath + ' -z ' + HOME + '' + savePath;
            }
            Debug.inform("file.downloadFile: running command " + command);
            systemCall = window.widget.system(command , function(response){fileDownloaded(response, onSuccess, onFailure, url, savePath, dontEval);});
          }
          else if(onFailure)
          {
            setTimeout(onFailure,1);
          }
        } 
        else if(onFailure)
        {
          setTimeout(onFailure,1);
        }
      }
      catch (error)
      {
        that.hideLoadingImage();
        Debug.alert("Error in EPG.file.downloadFile: " + error);
      }
    },
    
    /**
     * @memberOf EPG.file
     * @function setLoadingImage
     * @description Sets the loading image src.
     */
    setLoadingImage: function (src) 
    {
      try
      {
        loadingImage.setAttribute("src", src);
        Debug.alert("loadingImage.src = " + src);
      }
      catch (error)
      {
        Debug.alert("Error in EPG.file.setLoadingImage: " + error);
      }
    }
  };
}(EPG.debug, EPG.growl, EPG.currentVersion);
EPG.file.init();
EPG.PreLoader.resume();