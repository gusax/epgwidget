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

if (EPG.debug)
{
  EPG.debug.inform("EPG.widget.js loaded");
}
/**
  * @name EPG.widget
  * @static
  * @type object
  * @description Host?
  * @param {object} front EPG.front.
  * @param {object} back EPG.back.
  * @param {object} debug EPG.debug.
  * @param {object} growl EPG.growl.
  * @param {object} file EPG.file.
  * @param {object} settings EPG.settings.
  * @param {object} translator EPG.translator.
  * @param {object} ProgramInfo EPG.ProgramInfo.
  */
EPG.widget = function (front, back, debug, growl, file, settings, translator, ProgramInfo, GeoLocation)
{
	// Private variables
	var that,
	internalState = "loading",
	currentSide,
	downloadingChannels = false;
	
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
	
	function proceed(currentChannelList)
	{
	  try
    {
      if(currentChannelList && currentChannelList.ordered && currentChannelList.ordered.length > 0)
      {
        that.toFront(true);
      }
      else
      {
        front.hide();
        that.toBack();
      }
    }
    catch (error)
    {
      debug.alert("widget proceed error " + error);
    }
	}
	
  function channelsLoaded(channels) 
  {
    try
    {
      downloadingChannels = false;
      if(window.widget)
      {
        window.widget.onshow = that.onshow;
        window.widget.onhide = that.onhide;
      }
      if (settings.getPreference("allowGeoLocation") === "yes")
      {
        GeoLocation.setOkToFetchLocation(true);
        GeoLocation.getLocation(function (location)
            {
              try
              {
                debug.inform("widget.channelsLoaded got location " + location.Longitude + " " + location.Latitude + " " + location.City);
                proceed(settings.getChannelList(settings.getChannelListIndexByLocation(location)));
              }
              catch (error)
              {
                debug.alert("widget gotLocation1 error " + error);
              }
            },
            function ()
            {
              try
              {
                debug.inform("widget.channelsLoaded got no location when asking for one, using previous channel list");
                proceed(settings.getChannelList(settings.getCurrentChannelListIndex()));
              }
              catch (error)
              {
                debug.alert("widget didNotGetLocation1 error " + error);
              }
            });
      }
      else
      {
        GeoLocation.setOkToFetchLocation(false);
        proceed(settings.getChannelList(settings.getCurrentChannelListIndex()));
      }
      setTimeout(function()
      {
        if (EPG.PreLoader && EPG.PreLoader.destroy)
        {
          EPG.PreLoader.destroy();
        } 
      }, 250);
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
      debug.alert("Could not load any channels :-( - does your internet connection work?");
      
      if(!downloadingChannels)
      {
        downloadingChannels = true;
        settings.downloadChannelList(
        function()
        {
          debug.inform("widget.channelsLoadedFailed: Downloaded missing channel list, trying to open file after download...");
          settings.getAllChannels(channelsLoaded, channelsLoadedFailed);
        }, 
        channelsLoadedFailed);
      }
      else
      {
        downloadingChannels = false;
        front.hide();
        that.toBack();
      }
      if (EPG.PreLoader && EPG.PreLoader.destroy)
      {
        EPG.PreLoader.destroy();
      }
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
	      debug.inform("widget afterOnShow reloading channel list on backside because current side is backside");
	      back.reloadChannelList(channels);
	    }
	    else
	    {
	      debug.inform("widget afterOnShow running front.onShow");
	      front.onShow();
	    }
	  }
	  catch (error)
	  {
	    debug.alert("Error in widget.afterOnShow: " + error);
	  }
	}
	
	function start (callback)
	{
	  try
	  {
  	  if (settings.getPreference("allowGeoLocation") === "yes")
      {
        GeoLocation.setOkToFetchLocation(true);
        GeoLocation.getLocation(function(location)
            {
              debug.inform("widget.onshow got location " + location.Longitude + " " + location.Latitude + " " + location.City);
              settings.getAllChannels(callback, channelsLoadedFailed, true);
            },
            function ()
            {
              debug.inform("widget onshow got no location when asking for one");
              settings.getAllChannels(callback, channelsLoadedFailed, true);
            });
      }
      else
      {
        GeoLocation.setOkToFetchLocation(false);
        settings.getAllChannels(callback, channelsLoadedFailed, true);
      }
	  }
	  catch (error)
	  {
	    debug.alert("Error in widget.start: " + error);
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
	 			  debug.inform("This is the first time EPG has been run on this computer (by this user)");
	 			  settings.getAllChannels(channelsLoaded, channelsLoadedFailed);
          settings.installGrabber(); // this should probably wait until the user has added one channel
	 			}
	 			else
	 			{
	 			  debug.inform("The EPG widget has been run on this computer (by this user) before.");
	 			  settings.updateGrabber();
	 			  start(channelsLoaded);
	 			}
	 			
	 			delete that.init;
			}
			catch (error)
			{
				debug.alert("Error in widget.init: " + error + " settings = " + settings);
			}
		},
		
		onshow: function () 
		{
		  try
		  {
		    debug.inform("----------- Onshow! -----------");
		    start(afterOnShow);
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
		    front.hide();
		    debug.inform("----------- Onhide! -----------");
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
		    front.show(that.toBack, widgetJustStarted);
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
}(EPG.front, EPG.back, EPG.debug, EPG.growl, EPG.file, EPG.settings, EPG.translator, EPG.ProgramInfo, EPG.GeoLocation);
EPG.widget.init();
EPG.PreLoader.resume();