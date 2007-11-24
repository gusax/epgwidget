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
	currentSide,
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
      if(window.widget)
      {
        window.widget.onshow = that.onshow;
        window.widget.onhide = that.onhide;
      }
           
      //growl.notifyNow(translator.translate("Found") + " " + channels.length + " " + translator.translate("channels") + "!");
      currentChannelList = settings.getChannelList(currentChannelListIndex);
      
      if(currentChannelList && currentChannelList.ordered && currentChannelList.ordered.length > 0)
      {
        //growl.notifyNow("List with index " + currentChannelListIndex + " had " + currentChannelList.ordered.length + " channels in it.");
        that.toFront(true);
        //that.toBack();
      }
      else
      {
        if(!currentChannelList)
        {
          growl.notifyNow("List with index " + currentChannelListIndex + " did not exist! Switching to backside!");
        }
        else
        {
          growl.notifyNow("List with index " + currentChannelListIndex + " had no channels in it! Switching to backside!");
        }
        front.hide();
        that.toBack();
      
      }
    }
    catch (error)
    {
      debug.alert("Error in widget.channelsLoaded: " + error);
    }
  }
  
  
  function channelsLoadedFailed() 
  {
    try
    {
      growl.notifyNow("Could not load any channels :-( - does your internet connection work?");
      that.toFront(true);
    }
    catch (error)
    {
      debug.alert("Error in widget.channelLoadedFailed: " + error);
    }
  }
	
	
	function afterOnShow (channels) 
	{
	  try
	  {
	    if(currentSide === back)
	    {
	      //debug.alert("Reloading backside");
	      back.reloadChannelList(channels);
	    }
	    else
	    {
	    	front.reloadIcons();
	    	front.reloadPrograms();
	    }
	  }
	  catch (error)
	  {
	    debug.alert("Error in widget.afterOnShow: " + error);
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
	 			  //growl.notifyNow(translator.translate("EPG has NOT been installed before!"));
	 			  debug.alert("This is the first time EPG has been run on this computer (by this user)");
	 			  settings.getAllChannels(channelsLoaded, channelsLoadedFailed);
          settings.installGrabber(); // this should probably wait until the user has added one channel
	 			}
	 			else
	 			{
	 			  //growl.notifyNow(translator.translate("EPG has been installed before."));
	 			  //debug.alert("The EPG widget has been run on this computer (by this user) before.");
	 			  settings.getAllChannels(channelsLoaded, channelsLoadedFailed);
        
	 			}
	 			
	 			delete init;
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
		    settings.getAllChannels(afterOnShow, channelsLoadedFailed);
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
		    front.removeDragElement();
		    debug.alert("Onhide!");
		    // Stop all refresh-timers
		    // Delete all old programs once every day.
		  }
		  catch (error)
		  {
		    debug.alert("Error in widget.onhide: " + error);
		  }
		},
		
		toFront: function (widgetJustStarted) 
		{
		  try
		  {
		    currentSide = front;
		    front.show(that.toBack, currentChannelListIndex, widgetJustStarted);
		  }
		  catch (error)
		  {
		    debug.alert("Error in widget.toFront: " + error);
		  }
		},
		
		toBack: function () 
		{
		  try
		  {
		    currentSide = back;
		    back.show(that.toFront);
		  }
		  catch (error)
		  {
		    debug.alert("Error in widget.toBack: " + error);
		  }
		}
	};
}(EPG.front, EPG.back, EPG.debug, EPG.growl, EPG.file, EPG.settings, EPG.translator);

EPG.widget.init();
