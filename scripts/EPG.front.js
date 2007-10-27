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

if(!EPG)
{
  var EPG = {};
}

if (EPG.debug)
{
  EPG.debug.alert("EPG.front.js loaded");
}

EPG.front = function(debug, growl, settings, skin, translator)
{
  // Private Variables
  var that,
  internalState = "loading",
  visible = false,
  backDiv,
  frontDiv,
  infoButton,
  toBack,
  currentChannelListID;
  
  // Private methods
  
  function createTopBar () 
  {
    try
    {
      
    }
    catch (error)
    {
      debug.alert("Error in front.createTopBar: " + error);
    }
  }
  
  function createInfoButton () 
  {
    
    try
    {
      if(!infoButton)
      {
        infoButton = document.createElement("div");
        infoButton.setAttribute("id", "infobutton");
        infoButton.appendChild(document.createTextNode("i"));
        frontDiv.appendChild(infoButton);
        infoButton.addEventListener("click", that.goToBack, false);
      }
    }
    catch (error)
    {
      debug.alert("Error in front.createInfobutton: " + error);
    }
  }
  
  function createBottomBar () 
  {
    try
    {
      createInfoButton();
    }
    catch (error)
    {
      debug.alert("Error in front.createBottomBar: " + error);
    }
  }
  
  function create () 
  {
    try
    {
      //createTopBar();
      createInfoButton();
      //createBottomBar();
    }
    catch (error)
    {
      debug.alert("Error in front.create: " + error);
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
    
    show: function (toBackMethod, channelListID, widgetJustStarted) 
    {
      try
      {
        if (!visible)
        {
          if(!backDiv)
          {
            backDiv = document.getElementById("back");
          }
          
          if(!widgetJustStarted)
          {
            if (window.widget) 
            {
              window.resizeTo(270, 504);
              window.widget.prepareForTransition("ToFront");
            }
            
            backDiv.style.display = "none";
          }
          
          if(typeof(channelListID) !== "undefined")
          {
            currentChannelListID = channelListID;
          }
          else
          {
            debug.alert("front.show: Tried to show front without a specified channelListID!");
          }
          skin.changeToSkinFromList(currentChannelListID);
          
          toBack = toBackMethod;
          
          if(!frontDiv)
          {
            frontDiv = document.getElementById("front");
            create();
          }
          else
          {
            //reload();
          }
          
          frontDiv.style.display="block";
          visible = true;
          if(window.widget)
          {
            setTimeout(function(){window.widget.performTransition();}, 300);
          }
        }
      }
      catch (error)
      {
        debug.alert("Error in front.show: " + error);
      }
    },
    
    hide: function () 
    {
      try
      {
        visible = false;
      }
      catch (error)
      {
        debug.alert("Error in front.hide: " + error);
      }
    },
    
    goToBack: function (event) 
    {
      try
      {
        if(event && event.stopPropagation)
        {
          event.stopPropagation();
        }
        if(toBack)
        {
          that.hide();
          toBack();
        }
        else
        {
          debug.alert("front.goToBack had no toBack method!\nCan't go to back!");
        }
      }
      catch (error)
      {
        debug.alert("Error in front.goToBack: " + error);
      }
    }
  };
}(EPG.debug, EPG.growl, EPG.settings, EPG.skin, EPG.translator);
EPG.front.init();
