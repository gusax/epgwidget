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

EPG.back = function(debug, growl, settings, skin, translator)
{
  // Private Variables
  var that,
  internalState = "loading",
  visible = false,
  backDiv,
  frontDiv,
  currentChannelList,
  currentChannelListIndex = 0,
  channelListToScroll,
  backSkin = "back",
  scrollSteps = 10;
  
  // Private methods
  
  
  function scrollChannelList (event, direction) 
  {
    var index;
    try
    {
      
      if(!channelListToScroll.topY)
      {
        channelListToScroll.topY = 0;
      }
      
      if(direction === "up")
      {
        if(channelListToScroll.topY < 0)
        {
          channelListToScroll.topY += scrollSteps;
        }
        else
        {
          channelListToScroll.topY = -Math.round((channelListToScroll.offsetHeight - channelListToScroll.parentNode.offsetHeight)/scrollSteps);
        }
      }
      else
      {
        if(channelListToScroll.topY > -Math.round((channelListToScroll.offsetHeight - channelListToScroll.parentNode.offsetHeight)/scrollSteps))
        {
          //debug.alert("channelListToScroll.offsetHeight - channelListToScroll.parentNode.offsetHeight = " + (channelListToScroll.offsetHeight - channelListToScroll.parentNode.offsetHeight));
          //debug.alert("channelListToScroll.topY * 10 = " + (channelListToScroll.topY * 10));
          channelListToScroll.topY -= scrollSteps;
        }
        else
        {
          channelListToScroll.topY = 0; 
        }
      }
      
      channelListToScroll.style.top = channelListToScroll.topY + "em";
      
      if(event.stopPropagation)
      {
        event.stopPropagation();
      }
    }
    catch (error)
    {
      debug.alert("Error in back.scrollChannelList: " + error);
    }
  }
  
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
      tempElement.firstChild.nodeValue = "EPG - " + translator.translate("list") + " " + (currentChannelListIndex + 1);
      
      return createScalableContainer("topbar", tempElement.cloneNode(true), "uppe.png");
    }
    catch (error)
    {
     debug.alert("Error in back.createTop: " + error);
    }
  }
  
  function createListTop (contents) 
  {
    var tempElement;
    try
    {
      tempElement = document.createElement("div");
      
      tempElement.setAttribute("class", "text center");
      if(contents)
      {
        tempElement.appendChild(contents);
      }
      return createScalableContainer("topbarlist", tempElement, "lista-uppe.png");
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
      tempElement.setAttribute("class", "text");
      
      tempTextNode = document.createTextNode("");
      
      tempElement.appendChild(tempTextNode.cloneNode(false));
      tempElement.firstChild.nodeValue = "Visa hjälprutor";
      
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
  
  function createListBottom (contents) 
  {
    var tempContainer,
    tempElement;
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
      
      tempElement.setAttribute("class", "text center");
      if(contents)
      {
        tempElement.appendChild(contents);
      }
      return createScalableContainer("bottombarlist", tempElement, "lista-nere.png");
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
    orderedChannelIDs,
    tempCheckBox,
    tempChannelList;
    try
    {
      if(channels.length > 0)
      {
        tempChannelList = settings.getChannelList(currentChannelListIndex);
        channelListToScroll = targetElement;
        while(targetElement.firstChild)
        {
          targetElement.removeChild(targetElement.firstChild);
        }
        targetElement.setAttribute("class","channellist");
        tempElement = document.createElement("div");
        tempElement.setAttribute("class", "text");
        tempCheckBox = document.createElement("input");
        tempCheckBox.setAttribute("type","checkbox");
        tempElement.appendChild(tempCheckBox);
        tempTextNode = document.createTextNode("");
        tempElement.appendChild(tempTextNode);
        //tempElement.setAttribute("class","icon");
        
        for(index in channels)
        {
          if(channels.hasOwnProperty(index))
          {
            channel = channels[index];
            if(channel.displayName)
            {
              if(channel.displayName.sv)
              {
                tempTextNode.nodeValue = channel.displayName.sv;
                if(tempChannelList && tempChannelList.hashed[index] >= 0)
                {
                  tempCheckBox.setAttribute("checked", "checked");
                }
                else
                {
                  tempCheckBox.removeAttribute("checked");
                }
                targetElement.appendChild(tempElement.cloneNode(true));
                targetElement.lastChild.addEventListener("click", function(event){that.selectChannel(this, event);}, false);
                targetElement.lastChild.channelID = index;
                
              }
              else
              {
                debug.alert("Ignored channel with id " + index + " since it had no swedish displayName :-(");
              }
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
      tempTextNode = document.createTextNode(translator.translate("Downloading channels..."));
      tempContainer.appendChild(tempTextNode.cloneNode(false));
      settings.getAllChannels(function(channels){createChannelListSuccess(channels, tempContainer);}, createChannelListFailure);
      
      return createScalableContainer("channels", tempContainer, "lista-bakgrund.png");
    }
    catch (error)
    {
      debug.alert("Error in back.createMiddle: " + error);
    }
  }
  
  function createSupportInfo () 
  {
    var tempContainer,
    tempElement,
    tempTextNode;
    try
    {
      tempContainer = document.createElement("div");
      tempContainer.setAttribute("class", "text");
      tempElement = document.createElement("a");
      tempElement.setAttribute("class", "block");
      tempTextNode = document.createTextNode(translator.translate("Help & support..."));
      tempElement.appendChild(tempTextNode.cloneNode(false));
      tempContainer.appendChild(tempElement.cloneNode(true));
      
      
      tempElement.firstChild.nodeValue = translator.translate("Report a bug...");
      tempContainer.appendChild(tempElement.cloneNode(true));
      
      tempElement.firstChild.nodeValue = translator.translate("Complaints...");
      tempContainer.appendChild(tempElement.cloneNode(true));
      if(window.widget)
      {
        tempContainer.lastChild.addEventListener("click",function(){window.widget.openURL("http://www.geraldbrimacombe.com/Israel/Israel%20-%20Western%20Wall%20Vt.jpg");}, false);
      }
      return createScalableContainer("support", tempContainer, "lista-bakgrund.png");
    }
    catch (error)
    {
      debug.alert("Error in back.createSupportInfo: " + error);
    }
  }
  
  function create () 
  {
    var tempElement,
    tempTextNode;
    try
    {
      backDiv.appendChild(createTop());
      backDiv.appendChild(createListTop(document.createTextNode("\u25b2")));
      backDiv.lastChild.addEventListener("mousedown", function(event){scrollChannelList(event,"up");}, false);
      backDiv.appendChild(createChannelList());
      backDiv.appendChild(createListBottom(document.createTextNode("\u25bc")));
      backDiv.lastChild.addEventListener("mousedown", function(event){scrollChannelList(event,"down");}, false);
      backDiv.appendChild(createListTop());
      backDiv.appendChild(createSupportInfo());
      backDiv.appendChild(createListBottom());
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
            window.resizeTo(270, 454);
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
    },
    
    selectChannel: function (div, event)
    {
      try
      {
        if(div && div.channelID)
        {
          debug.alert(" div.firstChild = " + div.firstChild);
          if(settings.addChannelToList(div.channelID, currentChannelListIndex))
          {
            div.firstChild.checked = true;
          }
          else
          {
            div.firstChild.checked = false;
          }
        }
      }
      catch (error)
      {
        debug.alert("Error in back.selectChannel: " + error);
      }
    }
  };
}(EPG.debug, EPG.growl, EPG.settings, EPG.skin, EPG.translator);
EPG.back.init();
