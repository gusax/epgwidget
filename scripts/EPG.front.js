/*extern EPG*/
if (EPG.debug)
{
  EPG.debug.inform("EPG.front.js loaded");
}
/**
  * @name EPG.front
  * @static
  * @type object
  * @description The front side of the widget.
  * @param {object} Debug EPG.debug.
  * @param {object} Growl EPG.growl.
  * @param {object} Settings EPG.settings.
  * @param {object} Skin EPG.skin.
  * @param {object} Translator EPG.translator.
  * @param {object} UIcreator EPG.UIcreator. 
  * @param {object} File EPG.file. 
  */
EPG.front = function (Debug, Growl, Settings, Skin, Translator, UIcreator, File, ProgramInfo, Filmtipset) 
{
  // Private Variables
  var that,
  currentView = 0, // 0 = now next later, 1 = dayview
  visible = false,
  backDiv,
  frontDiv,
  topBar,
  topBarContainer,
  bottomBarContainer,
  overviewDiv,
  dayViewDiv,
  dayViewNode,
  channelNodes = {},
  infoButton,
  toBack,
  currentChannelListIndex = Settings.getCurrentChannelListIndex(),
  width = 270, // program info is 223 but placed 19 px into list, so total width is 474 when program info is visible 
  height = 80,
  dragElement,
  updateInterval,
  key = {},
  scrollFrame,
  hideDuration = false,
  updateAvailable,
  scrollInterval,
  showHDsymbol = false,
  showFtScore = false,
  waitingForScore = [],
  tooTallForScreen = false,
  overviewTimeout,
  dayViewTimeout;
  
  key.ARROW_UP = 38;
  key.ARROW_DOWN = 40;
  key.BACKSPACE = 8;
  key.COMMA = 188;
  key.SPACE = 32;
  
  key.ZERO = 48;
  key.ONE = 49;
  key.TWO = 50;
  key.THREE = 51;
  key.FOUR = 52;
  key.FIVE = 53;
  key.SIX = 54;
  key.SEVEN = 55;
  key.EIGHT = 56;
  key.NINE = 57;
  
  key.N_ZERO = 96;
  key.N_ONE = 97;
  key.N_TWO = 98;
  key.N_THREE = 99;
  key.N_FOUR = 100;
  key.N_FIVE = 101;
  key.N_SIX = 102;
  key.N_SEVEN = 103;
  key.N_EIGHT = 104;
  key.N_NINE = 105;
  
  key.T = 84;
  
  // Private methods
  /**
   * @memberOf EPG.front
   * @name createTopBar
   * @function
   * @description Creates the topmost bar on the widget.
   * @return {object} An element (div tag) representing the top bar.
   * @private
   */
  function createTopBar()  
  {
    try
    {
      topBar = document.createElement("div");
      topBar.setAttribute("class", "text");
      topBar.setAttribute("id", "topbarText");
      topBar.setAttribute("title", Translator.translate("Type four numbers to jump forward up to 24 hours, backspace returns current time. (Examples: 2030 for 20:30, 0615 for 06:15.)"));
      
      topBar.appendChild(document.createTextNode("EPG: "));
      topBar.appendChild(document.createTextNode(Translator.translate("overview")));
      topBar.heading = topBar.lastChild;
      topBar.appendChild(document.createElement("div"));
      topBar.lastChild.setAttribute("id", "topbardate");
      topBar.dateContainer = topBar.lastChild;
      topBar.lastChild.appendChild(document.createElement("span"));
      topBar.lastChild.lastChild.appendChild(document.createTextNode("\u2190"));
      topBar.prevDateButton = topBar.lastChild.lastChild.firstChild;
      topBar.lastChild.appendChild(document.createElement("span"));
      topBar.lastChild.lastChild.appendChild(document.createTextNode(" 2010-08-10 "));
      topBar.date = topBar.lastChild.lastChild.firstChild;
      topBar.lastChild.appendChild(document.createElement("span"));
      topBar.lastChild.lastChild.appendChild(document.createTextNode("\u2192"));
      topBar.nextDateButton = topBar.lastChild.lastChild.firstChild;
      topBarContainer = UIcreator.createScalableContainer("topbar", topBar, "uppe.png", currentChannelListIndex);
      topBarContainer.style.width = "27em";
      topBarContainer.style.height = "4.8em";
      //UIcreator.setPosition(topBarContainer, "0em", "0em", "27em", "4.8em", 99, "absolute");
      topBarContainer.style.overflow = "hidden";
      return topBarContainer;
    }
    catch (error)
    {
      Debug.alert("Error in front.createTopBar: " + error);
    }
  }
  
  /**
   * @memberOf EPG.front
   * @name stopEvent
   * @function
   * @description Stops the propagation of an event.
   * @private
   * @param {object} event The event.
   */
  function stopEvent(event)
  {
    try
    {
      if (event && event.stopPropagation)
      {
        event.stopPropagation();
        event.preventDefault();
      }
    }
    catch (error)
    {
      Debug.alert("Error in front.stopEvent: " + error + " (event = " + event + ")");
    }
  }
  
  /**
   * @memberOf EPG.front
   * @name newVersionAvailable
   * @function
   * @description Runs whenever a new version is available.
   * @private
   * @param {object} updateInfo Information about the update.
   */
  function newVersionAvailable(updateInfo)
  {
    try
    {
      if (updateInfo && updateAvailable)
      {
        updateAvailable.style.display = "block";
        if (!updateAvailable.hasEventListener)
        {
          updateAvailable.hasEventListener = true;
          updateAvailable.updateInfo = updateInfo;
          updateAvailable.addEventListener("click", 
          function (event)
          {
            if (window.widget)
            {
              if (event.altKey)
              {
                window.widget.openURL(updateAvailable.updateInfo.stable.fileUrl);
              }
              else
              {
                window.widget.openURL(updateAvailable.updateInfo.stable.blogUrl);
              }
            }
            else if (event.altKey)
            {
              window.location = updateAvailable.updateInfo.stable.fileUrl;
            }
            else
            {
              window.location = updateAvailable.updateInfo.stable.blogUrl;
            }
            return stopEvent(event);
          },
          false);
        }
      }
    }
    catch (error)
    {
      Debug.alert("Error in EPG.front.newVersionAvailable: " + error + " (updateInfo = " + updateInfo + ")");
    }
  }
  
  /**
   * @memberOf EPG.front
   * @name createInfoButton
   * @function
   * @description Creates the infobutton shown on the front of the widget.
   * @private
   */
  function createInfoButton() 
  {
    try
    {
      if (!infoButton)
      {
        infoButton = document.createElement("div");
        infoButton.setAttribute("id", "infobutton");
        infoButton.setAttribute("title", Translator.translate("Click (or press \u2318-,) to flip to backside."));
        infoButton.appendChild(document.createTextNode("i"));
        infoButton.addEventListener("click", that.goToBack, false);
        return infoButton;
      }
    }
    catch (error)
    {
      Debug.alert("Error in front.createInfobutton: " + error);
    }
  }
  
  /**
   * @memberOf EPG.front
   * @name createBottomBar
   * @function
   * @description Creates the bar at the bottom of the widget.
   * @private
   * @return {object} An element (div tag) representing the bottom bar.
   */
  function createBottomBar() 
  {
    try
    {
      var tempContainer,
      tempElement,
      tempDiv,
      tempTextNode,
      resizers = [];
      /*
       * <div class="scalable bottom">
       *  <div class="contents">
       *    <div class="text">bottom</div>
       *  </div>
       *  <img class="background" src="skins/back/uppe.png" />
       * </div>
       */
      tempContainer = document.createElement("div");
      tempContainer.setAttribute("class", "container");
      tempContainer.setAttribute("id", "bottombarText");
      tempDiv = document.createElement("div");
      tempDiv.setAttribute("class", "resizer");
      
      tempElement = document.createElement("a");
      tempElement.setAttribute("class", "smallertext");
      
      tempTextNode = document.createTextNode("");
      
      tempElement.appendChild(tempTextNode.cloneNode(false));
      tempElement.firstChild.nodeValue = "A";
      tempDiv.appendChild(tempElement);
      tempContainer.appendChild(tempDiv.cloneNode(true));
      resizers.push(tempContainer.lastChild);
      tempContainer.lastChild.addEventListener("click", function ()
      {
        Settings.resizeText(-1);
      }, false);
      tempElement.setAttribute("class", "normaltext");
      tempContainer.appendChild(tempDiv.cloneNode(true));
      resizers.push(tempContainer.lastChild);
      tempContainer.lastChild.addEventListener("click", function ()
      {
        Settings.resizeText(0);
      }, false);
      tempElement.setAttribute("class", "biggertext");
      tempContainer.appendChild(tempDiv.cloneNode(true));
      resizers.push(tempContainer.lastChild);
      tempContainer.lastChild.addEventListener("click", function ()
      {
        Settings.resizeText(1);
      }, false);
      tempContainer.appendChild(tempDiv.cloneNode(false));
      updateAvailable = tempContainer.lastChild;
      updateAvailable.appendChild(document.createTextNode("\u27a0 " + Translator.translate("Update available!")));
      updateAvailable.setAttribute("id", "updateAvailable");
      updateAvailable.style.fontSize = "1.3em";
      updateAvailable.style.display = "none";
      UIcreator.setPosition(updateAvailable, "4em", "-0.1em", "13em", "1.1em", 1, "absolute");
      tempContainer.appendChild(createInfoButton());
      bottomBarContainer =  UIcreator.createScalableContainer("bottombar", tempContainer, "nere.png", currentChannelListIndex);
      bottomBarContainer.style.width = "27em";
      bottomBarContainer.style.height = "3.2em";
      bottomBarContainer.resizers = resizers;
      //UIcreator.setPosition(bottomBarContainer, "0em", "4.8em", "27em", "3.2em", 99, "absolute");
      return bottomBarContainer;
    
    }
    catch (error)
    {
      Debug.alert("Error in front.createBottomBar: " + error);
    }
  }
  
  /**
   * @memberOf EPG.front
   * @name couldNotFindLogo
   * @function
   * @description Run if a logo could not be found (for example if it has been deleted from the harddrive)
   * @private
   * @param {string} channelID ID of the channel that the logo belongs to.
   */
  function couldNotFindLogo(channelID)
  {
    try
    {
      var channel;
      
      Debug.warn("Could not find logo for channel with ID " + channelID + "!");
      Settings.getChannel(channelID);
      if (channel && channel.icon)
      {
        //File.downloadLogoForChannel(channelID) 
      }
      else
      {
        // Alert the user that he can place his own icons in ~/Images/EPGWidget
      }
      //File.downloadLogoForChannel(channelID)
    }
    catch (error)
    {
      Debug.alert("Error in front.couldNotFindLogo: " + error + " (channelID = " + channelID + ")");
    }
  }
  
  /**
   * @memberOf EPG.front
   * @name switchChannelNodes
   * @function
   * @description Switches two channel nodes.
   * @private
   */
  function switchChannelNodes(channelNode) 
  {
    try
    {
      var parentNode,
      i,
      dragElementPosition = -1,
      channelNodePosition = -1,
      currentNode,
      dragElementID,
      channelNodeID;
      
      parentNode = channelNode.parentNode;
      for (i = 0; i < parentNode.childNodes.length; i += 1)
      {
        currentNode = parentNode.childNodes[i];
        if (currentNode === channelNode)
        {
          channelNodePosition = i;
          if (dragElementPosition >= 0)
          {
            break;
          }
        }
        else if (currentNode === dragElement)
        {
          dragElementPosition = i;
          if (channelNodePosition >= 0)
          {
            break;
          }
        }
      }
      // Backup channelIDs
      channelNodeID = channelNode.channelID;
      dragElementID = dragElement.channelID;
      // Switch nodes
      parentNode.removeChild(dragElement);
      if (dragElementPosition < channelNodePosition)
      {
        parentNode.insertBefore(dragElement, channelNode.nextSibling);
      }
      else
      {
        parentNode.insertBefore(dragElement, channelNode);
      }
      // Switch IDs
      /*Debug.inform("channelNode.channelID = " + channelNode.channelID + " replaced with " + dragElementID);
      channelNode.channelID = dragElementID;
      Debug.inform("dragElement.channelID = " + dragElement.channelID + " replaced with " + channelNodeID);
      dragElement.channelID = channelNodeID;
      // Switch positions in channelNodes hash table
      channelNodes[channelNodeID] = dragElement;
      channelNodes[dragElementID] = channelNode;*/
    }
    catch (error)
    {
      Debug.alert("Error in front.switchChannelNodes: " + error);
    }
  }
  
  /**
     * @memberOf EPG.front
     * @name saveCurrentChannelOrder
     * @function 
     * @description Creates a string with the current channel ordering.
     * @private
     * @return {string} Comma separated string with the current channel order.
     */
  function saveCurrentChannelOrder() 
  {
    try
    {
      var i,
      length,
      childNodes,
      channelOrder = [],
      channelsHash = {},
      channelList,
      position;
      
      childNodes = overviewDiv.childNodes;
      length = childNodes.length;
      if (length > 0)
      {
        for (i = 0; i < length; i += 1)
        {
          if (typeof childNodes[i].channelID !== "undefined" && childNodes[i].style.display !== "none")
          {
            position = channelOrder.length;
            channelOrder[position] = childNodes[i].channelID;
            channelsHash[channelOrder[position]] = position;
          }
        }
      }
      
      channelList = Settings.getChannelList(currentChannelListIndex);
      if (channelList && channelList.ordered)
      {
        channelList.ordered = channelOrder;
        channelList.hashed = channelsHash;
        Settings.saveChannelList(currentChannelListIndex);
      }
      
    }
    catch (error)
    {
      Debug.alert("Error in front.saveChannelOrder: " + error);
    }
  }
  
  /**
   * @memberOf EPG.front
   * @name startChannelDrag
   * @function
   * @description Starts the drag of one channel.
   * @private
   * @param {object} event The event that caused the drag to start (most likely a mouse down event).
   * @param {object} channelNode The channelNode (or rather the scalable container containing the channelNode) beeing dragged.
   */
  function startChannelDrag(event, channelNode)
  {
    try
    {
      stopEvent(event);
      if (dragElement !== channelNode)
      {
        dragElement = channelNode;
        //Debug.inform("Started dragging element: " + dragElement);
      }
    }
    catch (error)
    {
      Debug.alert("Error in front.startChannelDrag: " + error + " (event = " + event + ")");
    }
  }
  
  /**
   * @memberOf EPG.front
   * @name continueChannelDrag
   * @function
   * @description Continues a channel drag. Fired when the mouse pointer is beeing moved on top of a channelNode
   * @private
   * @param {object} event The event (mouse move).
   * @param {object} channelNode The current channelNode that the mouse is over.
   */
  function continueChannelDrag(event, channelNode)
  {
    try
    {
      stopEvent(event);
      if (dragElement && channelNode && dragElement !== channelNode)
      {
        //Debug.inform("Dragged over element: " + channelNode);
        dragElement.hasBeenDragged = true;
        switchChannelNodes(channelNode);
      }
    }
    catch (error)
    {
      Debug.alert("Error in front.continueChannelDrag: " + error + " (event = " + event + ")");
    }
  }
  
  /**
   * @memberOf EPG.front
   * @name updateTopBar
   * @function
   * @description Updates the text on the top bar.
   * @private
   * @param {string} channelID ID of active channel (in case of dayview)
   */
  function updateTopBar(channelID, date)
  {
    try
    {
      var channel;
      
      if (currentView === 0)
      {
        topBar.setAttribute("title", "");
        topBar.heading.nodeValue = topBar.heading.overview;
        if (topBar.dateContainer.top !== "3.4")
        {
          topBar.dateContainer.top = "3.4";
          topBar.dateContainer.style.top = topBar.dateContainer.top + "em";
        }
      }
      else if (currentView === 1)
      {
        channel = Settings.getChannel(channelID);
        if (topBar.dateContainer.top !== "2.4")
        {
          topBar.dateContainer.top = "2.4";
          topBar.dateContainer.style.top = topBar.dateContainer.top + "em";
        }
        topBar.date.nodeValue = " " + Settings.getYYYYMMDD(date) + " ";
        if (channel && channel.displayName)
        {
          if (channel.displayName.sv)
          {
            topBar.setAttribute("title", channel.displayName.sv);
            topBar.heading.nodeValue = channel.displayName.sv;  
          }
          else if (channel.displayName.en)
          {
            topBar.setAttribute("title", channel.displayName.en);
            topBar.heading.nodeValue = channel.displayName.en;
          }
          else
          {
            topBar.setAttribute("title", "");
            topBar.heading.nodeValue = Translator.translate("day view");
          }
        }
        else
        {
          topBar.setAttribute("title", "");
          topBar.heading.nodeValue = Translator.translate("day view");
        }
      }
    }
    catch (error)
    {
      Debug.alert("Error in EPG.front.updateTopBar: " + error + " (channelID = " + channelID + ")");
    }
  }
  
  /**
   * @memberOf EPG.front
   * @name dimChannelNode
   * @function
   * @description Dims a channel node.
   * @private
   * @param {object} channelNode Node that should be dimmed.
   * @param {boolean} reverse True to reverse effect (make node visible again).
   */
  function dimChannelNode(channelNode, reverse)
  {
    try
    {
      if (reverse)
      {
        channelNode.logo.style.opacity = "0.8";
        channelNode.programsNode.style.opacity = "1";
      }
      else
      {
        channelNode.logo.style.opacity = "0.3";
        channelNode.programsNode.style.opacity = "0";
      }
    }
    catch (error)
    {
      Debug.alert("Error in EPG.front.dimChannelNode: " + error + " (channelNode = " + channelNode + ")");
    }
  }
  
  /**
   * @memberOf EPG.front
   * @name dimAllChannelNodesExcept
   * @function
   * @description Dims all channel nodes except the specified one.
   * @private
   * @param {object} channelNode Node that should be left alone.
   * @param {boolean} reverse True to reverse effect (make channel nodes visible again).
   */
  function dimAllChannelNodesExcept(channelNode, reverse)
  {
    try
    {
      var id, node;
      
      for (id in channelNodes)
      {
        if (channelNodes.hasOwnProperty(id))
        {
          node = channelNodes[id];
          if (channelNode === node)
          {
            dayViewNode = channelNode;
            if (reverse)
            {
              channelNode.logo.style.opacity = "0.8";
              channelNode.programsNode.style.opacity = "1";
            }
            else
            {
              channelNode.logo.style.opacity = "0.8";
              channelNode.programsNode.style.opacity = "0";
            }
          }
          else
          {
            dimChannelNode(channelNodes[id], reverse);
          }
        }
      }
    }
    catch (error)
    {
      Debug.alert("Error in EPG.front.dimAllChannelNodesExcept: " + error);
    }
  }
  
  /**
   * @memberOf EPG.front
   * @name fillDayViewFailed
   * @function
   * @description Runs if an error happened when day view programs.
   * @private
   */
  function fillDayViewFailed() 
  {
    try
    {
      Debug.alert("front.fillDayViewFailed: Could not get programs :-(");
    }
    catch (error)
    {
      Debug.alert("Error in EPG.front.fillDayViewFailed: " + error);
    }
  }
  
  /**
   * @memberOf EPG.front
   * @name applySkin
   * @function
   * @description Applies a skin.
   * @private
   * @param {string} skinId ID of skin.
   */
  function applySkin(skinId)
  {
    try
    {
      var index, channelNode;
      
      topBarContainer.updateSkin(skinId);
      
      for (index in channelNodes)
      {
        if (channelNodes.hasOwnProperty(index))
        {
          channelNodes[index].updateSkin(skinId);
        }
      }
      
      bottomBarContainer.updateSkin(skinId);
      
      ProgramInfo.updateSkin(skinId);
    }
    catch (error)
    {
      Debug.alert("Error in EPG.front.applySkin: " + error + " (skinId = " + skinId + ")");
    }
  }
  
  /**
   * @memberOf EPG.front
   * @name deletePhantomChannel
   * @function
   * @description Deletes a phantom channel (a channel that has been renamed for example) from the front side.
   * @private
   * @param {string} channelID ID of channel that should be deleted.
   */
  function deletePhantomChannel(channelID)
  {
    try
    {
      var channelListIndex = Settings.getCurrentChannelListIndex(), 
      channelNode = channelNodes[channelID];
      channelNode.parentNode.removeChild(channelNode);
      Settings.removeChannelFromList(channelID, channelListIndex);
      that.resize();
    }
    catch (error)
    {
      Debug.alert("Error in EPG.front.deletePhantomChannel: " + error + " (channelID = " + channelID + ")");
    }
  }
  
  /**
   * @memberOf EPG.front
   * @name createDayView
   * @function
   * @description Creates a placeholder for the day view
   * @private
   * @return {object} An element (div tag) containing all channels.
   */
  function createDayView() 
  {
    try
    {
      dayViewDiv = document.createElement("div");
      dayViewDiv.setAttribute("id", "dayView");
      UIcreator.setPosition(dayViewDiv, "5.7em", "0em", "19.3em", false, 4, "absolute");
      dayViewDiv.style.opacity = "0";
      dayViewDiv.style.zIndex = "-1";
      return dayViewDiv;
    }
    catch (error)
    {
      Debug.alert("Error in front.createChannelList: " + error);
    }
  }
  
  /**
   * @memberOf EPG.front
   * @name createOverview
   * @function
   * @description Creates the list of channels shown on the front of the widget. (now next later)
   * @private
   * @return {object} An element (div tag) containing all channels.
   */
  function createOverview() 
  {
    try
    {
      var index,
      channelList,
      orderedList;
      
      overviewDiv = document.createElement("div");
      overviewDiv.topY = 0;
      overviewDiv.setAttribute("id", "overview");
      UIcreator.setPosition(overviewDiv, "0em", "0em", false, false, false, "relative");
      overviewDiv.style.overflow = "hidden";
      
      return overviewDiv;
    }
    catch (error)
    {
      Debug.alert("Error in front.createChannelList: " + error);
    }
  }
  
  /**
   * @memberOf EPG.front
   * @name updateClock
   * @function
   * @description Updates the clock.
   * @private
   * @param {string} time The time to print at the top bar.
   */
  function updateClock(time)
  {
    try
    {
      //Debug.inform("Front.updateClock: time = " + time);
      if (typeof time  === "string")
      {
        topBar.heading.overview = time;
      }
      else if (typeof time  === "object" && time.getHours)
      {
        topBar.heading.overview = Settings.getHHMM(time);
      }
      else
      {
        topBar.heading.overview = Translator.translate("overview");
      }
      if (currentView === 0)
      {
        topBar.heading.nodeValue = topBar.heading.overview;
      }
    }
    catch (error)
    {
      Debug.alert("Error in EPG.front.updateClock: " + error + " (time = " + time + ")");
    }
  }
  
  /**
   * @memberOf EPG.front
   * @name stopUpdateInterval
   * @function
   * @description Stops the update interval.
   * @private
   */
  function stopUpdateInterval()
  {
    try
    {
      if (updateInterval)
      {
        if (updateInterval.type === "timeout")
        {
          clearTimeout(updateInterval.timeout);
        }
        else
        {
          clearInterval(updateInterval.interval);
        }
        updateInterval = false;
      }
    }
    catch (error)
    {
      Debug.alert("Error in EPG.front.stopUpdateInterval: " + error);
    }
  }
  
  /**
   * @memberOf EPG.front
   * @name addKeyToHistory
   * @function
   * @description Adds currently pressed key to key history.
   * @private
   * @param {number} number Number on the key pressed.
   */
  function addKeyToHistory(number)
  {
    try
    {
      var num, time, hour, minute;
      //Debug.inform("number " + number);
      if (typeof key.firstKey !== "number" && number < 3) // first number, must be 0, 1 or 2
      {
        key.firstKey = number;
        updateClock(key.firstKey + "_:__");
      }
      else if (key.firstKey >= 0)
      {
        if (typeof key.secondKey !== "number")
        {
          key.secondKey = number;
          num = (key.firstKey + "" + key.secondKey) * 1;
          if (num > 24)
          {
            delete key.secondKey;
          }
          else 
          {
            if (num === 24) // replace 24 with 00
            {
              key.firstKey = 0;
              key.secondKey = 0;
            }
            updateClock(key.firstKey + "" + key.secondKey + ":__");
          }
        }
        else if (key.secondKey >= 0)
        {
          if (typeof key.thirdKey !== "number" && number < 6)
          {
            key.thirdKey = number;
            updateClock(key.firstKey + "" + key.secondKey + ":" + key.thirdKey + "_");
          }
          else if (key.thirdKey >= 0 && typeof key.forthKey !== "number")
          {
            key.forthKey = number;
            time = new Date();
            time = new Date(time.getFullYear(), time.getMonth(), time.getDate(), (key.firstKey + "" + key.secondKey) * 1, (key.thirdKey + "" + key.forthKey) * 1); // To to specified time
            
            if (time < new Date())
            {
              time = new Date(new Date().getTime() + 86400000); // jump to tomorrow 
              time = new Date(time.getFullYear(), time.getMonth(), time.getDate(), (key.firstKey + "" + key.secondKey) * 1, (key.thirdKey + "" + key.forthKey) * 1); // To to specified time
              updateClock(key.firstKey + "" + key.secondKey + ":" + key.thirdKey + "" + key.forthKey + " " + Translator.translate("tomorrow"));
            }
            else
            {
              updateClock(key.firstKey + "" + key.secondKey + ":" + key.thirdKey + "" + key.forthKey + " " + Translator.translate("today"));
            }
            //Debug.inform("time = " + time);
            stopUpdateInterval();
            that.reloadPrograms(time, true);
            delete key.firstKey;
            delete key.secondKey;
            delete key.thirdKey;
            delete key.forthKey;
            
          }
        }
      }
    }
    catch (error)
    {
      Debug.alert("Error in EPG.front.addKeyToHistory: " + error + " (number = " + number + ")");
    }
  }
  
  /**
   * @memberOf EPG.front
   * @name scrollDayView
   * @function
   * @description Scrolls front side.
   * @private
   */
  function scrollDayView(event, amount) 
  {
    try
    {
      var limit;
      if (currentView === 1)
      {
        if (typeof amount === "undefined")
        {
          if (event.detail)
          {
            amount = event.detail * -1;
          }
          else if (event.wheelDelta)
          {
            amount = event.wheelDelta / 40;
            scrollFrame.dayView.style.webkitTransition = "";
            clearTimeout(dayViewTimeout);
            dayViewTimeout = setTimeout(function ()
            {
              scrollFrame.dayView.style.webkitTransition = "top 0.3s ease-out";
            }, 100);
          }
          else
          {
            amount = 0;
          }
        }
        limit = -1 * (scrollFrame.dayView.scrollHeight - scrollFrame.offsetHeight) - 5;
        if (limit < 0)
        {
          scrollFrame.dayView.topY = scrollFrame.dayView.topY + amount;
          if (scrollFrame.dayView.topY > 0)
          {
            //startBounceback(amount, 0);
            scrollFrame.dayView.topY = 0;
            if (scrollInterval)
            {
              clearInterval(scrollInterval);
            }
          }
          else if (scrollFrame.dayView.topY < limit)
          {
            //startBounceback(amount, limit);
            scrollFrame.dayView.topY = limit;
            if (scrollInterval)
            {
              clearInterval(scrollInterval);
            }
          }
          scrollFrame.dayView.style.top = scrollFrame.dayView.topY + "px";
        }
        if (event)
        {
          if (updateInterval)
          {
            clearInterval(scrollInterval);
          }
          event.preventDefault();
          event.stopPropagation();
        }
      }
    }
    catch (error)
    {
      Debug.alert("Error in EPG.front.scrollDayView: " + error);
    }
  }
  
  /**
   * @memberOf EPG.front
   * @name scrollFront
   * @function
   * @description Scrolls front side.
   * @private
   */
  function scrollFront(event, amount) 
  {
    try
    {
      var limit,
      index;
      if (currentView === 0)
      {
        if (!tooTallForScreen)
        {
          if (event)
          {
            event.preventDefault();
            event.stopPropagation();
          }
          return;
        }
        if (typeof amount === "undefined")
        {
          if (event.detail)
          {
            amount = event.detail * -1;
          }
          else if (event.wheelDeltaX)
          {
            // Side scrolling
            //Debug.inform("Front scrollFront would have scrolled sideways: " + (event.wheelDeltaX / 40));
            amount = 0;
          }
          else if (event.wheelDelta)
          {
            if (Settings.safariVersion === 4)
            {
              amount = event.wheelDelta;
            }
            else
            {
              amount = event.wheelDelta / 40;
            }
            overviewDiv.removeAttribute("id");
            clearTimeout(overviewTimeout);
            overviewTimeout = setTimeout(function ()
            {
              overviewDiv.setAttribute("id", "overview");
            }, 100);
          }
          else
          {
            amount = 0;
          }
        }
              
        limit = -1 * (scrollFrame.scrollHeight - scrollFrame.offsetHeight);
        if (limit < 0)
        {
          overviewDiv.topY = overviewDiv.topY + amount;
          if (overviewDiv.topY > 0)
          {
            //startBounceback(amount, 0);
            overviewDiv.topY = 0;
          }
          else if (overviewDiv.topY < limit)
          {
            //startBounceback(amount, limit);
            overviewDiv.topY = limit;
          }
          overviewDiv.style.top = overviewDiv.topY + "px";
        }
        event.preventDefault();
        event.stopPropagation();
      }
      else if (currentView === 1)
      {
        scrollDayView(event, amount);
      }
    }
    catch (error)
    {
      Debug.alert("Error in EPG.front.scrollFront: " + error);
    }
  }
  
  function setFtScore(pNode)
  {
    try
    {
      var score;
      if (pNode && pNode.program && pNode.program.title)
      {
        if (pNode.program.filmtipsetgrade)
        {
          if (pNode.program.filmtipsetgrade.value * 1 > 0)
          {
            pNode.ftScoreNode.firstChild.nodeValue = Filmtipset.getStars(pNode.program.filmtipsetgrade, pNode.program.watched);
            pNode.ftScoreNode.style.display = "inline";
          }
          else
          {
            pNode.ftScoreNode.style.display = "none";
          }
        }
      }
      else
      {
        pNode.ftScoreNode.style.display = "none";
      }
    }
    catch (error)
    {
      Debug.alert("EPG.front setFtScore error " + error);
    }
  }
  
  function fixTitle(locale, program)
  {
    try
    {
      var l;
      for (l in program.title)
      {
        if (program.title.hasOwnProperty(l) && l !== locale)
        {
          program.title[locale] = program.title[l];
          return;
        }
      }
    }
    catch (error)
    {
      Debug.alert("EPG.front fixTitle error " + error);
    }
  }
  
  function ftAddToQueue(pNode)
  {
    pNode.ftScoreNode.style.display = "none";
    if (pNode.program && pNode.program.title)
    {
      if (!pNode.program.title.sv)
      {
        fixTitle("sv", pNode.program);
      }
      if (!waitingForScore[pNode.program.title.sv.toLowerCase()])
      {
        waitingForScore[pNode.program.title.sv.toLowerCase()] = [];
      }
      waitingForScore[pNode.program.title.sv.toLowerCase()].push(pNode);
    }
  }
  
  function ftCallback(program)
  {
    try
    {
      var callbacks,
      score,
      pNode;
      if (!program.title.sv)
      {
        fixTitle("sv", program);
      }
      callbacks = waitingForScore[program.title.sv.toLowerCase()];
      if (showFtScore && callbacks)
      {
        if (callbacks.length > 0)
        {
          score = callbacks[0].filmtipsetgrade;
          while (callbacks.length > 0)
          {
            pNode = callbacks.shift();
            pNode.program.filmtipsetgrade = program.filmtipsetgrade;
            pNode.program.imdbgrade = program.imdbgrade;
            pNode.program.imdbid = program.imdbid;
            setFtScore(pNode);
          }
        }
        else
        {
          delete waitingForScore[program.title.sv.toLowerCase()];
        }
      }
    }
    catch (error)
    {
      Debug.alert("EPG.front ftCallback " + error);
    }
  }
  
  /**
   * @memberOf EPG.front
   * @name updateProgramNode
   * @function
   * @description Updates the text in a programNode.
   * @private
   * @param {object} programsNode The programsNode.
   * @param {object} program The program containing the new info.
   */
  function updateProgramNode(programNode, program)
  {
    try
    {
      var i,
      startDate,
      start,
      locale;
      
      if (program && program !== programNode.program)
      {
        if (programNode.titleNode.parentNode.isAnimating)
        {
          if (programNode.titleNode.parentNode.animationType === "interval")
          {
            clearInterval(programNode.titleNode.parentNode.isAnimating);
          }
          else if (programNode.titleNode.parentNode.animationType === "timeout")
          {
            clearTimeout(programNode.titleNode.isAnimating);
          }
          programNode.titleNode.parentNode.isAnimating = false;
          delete programNode.titleNode.parentNode.animationType;
          programNode.titleNode.parentNode.xPos = 0;
          programNode.titleNode.parentNode.style.left = "0px";
        }
        programNode.program = program;
        if (program.isTheEmptyProgram)
        {
          programNode.startNode.nodeValue = "";
          programNode.titleNode.nodeValue = "- " + Translator.translate("No program") + " -";
          programNode.hdSymbolNode.nodeValue = "";
        }
        else
        {
          startDate = new Date(program.start * 1000);
          programNode.startNode.nodeValue = Settings.getHHMM(startDate);
          programNode.titleNode.parentNode.removeAttribute("title");
          for (locale in program.title)
          {
            if (program.title.hasOwnProperty(locale))
            {
              programNode.titleNode.nodeValue = program.title[locale]; // just pick the first translation and then break
              break;
            }
          }
          if (showHDsymbol && program.channel === "hd.svt.se" && program.desc && program.desc.sv && program.desc.sv.indexOf("S\u00e4nds i HD.") > -1)
          {
            programNode.hdSymbolNode.style.display = "inline";
          }
          else
          {
            programNode.hdSymbolNode.style.display = "none";
          }
        }
        if (showFtScore)
        {
          ftAddToQueue(programNode);
          Filmtipset.getScore(programNode.program);
        }
        else
        {
          programNode.ftScoreNode.style.display = "none";
        }
      }
    }
    catch (error)
    {
      Debug.alert("Error in front.updateProgramsNode: " + error + " (programNode = " + programNode + ")");
    }
  }
  
  /**
   * @memberOf EPG.front
   * @name fillDayView
   * @function
   * @description Fills day view with programs.
   * @private
   * @param {array} programs The programs for a specific date.
   * @param {object} [when] Current date.
   */
  function fillDayView(programs, when)
  {
    try
    {
      var i, length, programsLength, stopDate, currentNode, limit, pNode;
      
      if (!when)
      {
        when = new Date();
      }
      if (programs && programs.length > 0)
      {
        if (dayViewDiv.childNodes && dayViewDiv.childNodes.length > 0)
        {
          // reuse child nodes
          length = dayViewDiv.childNodes.length;
          programsLength = programs.length;
          if (length > programsLength)
          {
            for (i = 0; i < length; i += 1)
            {
              if (i < programsLength)
              {
                updateProgramNode(dayViewDiv.childNodes[i], programs[i]);
                stopDate = new Date(programs[i].stop * 1000);
                if (stopDate < when)
                {
                  dayViewDiv.childNodes[i].setAttribute("class", "program");
                }
                else
                {
                  if (!currentNode)
                  {
                    currentNode = dayViewDiv.childNodes[i];
                  }
                  dayViewDiv.childNodes[i].setAttribute("class", "program upcomingprogram");
                }
                if (showHDsymbol && programs[i].channel === "hd.svt.se" && programs[i].desc && programs[i].desc.sv && programs[i].desc.sv.indexOf("S\u00e4nds i HD.") > -1)
                {
                  dayViewDiv.childNodes[i].hdSymbolNode.style.display = "inline";
                }
                else
                {
                  dayViewDiv.childNodes[i].hdSymbolNode.style.display = "none";
                }
                dayViewDiv.childNodes[i].style.display = "block";
                if (showFtScore)
                {
                  ftAddToQueue(dayViewDiv.childNodes[i]);
                  Filmtipset.getScore(dayViewDiv.childNodes[i].program);
                }
                else
                {
                  dayViewDiv.childNodes[i].ftScoreNode.style.display = "none";
                }
              }
              else
              {
                dayViewDiv.childNodes[i].style.display = "none";
                dayViewDiv.childNodes[i].hdSymbolNode.nodeValue = "";
                dayViewDiv.childNodes[i].ftScoreNode.style.display = "none";
              }
              
              
            }
          }
          else if (programsLength > length)
          {
            for (i = 0; i < programsLength; i += 1)
            {
              if (i < length)
              {
                updateProgramNode(dayViewDiv.childNodes[i], programs[i]);
                dayViewDiv.childNodes[i].style.display = "block";
                stopDate = new Date(programs[i].stop * 1000);
                if (stopDate < when)
                {
                  dayViewDiv.childNodes[i].setAttribute("class", "program");
                }
                else
                {
                  if (!currentNode)
                  {
                    currentNode = dayViewDiv.childNodes[i];
                  }
                  dayViewDiv.childNodes[i].setAttribute("class", "program upcomingprogram");
                }
              }
              else
              {
                pNode = UIcreator.createProgramNode(programs[i], ProgramInfo, showHDsymbol, showFtScore);
                if (showFtScore)
                {
                  ftAddToQueue(pNode);
                  Filmtipset.getScore(pNode.program);
                }
                else
                {
                  pNode.ftScoreNode.style.display = "none";
                }
                dayViewDiv.appendChild(pNode);
                stopDate = new Date(programs[i].stop * 1000);
                if (stopDate < when)
                {
                  dayViewDiv.childNodes[i].setAttribute("class", "program");
                }
                else
                {
                  if (!currentNode)
                  {
                    currentNode = dayViewDiv.childNodes[i];
                  }
                  dayViewDiv.childNodes[i].setAttribute("class", "program upcomingprogram");
                }
              }
              dayViewDiv.childNodes[i].durationNode.nodeValue = "";
              if (showHDsymbol && programs[i].channel === "hd.svt.se" && programs[i].desc && programs[i].desc.sv && programs[i].desc.sv.indexOf("S\u00e4nds i HD.") > -1)
              {
                dayViewDiv.childNodes[i].hdSymbolNode.style.display = "inline";
              }
              else
              {
                dayViewDiv.childNodes[i].hdSymbolNode.style.display = "none";
              }
            }
          }
          else 
          {
            for (i = 0; i < length; i += 1)
            {
              updateProgramNode(dayViewDiv.childNodes[i], programs[i]);
              stopDate = new Date(programs[i].stop * 1000);
              if (stopDate < when)
              {
                dayViewDiv.childNodes[i].setAttribute("class", "program");
                dayViewDiv.childNodes[i].durationNode.nodeValue = "";
              }
              else
              {
                if (!currentNode)
                {
                  currentNode = dayViewDiv.childNodes[i];
                }
                dayViewDiv.childNodes[i].setAttribute("class", "program upcomingprogram");
                dayViewDiv.childNodes[i].durationNode.nodeValue = "";
              }
              dayViewDiv.childNodes[i].style.display = "block";
              if (showHDsymbol && programs[i].channel === "hd.svt.se" && programs[i].desc && programs[i].desc.sv && programs[i].desc.sv.indexOf("S\u00e4nds i HD.") > -1)
              {
                dayViewDiv.childNodes[i].hdSymbolNode.style.display = "inline";
              }
              else
              {
                dayViewDiv.childNodes[i].hdSymbolNode.style.display = "none";
              }
            }
          }
        }
        else if (programs.length > 0)
        {
          length = programs.length;
          for (i = 0; i < length; i += 1)
          {
            pNode = UIcreator.createProgramNode(programs[i], ProgramInfo, showHDsymbol, showFtScore);
            if (showFtScore)
            {
              ftAddToQueue(pNode);
              Filmtipset.getScore(pNode.program);
            }
            else
            {
              pNode.ftScoreNode.style.display = "none";
            }
            dayViewDiv.appendChild(pNode);
            stopDate = new Date(programs[i].stop * 1000);
            if (stopDate < when)
            {
              dayViewDiv.childNodes[i].setAttribute("class", "program");
            }
            else
            {
              if (!currentNode)
              {
                currentNode = dayViewDiv.childNodes[i];
              }
              dayViewDiv.childNodes[i].setAttribute("class", "program upcomingprogram");
            }
            
            dayViewDiv.childNodes[i].durationNode.nodeValue = "";
            if (showHDsymbol && programs[i].channel === "hd.svt.se" && programs[i].desc && programs[i].desc.sv && programs[i].desc.sv.indexOf("S\u00e4nds i HD.") > -1)
            {
              dayViewDiv.childNodes[i].hdSymbolNode.style.display = "inline";
            }
            else
            {
              dayViewDiv.childNodes[i].hdSymbolNode.style.display = "none";
            }
          }
        }
        else
        {
          // print error?
        }
      }
      else
      {
        // print error
      }
      //dayViewDiv.style.display = "block";
      if (currentNode)
      {
        limit = -1 * currentNode.offsetTop;
        scrollDayView(false, -1 * currentNode.offsetTop);
      }
      dayViewDiv.style.opacity = "1";
      dayViewDiv.style.zIndex = "99";
    }
    catch (error)
    {
      Debug.alert("Error in EPG.front.fillDayView: " + error + " (programs = " + programs + ", i = " + i + ")");
    }
  }
  
  /**
   * @memberOf EPG.front
   * @name switchView
   * @function
   * @description Switches between views (currently now,next,later and dayview).
   * @private
   * @param {object} channelNode Node of channel that was clicked.
   */
  function switchView(channelNode)
  {
    try
    {
      ProgramInfo.hide();
      if (channelNode)
      {
        if (currentView === 0 || (currentView === 1 && channelNode !== dayViewNode))
        {
          dimAllChannelNodesExcept(channelNode, false);
          currentView = 1; // Day view
          scrollFrame.dayView.topY = 0;
          scrollFrame.dayView.style.top = scrollFrame.dayView.topY + "px";
          Settings.getProgramsForDay(channelNode.channelID, fillDayView, fillDayViewFailed, new Date());
        }
        else
        {
          //dayViewDiv.style.display = "none";
          dayViewDiv.style.opacity = "0";
          dayViewDiv.style.zIndex = "-1";
          dimAllChannelNodesExcept(channelNode, true);
          currentView = 0; // now next later
        }
        updateTopBar(channelNode.channelID, ((currentView === 1) ? new Date() : undefined));
      }
      else if (currentView !== 0) // current view is not now next later
      {
        //dayViewDiv.style.display = "none";
        dayViewDiv.style.opacity = "0";
        dayViewDiv.style.zIndex = "-1";
        dimAllChannelNodesExcept(channelNode, true);
        currentView = 0; // now next later
        updateTopBar();
      }
    }
    catch (error)
    {
      Debug.alert("Error in EPG.front.switchView: " + error + " (channelNode = " + channelNode + ")");
    }
  }
  
  /**
   * @memberOf EPG.front
   * @name stopChannelDrag
   * @function
   * @description Stops the dragging of a channelNode.
   * @private
   * @param {object} event The event (mouse up).
   * @param {object} channelNode The channelNode that the mouse has been released at.
   */
  function stopChannelDrag(event, channelNode)
  {
    try
    {
      stopEvent(event);
      if (dragElement)
      {
        if (channelNode && dragElement !== channelNode)
        {
          channelNode.hasBeenDragged = true;
          switchChannelNodes(channelNode);
        }
        if (dragElement.hasBeenDragged)
        {
          delete dragElement.hasBeenDragged;
          saveCurrentChannelOrder(); // save changes
        }
        else
        {
          switchView(channelNode);
        }
        
        dragElement = false;
      }
      
    }
    catch (error)
    {
      Debug.alert("Error in front.stopChannelDrag: " + error + " (event = " + event + ")");
    }
  }
  
  /**
   * @memberOf EPG.front
   * @name createChannelNode
   * @function
   * @description Creates a container showing the logo, current program and the two upcoming programs.
   * @private
   * @param {string} channelID ID of the channel that should be shown in this container.
   * @return {object} An element (div tag) containing a logo and three program titles.
   */
  function createChannelNode(channelID) 
  {
    try
    {
      var channel,
      channelNode,
      tempScalableContainer,
      logo,
      textNode,
      channelFound;
      
      channelNode = channelNodes[channelID];
      if (channelNode)
      {
        return channelNode; // No need to create a node for the same channelID twice
      }
      else
      {
        channelNode = document.createElement("div");
        channelNode.channelID = channelID;
        channelNode.setAttribute("class", "channelnode");
        channel = Settings.getChannel(channelID);
        if (channel)
        {
          channelFound = true;
          //if (channel.icon)
          //{
            
          /*}
          else
          {
            download icons from another source?
          }
          */
          
        }
        else
        {
          channelFound = false;
        }
        
        logo = document.createElement("img");
        logo.setAttribute("src", File.getHomePath() + "Library/Xmltv/logos/" + channelID + ".png");
        logo.addEventListener("error", function ()
        {
          couldNotFindLogo(channelID);
        }, false);
        logo.setAttribute("class", "logo");
        if (channelFound && channel.displayName && channel.displayName.sv)
        {
          logo.setAttribute("title", channel.displayName.sv + ". " + Translator.translate("Click to show more programs, press and drag to move."));
        }
        else
        {
          logo.setAttribute("title", channelID + ". " + Translator.translate("Click to show more programs, press and drag to move."));
        }
        channelNode.logo = logo;
        channelNode.appendChild(logo);
        
        textNode = document.createElement("div");
        textNode.setAttribute("class", "programs");
        channelNode.appendChild(textNode);
        
        tempScalableContainer = UIcreator.createScalableContainer("onechannel", channelNode, "bakgrund.png", currentChannelListIndex);
        if (channelNode.logo)
        {
          tempScalableContainer.logo = channelNode.logo;
          delete channelNode.logo;
        } 
        channelNodes[channelID] = tempScalableContainer;
        tempScalableContainer.channelID = channelID;
        tempScalableContainer.programsNode = textNode;
        logo.addEventListener("mousedown", function (event)
        {
          startChannelDrag(event, tempScalableContainer);
        }, false);
        tempScalableContainer.addEventListener("mouseover", function (event)
        {
          continueChannelDrag(event, tempScalableContainer);
        }, false);
        tempScalableContainer.addEventListener("mouseup", function (event)
        {
          stopChannelDrag(event, tempScalableContainer);
        }, false);
        
        if (!channelFound)
        {
          tempScalableContainer.programsNode.appendChild(document.createTextNode(Translator.translate("Channel with id") + " " + channelID + " " + Translator.translate("was not found :-( It might have been renamed.")));
          tempScalableContainer.programsNode.appendChild(document.createElement("span"));
          tempScalableContainer.programsNode.lastChild.setAttribute("class", "phantomChannelWarning");
          tempScalableContainer.programsNode.lastChild.style.textDecoration = "underline !important";
          tempScalableContainer.programsNode.lastChild.addEventListener("click", function ()
          {
            deletePhantomChannel(channelID);
          }, false);
          tempScalableContainer.programsNode.lastChild.appendChild(document.createTextNode(" " + Translator.translate("Click to remove.")));
        }
        
        return channelNodes[channelID];
      }
      
    }
    catch (error)
    {
      Debug.alert("Error in front.createChannelNode: " + error + " (channelID = " + channelID + ")");
    }
  }
   
  /**
   * @memberOf EPG.front
   * @name showChannelNodes
   * @function
   * @description Shows existing channel nodes and creates new ones (if needed) after returning from backside.
   * @private
   */
  function showChannelNodes() 
  {
    try
    {
      var channelList,
      index,
      channelID,
      channelNode,
      orderedList,
      foundChannels;
      
      channelList = Settings.getChannelList(currentChannelListIndex);
      hideDuration = (Settings.getPreference("hideDuration") === "yes");
      
      if (channelList && channelList.ordered)
      {
        orderedList = channelList.ordered;
        
        for (index in orderedList)
        {
          if (orderedList.hasOwnProperty(index))
          {
            channelID = orderedList[index];
            channelNode = channelNodes[channelID];
            if (!channelNode) // Channel was just added
            {
              //Debug.inform("Creating channelNode for channelID " + channelID);
              channelNode = createChannelNode(channelID); 
            }
            overviewDiv.appendChild(channelNode);
          }
        } 
      }
    }
    catch (error)
    {
      Debug.alert("Error in front.showChannelNodes: " + error);
    }
  }
  
  /**
   * @memberOf EPG.front
   * @name update
   * @function
   * @description Updates the front side (reloads programs).
   * @private
   */
  function update() 
  {
    try
    {
      var now;
      now = new Date();
      that.reloadPrograms(now);
      ProgramInfo.update(now);
    }
    catch (error)
    {
      Debug.alert("Error in front.update: " + error);
    }
  }
  
  /**
   * @memberOf EPG.front
   * @name startUpdateInterval
   * @function
   * @description Starts the update timer.
   * @private
   */
  function startUpdateInterval() 
  {
    try
    {
      var millisecondsLeftToFullMinute;
      if (updateInterval)
      {
        stopUpdateInterval();
      }
      if (visible)
      {
        updateInterval = {};
        millisecondsLeftToFullMinute = new Date();
        millisecondsLeftToFullMinute = 61000 - (millisecondsLeftToFullMinute.getSeconds() * 1000 + millisecondsLeftToFullMinute.getMilliseconds());
        updateInterval.type = "timeout";
        updateInterval.timeout = setTimeout(function ()
          {
            updateInterval.type = "interval";
            updateInterval.interval = setInterval(update, 60000);
            update();
            delete updateInterval.timeout;
          },
          millisecondsLeftToFullMinute);
      }
    }
    catch (error)
    {
      Debug.alert("Error in front.startUpdateInterval: " + error);
    }
  }
  
  /**
   * @memberOf EPG.front
   * @name keyHandler
   * @function
   * @description Handles keypresses.
   * @private
   * @param {object} event Keypress event.
   */
  function keyHandler(event)
  {
    try
    {
      if (event && visible)
      {
        switch (event.keyCode) {
        case key.N_ZERO:
        case key.ZERO:
          if (event.metaKey)
          {
            Settings.setCurrentChannelListIndex(9);
            that.onShow();
          }
          else
          {
            addKeyToHistory(0);
          }
          break;
      	case key.ONE:
        case key.TWO:
        case key.THREE:
        case key.FOUR:
        case key.FIVE:
        case key.SIX:
        case key.SEVEN:
        case key.EIGHT:
        case key.NINE:
          if (event.metaKey)
          {
            Settings.setCurrentChannelListIndex(event.keyCode - key.ONE);
            that.onShow();
          }
          else
          {
            addKeyToHistory(event.keyCode - key.ZERO);
          }
          break;
        case key.N_ONE:
        case key.N_TWO:
        case key.N_THREE:
        case key.N_FOUR:
        case key.N_FIVE:
        case key.N_SIX:
        case key.N_SEVEN:
        case key.N_EIGHT:
        case key.N_NINE:
          if (event.metaKey)
          {
            Settings.setCurrentChannelListIndex(event.keyCode - key.N_ONE);
            that.onShow();
          }
          else
          {
            addKeyToHistory(event.keyCode - key.N_ZERO);
          }
          break;
        case key.BACKSPACE:
          if (!updateInterval)
          {
            update();
            startUpdateInterval();
          }
          break;
        case key.ARROW_UP:
          if (ProgramInfo.isVisible())
          {
            ProgramInfo.scroll(false, false, 10);
          }
          else
          {
            scrollFront(event, Math.round(overviewDiv.offsetHeight * 0.1));
          }
          if (event.preventDefault)
          {
            event.preventDefault();
          }
          break;
        case key.ARROW_DOWN:
          if (ProgramInfo.isVisible())
          {
            ProgramInfo.scroll(false, false, -10);
          }
          else
          {
            scrollFront(event, -1 * Math.round(overviewDiv.offsetHeight * 0.1));
          }
          if (event.preventDefault)
          {
            event.preventDefault();
          }
          break;
        case key.COMMA:
          if (visible && event.metaKey)
          {
            that.goToBack(event);
          }
          break;
        case key.SPACE:
          if (ProgramInfo.isVisible())
          {
            if (event.shiftKey)
            {
              ProgramInfo.scroll(false, false, 40);
            }
            else
            {
              ProgramInfo.scroll(false, false, -40);
            }
          }
          else if (event.shiftKey)
          {
            scrollFront(event, Math.round(scrollFrame.offsetHeight / 2));
          }
          else
          {
            scrollFront(event, -Math.round(scrollFrame.offsetHeight / 2));
          }
          if (event.preventDefault)
          {
            event.preventDefault();
          }
          break;
        case key.T:
          if (visible)
          {
            stopUpdateInterval();
            UIcreator.resetAllDataNodes();
            if (event.altKey)
            {
              Debug.inform("Front.keyHandler: Trying to force update grabber...");
              Settings.updateGrabber(true, that.onShow, startUpdateInterval);
            }
            else
            {
              Settings.runGrabber(true, that.onShow, startUpdateInterval);
            }
          }
          break;
      	default:
      	  //Debug.inform("Front.keyHandler: event.keyCode = " + event.keyCode);
          break;
        }
      }
    }
    catch (error)
    {
      Debug.alert("Error in EPG.front.keyHandler: " + error + " (event = " + event + ")");
    }
  }
  
  /**
   * @memberOf Epg.front
   * @name repeatKeyHandler
   * @function
   * @description Handles repeating keys.
   * @private
   * @param {object} event Key event.
   */
  function repeatKeyHandler(event)
  {
    try
    {
      if (event)
      {
        switch (event.keyCode)
        {
        case 63232:
          event.keyCode = key.ARROW_UP;
          keyHandler(event);
          break;
        case 63233:
          event.keyCode = key.ARROW_DOWN;
          keyHandler(event);
          break;
        default:
         // ignore
          break;
        }
      }
    }
    catch (error)
    {
      Debug.alert("Error in Epg.front.repeatKeyHandler: " + error + " (event = " + event + ")");
    }
  }
  
  /**
   * @memberOf EPG.front
   * @name create
   * @function 
   * @description Creates all elements and text nodes on the front side of the widget and then appends the elements to frontDiv.
   * @private
   */
  function create() 
  {
    try
    {
      frontDiv.appendChild(createTopBar());
      topBar.dateContainer.top = "3.4";
      topBar.dateContainer.style.top = topBar.dateContainer.top + "em";
      topBar.dateContainer.style.webkitTransition = "top 0.1s ease-out";
      frontDiv.appendChild(document.createElement("div"));
      scrollFrame = frontDiv.lastChild;
      scrollFrame.style.width = "27em";
      scrollFrame.style.position = "relative";
      //UIcreator.setPosition(scrollFrame, "0em", "4.8em", "27em", "0em", 1, "absolute");
      scrollFrame.style.overflow = "hidden";
      scrollFrame.appendChild(createOverview());
      frontDiv.appendChild(createBottomBar());
      scrollFrame.appendChild(createDayView());
      scrollFrame.dayView = overviewDiv.dayViewNode = scrollFrame.lastChild;
      scrollFrame.dayView.style.webkitTransition = "top 0.3s ease-out";
      scrollFrame.dayView.topY = 0;
      UIcreator.setPosition(scrollFrame.dayView, "5.7em", "0em", false, false, 3, "absolute");
      document.addEventListener("keydown", keyHandler, false);
      document.addEventListener("keypress", repeatKeyHandler, false);
      scrollFrame.dayView.addEventListener("DOMMouseScroll", scrollDayView, false);
      //frontDiv.addEventListener("mousewheel", scrollDayView, false);
      frontDiv.addEventListener("DOMMouseScroll", scrollFront, false);
      frontDiv.addEventListener("mousewheel", scrollFront, false);
    }
    catch (error)
    {
      Debug.alert("Error in front.create: " + error);
    }
  }
   
  function isNowNextLater()
  {
    return (currentView === 0);
  }
  
  
  /**
   * @memberOf EPG.front
   * @name reloadProgramsForChannel
   * @function
   * @description Reloads the visible programs for one channel.
   * @private
   * @param {string} channelID ID of the channel that should reload programs.
   * @param {array} programs The programs that are to be shown.
   */
  function reloadProgramsForChannel(channelID, programs, when)
  {
    try
    {
      var channelNode,
      programNode,
      pNode,
      title,
      i,
      program,
      start,
      stop, 
      duration;
      
      channelNode = channelNodes[channelID];
      if (channelNode && programs)
      {
        channelNode = channelNode.programsNode;
        if (channelNode.childNodes.length === programs.length && !channelNode.hadNoProgramsNode)
        {
          for (i = 0; i < programs.length; i += 1)
          {
            program = programs[i];
            updateProgramNode(channelNode.childNodes[i], program);
            if (i === 0)
            {
              if (program.isTheEmptyProgram || hideDuration)
              {
                channelNode.childNodes[i].durationNode.nodeValue = "";
              }
              else
              {
                start = new Date(program.start * 1000);
                stop = new Date(program.stop * 1000);
                channelNode.childNodes[i].durationNode.nodeValue = (100 - Math.round(((stop - when) / (stop - start)) * 100)) + "% ";
              }
            }
            else
            {
              channelNode.childNodes[i].durationNode.nodeValue = "";
            }
            if (showHDsymbol && program.channel === "hd.svt.se" && program.desc && program.desc.sv && program.desc.sv.indexOf("S\u00e4nds i HD.") > -1)
            {
              channelNode.childNodes[i].hdSymbolNode.style.display = "inline";
            }
            else
            {
              channelNode.childNodes[i].hdSymbolNode.style.display = "none";
            }
            if (showFtScore)
            {
              ftAddToQueue(channelNode.childNodes[i]);
              Filmtipset.getScore(channelNode.childNodes[i].program);
            }
            else
            {
              channelNode.childNodes[i].ftScoreNode.style.display = "none";
            }
          }
        }
        else
        {
          channelNode.hadNoProgramsNode = undefined;
          UIcreator.removeChildNodes(channelNode);
          for (i = 0; i < programs.length; i += 1)
          {
            program = programs[i];
            pNode = UIcreator.createProgramNode(program, ProgramInfo, showHDsymbol, showFtScore, isNowNextLater);
            if (showFtScore)
            {
              ftAddToQueue(pNode);
              Filmtipset.getScore(pNode.program);
            }
            else
            {
              pNode.ftScoreNode.style.display = "none";
            }
            channelNode.appendChild(pNode);
            if (i === 0)
            {
              if (program.isTheEmptyProgram || hideDuration)
              {
                channelNode.childNodes[i].durationNode.nodeValue = "";
              }
              else
              {
                start = new Date(program.start * 1000);
                stop = new Date(program.stop * 1000);
                channelNode.childNodes[i].durationNode.nodeValue = (100 - Math.round(((stop - when) / (stop - start)) * 100)) + "% ";
              }
            }
            else
            {
              channelNode.childNodes[i].durationNode.nodeValue = "";
            }
          }
          if (channelNode.firstChild)
          {
            channelNode.firstChild.setAttribute("class", "program currentprogram");
          }
        }
      }
      else
      {
        Debug.alert(channelID + ": Can't reload programs!");
      }
    }
    catch (error)
    {
      Debug.alert("Error in front.reloadProgramsForChannel: " + error + " (channelID = " + channelID + ", programs = " + programs + ")");
    }
  }
  
  /**
   * @memberOf EPG.front
   * @name reloadProgramsForChannelFailed
   * @function
   * @description Prints a message that programs for one channel could not be loaded.
   * @private
   * @param {string} channelID ID of the channel that is waiting for an update.
   */
  function reloadProgramsForChannelFailed(channelID, when)
  {
    try
    {
      var channelNode = channelNodes[channelID],
      now = new Date(),
      whenCopy = when,
      pNode;
      if (typeof channelID !== "undefined")
      {
        Debug.warn("front.reloadProgramsForChannelFailed: could not reload programs for channel with id " + channelID + "! channelNodes[" + channelID + "] = " + channelNodes[channelID]);
      }
      if (now.getFullYear() === when.getFullYear() && now.getMonth() === when.getMonth() && now.getDate() === when.getDate())
      {
        if (channelNode)
        {
          channelNode = channelNode.programsNode;
          UIcreator.removeChildNodes(channelNode);
          pNode = UIcreator.createProgramInfoMissingNode(function ()
          {
            stopUpdateInterval();
            Settings.runGrabber(true, that.onShow, startUpdateInterval);
          });
          channelNode.appendChild(pNode);
        }
        else
        {

        }
      }
    }
    catch (error)
    {
      Debug.alert("Error in front.reloadProgramsForChannelFailed: " + error + " (channelID = " + channelID + ")");
    }
  }
  
  /**
   * @memberOf EPG.front
   * @name hideChannelNodes
   * @function
   * @description Hides all channelNodes when going to the backside, in case we add or remove a channel.
   * @private
   */
  function hideChannelNodes()
  {
    try
    {
      var i,
      length;
      
      while (overviewDiv.lastChild && overviewDiv.lastChild !== overviewDiv.dayViewNode)
      {
        overviewDiv.removeChild(overviewDiv.lastChild);
      }
      
      bottomBarContainer.style.top = "4.8em";
    }
    catch (error)
    {
      Debug.alert("Error in front.hideChannelNodes: " + error);
    }
  }
   
  function onChannelListChange(newIndex)
  {
    try
    {
      Debug.inform("front onChannelListChange newIndex " + newIndex);
      if (visible && frontDiv)
      {
        that.show(toBack, true);
      }
    }
    catch (error)
    {
      Debug.alert("Error in front.onChannelListChange newIndex : " + newIndex);
    }
  }
  
  // Public methods
  return /** @scope front */ {
    
    /**
     * @memberOf EPG.front
     * @function init
     * @description Initializes the singleton and saves the this-object.
     */
    init: function ()
    {
      if (!that)
      {
        that = this;
      }
      Filmtipset.setCallbacks(Filmtipset.CALLBACK_GET_SCORE, ftCallback, function () {});
      //Settings.addChannelListChangeListener(onChannelListChange);
      delete that.init;
    },
    
    /**
     * @memberOf EPG.front
     * @function show
     * @description Shows the front side of the widget. Flips the widget over if it's currently on the backside.
     * @param {function} toBackMethod Function that makes the widget flip over to the backside.
     * @param {boolean} [dontAnimate] If true skips the animation from back to front.
     */
    show: function (toBackMethod, dontAnimate)
    {
      try
      {
        Debug.inform("front.show got current index " + currentChannelListIndex + " new index will be " + Settings.getCurrentChannelListIndex());
        stopUpdateInterval();
        showHDsymbol = (Settings.getPreference("showHDsymbol") === "yes");
        showFtScore = Filmtipset.isEnabled();
        if (!backDiv)
        {
          backDiv = document.getElementById("back");
        }
        
        if (!dontAnimate)
        {
          if (window.widget) 
          {
            Settings.resizeTo(474, screen.height, true);
            window.widget.prepareForTransition("ToFront");
            Settings.resizeTo(width, height);
          }
          backDiv.style.display = "none";
        }
        else
        {
          if (window.widget)
          {
            Settings.resizeTo(width, height); // calculate how many channels there are and then resize
          } 
        }
        
        currentChannelListIndex = Settings.getCurrentChannelListIndex();
        Skin.changeToSkinFromList(currentChannelListIndex);

        if (toBackMethod)
        {
          toBack = toBackMethod;
        }

        if (!frontDiv)
        {
          frontDiv = document.getElementById("front");
          create();
          ProgramInfo.updateSkin(Skin.getSkinForList(currentChannelListIndex));
        }
        else
        {
          applySkin(Skin.getSkinForList(currentChannelListIndex));
        }
    
        showChannelNodes();
        that.reloadPrograms(new Date());
        updateClock(new Date());
        that.resize();
        
        frontDiv.style.display = "block";
        visible = true;
        if (!dontAnimate && window.widget)
        {
          setTimeout(function ()
          {
            window.widget.performTransition();
            startUpdateInterval();
          }, 300);
        }
      }
      catch (error)
      {
        Debug.alert("Error in front.show: " + error);
      }
    },
    
    /**
     * @memberOf EPG.front
     * @function hide
     * @description Tells the front that it should consider itself hidden. Used when Dashboard is dismissed to prevent timeouts and intervals from running in the background.
     */
    hide: function () 
    {
      try
      {
        //Debug.inform("Front.hide");
        visible = false;
        stopUpdateInterval();
        ProgramInfo.hide();
        that.removeDragElement();
      }
      catch (error)
      {
        Debug.alert("Error in front.hide: " + error);
      }
    },
    
    /**
     * @memberOf EPG.front
     * @function removeDragElement
     * @description Removes the drag element if any exists.
     */
    removeDragElement: function () 
    {
      try
      {
        dragElement = false;
      }
      catch (error)
      {
        Debug.alert("Error in front.removeDragElement: " + error);
      }
    },
    
    /**
     * @memberOf EPG.front
     * @function goToBack
     * @description Calls the function responsible for flipping the widget over to its backside.
     * @param {object} event The event that caused this function to be run. 
     */
    goToBack: function (event) 
    {
      try
      {
        stopEvent(event);
        if (toBack)
        {
          switchView(); // in case we are in day view, switch back to now next later.
          hideChannelNodes();
          that.hide();
          toBack();
          UIcreator.applyTransparency(1);
        }
        else
        {
          Debug.warn("front.goToBack had no toBack method!\nCan't go to back!");
        }
      }
      catch (error)
      {
        Debug.alert("Error in front.goToBack: " + error);
      }
    },
    
    /**
     * @memberOf EPG.front
     * @function resize
     * @description Resizes the front side.
     */
    resize: function () 
    {
      try
      {
        var currentChannelList,
        i,
        channelListHeight,
        numChannels,
        overviewDivHeight;
        tooTallForScreen = false;
        
        currentChannelList = Settings.getChannelList(currentChannelListIndex);
        if (currentChannelList && currentChannelList.ordered && currentChannelList.ordered.length > 0)
        {
          //Debug.inform("number of channels in list " + currentChannelListIndex + ": " + currentChannelList.ordered.length);
          height = 80 + currentChannelList.ordered.length * 38;
          numChannels = currentChannelList.ordered.length;
          channelListHeight = height;
          overviewDivHeight = ((channelListHeight / 10) - 8) + "em";
          while (channelListHeight > screen.height)
          {
            tooTallForScreen = true;
            channelListHeight -= 19;
          }
          channelListHeight -= 80;
          channelListHeight = channelListHeight / 10;
          //Debug.inform("channelListHeight = " + channelListHeight);
          if (channelListHeight < 0)
          {
            channelListHeight = 0;
          }
        }
        else
        {
          height = 80;
          channelListHeight = 0;
        }
        if (tooTallForScreen)
        {
          overviewDiv.style.height = overviewDivHeight;
          scrollFrame.style.height = channelListHeight + "em";
          bottomBarContainer.resizers[0].style.visibility = "hidden";
          bottomBarContainer.resizers[1].style.visibility = "hidden";
          bottomBarContainer.resizers[2].style.visibility = "hidden";
        }
        else
        {
          overviewDiv.style.height = "";
          scrollFrame.style.height = "";
          bottomBarContainer.resizers[0].style.visibility = "inherit";
          bottomBarContainer.resizers[1].style.visibility = "inherit";
          bottomBarContainer.resizers[2].style.visibility = "inherit";
        }
        //bottomBarContainer.style.top = (4.8 + channelListHeight) + "em";
        height = 80 + channelListHeight * 10;
        overviewDiv.topY = 0;
        overviewDiv.style.top = overviewDiv.topY + "px";
        Settings.resizeTo(width, height);
      }
      catch (error)
      {
        Debug.alert("Error in front.getHeight: " + error);
      }
    },
    
    /**
     * @memberOf EPG.front
     * @function reloadPrograms
     * @description Reloads the programs on the front side.
     * @param {object} [when] A Date-object specifying what time it is. Use to move forwards or backwards in time.
     */
    reloadPrograms: function (when, skipUpdate) 
    {
      try
      {
        var currentChannelList,
        channelID,
        channelNode;
        
      	if (!when)
      	{
      		when = new Date();
      	}
      	if (!skipUpdate)
      	{
      	  updateClock(when);
      	}
      	
      	currentChannelList = Settings.getChannelList(currentChannelListIndex);
      	if (currentChannelList && currentChannelList.ordered && currentChannelList.ordered.length > 0)
        {
        	currentChannelList = currentChannelList.hashed;
        	for (channelID in currentChannelList)
        	{
        	  if (currentChannelList.hasOwnProperty(channelID)) 
        	  {
        	    channelNode = channelNodes[channelID];
        	    if (Settings.getChannel(channelID)) // Only try to download programs from channels that are present in channels.js
        	    {
          	  	channelNode = channelNodes[channelID];
          	  	if (channelNode && channelNode.isVisible && channelNode.contents)
          	  	{
          	  	  //Debug.inform("reloading programs for channelID " + channelID + " (but channelNode.channelID = " + channelNode.channelID + ")");
          	      Settings.getProgramsForChannel(channelID,
          	      function (theID, when)
          	      {
          	        return function (thePrograms)
          	        {
          	          reloadProgramsForChannel(theID, thePrograms, when);
          	        };
          	      }(channelID, when),
          	      function (theID)
          	      {
          	        return function ()
          	        {
          	          reloadProgramsForChannelFailed(theID, when);
          	        };
          	      }(channelID),
          	      3,
          	      when);
          	  	}
        	    }
        	    else
        	    {
        	      
        	    }
        	  }
        	}
        }
      }
      catch (error)
      {
        Debug.alert("Error in front.reloadPrograms: " + error);
      }
    },
    
    /**
     * @memberOf EPG.front
     * @function reloadIcons
     * @description Reloads all icons. Used to update icons if they are changed on, added to or removed from the harddrive
     */
    reloadIcons: function () 
    {
      try
      {
        var index,
        channelNode,
        logo,
        src;
        
        for (index in channelNodes)
        {
          if (channelNodes.hasOwnProperty(index))
          {
            channelNode = channelNodes[index];
            if (channelNode && channelNode.logo)
            {
            	logo = channelNode.logo;
            	src = logo.getAttribute("src");
            	if (src)
            	{
            	  logo.removeAttribute("src");
            	  logo.setAttribute("src", "" + src);
            	}
            }
          }
        }
      }
      catch (error)
      {
        Debug.alert("Error in front.reloadIcons: " + error);
      }
    },
    
    /**
     * @memberOf EPG.front
     * @function onShow
     * @description Runs when Dashboard is shown.
     */
    onShow: function () 
    {
      try
      {
        Debug.inform("front.onshow");
        if (Settings.getCurrentChannelListIndex() !== currentChannelListIndex)
        {
          Debug.inform("front.onShow reloading because of channel list change");
          switchView(); // in case we are in day view, switch back to now next later.
          hideChannelNodes();
          that.show(toBack, true);
        }
        else
        {
          Debug.inform("front.onShow still using the same channel list");
          that.reloadIcons();
          that.reloadPrograms();
          Settings.checkForNewVersion(newVersionAvailable);
          visible = true;
          startUpdateInterval(); // should really be one interval per channel
        }
      }
      catch (error)
      {
        Debug.alert("Error in front.onShow: " + error);
      }
    }
  };
}(EPG.debug, EPG.growl, EPG.settings, EPG.skin, EPG.translator, EPG.UIcreator, EPG.file, EPG.ProgramInfo, EPG.Filmtipset);
EPG.front.init();
//EPG.PreLoader.resume();