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

EPG.UIcreator = function(debug, skin)
{
  // Private Variables
  var that;
  
  // Private methods
  
  
  // Public methods
  return {
    init: function()
    {
      if(!that)
      {
        that = this;
      }
    },
    
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
        tempElement = tempContainer.cloneNode(false);
        tempTextNode = document.createTextNode("");
        
        tempContainer.setAttribute("class","scalable " + className);
        
        tempElement.setAttribute("class","contents");
        
        tempContainer.appendChild(tempElement.cloneNode(false));
        
        tempContainer.firstChild.appendChild(contents);
        
        tempElement = document.createElement("img");
        tempElement.setAttribute("class", "background");
        
        tempElement.setAttribute("src", "skins/" + skin.getSkinForList(listID) + "/" + backgroundImage);
        
        tempContainer.appendChild(tempElement.cloneNode(false));
        
        return tempContainer;
      }
      catch (error)
      {
        debug.alert("Error in UIcreator.createScalableContainer: " + error);
      }
    }
  };
}(EPG.debug, EPG.skin);
EPG.UIcreator.init();

