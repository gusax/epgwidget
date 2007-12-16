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
 on:false,
 passfail:false, 
 plusplus:true, 
 rhino:false, 
 undef:true, 
 white:false, 
 widget:false */

/*extern EPG*/

/**
 * @memberOf EPG
 * @name ProgramInfo
 * @static
 * @type object
 * @description Shows the program info.
 */
EPG.ProgramInfo = function(Debug, UIcreator, Translator, Settings, Skin) 
{
  // Private Variables
  var that,
  scalableContainer,
  programInfoNode,
  xPos = 0,
  yPos = 0,
  currentChannelListIndex;
  
  // Private methods
  /**
   * @memberOf ProgramInfo
   * @name create
   * @function
   * @description Creates the necessary DOM nodes.
   * @private
   */
  function create ()
  {
    var div,
    textNode;
    try
    {
      currentChannelListIndex = Settings.getCurrentChannelListIndex();
      programInfoNode = document.createElement("div");
      
      div = document.createElement("div");
      textNode = document.createTextNode("");
      
      programInfoNode.appendChild(div.cloneNode(false));
      programInfoNode.lastChild.setAttribute("class","title");
      programInfoNode.lastChild.appendChild(textNode.cloneNode(false));
      programInfoNode.titleNode = programInfoNode.lastChild.firstChild;
      
      programInfoNode.appendChild(div.cloneNode(false));
      programInfoNode.lastChild.setAttribute("class","startAndStop");
      programInfoNode.startAndStopNode = programInfoNode.lastChild;
      
      programInfoNode.startAndStopNode.appendChild(div.cloneNode(false));
      programInfoNode.startAndStopNode.lastChild.setAttribute("class","start");
      programInfoNode.startAndStopNode.lastChild.appendChild(textNode.cloneNode(false));
      programInfoNode.startNode = programInfoNode.startAndStopNode.lastChild.firstChild;

      programInfoNode.startAndStopNode.appendChild(div.cloneNode(false));
      programInfoNode.startAndStopNode.lastChild.setAttribute("class","progressbar");
      programInfoNode.progressbarNode = programInfoNode.startAndStopNode.lastChild;
      
      programInfoNode.startAndStopNode.appendChild(div.cloneNode(false));
      programInfoNode.startAndStopNode.lastChild.setAttribute("class","stop");
      programInfoNode.startAndStopNode.lastChild.appendChild(textNode.cloneNode(false));
      programInfoNode.stopNode = programInfoNode.startAndStopNode.lastChild.firstChild;
      
      programInfoNode.appendChild(div.cloneNode(false));
      programInfoNode.lastChild.setAttribute("class","descriptionFrame");
      programInfoNode.descriptionFrameNode = programInfoNode.lastChild;
      
      programInfoNode.descriptionFrameNode.appendChild(div.cloneNode(false));
      programInfoNode.descriptionFrameNode.lastChild.setAttribute("class","description");
      programInfoNode.descriptionFrameNode.lastChild.appendChild(textNode.cloneNode(false));
      programInfoNode.descriptionNode = programInfoNode.descriptionFrameNode.lastChild.firstChild;
      
      scalableContainer = UIcreator.createScalableContainer("programInfo", programInfoNode, "infobakgrund.png", currentChannelListIndex);
      scalableContainer.setAttribute("id","programInfo");
      scalableContainer.style.visibility = "hidden";
      document.getElementsByTagName("body")[0].appendChild(scalableContainer);
    }
    catch (error)
    {
      Debug.alert("Error in ProgramInfo.create: " + error);
    }
  }
  
  /**
   * @memberOf ProgramInfo
   * @name getHHMM
   * @function
   * @description Returns a specified timestamp formatted as HH:MM.
   * @private
   * @param {number} timestamp Unix timestamp.
   * @return {string} The timestamp formatted as HH:MM.
   */
  function getHHMM (timestamp)
  {
    var date,
    HHMM;
    try
    {
      if(typeof(timestamp) !== "undefined")
      {
        date = new Date(timestamp * 1000);
        if(date.getHours() < 10)
        {
          HHMM = "0" + date.getHour() + ":";
        }
        else
        {
          HHMM = date.getHours() + ":";
        }
        if(date.getMinutes() < 10)
        {
          HHMM += "0" + date.getMinutes();
        }
        else
        {
          HHMM += "" + date.getMinutes();
        }
        return HHMM;
      }
      else
      {
        return "";
      }
    }
    catch (error)
    {
      Debug.alert("Error in ProgramInfo.getHHMM: " + error + " (timestamp = " + timestamp + ")");
    }
  }
  
  // Public methods
  return /** @scope ProgramInfo */ {
    /**
     * @memberOf ProgramInfo
     * @description Initialization function for ProgramInfo.
     */
    init: function()
    {
      if(!that)
      {
        that = this;
      }
      create();
      delete that.init;
    },
    
    /**
     * @memberOf ProgramInfo
     * @function show
     * @description Shows the program information.
     * @param {object} program A program object.
     * @param {number} x X coordinate of active channel title.
     * @param {number} y Y coordinate of active channel title.
     */
    show: function (program, x, y) 
    {
      var locale,
      description;
      try
      {
        if(program)
        {
          if(programInfoNode.program !== program)
          {
            programInfoNode.program = program;
            
            // Title
            for (locale in program.title)
            {
              if(program.title.hasOwnProperty(locale))
              {
                programInfoNode.titleNode.nodeValue = program.title[locale];
                break;
              }
            }
            
            // Description
            if(program.desc)
            {
              if(program.desc[locale])
              {
                programInfoNode.descriptionNode.nodeValue = program.desc[locale];
              }
              else
              {
                for (locale in program.title)
                {
                  if(program.desc.hasOwnProperty(locale))
                  {
                    programInfoNode.descriptionNode.nodeValue = program.desc[locale];
                    break;
                  }
                }
              }
              
              // Start & stop
              programInfoNode.startNode.nodeValue = getHHMM(program.start);
              programInfoNode.stopNode.nodeValue = getHHMM(program.stop);
              // Category (and episode number if category = series)
              
              // Director(s)
              
              // Actor(s)
            }
            else
            {
              programInfoNode.descriptionNode.nodeValue = Translator.translate("No description.");
            }  
            
            if(scalableContainer.style.visibility !== "visible")
            {
              scalableContainer.style.visibility = "visible";
            }  
          } 
          else if(scalableContainer.style.visibility !== "visible")
          {
            scalableContainer.style.visibility = "visible";
          }
          else if(scalableContainer.style.visibility !== "hidden")
          {
            scalableContainer.style.visibility = "hidden";
          }
        }
        else
        {
          Debug.alert("ProgramInfo.show: Program was undefined!");
        }
      }
      catch (error)
      {
        Debug.alert("Error in ProgramInfo.show: " + error + " (program = " + program + ")");
      }
    },
    
    /**
     * @memberOf ProgramInfo
     * @function hide
     * @description Hides the program information.
     */
    hide: function () 
    {
      try
      {
        if(scalableContainer.style.visibility !== "hidden")
        {
          scalableContainer.style.visibility = "hidden";
          delete programInfoNode.program;
        }
      }
      catch (error)
      {
        Debug.alert("Error in ProgramInfo.hide: " + error);
      }
    }
  };
}(EPG.debug, EPG.UIcreator, EPG.translator, EPG.settings, EPG.skin);
EPG.ProgramInfo.init();
