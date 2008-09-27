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

if (EPG.debug)
{
  EPG.debug.inform("EPG.back.js loaded");
}
/**
  * @name EPG.back
  * @static
  * @type object
  * @description The front side of the widget.
  * @param {object} debug EPG.debug.
  * @param {object} growl EPG.growl.
  * @param {object} settings EPG.settings.
  * @param {object} skin EPG.skin.
  * @param {object} translator EPG.translator.
  * @param {object} UIcreator EPG.UIcreator. 
  */
EPG.back = function(debug, growl, settings, skin, translator, UIcreator)
{
  // Private Variables
  var that,
  internalState = "loading",
  visible = false,
  backDiv,
  frontDiv,
  currentChannelList,
  currentChannelListIndex,
  channelListToScroll,
  backSkin = "back",
  scrollSteps = 10,
  toFront,
  channelListContainer,
  topY = 0,
  scrollHeight = 0;
  
  // Private methods
  
  function resetChannelListScroll () 
  {
    try
    {
      topY = 0;
      channelListToScroll.listFrame.style.top = topY + "px";
      scrollHeight = channelListToScroll.scrollHeight;
    }
    catch (error)
    {
      debug.alert("Error in back.scrollChannelListToTop: " + error);
    }
  }
  
  function scrollChannelList (event, direction) 
  {
    try
    {
      var limit, amount;
      
      if(topY === 0)
      {
        scrollHeight = channelListToScroll.scrollHeight;
      }
      limit = -1*(scrollHeight - channelListToScroll.offsetHeight);
      debug.inform("channelListToScroll.scrollHeight = " + channelListToScroll.scrollHeight);
      debug.inform("scrollHeight = " + scrollHeight);
      debug.inform("limit = " + limit);
      if(limit < 0)
      {
        if(direction === "up")
        {
          amount = -105;
        }
        else if(direction === "down")
        {
          amount = 105;
        }
        else if(event.detail)
        {
          amount = event.detail * -1;
        }
        else if(event.wheelDelta)
        {
          amount = event.wheelDelta / 40;
        }
        else
        {
          amount = 0;
        }
        topY += amount;
        
        if(topY > 0)
        {
          topY = 0;
        }
        else if(topY < limit)
        {
          topY = limit;
        }
        
        channelListToScroll.listFrame.style.top = topY + "px";
        
      }
      if(event.stopPropagation)
      {
        event.stopPropagation();
        event.preventDefault();
      }
    }
    catch (error)
    {
      debug.alert("Error in back.scrollChannelList: " + error);
    }
  }
  
  function createTop () 
  {
    try
    {
      var tempElement,
      tempTextNode;
      
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
      tempElement.firstChild.nodeValue = "EPG version " + EPG.currentVersion;
      
      return UIcreator.createScalableContainer("topbar", tempElement.cloneNode(true), "uppe.png", "back");
    }
    catch (error)
    {
     debug.alert("Error in back.createTop: " + error);
    }
  }
  
  function createListTop (contents) 
  {
    try
    {
      var tempElement;
      
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
    try
    {
      var tempContainer,
      tempElement,
      tempTextNode;
    
      /*
       * <div class="scalable middle">
       *  <div class="contents">
       *    <div class="donebutton">[the done button]</div>
       *  </div>
       *  <img class="background" src="skins/back/uppe.png" />
       * </div>
       */
      tempElement = document.createElement("div");
      tempElement.setAttribute("class", "container center author");
      
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
    try
    {
      var tempContainer,
      tempElement,
      tempTextNode;
    
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
      tempElement.setAttribute("title", translator.translate("Click (or press Enter \u21a9) to flip to front."));
      
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
    try
    {
      var tempContainer,
      tempElement;
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
  
  function createChannelListSuccess (channels, targetElement)
  {
    try
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
      
      if(channels.length > 0 && targetElement)
      {
        tempChannelList = settings.getChannelList(currentChannelListIndex);
        channelListToScroll = targetElement;
        while(channelListToScroll.firstChild)
        {
          i += 1;
          try
          {
            channelListToScroll.firstChild.removeEventListener("click"); 
          }
          catch (e)
          {
            debug.warn("back.createChannelListSuccess: removeEventListener failed!");
          }
          channelListToScroll.removeChild(channelListToScroll.firstChild);
        }
        //debug.alert("back.createChannelListSuccess: removed " + i + " children from list.\nGot " + channels.length + " channels to print.");
        channelListToScroll.setAttribute("class","channellist");
        channelListToScroll.appendChild(document.createElement("div"));
        channelListToScroll.listFrame = channelListToScroll.lastChild;
        channelListToScroll.listFrame.style.position = "absolute";
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
                channelListToScroll.listFrame.appendChild(tempElement.cloneNode(true));
                channelListToScroll.listFrame.lastChild.addEventListener("click", function(){return function(event){that.selectChannel(this, event);};}(), false);
                channelListToScroll.listFrame.lastChild.channelID = index;
                
              }
              else
              {
                debug.warn("Ignored channel with id " + index + " since it had no swedish displayName :-(");
              }
            }
          }
        }
        scrollHeight = channelListToScroll.scrollHeight;
        //debug.alert("back.createChannelListSuccess: added " + i + " children to channelList");
      }
      else
      {
        debug.alert("back.createChannelList could not create a channel list!\nchannels = " + channels + ", targetElement = " + targetElement);
      }
    }
    catch (error)
    {
      debug.alert("Error in back.createChannelListSuccess: " + error);
    }
  }
  
  function createChannelList () 
  {
    try
    {
      var tempContainer,
      tempElement,
      tempTextNode;
      
      tempContainer = document.createElement("div");
      tempContainer.setAttribute("class", "text");
      tempContainer.appendChild(document.createElement("div"));
      tempContainer.lastChild.style.textAlign = "center";
      tempTextNode = document.createTextNode(translator.translate("Downloading channels..."));
      tempContainer.lastChild.appendChild(tempTextNode.cloneNode(false));
      
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
    try
    {
      var tempContainer,
      tempElement,
      tempTextNode;
      
      tempContainer = document.createElement("div");
      tempContainer.setAttribute("class", "text");
      tempElement = document.createElement("a");
      tempElement.setAttribute("class", "block");
      tempTextNode = document.createTextNode(translator.translate("http://epgwidget.googlecode.com"));
      tempElement.appendChild(tempTextNode.cloneNode(false));
      tempContainer.appendChild(tempElement.cloneNode(true));
      if(window.widget)
      {
        tempContainer.lastChild.addEventListener("click",function(){window.widget.openURL("http://epgwidget.googlecode.com");}, false);
      }
      else
      {
        tempContainer.lastChild.setAttribute("href", "http://epgwidget.googlecode.com"); 
      }
      
      tempElement.firstChild.nodeValue = translator.translate("http://epgwidget.blogspot.com");
      tempContainer.appendChild(tempElement.cloneNode(true));
      if(window.widget)
      {
        tempContainer.lastChild.addEventListener("click",function(){window.widget.openURL("http://epgwidget.blogspot.com");}, false);
      }
      else
      {
        tempContainer.lastChild.setAttribute("href", "http://epgwidget.blogspot.com"); 
      }
      
      tempElement.firstChild.nodeValue = translator.translate("Help & support...");
      tempContainer.appendChild(tempElement.cloneNode(true));
      if(window.widget)
      {
        tempContainer.lastChild.addEventListener("click",function(){window.widget.openURL("http://code.google.com/p/epgwidget/w/list");}, false);
      }
      else
      {
        tempContainer.lastChild.setAttribute("href", "http://code.google.com/p/epgwidget/w/list"); 
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
  
  /**
   * @memberOf EPG.back
   * @name saveSetting
   * @function
   * @description Saves a setting.
   * @private
   * @param {object} container The settings container holding the setting to save.
   */
  function saveSetting(container)
  {
    try
    {
      if (container.checkBox)
      {
        if (container.checkBox.checked)
        {
          settings.savePreference(container.setting.prefName, container.setting.checkedValue);
        }
        else
        {
          settings.savePreference(container.setting.prefName, container.setting.uncheckedValue);
        }
      }
    }
    catch (error)
    {
      debug.alert("Error in EPG.back.saveSetting: " + error + " (container = " + container + ")");
    }
  }
  
  function createSettingsList () 
  {
    try
    {
      var tempContainer,
      tempElement,
      tempCheckBox,
      tempTextNode,
      settingsArray = [],
      settingsObj,
      aSkin,
      skins,
      index,
      currentSkin,
      skinList,
      skinListItem;
      
      tempContainer = document.createElement("div");
      tempContainer.setAttribute("class", "settingsList");
      tempElement = document.createElement("div");
      tempElement.setAttribute("class", "text withHoverEffect");
      tempCheckBox = document.createElement("input");
      tempCheckBox.setAttribute("type","checkbox");
      tempElement.appendChild(tempCheckBox);
      tempTextNode = document.createTextNode("");
      tempElement.appendChild(tempTextNode);
      
      settingsObj = settingsArray[settingsArray.length] = {};
      settingsObj.prefName = "hideDuration";
      settingsObj.checkedValue = "yes";
      settingsObj.uncheckedValue = "no";
      settingsObj.title = "Hide duration (%).";
      
      for (i = 0; i < settingsArray.length; i += 1)
      {
        tempContainer.appendChild(tempElement.cloneNode(true));
        tempContainer.lastChild.checkBox = tempContainer.lastChild.firstChild; 
        settingsArray[i].value = settings.getPreference(settingsArray[i].prefName);
        tempContainer.lastChild.setting = settingsArray[i];
        if (tempContainer.lastChild.setting.value === tempContainer.lastChild.setting.checkedValue)
        {
          tempContainer.lastChild.firstChild.setAttribute("checked", "checked");
          tempContainer.lastChild.firstChild.checked = true;
        }
        else
        {
          tempContainer.lastChild.firstChild.removeAttribute("checked");
          tempContainer.lastChild.firstChild.checked = false;
        }
        tempContainer.lastChild.lastChild.nodeValue = translator.translate(tempContainer.lastChild.setting.title);
        
        tempContainer.lastChild.checkBox.addEventListener("click", 
        function (container) 
        { 
          return function (event)
          {
            saveSetting (container);
            event.stopPropagation();
            return false;
          };
        }(tempContainer.lastChild), 
        false);
        
        tempContainer.lastChild.addEventListener("click", 
        function (container) 
        { 
          return function (event)
          {
            debug.alert("click");
            container.firstChild.checked = !container.firstChild.checked;
            saveSetting (container);
            event.stopPropagation();
            event.preventDefault();
          };
        }(tempContainer.lastChild), 
        false);
      }
      
      tempContainer.appendChild(tempElement.cloneNode(false));
      tempContainer.lastChild.setAttribute("class", "text");
      
      skins = skin.getAllSkins();
      currentSkin = skin.getSkinForList(settings.getCurrentChannelListIndex());
      skinList = UIcreator.createList("Skin:", 
      "skin", 
      function () 
      {
        skin.saveSkinForList(settings.getCurrentChannelListIndex(), this.value);
      }, 
      tempContainer.lastChild);
      for (index in skins)
      {
        if (skins.hasOwnProperty(index))
        {
          aSkin = skins[index];
          aSkin.value = aSkin.id;
          skinListItem = UIcreator.createListItem(aSkin, skinList);
          if (aSkin.id === currentSkin)
          {
            skinListItem.setAttribute("selected", "selected");
          }
        }
      }
      return UIcreator.createScalableContainer("settings", tempContainer, "lista-bakgrund.png","back");
    }
    catch (error)
    {
      debug.alert("Error in back.createSettingsList: " + error);
    }
  }
  
  function create () 
  {
    try
    {
      var tempElement,
      tempTextNode;
      
      backDiv.appendChild(createTop());
      backDiv.appendChild(createListTop(document.createTextNode("\u25b2"))); // arrow up
      backDiv.lastChild.addEventListener("mousedown", function(event){scrollChannelList(event,"down");}, false);
      backDiv.appendChild(createChannelList());
      backDiv.channelList = backDiv.lastChild;
      backDiv.channelList.addEventListener("DOMMouseScroll", scrollChannelList, false);
      backDiv.channelList.addEventListener("mousewheel", scrollChannelList, false);
      backDiv.appendChild(createListBottom(document.createTextNode("\u25bc"))); // arrow down
      backDiv.lastChild.addEventListener("mousedown", function(event){scrollChannelList(event,"up");}, false);
      backDiv.appendChild(createListTop());
      backDiv.appendChild(createSettingsList());
      backDiv.appendChild(createListBottom());
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
      currentChannelListIndex = settings.getCurrentChannelListIndex();
      document.getElementsByTagName("body")[0].addEventListener("keyup", 
        function(event)
        {
          if(visible && event && event.keyCode === 13)
          {
            that.goToFront(event);
          }
        }, false);
      delete that.init;
    },
    
    show: function (toFrontMethod) 
    {
      try
      {
        if (!visible)
        {
          if (window.widget) 
          {
            settings.resizeTo(270, screen.height, true);
            window.widget.prepareForTransition("ToBack");
            settings.resizeTo(270, document.getElementById("back").offsetHeight);
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
          UIcreator.applyTransparency(settings.getTransparency());
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
          //debug.alert(" div.firstChild = " + div.firstChild);
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
          debug.inform("reloading channel list with " + channels.length + " channels");
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
EPG.PreLoader.resume();