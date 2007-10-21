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
  EPG.debug.alert("EPG.file.js loaded");
}

EPG.file = function(debug, growl)
{
  // Private Variables
  var that,
  HOME,
  gettingPath = false;
  
  // Private methods
  function fileOpened(xhr) 
  {
    var jsonObject;
    try
    {
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
                debug.alert("file.fileOpened: Opened file " + xhr.path + " but it did not contain a jsontv-object! Contents:\n" + xhr.responseText);
                xhr.onFailure(xhr.responseText, xhr.channelID);
              }
            }
          } 
          catch (e)
          {
          	if(xhr.onFailure)
          	{
          	  debug.alert("file.fileOpened: Opened file " + xhr.path + " but it's contents was not valid javascript:\n" + xhr.responseText);
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
          HOME = HOME.replace(/^\s+|\s+$/g, '') + "/";
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
      
      debug.alert("file.savePath: HOME = " + HOME);
    }
    catch (error)
    {
      debug.alert("Error in file.savePath: " + error);
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
    },
    
    open: function(path, onSuccess, onFailure, channelID) 
    {
      var xhr;
      try
      {
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
          debug.alert("file.open: don't have HOME-path yet. Trying again in 100ms...");
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
            debug.alert("file.open: Opening file at path: " + path);
          }
        }
      }
      catch (error)
      {
        debug.alert("Error in file.open: " + error + "\n(path = " + path + ")");
      }
    }
  };
}(EPG.debug, EPG.growl);
EPG.file.init();
