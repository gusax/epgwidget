
if (EPG.debug)
{
  EPG.debug.inform("EPG.PreLoader loaded");
}

/**
 * @memberOf EPG
 * @name PreLoader
 * @static
 * @type object
 * @description Preloads the scripts in the EPG widget.
 */
EPG.PreLoader = function (Debug) 
{
  // Private Variables
  var that,
  queue = [],
  numScripts = 0,
  numLoaded = -1,
  onFinish,
  body = document.getElementsByTagName("body")[0],
  loadingDiv;
  
  // Private methods
  /**
   * @memberOf EPG.PreLoader
   * @name createScriptTag
   * @function
   * @description Creates a script-tag.
   * @private
   * @return {object} The script tag.
   */
  function createScriptTag(onload) 
  {
    try
    {
      var tag = document.createElement("script");
      //tag.setAttribute("type", "text/javascript");
      //tag.addEventListener("load", onload, false);
      //tag.onload = onload;
      tag.eventListener = onload;
      tag.destroy = function ()
      {
        //this.removeEventListener("load", this.eventListener, false);
        this.parentNode.removeChild(this);
      }
      return tag;
    }
    catch (error)
    {
      Debug.alert("Error in EPG.PreLoader.createScriptTag: " + error);
    }
  }
  
  /**
   * @memberOf EPG.PreLoader
   * @name loadScript
   * @function
   * @description Loads a (new) script.
   * @private
   */
  function loadScript()
  {
    try
    {
      var scriptObj, tag;
      
      if (numLoaded >= 0)
      {
        loadingDiv.loadingMessage.nodeValue += ".";
        scriptObj = queue.shift(); // Remove first element from queue 
        scriptObj.tag.destroy(); // Remove script tag
        Debug.inform("EPG.PreLoader: " + scriptObj.path + " OK.");
        if (scriptObj.initFunction)
        {
          scriptObj.initFunction();
        }
        // update progressbar?
      }
      numLoaded += 1;
      
      scriptObj = queue[0]; // FIFO, pick first element in queue
      if (scriptObj && scriptObj.path)
      {
        scriptObj.tag = createScriptTag(loadScript);
        setTimeout(
          function()
          {
            scriptObj.tag.setAttribute("src", scriptObj.path); // Must set src before appending script-tag to body! 
            body.appendChild(scriptObj.tag);
          },
          20);
      }
      else if (!scriptObj)
      {
        // We're done!
        if (onFinish)
        {
          setTimeout(
          function()
          {
            onFinish();
          },
          20);
        }
      }
      else 
      {
        // We have a scriptObj, but it does not have a path. Skip it, try next.
        Debug.warn("EPG.PreLoader: Skipping a script...");
        loadScript();
      }
    }
    catch (error)
    {
      Debug.alert("Error in EPG.PreLoader.loadScript: " + error);
    }
  }
  
  // Public methods
  return /** @scope EPG.PreLoader */ {
    /**
     * @memberOf EPG.PreLoader
     * @description Initialization function for PreLoader.
     */
    init: function ()
    {
      if (!that)
      {
        that = this;
      }
      
      loadingDiv = document.createElement("div");
      loadingDiv.image = loadingDiv.appendChild(document.createElement("img"));
      loadingDiv.image.setAttribute("src", "Default.png");
      loadingDiv.messageContainer = loadingDiv.appendChild(document.createElement("div"));
      loadingDiv.messageContainer.style.position = "absolute";
      loadingDiv.messageContainer.style.top = "1.7em";
      loadingDiv.messageContainer.style.left = "1em";
      loadingDiv.messageContainer.style.width = "5em";
      loadingDiv.messageContainer.style.textAlign = "left";
      loadingDiv.messageContainer.style.fontWeight = "bold";
      loadingDiv.messageContainer.style.fontSize = "2em";
      loadingDiv.messageContainer.appendChild(document.createTextNode("."));
      loadingDiv.loadingMessage = loadingDiv.messageContainer.lastChild;
      loadingDiv.destroy = function ()
      {
        this.parentNode.removeChild(this);
      }
      body.appendChild(loadingDiv);
      delete that.init;
    },
    
    /**
     * @memberOf EPG.PreLoader
     * @function addScript
     * @description Adds a script to the queue.
     * @param {string} path Path to script file.
     * @param {function} [initFunction] Optional function to run after script has been loaded.
     */
    addScript: function (path, initFunction) 
    {
      try
      {
        var scriptObj = {};
        scriptObj.path = path;
        scriptObj.initFunction = initFunction;
        queue[queue.length] = scriptObj; 
        numScripts += 1;
      }
      catch (error)
      {
        Debug.alert("Error in EPG.PreLoader.addScript: " + error);
      }
    },
    
    /**
     * @memberOf EPG.PreLoader
     * @function runWhenFinished
     * @description bizo
     * @param {function} onFinishFunction Function to run when loading has finished.
     */
    runWhenFinished: function (onFinishFunction) 
    {
      try
      {
        onFinish = onFinishFunction;
      }
      catch (error)
      {
        Debug.alert("Error in EPG.PreLoader.runWhenFinished: " + error);
      }
    },
    
    /**
     * @memberOf EPG.PreLoader
     * @function start
     * @description Starts the preloading.
     */
    start: function () 
    {
      try
      {
        loadScript();
      }
      catch (error)
      {
        Debug.alert("Error in EPG.PreLoader.start: " + error);
      }
    },
    
    /**
     * @memberOf EPG.PreLoader
     * @function destroy
     * @description Destroys the PreLoader
     */
    destroy: function () 
    {
      try
      {
        loadingDiv.destroy();
        delete EPG.PreLoader;
      }
      catch (error)
      {
        Debug.alert("Error in EPG.PreLoader.destroy: " + error);
      }
    },
    
    /**
     * @memberOf EPG.PreLoader
     * @function resume
     * @description Resumes the PreLoader.
     */
    resume: function () 
    {
      try
      {
        loadScript();
      }
      catch (error)
      {
        Debug.alert("Error in EPG.PreLoader.resume: " + error);
      }
    }
  };
}(EPG.debug);
EPG.PreLoader.init();
EPG.PreLoader.addScript("scripts/EPG.growl.js");
EPG.PreLoader.addScript("scripts/EPG.file.js");
EPG.PreLoader.addScript("scripts/EPG.settings.js");
EPG.PreLoader.addScript("scripts/EPG.skin.js");
EPG.PreLoader.addScript("scripts/EPG.Reminder.js");
EPG.PreLoader.addScript("scripts/EPG.UIcreator.js");
EPG.PreLoader.addScript("scripts/EPG.back.js");
EPG.PreLoader.addScript("scripts/EPG.ProgramInfo.js");
EPG.PreLoader.addScript("scripts/EPG.front.js");
EPG.PreLoader.addScript("scripts/EPG.widget.js");
EPG.bootstrap();