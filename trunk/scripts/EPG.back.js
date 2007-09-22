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
  EPG.debug.alert("EPG.back.js loaded");
}

EPG.back = function(debug, growl, settings, skin)
{
  // Private Variables
  var that,
  internalState = "loading",
  visible = false,
  backDiv,
  frontDiv,
  currentChannelList,
  currentChannelListIndex = 0,
  backSkin = "back";
  
  // Private methods
  function createScalableContainer (className, contents, backgroundImage) 
  {
    var tempContainer,
    tempElement,
    tempTextNode;
    try
    {
      /*
       * <div class="top">
       *  <div class="contents"></div>
       *  <img class="background"/>
       * </div>
       */
      tempContainer = document.createElement("div");
      tempElement = tempContainer.cloneNode(false);
      tempTextNode = document.createTextNode("");
      
      tempContainer.setAttribute("class","scalable " + className);
      
      tempElement.setAttribute("class","contents");
      
      tempContainer.appendChild(tempElement.cloneNode(false));
      
      tempContainer.firstChild.appendChild(contents);
      
      tempElement = document.createElement("img");
      tempElement.setAttribute("class", "background");
      tempElement.setAttribute("src", "skins/" + skin.getCurrentSkin() + "/" + backgroundImage);
      
      tempContainer.appendChild(tempElement.cloneNode(false));
      
      return tempContainer;
    }
    catch (error)
    {
      debug.alert("Error in back.createScalableContainer: " + error);
    }
  }
  
  function createTop () 
  {
    var tempElement,
    tempTextNode;
    try
    {
      /*
       * <div class="scalable top">
       *  <div class="contents">
       *    <div class="text">EPG - list 1</div>
       *  </div>
       *  <img class="background" src="skins/back/uppe.png" />
       * </div>
       */
      tempElement = document.createElement("div");
      tempTextNode = document.createTextNode("");
      
      tempElement.setAttribute("class", "text");
      tempElement.appendChild(tempTextNode.cloneNode(false));
      tempElement.firstChild.nodeValue = "EPG - list " + (currentChannelListIndex + 1);
      
      return createScalableContainer("topbar", tempElement.cloneNode(true), "uppe.png");
    }
    catch (error)
    {
     debug.alert("Error in back.createTop: " + error);
    }
  }
  
  function createBottom () 
  {
    var tempContainer,
    tempElement,
    tempTextNode;
    try
    {
      /*
       * <div class="scalable bottom">
       *  <div class="contents">
       *    <div class="text">bottom</div>
       *  </div>
       *  <img class="background" src="skins/back/uppe.png" />
       * </div>
       */
      tempElement = document.createElement("div");
      tempTextNode = document.createTextNode("");
      
      tempElement.setAttribute("class", "text");
      tempElement.appendChild(tempTextNode.cloneNode(false));
      tempElement.firstChild.nodeValue = "bottom";
      
      return createScalableContainer("bottombar", tempElement.cloneNode(true), "nere.png");
    }
    catch (error)
    {
      debug.alert("Error in back.createBottom: " + error);
    }
  }
  
  function createChannelListFailure () 
  {
    try
    {
      debug.alert("Feck! Could not create channellist!");
    }
    catch (error)
    {
      debug.alert("Error in back.createChannelListFailure: " + error);
    }
  }
  
  function createChannelListSuccess (channels, targetElement)
  {
    var channel,
    index,
    tempElement,
    tempTextNode,
    parentNode,
    orderedChannelIDs;
    try
    {
      if(channels.length > 0)
      {
        
        while(targetElement.firstChild)
        {
          targetElement.removeChild(targetElement.firstChild);
        }
        targetElement.setAttribute("class","channellist");
        tempElement = document.createElement("div");
        tempElement.setAttribute("class", "text");
        tempTextNode = document.createTextNode("");
        tempElement.appendChild(tempTextNode);
        //tempElement.setAttribute("class","icon");
        
        for(index in channels)
        {
          channel = channels[index];
          if(channel.displayName)
          {
            if(channel.displayName.sv)
            {
              tempTextNode.nodeValue = channel.displayName.sv;
              targetElement.appendChild(tempElement.cloneNode(true));
            }
            else if(channel.displayName.en)
            {
              tempTextNode.nodeValue = channel.displayName.en;
              targetElement.appendChild(tempElement.cloneNode(true));
            }
            else
            {
              debug.alert("Ignored channel with id " + index + " since it had no (localized) displayName :-(");
            }
          }
        }
      }
    }
    catch (error)
    {
      debug.alert("Error in back.createChannelListSuccess: " + error);
    }
  }
  
  function createChannelList () 
  {
    var tempContainer,
    tempElement,
    tempTextNode;
    try
    {
      tempContainer = document.createElement("div");
      tempContainer.setAttribute("class", "text");
      tempTextNode = document.createTextNode("Downloading channels...");
      tempContainer.appendChild(tempTextNode.cloneNode(false));
      settings.getAllChannels(function(channels){createChannelListSuccess(channels, tempContainer);}, createChannelListFailure);
      
      return createScalableContainer("channels", tempContainer, "bakgrund.png");
    }
    catch (error)
    {
      debug.alert("Error in back.createMiddle: " + error);
    }
  }
  
  function create () 
  {
    var tempElement,
    tempTextNode;
    try
    {
      tempElement = document.createElement("div");
      tempTextNode = document.createTextNode("");
      backDiv.appendChild(createTop());
      backDiv.appendChild(createChannelList());
      backDiv.appendChild(createBottom());
    }
    catch (error)
    {
      debug.alert("Error in back.create: " + error);
    }
  }
  
  // Public methods
  return {
    init: function()
    {
      if(!that)
      {
        that = this;
        frontDiv = document.getElementById("front");
      }
    },
    
    show: function () 
    {
      try
      {
        if (!visible)
        {
          if (window.widget) 
          {
            window.resizeTo(270, 300);
            window.widget.prepareForTransition("ToBack");
          }
          
          frontDiv.style.display = "none";
          skin.setSkin("back");
          
          if(!backDiv)
          {
            backDiv = document.getElementById("back");
            create();
          }
          
          backDiv.style.display="block";
          visible = true;
          if(window.widget)
          {
            setTimeout(function(){window.widget.performTransition();}, 300);
          }
        }
      }
      catch (error)
      {
        debug.alert("Error in back.show: " + error);
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
        debug.alert("Error in back.hide: " + error);
      }
    }
  };
}(EPG.debug, EPG.growl, EPG.settings, EPG.skin);
EPG.back.init();
