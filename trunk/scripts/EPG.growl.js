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
/**
 * @memberOf EPG
 * @name growl
 * @static
 * @type object
 * @description Displays growl notifications if growl (www.growl.info) with growlnotify is installed.
 */
EPG.growl = function(Debug, Translator)
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
  /**
   * @memberOf growl
   * @name growlCheck
   * @function 
   * @description Checks if the growl notification test failed. If an error was found, growl is not installed and no further attempts will be made to send messages via growl.
   * @private
   * @param {object} systemCall Represents the object recieved after a system call has finished running (in the Dashboard case growlnotify was called via widget.system).
   * @param {function} callback Function to tell weather growl is installed or not.
   */
  function growlCheck(systemCall, callback) 
  {
    var index;
    try
    {
      hasNotCheckedForGrowlYet = false;
      if(systemCall.errorString)
      {
        userHasGrowlInstalled = false;
        Debug.alert("growlCheck: User does not have growl installed :-(");
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
      Debug.alert("Error in growl.growlCheck: " + error);
    }
  }
  
  /**
    * @memberOf growl
    * @name growlFinished
    * @function
    * @description Runs after a growl notification has been shown.
    * @private
    * @param {object} systemCall Represents the object recieved after a system call has finished running.
    */
  function growlFinished(systemCall) 
  {
    var index;
    try
    {
      if(systemCall.errorString)
      {
        Debug.alert("Error when sending growl notification :-(\n" + systemCall.errorString);
      }
    }
    catch (error)
    {
      Debug.alert("Error in growl.growlFinished: " + error);
    }
  }
  
  // Public methods
  return /** @scope growl */ {
    
    /**
      * @memberOf growl
      * @function init
      * @description Saves "this" and initializes the singleton.
      */
    init: function()
    {
      if(!that)
      {
        that = this;
      }
      that.checkForGrowl();
    },
    
    /**
      * @memberOf growl
      * @function checkForGrowl
      * @description Checks if growl is installed on this computer.
      * @param {function} callback Function to be run after the check has finished. Must accept a boolean as its first parameter (true if growl was installed, false if not).
      */
    checkForGrowl: function(callback) 
    {
      try
      {
        
        if(window.widget)
        {
          
          widget.system(pathToGrowl + " --name \"DreamEPG\" --image \"" + pathToEPGIcon + "\" --message \"" + Translator.translate("Jippie, you can use Growl together with the EPG widget :-)") + "\"", function(systemcall){growlCheck(systemcall, callback);});
        }
      }
      catch (error)
      {
        Debug.alert("Error in growl.checkForGrowl: " + error);
      }
    },
    
    /**
      * @memberOf growl
      * @function notifyNow
      * @description Immediately sends a growl notification message to the user.
      * @param {string} message The message to send to the user.
      * @param {string} [pathToImage] Absolute path to the image that should be used as the icon for the growl notification.
      * @param {boolean} [sticky] True if the notification should be sticky (not disappear until clicked by the user).
      */
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
            Debug.alert("growl.notifyNow: Cannot send growl notification now, don't yet know if growl is installed. Trying again in just a moment...");
            that.notifyLater(message, pathToImage, sticky, 100);
          }
          else
          {
            Debug.alert("growl.notifyNow: Cannot send growl notification - growl is not installed :-(\nMessage was:\n" + message);
          }
        }
        else
        {
          Debug.alert("GROWL NOTIFICATION:\n" + message);
        }
      }
      catch (error)
      {
        Debug.alert("Error in growl.notifyNow: " + error);
      }
    },
    
    /**
      * @memberOf growl
      * @function notifyLater
      * @description Schedules a growl notification to be displayed at a certain date and time. Will of course not show notifications if the computer is asleep or turned off.
      * @param {string} message The message to send to the user.
      * @param {string} pathToImage Absolute path to the image that should be used as the icon for the growl notification.
      * @param {boolean} sticky True if the notification should be sticky (not disappear until clicked by the user).
      * @param {object} later Date object representing at which point in time the notification should be shown to the user.
      */
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
        Debug.alert("Error in growl.notifyLater: " + error);
      }
    },
    
    /**
      * @memberOf growl
      * @function isInstalled
      * @description Returns weather growl is installed or not.
      * @return {boolean} True if growl is installed, otherwise false.
      */
    isInstalled: function() 
    {
      try
      {
        return userHasGrowlInstalled;
      }
      catch (error)
      {
        Debug.alert("Error in growl.isInstalled: " + error);
      }
    } 
  };
}(EPG.debug, EPG.translator);
EPG.growl.init();