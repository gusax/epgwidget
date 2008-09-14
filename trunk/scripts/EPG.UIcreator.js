/*jslint adsafe:false, 
 bitwise: true, 
 browser:true, 
 cap:false, 
 Debug:false,
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

if(EPG.debug)
{
  EPG.debug.inform("EPG.UIcreator.js loaded");
}

/**
 * @name EPG.UIcreator
 * @static
 * @type object
 * @description Creates different UI-elements.
 */
EPG.UIcreator = function(Debug, Skin, Translator, Settings, Reminder)
{
  // Private Variables
  var that,
  transparentElements = [];
  
  // Private methods
  
  
  // Public methods
  return /** @scope UIcreator */ {
  	
  	/**
  	 * @memberOf EPG.UIcreator
  	 * @function init
  	 * @description Saves "this" and initializes the UIcreator.
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
     * @memberOf EPG.UIcreator
     * @name createScalableContainer
     * @function
     * @description Takes contents and a background and returns a div-container that supports scaling of the contents and its background.
     * @private
     * @param {string} className Name of the css-class that should be used for this container.
     * @param {object} contents A DOM-node (for example a div-tag) containing the stuff that should be shown in this container.
     * @param {string} backgroundImage Name of the background image that should be used for this container.
     * @param {number} listID ID of the channelList that this container is for.
     * @return {object} A DOM-node representing the scalable container.
     */
    createScalableContainer: function (className, contents, backgroundImage, listID)  
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
        tempContainer.setAttribute("class","container");
        tempElement = tempContainer.cloneNode(false);
        tempTextNode = document.createTextNode(".");
        
        tempContainer.setAttribute("class","scalable " + className);
        
        tempElement.setAttribute("class","contents");
        
        tempContainer.appendChild(tempElement.cloneNode(false));
        
        tempContainer.firstChild.appendChild(contents);
        tempElement = document.createElement("img");
        tempElement.setAttribute("class", "background");
        
        tempElement.setAttribute("src", "skins/" + Skin.getSkinForList(listID) + "/" + backgroundImage);
        
        tempContainer.appendChild(tempElement.cloneNode(false));
        tempContainer.bgImage = tempContainer.lastChild;
        tempContainer.bgImage.fileName = backgroundImage;
        tempContainer.bgImage.style.opacity = Settings.getTransparency();
        transparentElements[transparentElements.length] = tempContainer.lastChild; 
        tempContainer.contents = contents;
        tempContainer.isVisible = true;
        tempContainer.updateSkin = function (skinId)
        {
          this.bgImage.removeAttribute("src");
          this.bgImage.setAttribute("src", "skins/" + skinId + "/" + this.bgImage.fileName);
        }
        return tempContainer;
      }
      catch (error)
      {
        Debug.alert("Error in UIcreator.createScalableContainer: " + error);
      }
    },
    
    /**
     * @memberOf EPG.UIcreator
     * @function createProgramNode
     * @description Creates a program node that displays information about a specific program.
     * @param {object} [program] The program whos information should be displayed in this programNode. If omitted, returns a programNode with the localized text "No program".
     * @return {object} A DOM-node representing the programNode.
     */
    createProgramNode: function (program, programInfoObject) 
    {
    	var programNode,
    	startNode,
    	titleNode,
    	tempTextNode,
    	startDate;
      try
      {
      	programNode = document.createElement("div");
      	programNode.setAttribute("class", "program");
      	that.setPosition(programNode, "0.2em", "0.3em", "23.8em", "1.2em", false, "relative");
      	startNode = document.createElement("div");
      	startNode.setAttribute("class", "start");
      	startNode.style.fontSize = "1.1em";
      	startNode.addEventListener("click", function(event){Reminder.addReminder(programNode.program);}, false);
      	titleNode = document.createElement("div");
      	titleNode.style.fontSize = "1.1em";
      	titleNode.style.whiteSpace = "nowrap";
      	titleNode.style.overflow = "hidden";
      	titleNode.appendChild(document.createElement("div"));
      	titleNode.firstChild.setAttribute("class", "title");
      	that.setPosition(titleNode.firstChild, "0em", "0em", false, false, false, "absolute");
      	titleNode.firstChild.style.display = "inline";
      	
        if(program && program.start && program.title)
        {
          startDate = new Date(program.start * 1000);
        	tempTextNode = document.createTextNode(Settings.getHHMM(startDate));
        	startNode.appendChild(tempTextNode.cloneNode(false));
        	tempTextNode.nodeValue = ".";
          titleNode.firstChild.appendChild(document.createElement("span"));
          titleNode.firstChild.firstChild.setAttribute("class", "currentProgramDuration");
          titleNode.firstChild.firstChild.appendChild(tempTextNode.cloneNode(true));
          
        	tempTextNode.nodeValue = "No title :-(";
        	for (locale in program.title)
        	{
        	  if(program.title.hasOwnProperty(locale))
        	  {
        	  	tempTextNode.nodeValue = program.title[locale]; // just pick the first translation and then break
        	  	//titleNode.setAttribute("title", Translator.translate("Click to open description."));
        	  	break;
        	  }
        	}
        	titleNode.firstChild.appendChild(tempTextNode.cloneNode(true));
        	delete tempTextNode;
        }
        else if(program && program.isTheEmptyProgram)
        {
          startNode.appendChild(document.createTextNode(" "));
          tempTextNode = document.createTextNode(" ");
          titleNode.firstChild.appendChild(document.createElement("span"));
          titleNode.firstChild.firstChild.setAttribute("class", "currentProgramDuration");
          titleNode.firstChild.firstChild.appendChild(tempTextNode.cloneNode(true));
          titleNode.firstChild.appendChild(tempTextNode.cloneNode(true));
          tempTextNode.nodeValue = "- " + Translator.translate("No program") + " -";
          titleNode.firstChild.appendChild(tempTextNode.cloneNode(true));
        }
        programNode.program = program;
        programNode.appendChild(startNode);
        programNode.appendChild(titleNode);
        that.setPosition(startNode, "0em", "0em", "3.4em", "1.3em", false, "absolute");
        that.setPosition(titleNode, "3.4em", "0em", "14em", "1.3em", false, "absolute");
        
        if(programInfoObject)
        {
          titleNode.addEventListener("mousedown", function(){try{programInfoObject.show(programNode.program);}catch(e){Debug.alert("Error when clicking on titleNode: " + e);}}, false);
          titleNode.addEventListener("DOMMouseScroll", function(event){try{return programInfoObject.scroll(event, programNode.program);}catch(e){Debug.alert("Error when scrolling on titleNode: " + e);}}, false);
          titleNode.addEventListener("mousewheel", function(event){try{return programInfoObject.scroll(event, programNode.program);}catch(e){Debug.alert("Error when scrolling on titleNode: " + e);}}, false);
        }
        
        programNode.startNode = startNode.firstChild;
        programNode.titleNode = titleNode.firstChild.lastChild;
        programNode.durationNode = titleNode.firstChild.firstChild.firstChild;
        
        titleNode.addEventListener("mouseover", function()
        {
          try
          {
            if(!this.firstChild.isAnimating && this.firstChild.offsetWidth + 5 > this.offsetWidth)
            {
              this.firstChild.xPos = 0;
              this.firstChild.style.left = "0px";
              this.firstChild.animationType = "interval";
              this.firstChild.isAnimating = setInterval(function(title, maxScroll)
                                            {
                                              return function ()
                                              {
                                                if(title.xPos < maxScroll)
                                                {
                                                  title.xPos += 1;
                                                  title.style.left = "-" + title.xPos + "px";
                                                }
                                                else
                                                {
                                                  clearInterval(title.isAnimating);
                                                  title.animationType = "timeout";
                                                  title.isAnimating = setTimeout(function()
                                                                                 {
                                                                                   title.xPos = 0; 
                                                                                   title.style.left = "0px";
                                                                                   delete title.animationType; 
                                                                                   title.isAnimating = false;
                                                                                 }, 
                                                                                 5000);
                                                }
                                              }
                                            }(this.firstChild, this.firstChild.offsetWidth - this.offsetWidth + 5),
                                            60);
            }
          }
          catch (e)
          {
            Debug.alert("Error when hovering over a titleNode: " + e);
          }
        }, false);
        
        return programNode;
      }
      catch (error)
      {
        Debug.alert("Error in UIcreator.createProgramNode: " + error);
      }
    },
    
    /**
     * @memberOf EPG.UIcreator
     * @function removeChildNodes
     * @description Removes all child nodes from the specified element.
     * @param {object} node The DOM node that is to be childless.
     */
    removeChildNodes: function (node) 
    {
      try
      {
        if(node)
        {
          while(node.firstChild)
          {
            node.removeChild(node.firstChild);
          }
        }
      }
      catch (error)
      {
        Debug.alert("Error in UIcreator.removeChildNodes: " + error);
      }
    },
    
    /**
     * @memberOf EPG.UIcreator
     * @function setPosition
     * @description Positions a node at the specified position, optionally adding it to a parent node.
     */
    setPosition: function (childNode, x, y, w, h, z, position, parentNode) 
    {
      try
      {
        var style = childNode.style;
        if(position)
        {
          style.position = position;
        }
        if(x)
        {
          style.left = x;
        }
        if(y)
        {
          style.top = y;
        }
        if(w)
        {
          style.width = w;
        }
        if(h)
        {
          style.height = h;
        }
        if(z)
        {
          style.zIndex = z;
        }
        if(parentNode)
        {
          parentNode.appendChild(childNode);
        }
      }
      catch (error)
      {
        Debug.alert("Error in EPG.UIcreator.setPosition: " + error + "\nx = " + x + ", y = " + y + ", w = " + w + ", h = " + h + ", z = " + z + ", relative = " + relative + ", parentNode = " + parentNode);
      }
    },
    
    /**
     * @memberOf EPG.UIcreator
     * @function createScrollbar
     * @description Creates a scrollbar
     */
    createScrollbar: function (x, y, w, h, z, position) 
    {
      try
      {
        var scrollbarBackground, scrollbar;
        
        scrollbarBackground = document.createElement("div")
        
        
      }
      catch (error)
      {
        Debug.alert("Error in EPG.UIcreator.createScrollbar: " + error);
      }
    },
    
    /**
     * @memberOf Epg.UIcreator
     * @function applyTransparency
     * @description Applies transparency on relevant elements.
     */
    applyTransparency: function (transparency) 
    {
      try
      {
        var i;
        for (i = 0; i < transparentElements.length; i += 1)
        {
          transparentElements[i].style.opacity = transparency;
        }
      }
      catch (error)
      {
        Debug.alert("Error in Epg.UIcreator.applyTransparency: " + error);
      }
    },
    
    /**
     * @memberOf EPG.UIcreator
     * @function createList
     * @description Creates a list.
     * @param {string} listTitle Title of list (printed before it)
     * @param {string} listName Name of list.
     * @param {function} onChange Callback for when list value changes.
     */
    createList: function (listTitle, listName, onChange, parentNode) 
    {
      try
      {
        var list = document.createElement("select");
        parentNode.appendChild(document.createTextNode(Translator.translate(listTitle)));
        list.setAttribute("class", "dropdownmenu");
        list.setAttribute("name", listName);
        list.addEventListener("change", onChange, false);
        parentNode.appendChild(list);
        return list;
      }
      catch (error)
      {
        Debug.alert("Error in EPG.UIcreator.createList: " + error);
      }
    },
    
    /**
     * @memberOf EPG.UIcreator
     * @function createListItem
     * @description Creates a list item.
     * @param {object} dataItem Data item.
     */
    createListItem: function (dataItem, parentNode) 
    {
      try
      {
        var listItem = document.createElement("option");
        listItem.setAttribute("value", dataItem.value);
        listItem.appendChild(document.createTextNode(Translator.translate(dataItem.title)));
        if (parentNode)
        {
          parentNode.appendChild(listItem);
        }
        return listItem;
      }
      catch (error)
      {
        Debug.alert("Error in EPG.UIcreator.createListItem: " + error);
      }
    }
  };
}(EPG.debug, EPG.skin, EPG.translator, EPG.settings, EPG.Reminder);
EPG.UIcreator.init();
EPG.PreLoader.resume();