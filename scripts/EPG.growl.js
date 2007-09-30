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
 widget */

if (!EPG)
{
  var EPG = {};
}

if (EPG.debug)
{
  EPG.debug.alert("EPG.growl.js loaded");
}

EPG.growl = function(debug, translator)
{
  // Private Variables
  var that,
  hasNotCheckedForGrowlYet = true,
  userHasGrowlInstalled = false,
  timers = [],
  callbacks = [],
  pathToGrowl = "/usr/local/bin/growlnotify",
  pathToEPGIcon = "$HOME/Library/Xmltv/grabber/Icon.png";; 
  
  // Private methods
  function growlCheck(systemCall, callback) 
  {
    var index;
    try
    {
      if(systemCall.errorString)
      {
        userHasGrowlInstalled = false;
        debug.alert("growlCheck: User does not have growl installed :-(");
      }
      else
      {
        userHasGrowlInstalled = true;
      }
      
      if(callback)
      {
        callBack(userHasGrowlInstalled);
      }
    }
    catch (error)
    {
      debug.alert("Error in growl.growlCheck: " + error);
    }
  }
  
  
  function growlFinished(systemCall) 
  {
    var index;
    try
    {
      if(systemCall.errorString)
      {
        debug.alert("Error when sending growl notification :-(\n" + systemCall.errorString);
      }
    }
    catch (error)
    {
      debug.alert("Error in growl.growlFinished: " + error);
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
      that.checkForGrowl();
    },
    
    checkForGrowl: function(callback) 
    {
      try
      {
        
        if(window.widget)
        {
          
          widget.system(pathToGrowl + " --name \"DreamEPG\" --image \"" + pathToEPGIcon + "\" --message \"" + translator.translate("Jippie, you can use Growl together with the EPG widget :-)") + "\"", function(systemcall){growlCheck(systemcall, callback);});
        }
      }
      catch (error)
      {
        debug.alert("Error in growl.checkForGrowl: " + error);
      }
    },
    
    notifyNow: function(message, pathToImage, sticky) 
    {
      
      try
      {
        // notify immediately (but if it is a reminder, perhaps check date first? If date has passed, there is no use filling the screen with messages.)
        if(window.widget)
        {
          if(userHasGrowlInstalled)
          {
            if(pathToImage)
            {
              window.widget.system(pathToGrowl + " --name \"DreamEPG\" --message \"" + message + "\" --image \"" + pathToImage + "\"", function(systemcall){growlFinished(systemcall);});
            }
            else
            {
              window.widget.system(pathToGrowl + " --name \"DreamEPG\" --message \"" + message + "\" --image \"" + pathToEPGIcon + "\"", function(systemcall){growlFinished(systemcall);});
            }
          }
          else if(hasNotCheckedForGrowlYet)
          {
            debug.alert("growl.notifyNow: Cannot send growl notification now, don't yet know if growl is installed. Trying again in just a moment...");
            that.notifyLater(message, pathToImage, sticky, 100);
          }
          else
          {
            debug.alert("growl.notifyNow: Cannot send growl notification - growl is not installed :-(\nMessage was:\n" + message);
          }
        }
        else
        {
          debug.alert("GROWL NOTIFICATION:\n" + message);
        }
      }
      catch (error)
      {
        debug.alert("Error in growl.notifyNow: " + error);
      }
    },
    
    notifyLater: function(message, pathToImage, sticky, later) 
    {
      var msToNotification = 100;
      try
      {
        // set a timeout that notifies at the specified date and time (when)
        if(userHasGrowlInstalled || hasNotCheckedForGrowlYet)
        {
          timers.push(setTimeout(function(){that.notifyNow(message, pathToImage, sticky);}, msToNotification));
        }
      }
      catch (error)
      {
        debug.alert("Error in growl.notifyLater: " + error);
      }
    },
    
    isInstalled: function() 
    {
      try
      {
        return userHasGrowlInstalled;
      }
      catch (error)
      {
        debug.alert("Error in growl.isInstalled: " + error);
      }
    } 
  };
}(EPG.debug, EPG.translator);
EPG.growl.init();