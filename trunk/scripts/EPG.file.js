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
  var that;
  
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
          growl.notifyNow("fileOpened: Failure! Did not find " + xhr.path + " :-(");
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
      debug.alert("Error in fileOpened: " + error);
      xhr = null;
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
        if (path)
        {
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
          debug.alert("Opening file at path: " + path);
        }
      }
      catch (error)
      {
        debug.alert("Error in open: " + error);
      }
    }
  };
}(EPG.debug, EPG.growl);
EPG.file.init();
