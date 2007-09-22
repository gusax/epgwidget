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

/*extern EPG*/

if (!EPG)
{
  var EPG = {};
}

if (EPG.debug)
{
  EPG.debug.alert("EPG.widget.js loaded");
}

EPG.widget = function (front, back, debug, growl, file, settings)
{
	// Private variables
	var that,
	internalState = "loading",
	currentChannelListIndex = 0;
	
	// Private methods
	function createObject(oldObject)
	{
		var F = function (){};
		if (oldObject)
		{
			F.prototype = oldObject;
		}
		return new F();
	}
	
  function channelsLoaded(channels) 
  {
    var currentChannelList;
    try
    {
      growl.notifyNow("Found " + channels.length + " channels!");
      currentChannelList = settings.getChannelList(currentChannelListIndex);
      if(!currentChannelList || currentChannelList.length === 0)
      {
        back.show();
      }
      else
      {
        front.show();
      }
    }
    catch (error)
    {
      debug.alert("Error in widget.channelsLoaded: " + error);
    }
  }
  
  
  function channelLoadedFailed() 
  {
    try
    {
      growl.notifyNow("Could not load any channels :-( - does your internet connection work?");
    }
    catch (error)
    {
      debug.alert("Error in widget.channelLoadedFailed: " + error);
    }
  }
	
	// Public methods
	return {
		init: function ()
		{
		  
			try
			{
				if (!that)
				{
					that = this;
				}
	 			if(settings.isFirstInstall())
	 			{
	 			  growl.notifyNow("EPG has NOT been installed before!");
	 			  debug.alert("This is the first time EPG has been run on this computer (by this user)");
	 			  settings.getAllChannels(channelsLoaded);
	 			}
	 			else
	 			{
	 			  growl.notifyNow("EPG has been installed before.");
	 			  debug.alert("The EPG widget has been run on this computer (by this user) before.");
	 			  
	 			}
				//file.open("/Users/gusax840/Library/Xmltv/schedules/svt1.svt.se_2007-09-22.xml", null);
			}
			catch (error)
			{
				debug.alert("Error in widget.init: " + error);
			}
		}
	};
}(EPG.front, EPG.back, EPG.debug, EPG.growl, EPG.file, EPG.settings);

EPG.widget.init();
