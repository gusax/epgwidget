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
EPG.back = function(debug, growl, settings, skin, translator, UIcreator, Filmtipset, GeoLocation)
{
  // Private Variables
  var that,
  internalState = "loading",
  visible = false,
  backDiv,
  frontDiv,
  currentChannelList,
  channelListToScroll,
  backSkin = "back",
  scrollSteps = 10,
  toFront,
  channelListContainer,
  topY = 0,
  scrollHeight = 0,
  categories = [],
  positionSelectorNode,
  MAX_CHANNEL_LISTS = 10,
  channelListSelector,
  skinList;
  
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
      if (channelListToScroll)
      {
        if(topY === 0)
        {
          scrollHeight = channelListToScroll.scrollHeight;
        }
        limit = -1*(scrollHeight - channelListToScroll.offsetHeight);
        if(limit < 0)
        {
          if(direction === "up")
          {
            amount = -1 * Math.round(channelListContainer.offsetHeight * 0.2);
          }
          else if(direction === "down")
          {
            amount = Math.round(channelListContainer.offsetHeight * 0.2);
          }
          else if (event.wheelDeltaX)
          {
            amount = 0;
          }
          else if(event.detail)
          {
            amount = event.detail * -1;
          }
          else if(event.wheelDelta)
          {
            if (settings.safariVersion === 4)
            {
              amount = event.wheelDelta;
            }
            else
            {
              amount = event.wheelDelta / 40;
            }
          }
          else
          {
            amount = 0;
          }
          
          if (Math.abs(amount) > channelListContainer.offsetHeight)
          {
            if (amount < 0)
            {
              amount = -1 * Math.round(channelListContainer.offsetHeight * 0.7);
            }
            else
            {
              amount = Math.round(channelListContainer.offsetHeight * 0.7);
            }
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
      tempTextNode,
      select,
      currentList = settings.getCurrentChannelListIndex();
      
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

      select = document.createElement("select");
      select.setAttribute("id", "channellistdroplist");
      select.setAttribute("name", "channellistdroplist");
      for (i = 0; i < MAX_CHANNEL_LISTS; i += 1)
      {
        select.appendChild(document.createElement("option"));
        select.lastChild.appendChild(document.createTextNode(translator.translate("List") + " " + (i + 1)));
        select.lastChild.setAttribute("value", i);
        if (i === currentList)
        {
          select.lastChild.setAttribute("selected", "selected");
        }
      }
      tempElement.appendChild(select);
      select.addEventListener("change", function(event){changeChannelList(this);}, false);
      channelListSelector = select;
      return UIcreator.createScalableContainer("topbar", tempElement, "uppe.png", "back");
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
      tempElement.firstChild.nodeValue = translator.translate("EPG by") + " Gustav Axelsson. " + translator.translate("Schedules from") + " ";
      tempElement.appendChild(document.createElement("a"));
      tempElement.lastChild.appendChild(document.createTextNode("tv.swedb.se."));
      if(window.widget)
      {
        tempElement.lastChild.addEventListener("click", function(event){window.widget.openURL("http://tv.swedb.se/");} , false);
      }
      else
      {
        tempElement.lastChild.setAttribute("href", "http://tv.swedb.se/"); 
      }
      tempElement.appendChild(document.createElement("br"));
      tempElement.appendChild(tempTextNode.cloneNode(false));
      tempElement.lastChild.nodeValue = translator.translate("Movie ratings from") + " ";
      tempElement.appendChild(document.createElement("a"));
      tempElement.lastChild.appendChild(document.createTextNode("filmtipset.se"));
      if(window.widget)
      {
        tempElement.lastChild.addEventListener("click",function(){window.widget.openURL("http://www.filmtipset.se/");}, false);
      }
      else
      {
        tempElement.lastChild.setAttribute("href", "http://www.filmtipset.se/"); 
      }
      tempElement.appendChild(document.createTextNode(". " + translator.translate("Enjoy") + " :-)"));
      
      return UIcreator.createScalableContainer("middle", tempElement, "bakgrund.png", "back");
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
  
  function createChannelListFailure (textNode, message) 
  {
    try
    {
      debug.alert("Feck! Could not create channellist!");
      if (textNode)
      {
        textNode.nodeValue = translator.translate("Channel list download failed :-( Please check that your internet connection works. If you're using Little Snitch, make sure both EPG and the grabber is permitted to access the Internet.");
      }
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
  
  /**
   * @memberOf EPG.back
   * @name removeChildNodes
   * @function
   * @description Removes child nodes from a parent node.
   * @private
   * @param {object} parentNode Parent node.
   */
  function removeChildNodes(parentNode)
  {
    try
    {
      while(parentNode.firstChild)
      {
        parentNode.removeChild(parentNode.firstChild);
      }
    }
    catch (error)
    {
      debug.alert("Error in EPG.back.removeChildNodes: " + error + " (parentNode = " + parentNode + ")");
    }
  }
  
  /**
   * @memberOf EPG.back
   * @name createBacksideChannelNode
   * @function
   * @description Creates a channel node for the backside
   * @private
   * @param {object} channel Channel object.
   * @param {object} parentNode Parent node.
   * @param {boolean} selected True if checkbox should be selected.
   */
  function createBacksideChannelNode(channel, parentNode, channelID, selected)
  {
    try
    {
      var div,
      locale,
      foundLocale = false;
      if (channel && channel.displayName)
      {
        div = document.createElement("div");
        div.channelID = channelID;
        div.setAttribute("class", "text");
        div.appendChild(document.createElement("input"));
        div.lastChild.setAttribute("type", "checkbox");
        if (selected)
        {
          div.lastChild.setAttribute("checked", "checked");
        }
        else
        {
          div.lastChild.removeAttribute("checked", "checked");
        }
        for (locale in channel.displayName)
        {
          if (channel.displayName.hasOwnProperty(locale))
          {
            div.appendChild(document.createTextNode(channel.displayName[locale]));
            foundLocale = true;
            break;
          }
        }
        if (foundLocale)
        {
          parentNode.appendChild(div);
          div.addEventListener("click", function(){return function(event){that.selectChannel(this, event);};}(), false);
        }
        else
        {
          debug.alert("Found no locale for channel with id " + channelID);
        }
      }
      
    }
    catch (error)
    {
      debug.alert("Error in EPG.back.createBacksideChannelNode: " + error + " (channel = " + channel + ")");
    }
  }
  
  /**
   * @memberOf EPG.back
   * @name createGroupNode
   * @function
   * @description Creates a node for the channel group.
   * @private
   * @param {object} group Channel group.
   */
  function createGroupNode(group, parentNode, channelList, missingChannels, currentChannelList, evenWhenEmpty)
  {
    try
    {
      var heading,
      i,
      channel,
      channelID;
      if (evenWhenEmpty || (group.channels && group.channels.length > 0))
      {
        heading = document.createElement("h2");
        heading.appendChild(document.createTextNode(group.title));
        parentNode.appendChild(heading);
        if (group.channels)
        {
          for (i = 0; i < group.channels.length; i += 1)
          {
            channelID = group.channels[i];
            channel = channelList[channelID];
            if (channel)
            {
              channel.alreadyKnownByWidget = true;
              createBacksideChannelNode(channel, parentNode, channelID, (currentChannelList && currentChannelList.hashed[channelID] >= 0));
            }
            else if (evenWhenEmpty)
            {
              channel = {};
              channel.displayName = {};
              channel.displayName.sv = channelID;
              createBacksideChannelNode(channel, parentNode, channelID, (currentChannelList && currentChannelList.hashed[channelID] >= 0));
            }
            else
            {
              missingChannels[missingChannels.length] = channelID;
            }
          } 
        }
        return true;
      }
      else
      {
        return false;
      }
      
    }
    catch (error)
    {
      debug.alert("Error in EPG.back.createGroupNode: " + error + " (group = " + group + ")");
      return false;
    }
  }
  
  function createBacksideCheckboxNode(parentNode, title, selected, enabled, onClick)
  {
    try
    {
      var div = document.createElement("div");
      div.setAttribute("class", "text");
      div.appendChild(document.createElement("input"));
      div.lastChild.setAttribute("type", "checkbox");
      div.checkbox = div.lastChild;
      div.setSelected = function(selection)
      {
        if (selection)
        {
          div.checkbox.setAttribute("checked", "checked");
        }
        else
        {
          div.checkbox.removeAttribute("checked");
        }
      };
      div.setSelected(selected);
      div.setEnabled = function (enable)
      {
        if (!enable)
        {
          div.checkbox.setAttribute("disabled", "disabled");
        }
        else
        {
          div.checkbox.removeAttribute("disabled");
        }
      };
      div.setEnabled(enabled);
      div.appendChild(document.createTextNode(translator.translate(title)));
      div.text = div.lastChild;
      parentNode.appendChild(div);
      div.addEventListener("click", function(event)
        {
          if (div.checkbox.getAttribute("disabled") !== "disabled")
          {
            if (div.checkbox.getAttribute("checked") === "checked")
            {
              div.setSelected(false);
              if (onClick)
              {
                onClick(false);
              }
            }
            else
            {
              div.setSelected(true);
              if (onClick)
              {
                onClick(true);
              }
            }
          }
        },
        false);
      return div;
    }
    catch (error)
    {
      debug.alert("Error in EPG.back.createBacksideCheckboxNode: " + error);
    }
  }
  
  function updatePositionNodeLocation(location)
  {
    try
    {
      if (positionSelectorNode)
      {
        if (location)
        {
          positionSelectorNode.setEnabled(true);
          if (settings.getChannelListIndexByLocation(location, true) === settings.getCurrentChannelListIndex())
          {
            positionSelectorNode.setSelected(true);
          }
          else
          {
            positionSelectorNode.setSelected(false);
          }
          positionSelectorNode.text.nodeValue = translator.translate("Use when I am in") + " " + location.City + " (" + location.Latitude + " x " + location.Longitude + ")";
          positionSelectorNode.location = location;
        }
        else
        {
          positionSelectorNode.setEnabled(false);
          positionSelectorNode.setSelected(false);
          positionSelectorNode.text.nodeValue = translator.translate("Could not get current location.");
        }
      }
    }
    catch (error)
    {
      debug.alert("Error in EPG.back updatePositionNodeLocation " + error);
    }
  }
  
  function createPositionSelectorNode(parentNode)
  {
    try
    {
      var heading = document.createElement("h2");
      var option;
      var message;
      var enable;
      heading.appendChild(document.createTextNode(translator.translate("Settings for channel list") + " " + (settings.getCurrentChannelListIndex() + 1)));
      parentNode.appendChild(heading);
      if (settings.getPreference("allowGeoLocation") === "yes")
      {
        enable = true;
        message = "Trying to find out current location...";
      }
      else
      {
        enable = false;
        message = "Not allowed to find out current position.";
      }
      positionSelectorNode = createBacksideCheckboxNode(parentNode, message, false, enable,
          function(enabled)
          {
            settings.setChannelListIndexByLocation(positionSelectorNode.location, settings.getCurrentChannelListIndex(), enabled);
          });
      GeoLocation.getLocation(updatePositionNodeLocation,
      function ()
      {
        updatePositionNodeLocation();
      });
    }
    catch (error)
    {
      debug.alert("Error in back.createPositionSelectorNode " + error);
    }
  }
  
  function createChannelListSuccess (channels, targetElement)
  {
    try
    {
      var groupIndex, 
      group,
      currentChannelList,
      channel,
      createdOneGroup = false,
      missingChannels = [],
      channelId,
      tempElement,
      i,
      alreadyFoundMissingChannel,
      fragment = document.createDocumentFragment();
      if (targetElement)
      {
        channelListToScroll = targetElement;
        removeChildNodes(targetElement);
        channelListToScroll.setAttribute("class","channellist");
        channelListToScroll.appendChild(document.createElement("div"));
        channelListToScroll.listFrame = channelListToScroll.lastChild;
        channelListToScroll.listFrame.setAttribute("id", "channellistframe");
        channelListToScroll.listFrame.style.position = "absolute";
        
        currentChannelList = settings.getChannelList(settings.getCurrentChannelListIndex());
        
        createPositionSelectorNode(fragment);
        
        for (groupIndex = 2; groupIndex < categories.length; groupIndex += 1)
        {
          if (createGroupNode(categories[groupIndex], fragment, channels, missingChannels, currentChannelList) && !createdOneGroup)
          {
            createdOneGroup = true;
          }
        }
        // Remove already found new channels
        categories[0].channels = [];
        
        // Look for new channels
        for (channelId in channels)
        {
          if (channels.hasOwnProperty(channelId))
          {
            channel = channels[channelId];
            if (!channel.alreadyKnownByWidget && channelId !== "orderedChannelIDs" && channelId !== "length")
            {
              categories[0].channels[categories[0].channels.length] = channelId;
            }
          }
        }
        tempElement = document.createElement("div");
        // Print new channels
        if (createGroupNode(categories[0], tempElement, channels, missingChannels, currentChannelList))
        {
          channelListToScroll.listFrame.insertBefore(tempElement, channelListToScroll.listFrame.firstChild);
        }
        
        // Look for missing channels in user channel list
        if (currentChannelList)
        {
          for (channelId in currentChannelList.hashed)
          {
            if (currentChannelList.hashed.hasOwnProperty(channelId) && channelId !== "ordered" && channelId !== "hashed")
            {
              if (!channels[channelId])
              {
                alreadyFoundMissingChannel = false;
                for (i = 0; i < missingChannels.length; i += 1)
                {
                  if (missingChannels[i] === channelId)
                  {
                    alreadyFoundMissingChannel = true;
                  }
                }
                
                if (!alreadyFoundMissingChannel)
                {
                  missingChannels[missingChannels.length] = channelId;
                }
              }
            }
          }
        }
        
        // Print missing channels
        if (missingChannels.length > 0)
        {
          categories[1].channels = missingChannels;
          createGroupNode(categories[1], channelListToScroll.listFrame, channels, [], currentChannelList, true);
        }
        
        if (createdOneGroup)
        {
          channelListToScroll.listFrame.appendChild(fragment);
        }
        
        // TODO: write an error message if createdOneGroup is still false
        scrollHeight = channelListToScroll.scrollHeight;
      }
      else
      {
        debug.alert("Back.createChannelListSuccess2 did not get any target element! Cannot create channel list!");
      }
      
    }
    catch (error)
    {
      debug.alert("Error in back.createChannelListSuccess2: " + error + " (channels " + channels + ", targetElement " + targetElement + ")");
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
      tempContainer.lastChild.style.marginRight = "1.5em";
      tempContainer.lastChild.style.marginLeft = "1.5em";
      tempTextNode = document.createTextNode(translator.translate("Downloading channels..."));
      tempContainer.lastChild.appendChild(tempTextNode.cloneNode(false));
      
      settings.getAllChannels(
      function(channels)
      {
        createChannelListSuccess(channels, tempContainer);
      }, 
      function(message)
      {
        createChannelListFailure(tempContainer.lastChild.lastChild, message);
      });
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
      
      tempElement.firstChild.nodeValue = translator.translate("Blog...");
      tempElement.setAttribute("class", "inline");
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
      tempElement.setAttribute("class", "inline");
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
      tempElement.setAttribute("class", "inline");
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
      tempElement.setAttribute("class", "inline");
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
  
  function allowGeoLocationToggle()
  {
    try
    {
      if (settings.getPreference("allowGeoLocation") === "yes")
      {
        GeoLocation.setOkToFetchLocation(true);
        positionSelectorNode.setEnabled(true);
        positionSelectorNode.setSelected(false);
        positionSelectorNode.text.nodeValue = translator.translate("Trying to find out current location...");
        GeoLocation.getLocation(updatePositionNodeLocation, function ()
        {
          updatePositionNodeLocation();
        });
      }
      else
      {
        positionSelectorNode.text.nodeValue = translator.translate("Not allowed to find out current position.");
        positionSelectorNode.setEnabled(false);
        positionSelectorNode.setSelected(false);
        GeoLocation.setOkToFetchLocation(false);
      }
    }
    catch (error)
    {
      debug.alert("Error in EPG.back allowGeoLocationToggle " + error);
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
      skinListItem,
      i,
      ftSetting;
      
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
      
      settingsObj = settingsArray[settingsArray.length] = {};
      settingsObj.prefName = "showHDsymbol";
      settingsObj.checkedValue = "yes";
      settingsObj.uncheckedValue = "no";
      settingsObj.title = "Show [HD] after HD programs.";
      
      settingsObj = settingsArray[settingsArray.length] = {};
      settingsObj.prefName = "allowGeoLocation";
      settingsObj.checkedValue = "yes";
      settingsObj.uncheckedValue = "no";
      settingsObj.title = "Allow EPG to ask for current location.";
      settingsObj.onClick = allowGeoLocationToggle;
      
      settingsObj = settingsArray[settingsArray.length] = {};
      settingsObj.prefName = Filmtipset.PREF_NAME_ENABLED;
      settingsObj.checkedValue = "yes";
      settingsObj.uncheckedValue = "no";
      settingsObj.title = "Show ratings from Filmtipset.se (membership required).";
      for (i = 0; i < settingsArray.length; i += 1)
      {
        tempContainer.appendChild(tempElement.cloneNode(true));
        tempContainer.lastChild.checkBox = tempContainer.lastChild.firstChild; 
        settingsArray[i].value = settings.getPreference(settingsArray[i].prefName);
        tempContainer.lastChild.setting = settingsArray[i];
        if (settingsArray[i].value === "yes")
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
        
        if (settingsArray[i].prefName === Filmtipset.PREF_NAME_ENABLED)
        {
          ftSetting = {};
          ftSetting.setting = settingsArray[i];
          ftSetting.container = tempContainer.lastChild;
          ftSetting.checked = tempContainer.lastChild.firstChild.checked;
        }
        else
        {
          tempContainer.lastChild.checkBox.addEventListener("click", 
              function (container) 
              { 
                return function (event)
                {
                  saveSetting(container);
                  if (container.setting.onClick)
                  {
                    container.setting.onClick();
                  }
                  event.stopPropagation();
                  event.preventDefault();
                  return false;
                };
              }(tempContainer.lastChild), 
              false);
          tempContainer.lastChild.addEventListener("click", 
          function (container) 
          { 
            return function (event)
            {
              container.firstChild.checked = !container.firstChild.checked;
              saveSetting(container);
              if (container.setting.onClick)
              {
                container.setting.onClick();
              }
              event.stopPropagation();
              event.preventDefault();
            };
          }(tempContainer.lastChild), 
          false);
        }
      }
      
      tempContainer.appendChild(tempElement.cloneNode(false));
      tempContainer.lastChild.setAttribute("class", "textNoHover");
      
      tempContainer.lastChild.appendChild(document.createTextNode(translator.translate("Filmtipset.se user number:")));
      tempContainer.lastChild.appendChild(document.createElement("input"));
      tempContainer.lastChild.theInput = tempContainer.lastChild.lastChild;
      tempContainer.lastChild.lastChild.style.marginLeft = "0.7em";
      tempContainer.lastChild.lastChild.style.width= "8em";
      tempContainer.lastChild.lastChild.setAttribute("type", "text");
      tempContainer.lastChild.lastChild.setAttribute("maxlength", "8");
      
      if (ftSetting)
      {
        if (ftSetting.checked)
        {
          tempContainer.lastChild.theInput.disabled = "";
          tempContainer.lastChild.theInput.className = "text";
        }
        else
        {
          tempContainer.lastChild.theInput.disabled = "disabled";
          tempContainer.lastChild.theInput.className = "text disabled";
        }
        ftSetting.container.checkBox.addEventListener("click", 
            function (container, checkBox, input) 
            { 
              return function (event)
              {
                try
                {
                  if (checkBox.checked)
                  {
                    input.disabled = "";
                    input.className= "text";
                  }
                  else
                  {
                    input.disabled = "disabled";
                    input.className = "text disabled";
                  }
                  saveSetting(container);
                  
                  event.stopPropagation();
                }
                catch (error2)
                {
                  debug.alert("ftSetting onclick error " + error2);
                }
              };
            }(ftSetting.container, ftSetting.container.checkBox, tempContainer.lastChild.theInput), 
            false);
        ftSetting.container.addEventListener("click", 
          function (container, input) 
          { 
            return function (event)
            {
              try
              {
                container.firstChild.checked = !container.firstChild.checked;
                if (container.firstChild.checked)
                {
                  input.disabled = "";
                  input.className = "text";
                }
                else
                {
                  input.disabled = "disabled";
                  input.className = "text disabled";
                }
                saveSetting(container);
                
                event.stopPropagation();
                event.preventDefault();
              }
              catch (error2)
              {
                debug.alert("ftSetting onclick error " + error2);
              }
            };
          }(ftSetting.container, tempContainer.lastChild.theInput), 
          false);
      }
      
      if (settings.getPreference(Filmtipset.PREF_NAME_USER_ID) * 1 >= 0)
      {
        tempContainer.lastChild.lastChild.setAttribute("value", settings.getPreference(Filmtipset.PREF_NAME_USER_ID));
      }
      tempContainer.lastChild.lastChild.addEventListener("input",
          function (input) 
          {
            return function (event)
            {
              var number;
              if (input.value * 1 >= 0 || input.value === "")
              {
                if (input.style.backgroundColor !== "#fff")
                {
                  input.style.backgroundColor = "#fff";
                }
                Filmtipset.setUserId(input.value);
              }
              else
              {
                input.style.backgroundColor = "#f00";
              }
            };
          }(tempContainer.lastChild.lastChild), false);
      tempContainer.lastChild.appendChild(document.createElement("a"));
      tempContainer.lastChild.lastChild.appendChild(document.createTextNode(translator.translate("(Shown here...)")));
      if(window.widget)
      {
        tempContainer.lastChild.lastChild.addEventListener("click", function(){window.widget.openURL("http://www.filmtipset.se/yourpage.cgi");}, false);
      }
      else
      {
        tempContainer.lastChild.lastChild.setAttribute("href", "http://www.filmtipset.se/yourpage.cgi"); 
      }
      
      tempContainer.appendChild(tempElement.cloneNode(false));
      tempContainer.lastChild.setAttribute("class", "textNoHover");
      
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
          if (aSkin.author)
          {
            aSkin.title = translator.translate(aSkin.title) + " - " + translator.translate("by") + " " + aSkin.author;
          }
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
      settings.resizeTo(474, 648); // So that the keep/remove dialog on first install does not flow outside the screen.
    }
    catch (error)
    {
      debug.alert("Error in back.create: " + error);
    }
  }
  
  function groupChannels(title, channels)
  {
    try
    {
      var obj = {};
      obj.title = translator.translate(title);
      if (channels)
      {
        obj.channels = channels;
      }
      else
      {
        obj.channels = [];
      }
      categories[categories.length] = obj;
    }
    catch (error)
    {
      debug.alert("Error in back.groupChannels: " + error);
    }
  }

  function changeSkinDropDownList(listIndex)
  {
    var currentSkin = skin.getSkinForList(listIndex);
    for (i = 0; i < skinList.childNodes.length; i += 1)
    {
      if (skinList.childNodes[i].value === currentSkin)
      {
        skinList.selectedIndex = i;
        break;
      }
    }
  }
  
  function switchToChannelList(newListIndex)
  {
    if (newListIndex !== settings.getCurrentChannelListIndex())
    {
      settings.setCurrentChannelListIndex(1 * newListIndex);
      settings.getAllChannels(
          function(channels)
          {
            that.reloadChannelList(channels);
          },
          function()
          {
            try
            {
              resetChannelListScroll(); 
              createChannelListFailure(channelListContainer);
            }
            catch (error2)
            {
              debug.alert("Error in back.show when trying to update channel list: " + error2);
            }
          },
          true);
    }
  }
  
  function changeChannelList(option)
  {
    switchToChannelList(option.value);
    changeSkinDropDownList(option.value);
  }
  
  // Public methods
  return {
    init: function()
    {
      if(!that)
      {
        that = this;
      }
      groupChannels("New");
      groupChannels("Removed or renamed");
      groupChannels("Swedish", 
      [
        "svt1.svt.se",
        "svtb-kunskap.svt.se",
        "svt2.svt.se",
        "svt24.svt.se",
        "tv3.viasat.se",
        "hd.svt.se",
        "tv4.se",
        "plus.tv4.se",
        "kanal5.se",
        "kanal9.se",
        "tv6.viasat.se",
        "tv7.nu"
      ]);
      groupChannels("Documentaries & nature", 
      [
        "nordic.discovery.com",
        "tv8.se",
        "nordic.science.discovery.com",
        "explorer.viasat.se",
        "world.discovery.com",
        "history.viasat.se",
        "hd.discovery.com",
        "nature.viasat.se",
        "nordic.travel.discovery.com",
        "nordic.animalplanet.discovery.com",
        "fakta.tv4.se",
        "axess.se",
        "kunskapskanalen.svt.se",
        "ngcsverige.com",
        "hd.ngcsverige.com"
      ]);
      groupChannels("Movies", 
      [
        "film.tv4.se",
        "tv1000.viasat.se",
        "action.canalplus.se",
        "plus-1.tv1000.viasat.se",
        "comedy.canalplus.se",
        "action.tv1000.viasat.se",
        "drama.canalplus.se",
        "classic.tv1000.viasat.se",
        "filmhd.canalplus.se",
        "family.tv1000.viasat.se",
        "first.canalplus.se",
        "hd.tv1000.viasat.se",
        "hits.canalplus.se",
        "nordic.tv1000.viasat.se",
        "sf.canalplus.se",
        "drama.tv1000.viasat.se",
        "hits-sport-weekend.canalplus.se"
      ]);
      groupChannels("Sport", 
      [
        "eurosport.com",
        "sport.tv4.se",
        "eurosport2.eurosport.com",
        "fotboll.viasat.se",
        "se.nasn.com",
        "golf.viasat.se",
        "sport1.canalplus.se",
        "hockey.viasat.se",
        "sport2.canalplus.se",
        "motor.viasat.se",
        "sport-extra.canalplus.se",
        "sport.viasat.se",
        "sporthd.canalplus.se",
        "sporthd.viasat.se"
      ]);
      groupChannels("Children & youth", 
      [ 
        "svtb.svt.se",
        "disneychannel.se",
        "nickelodeon.se",
        "playhouse.disneychannel.se",
        "nordic.mtve.com",
        "xd.disneychannel.se",
        "tv400.tv4.se"
      ]
      );
      groupChannels("Music", 
      [
        "vh1.com",
        "mtv2.mtve.com",
        "ztv.se",
        "hd.mtve.com"
      ]);
      groupChannels("Nordic", 
      [
        "dr1.dr.dk",
        "dr2.dr.dk"
      ]);
      groupChannels("European", 
      [
        "world.svt.se"
      ]);
      groupChannels("Radio", 
      [
        "p1.sr.se",
        "p3.sr.se",
        "p2.sr.se"
      ]);
      groupChannels("Other", 
      [
        "guld.tv4.se",
        "viasat-nature-nick.spa.se",
        "komedi.tv4.se",
        "se.comedycentral.tv",
        "sf.tv4.se"
      ]);
      groupChannels("PPV",
      [
        "ppv1.canalplus.se",
        "ppv8.canalplus.se",
        "ppv2.canalplus.se",
        "ppvsport1.canalplus.se",
        "ppv3.canalplus.se",
        "ppvsport2.canalplus.se",
        "ppv4.canalplus.se",
        "ppvsport3.canalplus.se",
        "ppv5.canalplus.se",
        "ppvsport4.canalplus.se",
        "ppv6.canalplus.se",
        "ppvsport5.canalplus.se",
        "ppv7.canalplus.se"
      ]);
      
      document.addEventListener("keydown", 
        function(event)
        {
          if(visible && event)
          {
            if (event.keyCode === 13)
            {
              that.goToFront(event);
            }
            else if (event.keyCode === 38)
            {
              scrollChannelList(event,"down");
            }
            else if (event.keyCode === 40)
            {
              scrollChannelList(event,"up");
            }
            else if (event.keyCode === 32)
            {
              if (event.shiftKey)
              {
                scrollChannelList(event,"down");
              }
              else
              {
                scrollChannelList(event,"up");
              }
            }
          }
        }, false);
      GeoLocation.addEventListener(updatePositionNodeLocation);
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
            settings.resizeTo(474, screen.height, true);
            window.widget.prepareForTransition("ToBack");
            settings.resizeTo(474, document.getElementById("back").offsetHeight);
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
            settings.getAllChannels(
            function(channels)
            {
              var i;
              var currentChannelListIndex = settings.getCurrentChannelListIndex();
              for (i = 0; i < channelListSelector.childNodes.length; i += 1)
              {
                if (channelListSelector.childNodes[i].value * 1 === currentChannelListIndex)
                {
                  channelListSelector.selectedIndex = i;
                  break;
                }
              }
              changeSkinDropDownList(currentChannelListIndex);
              that.reloadChannelList(channels);
              settings.resizeTo(474, 648); // So that the keep/remove dialog on first install does not flow outside the screen.
            },
            function()
            {
              try
              {
                resetChannelListScroll(); 
                createChannelListFailure(channelListContainer);
                settings.resizeTo(474, 648); // So that the keep/remove dialog on first install does not flow outside the screen.
              }
              catch (error2)
              {
                debug.alert("Error in back.show when trying to update channel list: " + error2);
              }
            },
            true);
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
          if(settings.addChannelToList(div.channelID, settings.getCurrentChannelListIndex()))
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
}(EPG.debug, EPG.growl, EPG.settings, EPG.skin, EPG.translator, EPG.UIcreator, EPG.Filmtipset, EPG.GeoLocation);
EPG.back.init();
EPG.PreLoader.resume();