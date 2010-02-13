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
 on:false,
 passfail:false, 
 plusplus:true, 
 rhino:false, 
 undef:true, 
 white:false, 
 widget:false */

/*extern EPG*/
if (EPG.debug)
{
  EPG.debug.inform("EPG.Reminder.js loaded");
}

/**
 * @memberOf EPG
 * @name Reminder
 * @static
 * @type object
 * @description Shows reminders.
 */
EPG.Reminder = function(Debug, Growl, Settings, Translator) 
{
  // Private Variables
  var that,
  reminders = {};
  
  // Private methods
  
  // Public methods
  return /** @scope Reminder */ {
    /**
     * @memberOf Reminder
     * @description Initialization function for Reminder.
     */
    init: function()
    {
      if(!that)
      {
        that = this;
      }
      delete that.init;
    },
    
    /**
     * @memberOf EPG.Reminder
     * @function addReminder
     * @description Adds a reminder.
     */
    addReminder: function (program) 
    {
      try
      {
        var timeLeft, message, local, channel, logoPath, start, title, stopTime;
        
        if(program && program.start && program.channel)
        {
          if(reminders[program.channel] && reminders[program.channel][program.start])
          {
            Growl.removeNotification(reminders[program.channel][program.start]);
            delete reminders[program.channel][program.start];
            return false;
          }
          else
          {
            if(!reminders[program.channel])
            {
              reminders[program.channel] = {};
            }
            start = new Date(program.start * 1000);
            stopTime = new Date(program.stop * 1000);
            channel = Settings.getChannel(program.channel);
            timeLeft = start - (new Date()) - 60000; // Alert 1 minute before the program starts.
            //timeLeft = 5000; // Alert 1 minute before the program starts.
            if (timeLeft <= 0)
            {
              timeLeft = 1;
            }
            //if(timeLeft > 0)
            //{ 
              title = "";
              message = "";
              for (locale in program.title)
              {
                if(program.title.hasOwnProperty(locale))
                {
                  title += program.title[locale];
                  break;
                }
              }
              
              if(channel)
              {
                //message = "\n";
                for (locale in channel.displayName)
                {
                  if(channel.displayName.hasOwnProperty(locale))
                  {
                    message += channel.displayName[locale];
                    break;
                  }
                }
                message += ", " + Settings.getHHMM(start) + " - " + Settings.getHHMM(stopTime);
              }
              else
              {
                message += " " + Settings.getHHMM(start) + " - " + Settings.getHHMM(stopTime);
              }

              if(message)
              {
                logoPath = Settings.getLogoPath(program.channel);
                //Debug.inform("Settings.getLogoPath(program.channel) = " + Settings.getLogoPath(program.channel));
                reminders[program.channel][program.start] = Growl.notifyLater(message, logoPath, true, false, timeLeft, title);
              }
              
            //}
            return true;
          }
        }
        else
        {
          return false;
        }
      }
      catch (error)
      {
        Debug.alert("Error in EPG.Reminder.addReminder: " + error);
      }
    }
  };
}(EPG.debug, EPG.growl, EPG.settings, EPG.translator);
EPG.Reminder.init();
//EPG.PreLoader.resume();