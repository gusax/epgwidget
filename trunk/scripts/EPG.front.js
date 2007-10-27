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

EPG.front = function(debug, growl, settings, skin, translator, UIcreator)
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
      tempElement.firstChild.nodeValue = "EPG: " + translator.translate("overview");
      
      return UIcreator.createScalableContainer("topbar", tempElement.cloneNode(true), "uppe.png", currentChannelListID);
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
      tempContainer.lastChild.addEventListener("click", function(){alert("smallertext");settings.resizeText(-1);}, false);
      tempElement.setAttribute("class", "normaltext");
      tempContainer.appendChild(tempDiv.cloneNode(true));
      tempContainer.lastChild.addEventListener("click", function(){alert("normaltext");settings.resizeText(0);}, false);
      tempElement.setAttribute("class", "biggertext");
      tempContainer.appendChild(tempDiv.cloneNode(true));
      tempContainer.lastChild.addEventListener("click", function(){alert("biggertext");settings.resizeText(1);}, false);
      createInfoButton();
      return UIcreator.createScalableContainer("bottombar", tempContainer, "nere.png",currentChannelListID);
    
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
      frontDiv.appendChild(createTopBar());
      //createInfoButton();
      frontDiv.appendChild(createBottomBar());
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
              settings.resizeTo(270, screen.height, true);
              window.widget.prepareForTransition("ToFront");
              settings.resizeTo(270, 80);
            }
            backDiv.style.display = "none";
          }
          else
          {
            if(window.widget)
            {
              settings.resizeTo(270, 80); // calculate how many channels there are and then resize
            } 
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
}(EPG.debug, EPG.growl, EPG.settings, EPG.skin, EPG.translator, EPG.UIcreator);
EPG.front.init();
