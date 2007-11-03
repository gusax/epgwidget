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

/**
  * @scope EPG
  * @static front
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
  channelNodes = {},
  infoButton,
  toBack,
  currentChannelListID,
  width = 270,
  height = 80;
  
  // Private methods
  /**
    * @scope front
    * @function createTopBar
    * @description Creates the topmost bar on the widget.
    * @private
    * @return {object} An element (div tag) representing the top bar.
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
    * @scope front
    * @function createInfoButton
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
    * @scope front
    * @function createBottomBar
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
    * @scope front
    * @function createChannelNode
    * @description Creates a container showing the logo, current program and the two upcoming programs.
    * @private
    * @param {string} channelID ID of the channel that should be shown in this container.
    * @return {object} An element (div tag) containing a logo and three program titles.
    */
  function createChannelNode (channelID) 
  {
    var channel,
    channelNode,
    logo,
    textNode;
    try
    {
      channelNode = channelNodes[channelID];
      if(channelNode)
      {
        return channelNode;
      }
      else
      {
        channelNode = document.createElement("div");
        channel = Settings.getChannel(channelID);
        if(channel)
        {
          if(channel.icon)
          {
            logo = document.createElement("img");
            logo.setAttribute("src", File.getHomePath() + "Library/Xmltv/logos/" + channelID + ".png");
            logo.setAttribute("class", "logo");
            if(channel.displayName && channel.displayName.sv)
            {
              logo.setAttribute("title", channel.displayName.sv);
            }
            channelNode.appendChild(logo);
          }
          textNode = document.createTextNode(channel.displayName.sv);
        }
        else
        {
          textNode = document.createTextNode("Channel with id " + channelID + " was not found :-(");
        }
        channelNode.appendChild(textNode);
        channelNodes[channelID] = UIcreator.createScalableContainer("onechannel", channelNode, "bakgrund.png", currentChannelListID);
        return channelNodes[channelID];
      }
      
    }
    catch (error)
    {
      Debug.alert("Error in front.createChannelNode: " + error + " (channelID = " + channelID + ")");
    }
  }
  
  /**
    * @scope front
    * @function createOverview
    * @description Creates the list of channels shown on the front of the widget. (now next later)
    * @private
    * @return {object} An element (div tag) containing all channels.
    */
  function createOverview () 
  {
    var index, 
    overview,
    channelList,
    orderedList;
    try
    {
      overview = document.createElement("div");
      channelList = Settings.getChannelList(currentChannelListID);
      if(channelList && channelList.ordered)
      {
        orderedList = channelList.ordered;
        for (index in orderedList)
        {
          if(orderedList.hasOwnProperty(index))
          {
            overview.appendChild(createChannelNode(orderedList[index]));
          }
        }
      }
      return overview;
    }
    catch (error)
    {
      Debug.alert("Error in front.createChannelList: " + error);
    }
  }
  
  /**
    * @scope front
    * @function create
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
      Debug.alert("ran front.create");
      that.resize();
    }
    catch (error)
    {
      Debug.alert("Error in front.create: " + error);
    }
  }
  
  // Public methods
  return {
    
    /**
      * @scope front
      * @function init
      * @description Initializes the singleton and saves the this-object.
      */
    init: function()
    {
      if(!that)
      {
        that = this;
      }
    },
    
    /**
      * @scope front
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
      * @scope front
      * @function hide
      * @description Tells the front that it should consider itself hidden. Used when Dashboard is dismissed to prevent timeouts and intervals from running in the background.
      */
    hide: function () 
    {
      try
      {
        visible = false;
      }
      catch (error)
      {
        Debug.alert("Error in front.hide: " + error);
      }
    },
    
    /**
      * @scope front
      * @function goToBack
      * @description Calls the function responsible for flipping the widget over to its backside.
      * @param {object} The event that caused this function to be run. 
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
      * @scope front
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
    }
  };
}(EPG.debug, EPG.growl, EPG.settings, EPG.skin, EPG.translator, EPG.UIcreator, EPG.file);
EPG.front.init();
