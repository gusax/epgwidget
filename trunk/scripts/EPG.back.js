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
 widget*/

if(!EPG)
{
  var EPG = {};
}

if (EPG.debug)
{
  EPG.debug.alert("EPG.back.js loaded");
}

EPG.back = function(debug, growl, settings, skin, translator, UIcreator)
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
  scrollSteps = 10,
  toFront,
  channelListContainer;
  
  // Private methods
  
  function resetChannelListScroll () 
  {
    try
    {
      debug.alert("back.resetChannelListScroll: scrolling to top");
      channelListToScroll.topY = 0;
      channelListToScroll.style.top = channelListToScroll.topY + "em";
    }
    catch (error)
    {
      debug.alert("Error in back.scrollChannelListToTop: " + error);
    }
  }
  
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
      
      return UIcreator.createScalableContainer("topbar", tempElement.cloneNode(true), "uppe.png", "back");
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
      return UIcreator.createScalableContainer("topbarlist", tempElement, "lista-uppe.png", "back");
    }
    catch (error)
    {
     debug.alert("Error in back.createTop: " + error);
    }
  }
  
  function createDoneButton () 
  {
    var tempContainer,
    tempElement,
    tempTextNode;
    try
    {
      /*
       * <div class="scalable middle">
       *  <div class="contents">
       *    <div class="donebutton">[the done button]</div>
       *  </div>
       *  <img class="background" src="skins/back/uppe.png" />
       * </div>
       */
      tempElement = document.createElement("div");
      tempElement.setAttribute("class", "center author");
      
      tempTextNode = document.createTextNode("");
      
      tempElement.appendChild(tempTextNode.cloneNode(false));
      tempElement.firstChild.nodeValue = translator.translate("EPG by") + " Gustav Axelsson. Enjoy :-)";
      
      return UIcreator.createScalableContainer("middle", tempElement.cloneNode(true), "bakgrund.png", "back");
    }
    catch (error)
    {
      debug.alert("Error in back.createBottom: " + error);
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
      tempElement.setAttribute("class", "right donebutton");
      
      tempTextNode = document.createTextNode("");
      
      tempElement.appendChild(tempTextNode.cloneNode(false));
      tempElement.firstChild.nodeValue = translator.translate("Done") + " \u21a9";
      
      return UIcreator.createScalableContainer("bottombar", tempElement.cloneNode(true), "nere.png","back");
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
      return UIcreator.createScalableContainer("bottombarlist", tempElement, "lista-nere.png","back");
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
    tempChannelList,
    i = 0;
    try
    {
      if(channels.length > 0)
      {
        tempChannelList = settings.getChannelList(currentChannelListIndex);
        channelListToScroll = targetElement;
        while(targetElement.firstChild)
        {
          i += 1;
          targetElement.firstChild.removeEventListener("click");
          targetElement.removeChild(targetElement.firstChild);
        }
        //debug.alert("back.createChannelListSuccess: removed " + i + " children from list.\nGot " + channels.length + " channels to print.");
        targetElement.setAttribute("class","channellist");
        tempElement = document.createElement("div");
        tempElement.setAttribute("class", "text");
        tempCheckBox = document.createElement("input");
        tempCheckBox.setAttribute("type","checkbox");
        tempElement.appendChild(tempCheckBox);
        tempTextNode = document.createTextNode("");
        tempElement.appendChild(tempTextNode);
        //tempElement.setAttribute("class","icon");
        i = 0;
        for(index in channels)
        {
          if(channels.hasOwnProperty(index))
          {
            channel = channels[index];
            if(channel.displayName)
            {
              i+=1;
              //debug.alert("adding " + index);
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
        //debug.alert("back.createChannelListSuccess: added " + i + " children to channelList");
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
      channelListContainer = tempContainer;
      return UIcreator.createScalableContainer("channels", tempContainer, "lista-bakgrund.png", "back");
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
      if(window.widget)
      {
        tempContainer.lastChild.addEventListener("click",function(){window.widget.openURL("http://epgwidget.googlecode.com/");}, false);
      }
      else
      {
        tempContainer.lastChild.setAttribute("href", "http://epgwidget.googlecode.com/"); 
      }
      
      tempElement.firstChild.nodeValue = translator.translate("Report a bug...");
      tempContainer.appendChild(tempElement.cloneNode(true));
      if(window.widget)
      {
        tempContainer.lastChild.addEventListener("click",function(){window.widget.openURL("http://code.google.com/p/epgwidget/issues/entry");}, false);
      }
      else
      {
        tempContainer.lastChild.setAttribute("href", "http://code.google.com/p/epgwidget/issues/entry"); 
      }
      
      tempElement.firstChild.nodeValue = translator.translate("Complaints...");
      tempContainer.appendChild(tempElement.cloneNode(true));
      if(window.widget)
      {
        tempContainer.lastChild.addEventListener("click",function(){window.widget.openURL("http://www.geraldbrimacombe.com/Israel/Israel%20-%20Western%20Wall%20Vt.jpg");}, false);
      }
      else
      {
        tempContainer.lastChild.setAttribute("href", "http://www.geraldbrimacombe.com/Israel/Israel%20-%20Western%20Wall%20Vt.jpg"); 
      }
      return UIcreator.createScalableContainer("support", tempContainer, "lista-bakgrund.png","back");
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
      backDiv.appendChild(createListTop(document.createTextNode("\u25b2"))); // arrow up
      backDiv.lastChild.addEventListener("mousedown", function(event){scrollChannelList(event,"up");}, false);
      backDiv.appendChild(createChannelList());
      backDiv.appendChild(createListBottom(document.createTextNode("\u25bc"))); // arrow down
      backDiv.lastChild.addEventListener("mousedown", function(event){scrollChannelList(event,"down");}, false);
      backDiv.appendChild(createListTop());
      backDiv.appendChild(createSupportInfo());
      backDiv.appendChild(createListBottom());
      backDiv.appendChild(createDoneButton());
      backDiv.appendChild(createBottom());
      backDiv.lastChild.addEventListener("mouseup", that.goToFront, false);
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
      }
    },
    
    show: function (toFrontMethod) 
    {
      try
      {
        if (!visible)
        {
          if (window.widget) 
          {
            window.resizeTo(270, 504);
            window.widget.prepareForTransition("ToBack");
          }
          
          toFront = toFrontMethod;
          
          if(!frontDiv)
          {
            frontDiv = document.getElementById("front");
          }
          frontDiv.style.display = "none";
          
          skin.changeToSkinFromList("back");
          
          if(!backDiv)
          {
            backDiv = document.getElementById("back");
            create();
          }
          else
          {
            //reload();
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
    
    goToFront: function (event) 
    {
      try
      {
        if(event && event.stopPropagation)
        {
          event.stopPropagation();
        }
        
        if(toFront)
        {
          that.hide();
          toFront();
        }
        else
        {
          debug.alert("back.goToFront had no toFront method!\nCan't go to front!");
        }
      }
      catch (error)
      {
        debug.alert("Error in back.goToFront: " + error);
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
    },
    
    reloadChannelList: function (channels) 
    {
      try
      {
        if(channels && channelListContainer)
        {
          debug.alert("reloading channel list with " + channels.length + " channels");
          createChannelListSuccess(channels, channelListContainer);
          resetChannelListScroll();
          
        }
      }
      catch (error)
      {
        debug.alert("Error in back.reloadChannelList: " + error);
      }
    }
  };
}(EPG.debug, EPG.growl, EPG.settings, EPG.skin, EPG.translator, EPG.UIcreator);
EPG.back.init();
