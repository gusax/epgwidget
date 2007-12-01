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

if(!EPG)
{
  var EPG = {};
}

/**
 * @memberOf EPG
 * @name UIcreator
 * @static
 * @type object
 * @description Creates different UI-elements.
 */
EPG.UIcreator = function(Debug, Skin, Translator)
{
  // Private Variables
  var that;
  
  // Private methods
  
  
  // Public methods
  return /** @scope UIcreator */ {
  	
  	/**
  	 * @memberOf UIcreator
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
     * @memberOf UIcreator
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
        tempTextNode = document.createTextNode("");
        
        tempContainer.setAttribute("class","scalable " + className);
        
        tempElement.setAttribute("class","contents");
        
        tempContainer.appendChild(tempElement.cloneNode(false));
        
        tempContainer.firstChild.appendChild(contents);
        
        tempElement = document.createElement("img");
        tempElement.setAttribute("class", "background");
        
        tempElement.setAttribute("src", "Skins/" + Skin.getSkinForList(listID) + "/" + backgroundImage);
        
        tempContainer.appendChild(tempElement.cloneNode(false));
        tempContainer.contents = contents;
        tempContainer.isVisible = true;
        return tempContainer;
      }
      catch (error)
      {
        Debug.alert("Error in UIcreator.createScalableContainer: " + error);
      }
    },
    
    /**
     * @memberOf UIcreator
     * @function createProgramNode
     * @description Creates a program node that displays information about a specific program.
     * @param {object} [program] The program whos information should be displayed in this programNode. If omitted, returns a programNode with the localized text "No program".
     * @return {object} A DOM-node representing the programNode.
     */
    createProgramNode: function (program) 
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
      	startNode = document.createElement("div");
      	startNode.setAttribute("class", "start");
      	titleNode = document.createElement("div");
      	titleNode.setAttribute("class", "title");
        if(program && program.start && program.title)
        {
          startDate = new Date(program.start * 1000);
        	tempTextNode = document.createTextNode("");
        	if(startDate.getHours() < 10)
        	{
        		tempTextNode.nodeValue = "0";
        	}
        	tempTextNode.nodeValue += "" + startDate.getHours() + ":";
        	if(startDate.getMinutes() < 10)
        	{
        		tempTextNode.nodeValue += "0";
        	}
        	tempTextNode.nodeValue += "" + startDate.getMinutes();
        	startNode.appendChild(tempTextNode.cloneNode(false));
        	
        	tempTextNode.nodeValue = "No title :-(";
        	for (locale in program.title)
        	{
        	  if(program.title.hasOwnProperty(locale))
        	  {
        	  	tempTextNode.nodeValue = program.title[locale]; // just pick the first translation and then break
        	  	break;
        	  }
        	}
        	titleNode.appendChild(tempTextNode.cloneNode(true));
        	delete tempTextNode;
        }
        else if(program && program.isTheEmptyProgram)
        {
          startNode.appendChild(document.createTextNode(""));
          titleNode.appendChild(document.createTextNode("- " + Translator.translate("No program") + " -"));
        }
        programNode.appendChild(startNode);
        programNode.appendChild(titleNode);
        programNode.program = program;
        programNode.startNode = startNode.firstChild;
        programNode.titleNode = titleNode.firstChild;
      
        return programNode;
      }
      catch (error)
      {
        Debug.alert("Error in UIcreator.createProgramNode: " + error);
      }
    },
    
    /**
     * @memberOf UIcreator
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
    }
  };
}(EPG.debug, EPG.skin, EPG.translator);
EPG.UIcreator.init();

