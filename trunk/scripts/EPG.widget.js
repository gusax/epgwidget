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

/*extern EPG*/

if (!EPG)
{
  var EPG = {};
}

if (EPG.debug)
{
  EPG.debug.alert("EPG.widget.js loaded");
}

EPG.widget = function (front, back, debug, growl, file, settings, translator)
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
      growl.notifyNow(translator.translate("Found") + " " + channels.length + " " + translator.translate("channels") + "!");
      currentChannelList = settings.getChannelList(currentChannelListIndex);
      growl.notifyNow("List with index " + currentChannelListIndex + " had " + currentChannelList.ordered.length + " channels in it.");
        
      if(!currentChannelList || currentChannelList.ordered.length === 0)
      {
        back.show();
      }
      else
      {
        //front.show();
        back.show();
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
					if(window.widget)
					{
					  window.widget.onshow = that.onshow;
					  window.widget.onhide = that.onhide;
					}
				}
				
				
	 			if(settings.isFirstInstall())
	 			{
	 			  growl.notifyNow(translator.translate("EPG has NOT been installed before!"));
	 			  debug.alert("This is the first time EPG has been run on this computer (by this user)");
	 			  settings.getAllChannels(channelsLoaded);
        
	 			}
	 			else
	 			{
	 			  growl.notifyNow(translator.translate("EPG has been installed before."));
	 			  debug.alert("The EPG widget has been run on this computer (by this user) before.");
	 			  settings.getAllChannels(channelsLoaded);
        
	 			}
			}
			catch (error)
			{
				debug.alert("Error in widget.init: " + error);
			}
		},
		
		onshow: function () 
		{
		  try
		  {
		    debug.alert("Onshow!");
		  }
		  catch (error)
		  {
		    debug.alert("Error in widget.onshow: " + error);
		  }
		},
		
		onhide: function () 
		{
		  try
		  {
		    debug.alert("Onhide!");
		  }
		  catch (error)
		  {
		    debug.alert("Error in widget.onhide: " + error);
		  }
		}
	};
}(EPG.front, EPG.back, EPG.debug, EPG.growl, EPG.file, EPG.settings, EPG.translator);

EPG.widget.init();
