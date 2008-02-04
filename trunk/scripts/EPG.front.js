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
EPG.front = function(Debug, Growl, Settings, Skin, Translator, UIcreator, File, ProgramInfo) 
{
  // Private Variables
  var that,
  currentView = 0, // 0 = now next later, 1 = dayview
  visible = false,
  backDiv,
  frontDiv,
  topBar,
  overviewDiv,
  dayViewNode,
  channelNodes = {},
  infoButton,
  toBack,
  currentChannelListIndex = Settings.getCurrentChannelListIndex(),
  width = 540,
  height = 80,
  dragElement,
  updateInterval;
  
  // Private methods
  /**
   * @memberOf EPG.front
   * @name createTopBar
   * @function
   * @description Creates the topmost bar on the widget.
   * @return {object} An element (div tag) representing the top bar.
   * @private
   */
  function createTopBar ()  
  {
    try
    {
      topBar = document.createElement("div");
      topBar.setAttribute("class", "text");
      topBar.appendChild(document.createTextNode("EPG: "));
      topBar.appendChild(document.createTextNode(Translator.translate("overview")));
      topBar.heading = topBar.lastChild;
      return UIcreator.createScalableContainer("topbar", topBar, "uppe.png", currentChannelListIndex);
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
  function stopEvent (event)
  {
    try
    {
      if(event && event.stopPropagation)
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
   * @name createInfoButton
   * @function
   * @description Creates the infobutton shown on the front of the widget.
   * @private
   */
  function createInfoButton () 
  {
    try
    {
      if(!infoButton)
      {
        infoButton = document.createElement("div");
        infoButton.setAttribute("id", "infobutton");
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
  function createBottomBar () 
  {
    try
    {
      var tempContainer,
      tempElement,
      tempDiv,
      tempTextNode;
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
      tempDiv = document.createElement("div");
      tempDiv.setAttribute("class", "resizer");
      
      tempElement = document.createElement("a");
      tempElement.setAttribute("class", "smallertext");
      
      tempTextNode = document.createTextNode("");
      
      tempElement.appendChild(tempTextNode.cloneNode(false));
      tempElement.firstChild.nodeValue = "A";
      tempDiv.appendChild(tempElement);
      tempContainer.appendChild(tempDiv.cloneNode(true));
      tempContainer.lastChild.addEventListener("click", function(){Settings.resizeText(-1);}, false);
      tempElement.setAttribute("class", "normaltext");
      tempContainer.appendChild(tempDiv.cloneNode(true));
      tempContainer.lastChild.addEventListener("click", function(){Settings.resizeText(0);}, false);
      tempElement.setAttribute("class", "biggertext");
      tempContainer.appendChild(tempDiv.cloneNode(true));
      tempContainer.lastChild.addEventListener("click", function(){Settings.resizeText(1);}, false);
      tempContainer.appendChild(createInfoButton());
      return UIcreator.createScalableContainer("bottombar", tempContainer, "nere.png",currentChannelListIndex);
    
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
  function couldNotFindLogo (channelID)
  {
    try
    {
      var channel;
      
      Debug.warn("Could not find logo for channel with ID " + channelID + "!");
      Settings.getChannel(channelID);
      if(channel && channel.icon)
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
  function switchChannelNodes (channelNode) 
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
      for(i = 0; i < parentNode.childNodes.length; i += 1)
      {
        currentNode = parentNode.childNodes[i];
        if(currentNode === channelNode)
        {
          channelNodePosition = i;
          if(dragElementPosition >= 0)
          {
            break;
          }
        }
        else if(currentNode === dragElement)
        {
          dragElementPosition = i;
          if(channelNodePosition >= 0)
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
      if(dragElementPosition < channelNodePosition)
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
    function saveCurrentChannelOrder () 
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
        if(length > 0)
        {
          for(i = 0; i < length; i+=1)
          {
            if(typeof(childNodes[i].channelID) !== "undefined" && childNodes[i].style.display !== "none")
            {
              position = channelOrder.length;
              channelOrder[position] = childNodes[i].channelID;
              channelsHash[channelOrder[position]] = position;
            }
          }
        }
        
        channelList = Settings.getChannelList(currentChannelListIndex);
        if(channelList && channelList.ordered)
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
  function startChannelDrag (event, channelNode)
  {
    try
    {
      stopEvent(event);
      if(dragElement !== channelNode)
      {
        dragElement = channelNode;
        Debug.inform("Started dragging element: " + dragElement);
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
  function continueChannelDrag (event, channelNode)
  {
    try
    {
      stopEvent(event);
      if(dragElement && channelNode && dragElement !== channelNode)
      {
        Debug.inform("Dragged over element: " + channelNode);
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
  function updateTopBar (channelID)
  {
    try
    {
      var channel;
      
      if(currentView === 0)
      {
        topBar.setAttribute("title","");
        topBar.heading.nodeValue = Translator.translate("overview");
      }
      else if(currentView === 1)
      {
        channel = Settings.getChannel(channelID);
        if(channel && channel.displayName)
        {
          if(channel.displayName.sv)
          {
            topBar.setAttribute("title",channel.displayName.sv);
            topBar.heading.nodeValue = channel.displayName.sv;  
          }
          else if(channel.displayName.en)
          {
            topBar.setAttribute("title",channel.displayName.en);
            topBar.heading.nodeValue = channel.displayName.en;
          }
          else
          {
            topBar.setAttribute("title","");
            topBar.heading.nodeValue = Translator.translate("day view");
          }
        }
        else
        {
          topBar.setAttribute("title","");
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
  function dimChannelNode (channelNode, reverse)
  {
    try
    {
      Debug.inform("Dimmed " + channelNode.channelID);
      if(reverse)
      {
        channelNode.logo.style.opacity = "0.8";
        channelNode.programsNode.style.visibility = "inherit";
      }
      else
      {
        channelNode.logo.style.opacity = "0.15";
        channelNode.programsNode.style.visibility = "hidden";
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
  function dimAllChannelNodesExcept (channelNode, reverse)
  {
    try
    {
      var id, node;
      
      for (id in channelNodes)
      {
        if(channelNodes.hasOwnProperty(id))
        {
          node = channelNodes[id];
          if(channelNode === node)
          {
            dayViewNode = channelNode;
            if(reverse)
            {
              channelNode.logo.style.opacity = "0.8";
              channelNode.programsNode.style.visibility = "inherit";
            }
            else
            {
              channelNode.logo.style.opacity = "0.8";
              channelNode.programsNode.style.visibility = "hidden";
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
      Debug.alert("Error in EPG.front.dimAllChannelNodesExcept: " + error + " (channelID = " + channelID + ")");
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
  function switchView (channelNode)
  {
    try
    {
      ProgramInfo.hide();
      if(currentView === 0 || (currentView === 1 && channelNode !== dayViewNode))
      {
        dimAllChannelNodesExcept(channelNode, false);
        currentView = 1;
      }
      else
      {
        dimAllChannelNodesExcept(channelNode, true);
        currentView = 0
      }
      updateTopBar(channelNode.channelID);
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
  function stopChannelDrag (event, channelNode)
  {
    try
    {
      stopEvent(event);
      if(dragElement)
      {
        if(channelNode && dragElement !== channelNode)
        {
          channelNode.hasBeenDragged = true;
          switchChannelNodes(channelNode);
        }
        if(dragElement.hasBeenDragged)
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
  function createChannelNode (channelID) 
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
      if(channelNode)
      {
        return channelNode; // No need to create a node for the same channelID twice
      }
      else
      {
        channelNode = document.createElement("div");
        channelNode.channelID = channelID;
        channelNode.setAttribute("class", "channelnode");
        channel = Settings.getChannel(channelID);
        if(channel)
        {
          channelFound = true;
          //if(channel.icon)
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
        logo.addEventListener("error", function(){couldNotFindLogo(channelID);}, false);
        logo.setAttribute("class", "logo");
        if(channelFound && channel.displayName && channel.displayName.sv)
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
        if(channelNode.logo)
        {
          tempScalableContainer.logo = channelNode.logo;
          delete channelNode.logo;
        } 
        channelNodes[channelID] = tempScalableContainer;
        tempScalableContainer.channelID = channelID;
        tempScalableContainer.programsNode = textNode;
        logo.addEventListener("mousedown", function(event){startChannelDrag(event, tempScalableContainer);}, false);
        tempScalableContainer.addEventListener("mouseover", function(event){continueChannelDrag(event, tempScalableContainer);}, false);
        tempScalableContainer.addEventListener("mouseup", function(event){stopChannelDrag(event, tempScalableContainer);}, false);
        
        if(!channelFound)
        {
          tempScalableContainer.programsNode.appendChild(document.createTextNode(Translator.translate("Channel with id") + " " + channelID + " " + Translator.translate("was not found :-( It might have been renamed.")));
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
   * @name createOverview
   * @function
   * @description Creates the list of channels shown on the front of the widget. (now next later)
   * @private
   * @return {object} An element (div tag) containing all channels.
   */
  function createOverview () 
  {
    try
    {
      var index,
      channelList,
      orderedList;
      
      overviewDiv = document.createElement("div");
      /*channelList = Settings.getChannelList(currentChannelListIndex);
      if(channelList && channelList.ordered)
      {
        orderedList = channelList.ordered;
        for (index in orderedList)
        {
          if(orderedList.hasOwnProperty(index))
          {
            overviewDiv.appendChild(createChannelNode(orderedList[index]));
          }
        }
      }*/
      return overviewDiv;
    }
    catch (error)
    {
      Debug.alert("Error in front.createChannelList: " + error);
    }
  }
  
  /**
   * @memberOf EPG.front
   * @name showChannelNodes
   * @function
   * @description Shows existing channel nodes and creates new ones (if needed) after returning from backside.
   * @private
   */
  function showChannelNodes () 
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
      
      if(channelList && channelList.ordered)
      {
        orderedList = channelList.ordered;
        
        for (index in orderedList)
        {
          if(orderedList.hasOwnProperty(index))
          {
            channelID = orderedList[index];
            channelNode = channelNodes[channelID];
            if(!channelNode) // Channel was just added
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
   * @name create
   * @function 
   * @description Creates all elements and text nodes on the front side of the widget and then appends the elements to frontDiv.
   * @private
   */
  function create () 
  {
    try
    {
      frontDiv.appendChild(createTopBar());
      frontDiv.appendChild(createOverview());
      frontDiv.appendChild(createBottomBar());
    }
    catch (error)
    {
      Debug.alert("Error in front.create: " + error);
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
  function updateProgramNode (programNode, program)
  {
    try
    {
      var i,
      startDate,
      start;
      
      if(program)
      {
        programNode.program = program;
        if(program.isTheEmptyProgram)
        {
          programNode.startNode.nodeValue = "";
          programNode.titleNode.nodeValue = "- " + Translator.translate("No program") + " -";
        }
        else
        {
          startDate = new Date(program.start*1000);
          if(startDate.getHours() < 10)
          {
            programNode.startNode.nodeValue = "0" + startDate.getHours() + ":";
          }
          else
          {
            programNode.startNode.nodeValue = startDate.getHours() + ":";
          }
          if(startDate.getMinutes() < 10)
          {
            programNode.startNode.nodeValue += "0";
          }
          programNode.startNode.nodeValue += "" + startDate.getMinutes();
          programNode.titleNode.parentNode.removeAttribute("title");
          for (locale in program.title)
          {
            if(program.title.hasOwnProperty(locale))
            {
              programNode.titleNode.nodeValue = program.title[locale]; // just pick the first translation and then break
              programNode.titleNode.parentNode.setAttribute("title", program.title[locale] + ". " + Translator.translate("Click to open description, use mousewheel/trackpad to scroll description."));
              break;
            }
          }
        }
      }
    }
    catch (error)
    {
      Debug.alert("Error in front.updateProgramsNode: " + error + " (programsNode = " + programsNode + ")");
    }
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
  function reloadProgramsForChannel (channelID, programs)
  {
    try
    {
      var channelNode,
      programNode,
      title;
      
      channelNode = channelNodes[channelID];
      if(channelNode && programs)
      {
        channelNode = channelNode.programsNode;
        if(channelNode.childNodes.length === programs.length)
        {
          for(i = 0; i < programs.length; i += 1)
          {
            updateProgramNode(channelNode.childNodes[i], programs[i]);
          }
        }
        else
        {
          UIcreator.removeChildNodes(channelNode);
          for (i in programs)
          {
            if(programs.hasOwnProperty(i))
            {
              channelNode.appendChild(UIcreator.createProgramNode(programs[i], ProgramInfo));              
            }
          }
          if(channelNode.firstChild)
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
  function reloadProgramsForChannelFailed (channelID)
  {
    try
    {
      
      if(typeof(channelID) !== "undefined")
      {
        Debug.warn("front.reloadProgramsForChannelFailed: could not reload programs for channel with id " + channelID + "!");
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
   * @description Hides all channelNodes when going to the backside, in case we add or remove a channel. (Removed channels are not actually removed from the front, they are just hidden.)
   * @private
   */
  function hideChannelNodes ()
  {
    try
    {
      var i,
      length;
      
      while(overviewDiv.firstChild)
      {
        overviewDiv.removeChild(overviewDiv.firstChild);
      }
    }
    catch (error)
    {
      Debug.alert("Error in front.hideChannelNodes: " + error);
    }
  }
  
  /**
   * @memberOf EPG.front
   * @name update
   * @function
   * @description Updates the front side (reloads programs).
   * @private
   */
  function update () 
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
  function startUpdateInterval () 
  {
    try
    {
      if(updateInterval)
      {
        clearTimeout(updateInterval);
      }
      updateInterval = setInterval(update, 60000);
    }
    catch (error)
    {
      Debug.alert("Error in front.startUpdateInterval: " + error);
    }
  }
  
  // Public methods
  return /** @scope front */ {
    
    /**
     * @memberOf EPG.front
     * @function init
     * @description Initializes the singleton and saves the this-object.
     */
    init: function()
    {
      if(!that)
      {
        that = this;
      }
      delete that.init;
    },
    
    /**
     * @memberOf EPG.front
     * @function show
     * @description Shows the front side of the widget. Flips the widget over if it's currently on the backside.
     * @param {function} toBackMethod Function that makes the widget flip over to the backside.
     * @param {number} channelListID ID of the channel list to show on the front side.
     * @param {boolean} [dontAnimate] If true skips the animation from back to front.
     */
    show: function (toBackMethod, channelListID, dontAnimate) 
    {
      try
      {
        if(updateInterval)
        {
          clearInterval(updateInterval);
        }
        if (!visible)
        {
          if(!backDiv)
          {
            backDiv = document.getElementById("back");
          }
          
          if(!dontAnimate)
          {
            if (window.widget) 
            {
              Settings.resizeTo(width, screen.height, true);
              window.widget.prepareForTransition("ToFront");
              Settings.resizeTo(width, height);
            }
            backDiv.style.display = "none";
          }
          else
          {
            if(window.widget)
            {
              Settings.resizeTo(width, height); // calculate how many channels there are and then resize
            } 
          }
          
          if(typeof(channelListID) !== "undefined")
          {
            currentChannelListIndex = channelListID;
          }
          else
          {
            Debug.warn("front.show: Tried to show front without a specified channelListID!");
          }
          Skin.changeToSkinFromList(currentChannelListIndex);
          
          toBack = toBackMethod;
          
          if(!frontDiv)
          {
            frontDiv = document.getElementById("front");
            create();
          }

          showChannelNodes();
          that.reloadPrograms(new Date());
          that.resize();
          
          frontDiv.style.display="block";
          visible = true;
          if(!dontAnimate && window.widget)
          {
            setTimeout(function(){window.widget.performTransition(); startUpdateInterval();}, 300);
          }
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
        visible = false;
        if(updateInterval)
        {
          clearInterval(updateInterval);
        }
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
        if(event && event.stopPropagation)
        {
          event.stopPropagation();
          event.preventDefault();
        }
        if(toBack)
        {
          hideChannelNodes();
          that.hide();
          toBack();
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
        i;
        
        currentChannelList = Settings.getChannelList(currentChannelListIndex);
        if(currentChannelList && currentChannelList.ordered && currentChannelList.ordered.length > 0)
        {
          Debug.inform("number of channels in list " + currentChannelListIndex + ": " + currentChannelList.ordered.length);
          height = 80 + currentChannelList.ordered.length * 38;
        }
        else
        {
          height = 80;
        }
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
    reloadPrograms: function (when) 
    {
      try
      {
        var currentChannelList,
        channelID,
        channelNode;
        
      	if(!when)
      	{
      		when = new Date();
      	}
      	
      	currentChannelList = Settings.getChannelList(currentChannelListIndex);
      	if(currentChannelList && currentChannelList.ordered && currentChannelList.ordered.length > 0)
        {
        	currentChannelList = currentChannelList.hashed;
        	for (channelID in currentChannelList)
        	{
        	  if(currentChannelList.hasOwnProperty(channelID)) 
        	  {
        	    channelNode = channelNodes[channelID];
        	    if(Settings.getChannel(channelID)) // Only try to download programs from channels that are present in channels.js
        	    {
          	  	channelNode = channelNodes[channelID];
          	  	if(channelNode && channelNode.isVisible && channelNode.contents)
          	  	{
          	  	  //Debug.inform("reloading programs for channelID " + channelID + " (but channelNode.channelID = " + channelNode.channelID + ")");
          	      Settings.getProgramsForChannel(channelID, function(theID){return function(thePrograms){reloadProgramsForChannel(theID, thePrograms);}}(channelID), function(theID){ return function(){reloadProgramsForChannelFailed(theID);}}(channelID), 3, when);
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
          if(channelNodes.hasOwnProperty(index))
          {
            channelNode = channelNodes[index];
            if(channelNode && channelNode.logo)
            {
            	logo = channelNode.logo;
            	src = logo.getAttribute("src");
            	if(src)
            	{
            	  logo.removeAttribute("src");
            	  logo.setAttribute("src", ""+src);
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
        that.reloadIcons();
        that.reloadPrograms();
        startUpdateInterval(); // should really be one interval per channel
      }
      catch (error)
      {
        Debug.alert("Error in front.onShow: " + error);
      }
    },
    
    /**
     * @memberOf EPG.front
     * @function onHide
     * @description Runs when Dashboard is hidden.
     */
    onHide: function () 
    {
      try
      {
        if(updateInterval)
        {
          clearInterval(updateInterval);
        }
        that.removeDragElement();
      }
      catch (error)
      {
        Debug.alert("Error in front.onHide: " + error);
      }
    }
  };
}(EPG.debug, EPG.growl, EPG.settings, EPG.skin, EPG.translator, EPG.UIcreator, EPG.file, EPG.ProgramInfo);
EPG.front.init();
