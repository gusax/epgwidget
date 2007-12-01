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
  EPG.debug.alert("EPG.front.js loaded");
}

/**
  * @memberOf EPG 
  * @name front
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
EPG.front = function(Debug, Growl, Settings, Skin, Translator, UIcreator, File) 
{
  // Private Variables
  var that,
  internalState = "loading",
  visible = false,
  backDiv,
  frontDiv,
  overviewDiv,
  channelNodes = {},
  infoButton,
  toBack,
  currentChannelListID,
  width = 270,
  height = 80,
  dragElement;
  
  // Private methods
  /**
   * @memberOf front
   * @name createTopBar
   * @function
   * @description Creates the topmost bar on the widget.
   * @return {object} An element (div tag) representing the top bar.
   * @private
   */
  function createTopBar ()  
  {
    var tempElement,
    tempTextNode;
    try
    {
      tempElement = document.createElement("div");
      tempTextNode = document.createTextNode("");
      
      tempElement.setAttribute("class", "text");
      tempElement.appendChild(tempTextNode.cloneNode(false));
      tempElement.firstChild.nodeValue = "EPG: " + Translator.translate("overview");
      
      return UIcreator.createScalableContainer("topbar", tempElement.cloneNode(true), "uppe.png", currentChannelListID);
    }
    catch (error)
    {
      Debug.alert("Error in front.createTopBar: " + error);
    }
  }
  
  /**
   * @memberOf front
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
      }
    }
    catch (error)
    {
      Debug.alert("Error in front.stopEvent: " + error + " (event = " + event + ")");
    }
  }
  /**
   * @memberOf front
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
        frontDiv.appendChild(infoButton);
        infoButton.addEventListener("click", that.goToBack, false);
      }
    }
    catch (error)
    {
      Debug.alert("Error in front.createInfobutton: " + error);
    }
  }
  
  /**
   * @memberOf front
   * @name createBottomBar
   * @function
   * @description Creates the bar at the bottom of the widget.
   * @private
   * @return {object} An element (div tag) representing the bottom bar.
   */
  function createBottomBar () 
  {
    var tempContainer,
    tempElement,
    tempDiv,
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
      tempContainer.lastChild.addEventListener("click", function(){alert("smallertext");Settings.resizeText(-1);}, false);
      tempElement.setAttribute("class", "normaltext");
      tempContainer.appendChild(tempDiv.cloneNode(true));
      tempContainer.lastChild.addEventListener("click", function(){alert("normaltext");Settings.resizeText(0);}, false);
      tempElement.setAttribute("class", "biggertext");
      tempContainer.appendChild(tempDiv.cloneNode(true));
      tempContainer.lastChild.addEventListener("click", function(){alert("biggertext");Settings.resizeText(1);}, false);
      createInfoButton();
      return UIcreator.createScalableContainer("bottombar", tempContainer, "nere.png",currentChannelListID);
    
    }
    catch (error)
    {
      Debug.alert("Error in front.createBottomBar: " + error);
    }
  }
  
  /**
   * @memberOf front
   * @name couldNotFindLogo
   * @function
   * @description Run if a logo could not be found (for example if it has been deleted from the harddrive)
   * @private
   * @param {string} channelID ID of the channel that the logo belongs to.
   */
  function couldNotFindLogo (channelID)
  {
    var channel;
    try
    {
      Debug.alert("Could not find logo for channel with ID " + channelID + "!");
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
   * @memberOf front
   * @name switchChannelNodes
   * @function
   * @description Switches two channel nodes.
   * @private
   */
  function switchChannelNodes (channelNode) 
  {
    var parentNode,
    i,
    dragElementPosition = -1,
    channelNodePosition = -1,
    currentNode;
    try
    {
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
      parentNode.removeChild(dragElement);
      if(dragElementPosition < channelNodePosition)
      {
        parentNode.insertBefore(dragElement, channelNode.nextSibling);
      }
      else
      {
        parentNode.insertBefore(dragElement, channelNode);
      }
    }
    catch (error)
    {
      Debug.alert("Error in front.switchChannelNodes: " + error);
    }
  }
  
  /**
     * @memberOf front
     * @name saveCurrentChannelOrder
     * @function 
     * @description Creates a string with the current channel ordering.
     * @private
     * @return {string} Comma separated string with the current channel order.
     */
    function saveCurrentChannelOrder () 
    {
      var i,
      length,
      childNodes,
      channelOrder = [],
      channelList;
      try
      {
        childNodes = overviewDiv.childNodes;
        length = childNodes.length;
        if(length > 0)
        {
          for(i = 0; i < length; i+=1)
          {
            if(typeof(childNodes[i].channelID) !== "undefined")
            {
              channelOrder.push(childNodes[i].channelID);
            }
          }
        }
        
        channelList = Settings.getChannelList(currentChannelListID);
        if(channelList && channelList.ordered)
        {
          channelList.ordered = channelOrder;
          Settings.saveChannelList(currentChannelListID);
        }
        
      }
      catch (error)
      {
        Debug.alert("Error in front.saveChannelOrder: " + error);
      }
    }
  
  /**
   * @memberOf front
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
      }
    }
    catch (error)
    {
      Debug.alert("Error in front.startChannelDrag: " + error + " (event = " + event + ")");
    }
  }
  
  /**
   * @memberOf front
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
   * @memberOf front
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
        
        dragElement = false;
      }
    }
    catch (error)
    {
      Debug.alert("Error in front.stopChannelDrag: " + error + " (event = " + event + ")");
    }
  }
  
  /**
   * @memberOf front
   * @name createChannelNode
   * @function
   * @description Creates a container showing the logo, current program and the two upcoming programs.
   * @private
   * @param {string} channelID ID of the channel that should be shown in this container.
   * @return {object} An element (div tag) containing a logo and three program titles.
   */
  function createChannelNode (channelID) 
  {
    var channel,
    channelNode,
    tempScalableContainer,
    logo,
    textNode,
    channelFound = false;
    try
    {
      channelNode = channelNodes[channelID];
      if(channelNode)
      {
        return channelNode; // No need to create a node for the same channelID twice
      }
      else
      {
        channelNode = document.createElement("div");
        channelNode.setAttribute("class", "channelnode");
        channel = Settings.getChannel(channelID);
        if(channel)
        {
          channelFound = true;
          //if(channel.icon)
          //{
            logo = document.createElement("img");
            logo.setAttribute("src", File.getHomePath() + "Library/Xmltv/logos/" + channelID + ".png");
            logo.addEventListener("error", function(){couldNotFindLogo(channelID);}, false);
            logo.setAttribute("class", "logo");
            if(channel.displayName && channel.displayName.sv)
            {
              logo.setAttribute("title", channel.displayName.sv + ". " + Translator.translate("Click to show more programs, press and drag to move."));
            }
            channelNode.logo = logo;
            channelNode.appendChild(logo);
          /*}
          else
          {
            download icons from another source?
          }
          */
          textNode = document.createElement("div");
          textNode.setAttribute("class", "programs");
        }
        else
        {
          textNode = document.createTextNode("Channel with id " + channelID + " was not found :-( It might have been renamed.");
          channelNotInChannelsJS = true;
        }
        channelNode.appendChild(textNode);
        
        tempScalableContainer = UIcreator.createScalableContainer("onechannel", channelNode, "bakgrund.png", currentChannelListID);
        if(channelNode.logo)
        {
          tempScalableContainer.logo = channelNode.logo;
          delete channelNode.logo;
        } 
        channelNodes[channelID] = tempScalableContainer;
        tempScalableContainer.channelID = channelID;
        if(channelFound)
        {
          tempScalableContainer.programsNode = textNode;
          logo.addEventListener("mousedown", function(event){startChannelDrag(event, tempScalableContainer);}, false);
          tempScalableContainer.addEventListener("mouseover", function(event){continueChannelDrag(event, tempScalableContainer);}, false);
          tempScalableContainer.addEventListener("mouseup", function(event){stopChannelDrag(event, tempScalableContainer);}, false);
        }
        else
        {
          // Open backside?
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
   * @memberOf front
   * @name createOverview
   * @function
   * @description Creates the list of channels shown on the front of the widget. (now next later)
   * @private
   * @return {object} An element (div tag) containing all channels.
   */
  function createOverview () 
  {
    var index,
    channelList,
    orderedList;
    try
    {
      overviewDiv = document.createElement("div");
      channelList = Settings.getChannelList(currentChannelListID);
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
      }
      return overviewDiv;
    }
    catch (error)
    {
      Debug.alert("Error in front.createChannelList: " + error);
    }
  }
  
  /**
   * @memberOf front
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
      that.reloadPrograms(new Date());
      that.resize();
    }
    catch (error)
    {
      Debug.alert("Error in front.create: " + error);
    }
  }
  
  /**
   * @memberOf front
   * @name updateProgramNode
   * @function
   * @description Updates the text in a programNode.
   * @private
   * @param {object} programsNode The programsNode.
   * @param {object} program The program containing the new info.
   */
  function updateProgramNode (programNode, program)
  {
    var i,
    startDate,
    start;
    try
    {
      startDate = new Date(program.start*1000);
      if(startDate.getHours() < 10)
      {
        programNode.startNode = "0";
      }
      programNode.startNode += "" + startDate.getHours() + ":";
      if(startDate.getMinutes() < 10)
      {
        programNode.startNode += "0";
      }
      programNode.startNode += "" + startDate.getHours();
      for (locale in program.title)
      {
        if(program.title.hasOwnProperty(locale))
        {
          programNode.titleNode = program.title[locale]; // just pick the first translation and then break
          break;
        }
      }
    }
    catch (error)
    {
      Debug.alert("Error in front.updateProgramsNode: " + error + " (programsNode = " + programsNode + ")");
    }
  }
  
  /**
   * @memberOf front
   * @name reloadProgramsForChannel
   * @function
   * @description Reloads the visible programs for one channel.
   * @private
   * @param {string} channelID ID of the channel that should reload programs.
   * @param {array} programs The programs that are to be shown.
   */
  function reloadProgramsForChannel (channelID, programs)
  {
    var channelNode,
    programNode,
    title;
    try
    {
      channelNode = channelNodes[channelID];
      if(channelNode && programs)
      {
        channelNode = channelNode.programsNode;
        //Debug.alert("channelNode for " + channelID + " = " + channelNode);
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
              channelNode.appendChild(UIcreator.createProgramNode(programs[i]));              
            }
          }
          if(channelNode.firstChild)
          {
            channelNode.firstChild.setAttribute("class", "program currentprogram");
          }
        }
      }
   }
    catch (error)
    {
      Debug.alert("Error in front.reloadProgramsForChannel: " + error + " (channelID = " + channelID + ", programs = " + programs + ")");
    }
  }
  
  // Public methods
  return /** @scope front */ {
    
    /**
     * @memberOf front
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
     * @memberOf front
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
            currentChannelListID = channelListID;
          }
          else
          {
            Debug.alert("front.show: Tried to show front without a specified channelListID!");
          }
          Skin.changeToSkinFromList(currentChannelListID);
          
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
          if(!dontAnimate && window.widget)
          {
            setTimeout(function(){window.widget.performTransition();}, 300);
          }
        }
      }
      catch (error)
      {
        Debug.alert("Error in front.show: " + error);
      }
    },
    
    /**
     * @memberOf front
     * @function hide
     * @description Tells the front that it should consider itself hidden. Used when Dashboard is dismissed to prevent timeouts and intervals from running in the background.
     */
    hide: function () 
    {
      try
      {
        visible = false;
        that.removeDragElement();
      }
      catch (error)
      {
        Debug.alert("Error in front.hide: " + error);
      }
    },
    
    /**
     * @memberOf front
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
     * @memberOf front
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
        }
        if(toBack)
        {
          that.hide();
          toBack();
        }
        else
        {
          Debug.alert("front.goToBack had no toBack method!\nCan't go to back!");
        }
      }
      catch (error)
      {
        Debug.alert("Error in front.goToBack: " + error);
      }
    },
    
    /**
     * @memberOf front
     * @function resize
     * @description Resizes the front side.
     */
    resize: function () 
    {
      var currentChannelList;
      try
      {
        currentChannelList = Settings.getChannelList(currentChannelListID);
        if(currentChannelList && currentChannelList.ordered && currentChannelList.ordered.length > 0)
        {
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
     * @memberOf front
     * @function reloadPrograms
     * @description Reloads the programs on the front side.
     * @param {object} [when] A Date-object specifying what time it is. Use to move forwards or backwards in time.
     */
    reloadPrograms: function (when) 
    {
    	var currentChannelList,
    	channelID,
    	channelNode,
    	now;
      try
      {
      	if(!when)
      	{
      		now = new Date();
      	}
      	else
      	{
      		now = when;
      	}
      	currentChannelList = Settings.getChannelList(currentChannelListID);
      	if(currentChannelList && currentChannelList.ordered && currentChannelList.ordered.length > 0)
        {
        	currentChannelList = currentChannelList.hashed;
        	for (channelID in currentChannelList)
        	{
        	  if(currentChannelList.hasOwnProperty(channelID) && Settings.getChannel(channelID)) // Only try to download programs from channels that are present in channels.js
        	  {
        	  	channelNode = channelNodes[channelID];
        	  	if(channelNode && channelNode.isVisible && channelNode.contents)
        	  	{
        	      Settings.getProgramsForChannel(channelID, function(theID){return function(thePrograms){reloadProgramsForChannel(theID, thePrograms);}}(channelID), function(theID){ return function(){reloadProgramsForChannelFailed(theID);}}(channelID), 3, when);
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
     * @memberOf front
     * @function reloadIcons
     * @description Reloads all icons. Used to update icons if they are changed on, added to or removed from the harddrive
     */
    reloadIcons: function () 
    {
    	var index,
    	channelNode,
    	logo,
    	src;
      try
      {
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
    }
  };
}(EPG.debug, EPG.growl, EPG.settings, EPG.skin, EPG.translator, EPG.UIcreator, EPG.file);
EPG.front.init();
