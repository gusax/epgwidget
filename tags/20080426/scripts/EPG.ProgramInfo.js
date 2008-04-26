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

if(EPG.debug)
{
  EPG.debug.inform("EPG.ProgramInfo.js loaded");
}

/**
 * @name EPG.ProgramInfo
 * @static
 * @type object
 * @description Shows the program info.
 */
EPG.ProgramInfo = function(Debug, UIcreator, Translator, Settings, Skin, File, Reminder) 
{
  // Private Variables
  var that,
  scalableContainer,
  programInfoNode,
  currentChannelListIndex,
  progressbarFull,
  logo,
  animationRunning = false,
  animationInterval;
  
  // Private methods
  /**
   * @memberOf EPG.ProgramInfo
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
          HHMM = "0" + date.getHours() + ":";
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
  
  /**
   * @memberOf EPG.ProgramInfo
   * @name updateProgressbar
   * @function
   * @description Updates progressbar and associated information.
   * @private
   * @param {object} start Date object that represent when the program starts.
   * @param {object} stop Date object that represent when the program ends.
   * @param {object} now Date object that represent what time it is now.
   */
  function updateProgressbar (start, stop, now)
  {
    var length, width, timeLeft;
    
    try
    {
      length = stop - start;
      timeLeft = Math.round(((stop - now)/60000));
      if(timeLeft < 0)
      {
        progressbarFull.style.visibility = "hidden";
        programInfoNode.durationNode.nodeValue = Translator.translate("Duration") + " " + (Math.round(length/60000)) + " " + Translator.translate("min") + ", " + Translator.translate("ended") + " " + (-1*timeLeft) + " " + Translator.translate("min ago") + ".";
      }
      else if(start <= now && now < stop)
      {
        width = Math.round( ((now - start) / length) * 100);
        progressbarFull.firstChild.style.width = width + "%";
        progressbarFull.style.visibility = "inherit";
        programInfoNode.durationNode.nodeValue = Translator.translate("Duration") + " " + Math.round(length/60000) + " " + Translator.translate("min") + ", " + timeLeft + " " + Translator.translate("min left") + ".";
      }
      else
      {
        progressbarFull.style.visibility = "hidden";
        programInfoNode.durationNode.nodeValue = Translator.translate("Duration") + " " + (Math.round(length/60000)) + " " + Translator.translate("min") + ", " + Translator.translate("starts in") + " " + (Math.round((start - now) / 60000))+ " " + Translator.translate("min") + ".";
      }
    }
    catch (error)
    {
      Debug.alert("Error in ProgramInfo.updateProgressbar: " + error + " (start = " + start + ")");
    }
  }
  
    /**
     * Easing equation function for a cubic (t^3) easing in: accelerating from zero velocity.
     *
     * @param t   Current time (in frames or seconds).
     * @param b   Starting value.
     * @param c   Change needed in value.
     * @param d   Expected easing duration (in frames or seconds).
     * @return    The correct value.
     */
    function easeInCubic (t, b, c, d)
    {
      return c*(t/=d)*t*t + b;
    }
  
  /**
     * Easing equation function for a cubic (t^3) easing out: decelerating from zero velocity.
     *
     * @param t   Current time (in frames or seconds).
     * @param b   Starting value.
     * @param c   Change needed in value.
     * @param d   Expected easing duration (in frames or seconds).
     * @return    The correct value.
     */

    function easeOutCubic (t, b, c, d)
    {
      return c*((t=t/d-1)*t*t + 1) + b;
    }

    /**
     * Easing equation function for a cubic (t^3) easing in/out: acceleration until halfway, then deceleration.
     *
     * @param t   Current time (in frames or seconds).
     * @param b   Starting value.
     * @param c   Change needed in value.
     * @param d   Expected easing duration (in frames or seconds).
     * @return    The correct value.
     */
    function easeInOutCubic (t, b, c, d)
    {
      if ((t/=d/2) < 1)
      {
        return c/2*t*t*t + b;
      }
      else
      {
        return c/2*((t-=2)*t*t + 2) + b;
      }
    }
  
  
  /**
     * Easing equation function for a cubic (t^3) easing out/in: deceleration until halfway, then acceleration.
     * @param t   Current time (in frames or seconds).
     * @param b   Starting value.
     * @param c   Change needed in value.
     * @param d   Expected easing duration (in frames or seconds).
     * @return    The correct value.
     */

    function easeOutInCubic (t, b, c, d)
    {
      if (t < d/2) 
      { 
        return easeOutCubic (t*2, b, c/2, d);
      }
      else
      {
        return easeInCubic((t*2)-d, b+c/2, c/2, d);
      }
    }
  
    /**
     * Easing equation function for a back (overshooting cubic easing: (s+1)*t^3 - s*t^2) easing out: decelerating from zero velocity.
     *
     * @param t   Current time (in frames or seconds).
     * @param b   Starting value.
     * @param c   Change needed in value.
     * @param d   Expected easing duration (in frames or seconds).
     * @param s   Overshoot ammount: higher s means greater overshoot (0 produces cubic easing with no overshoot, and the default value of 1.70158 produces an overshoot of 10 percent).
     * @return    The correct value.
     */

    function easeOutBack (t, b, c, d, s)
    {
      if (!s) 
      {
        s = 1.70158;
      }
      return c*((t=t/d-1)*t*((s+1)*t + s) + 1) + b;
    }
  
  /**
   * @memberOf EPG.ProgramInfo
   * @name bounceback
   * @function
   * @description Bounces the description back if it has been scrolled too far.
   * @private
   */
  function bounceback (amount, force)
  {
    var easingValue;
    try
    {
      if(amount === 0 || programInfoNode.descriptionFrameNode.animationStep >= programInfoNode.descriptionFrameNode.animationSteps)
      {
        animationRunning = false;
        clearInterval(animationInterval);
        programInfoNode.descriptionContainer.topY = programInfoNode.descriptionFrameNode.endY;
      }
      else
      {
        easingValue = Math.round(easeOutCubic(programInfoNode.descriptionFrameNode.animationStep, programInfoNode.descriptionContainer.topY, programInfoNode.descriptionFrameNode.correctionNeeded, programInfoNode.descriptionFrameNode.animationSteps, force));
        programInfoNode.descriptionContainer.style.top =  easingValue + "px";
        programInfoNode.durationContainer.style.top = programInfoNode.descriptionContainer.style.top;
        /*if(easingValue === programInfoNode.descriptionFrameNode.endY)
        {
          programInfoNode.descriptionFrameNode.animationStep = programInfoNode.descriptionFrameNode.animationSteps;
        }
        else
        {*/
          programInfoNode.descriptionFrameNode.animationStep += 1;
        //}
      }
    }
    catch (error)
    {
      Debug.alert("Error in ProgramInfo.bounceback: " + error);
    }
  }
  
  /**
   * @memberOf EPG.ProgramInfo
   * @name startBounceback
   * @function
   * @description Starts the bounce back animation
   * @private
   * @param {number} amount Amount (or force) of scroll.
   * @param {number} endY Final y coordinate.
   */
  function startBounceback (amount, endY)
  {
    var force;
    try
    {
      animationRunning = true;
      programInfoNode.descriptionFrameNode.animationStep = 1;
      programInfoNode.descriptionFrameNode.animationSteps = 25;
      programInfoNode.descriptionFrameNode.animationAmount = amount;
      programInfoNode.descriptionFrameNode.endY = endY;
      programInfoNode.descriptionFrameNode.correctionNeeded = endY - programInfoNode.descriptionContainer.topY;
      animationInterval = setInterval(function(){bounceback(amount, force);}, 40); // 25fps, will complete animation in one second
    }
    catch (error)
    {
      Debug.alert("Error in ProgramInfo.startBounceback: " + error + " (amount = " + amount + ")");
    }
  }
  
  /**
   * @memberOf EPG.ProgramInfo
   * @name scrollDescription
   * @function
   * @description Scrolls the description by the specified amount.
   * @private
   * @param {number} amount Amount of scrolling to be done.
   */
  function scrollDescription (amount)
  {
    try
    {
      var limit;
      
      limit = -1*(programInfoNode.descriptionFrameNode.scrollHeight - programInfoNode.descriptionFrameNode.offsetHeight);
      if(!animationRunning)
      {
        if(limit < 0)
        {
          programInfoNode.descriptionContainer.topY = programInfoNode.descriptionContainer.topY + amount;
          if(programInfoNode.descriptionContainer.topY > 0)
          {
            //startBounceback(amount, 0);
            programInfoNode.descriptionContainer.topY = 0;
          }
          else if(programInfoNode.descriptionContainer.topY < limit)
          {
            //startBounceback(amount, limit);
            programInfoNode.descriptionContainer.topY = limit;
          }
          programInfoNode.durationContainer.style.top = programInfoNode.descriptionContainer.topY + "px";
          programInfoNode.descriptionContainer.style.top = programInfoNode.descriptionContainer.topY + "px";
        }
      }
    }
    catch (error)
    {
      Debug.alert("Error in ProgramInfo.scrollDescription: " + error + " (amount = " + amount + ", programInfoNode.descriptionNode.topY = " + programInfoNode.descriptionNode.topY + ")");
    }
  }
  
  // Public methods
  return /** @scope ProgramInfo */ {
    /**
     * @memberOf EPG.ProgramInfo
     * @description Initialization function for ProgramInfo.
     */
    init: function()
    {
      try
      {
        var div,
        textNode;
        
        if(!that)
        {
          that = this;
        }
        
        currentChannelListIndex = Settings.getCurrentChannelListIndex();
        programInfoNode = document.createElement("div");
        
        div = document.createElement("div");
        textNode = document.createTextNode("");
        logo = document.createElement("img");
        logo.setAttribute("id","backgroundlogo");
        logo.style.visibility = "hidden";
        programInfoNode.appendChild(logo);
        
        programInfoNode.appendChild(div.cloneNode(false));
        programInfoNode.lastChild.setAttribute("class","title");
        programInfoNode.lastChild.style.margin = "2.5em 2.7em 0em 0.9em";
        programInfoNode.lastChild.style.height = "1.3em";
        programInfoNode.lastChild.style.overflow = "hidden";
        programInfoNode.lastChild.style.fontSize = "1.1em";
        programInfoNode.lastChild.appendChild(textNode.cloneNode(false));
        programInfoNode.titleNode = programInfoNode.lastChild.firstChild;
        
        
        programInfoNode.appendChild(div.cloneNode(false));
        programInfoNode.lastChild.setAttribute("class","startAndStop");
        programInfoNode.startAndStopNode = programInfoNode.lastChild;
        programInfoNode.startAndStopNode.style.margin = "0.1em 2.7em 0.2em 0.9em";
        programInfoNode.startAndStopNode.style.fontSize = "1.1em";
        programInfoNode.startAndStopNode.style.height = "2em";
        programInfoNode.startAndStopNode.style.overflow = "hidden";
        
        programInfoNode.startAndStopNode.appendChild(div.cloneNode(false));
        programInfoNode.startAndStopNode.lastChild.setAttribute("class","start");
        UIcreator.setPosition(programInfoNode.startAndStopNode.lastChild, "0.7em", "3.9em", "3.2em", "1.4em", false, "absolute");
        programInfoNode.startAndStopNode.lastChild.style.lineHeight = "2em";
        programInfoNode.startAndStopNode.lastChild.appendChild(textNode.cloneNode(false));
        programInfoNode.startNode = programInfoNode.startAndStopNode.lastChild.firstChild;
        programInfoNode.startAndStopNode.lastChild.addEventListener("click", function(event){Reminder.addReminder(programInfoNode.program);}, false);
  
        progressbarFull = div.cloneNode(false);
        progressbarFull.setAttribute("class","progressbarFullContainer");
        UIcreator.setPosition(progressbarFull, "4.1em", "4.6em", "12em", "1.4em", 2, "absolute");
        progressbarFull.appendChild(div.cloneNode(true));
        progressbarFull.firstChild.style.width = "0%";
        progressbarFull.firstChild.style.height = "100%";
        progressbarFull.firstChild.style.overflow = "hidden";
        progressbarFull.firstChild.appendChild(UIcreator.createScalableContainer("progressbarFull", div.cloneNode(true), "tid.png", currentChannelListIndex));
        progressbarFull.firstChild.firstChild.style.width = "12em";
        progressbarFull.firstChild.firstChild.style.height = "1.4em";
        programInfoNode.appendChild(progressbarFull);
        programInfoNode.progressbarFullNode = programInfoNode.lastChild;
  
        programInfoNode.appendChild(UIcreator.createScalableContainer("progressbarEmpty", div.cloneNode(true), "tidtom.png", currentChannelListIndex));
        programInfoNode.progressbarEmptyNode = programInfoNode.lastChild;
        UIcreator.setPosition(programInfoNode.progressbarEmptyNode, "4.1em", "4.6em", "12em", "1.4em", 1, "absolute");
        
        programInfoNode.startAndStopNode.appendChild(div.cloneNode(false));
        programInfoNode.startAndStopNode.lastChild.setAttribute("class","stop");
        UIcreator.setPosition(programInfoNode.startAndStopNode.lastChild, "14.9em", "3.9em", "3.2em", "1.4em", false, "absolute");
        programInfoNode.startAndStopNode.lastChild.style.lineHeight = "2em";
        
        programInfoNode.startAndStopNode.lastChild.appendChild(textNode.cloneNode(false));
        programInfoNode.stopNode = programInfoNode.startAndStopNode.lastChild.firstChild;
        
        // Scrollbar
        programInfoNode.appendChild(div.cloneNode(false));
        programInfoNode.lastChild.setAttribute("class","programInfoScrollButton");
        programInfoNode.scrollUpButton = programInfoNode.lastChild;
        programInfoNode.scrollUpButton.appendChild(document.createTextNode("\u25b2")); // Arrow up
        UIcreator.setPosition(programInfoNode.scrollUpButton, "18.6em", "21.7em", "1.2em", "1.2em", 1, "absolute");
        programInfoNode.scrollUpButton.style.border = "0.1em solid transparent";
        programInfoNode.scrollUpButton.style.lineHeight = "1.2em";
        programInfoNode.scrollUpButton.style.textAlign = "center";
        programInfoNode.scrollUpButton.addEventListener("mousedown", function(event){try{that.scroll(event, programInfoNode.program, 10);}catch(e){Debug.alert("Error when clicking on scrollUpButton: " + e);}}, false);
        
        
        programInfoNode.appendChild(div.cloneNode(false));
        programInfoNode.lastChild.setAttribute("class","programInfoScrollButton");
        programInfoNode.scrollDownButton = programInfoNode.lastChild;
        programInfoNode.scrollDownButton.appendChild(document.createTextNode("\u25bc")); // Arrow down
        UIcreator.setPosition(programInfoNode.scrollDownButton, "18.6em", "23.3em", "1.2em", "1.2em", 1, "absolute");
        programInfoNode.scrollDownButton.style.border = "0.1em solid transparent";
        programInfoNode.scrollDownButton.style.lineHeight = "1.4em";
        programInfoNode.scrollDownButton.style.textAlign = "center";
        programInfoNode.scrollDownButton.addEventListener("mousedown", function(event){try{that.scroll(event, programInfoNode.program, -10);}catch(e){Debug.alert("Error when clicking on scrollUpButton: " + e);}}, false);
        
        // Description frame
        programInfoNode.appendChild(div.cloneNode(false));
        programInfoNode.lastChild.setAttribute("class","descriptionFrame");
        programInfoNode.descriptionFrameNode = programInfoNode.lastChild;
        programInfoNode.descriptionFrameNode.setAttribute("title", Translator.translate("Use mousewheel/trackpad to scroll description") + ".");
        UIcreator.setPosition(programInfoNode.descriptionFrameNode, "0em", "6.6em", "18em", "18.3em", false, "absolute");
        programInfoNode.descriptionFrameNode.style.margin = "0em 2em 0em 1em";
        programInfoNode.descriptionFrameNode.style.overflow = "hidden";
        programInfoNode.descriptionFrameNode.style.clear = "both";
        
        programInfoNode.descriptionFrameNode.addEventListener("DOMMouseScroll", function(event){try{that.scroll(event, programInfoNode.program);}catch(e){Debug.alert("Error when scrolling on titleNode: " + e);}}, false);
        programInfoNode.descriptionFrameNode.addEventListener("mousewheel", function(event){try{that.scroll(event, programInfoNode.program);}catch(e){Debug.alert("Error when scrolling on titleNode: " + e);}}, false);
          
        // Duration and time left
        programInfoNode.descriptionFrameNode.appendChild(div.cloneNode(false));
        programInfoNode.descriptionFrameNode.lastChild.setAttribute("class","duration");
        programInfoNode.descriptionFrameNode.lastChild.style.fontSize = "1.1em";
        programInfoNode.descriptionFrameNode.lastChild.style.margin = "0.8em 0.8em 0em 0.2em"; 
        programInfoNode.descriptionFrameNode.lastChild.appendChild(textNode.cloneNode(false));
        programInfoNode.durationNode = programInfoNode.descriptionFrameNode.lastChild.firstChild;
        programInfoNode.durationContainer = programInfoNode.descriptionFrameNode.lastChild; 
        programInfoNode.durationContainer.style.position="relative";
        
        // Description
        programInfoNode.descriptionFrameNode.appendChild(div.cloneNode(false));
        programInfoNode.descriptionFrameNode.lastChild.setAttribute("class","description");
        programInfoNode.descriptionFrameNode.lastChild.style.paddingBottom = "1em";
        programInfoNode.descriptionFrameNode.lastChild.style.fontSize = "1.1em";
        programInfoNode.descriptionFrameNode.lastChild.style.margin = "0.8em 0.8em 0em 0.2em";
        programInfoNode.descriptionFrameNode.lastChild.appendChild(textNode.cloneNode(false));
        programInfoNode.descriptionNode = programInfoNode.descriptionFrameNode.lastChild.firstChild;
        programInfoNode.descriptionContainer = programInfoNode.descriptionFrameNode.lastChild;
        programInfoNode.descriptionContainer.topY = 0;
        programInfoNode.descriptionContainer.style.position="relative";
        
        scalableContainer = UIcreator.createScalableContainer("programInfo", programInfoNode, "infobakgrund.png", currentChannelListIndex);
        scalableContainer.setAttribute("id","programInfo");
        UIcreator.setPosition(scalableContainer, "25.1em", "1em", "22.3em", "26.5em", 10, "absolute");
        scalableContainer.style.fontWeight = "bold";
        scalableContainer.style.visibility = "hidden";
        document.getElementsByTagName("body")[0].appendChild(scalableContainer);
        
        delete that.init;
      }
      catch (error)
      {
        Debug.alert("Error in ProgramInfo.init: " + error);
      }
    },
    
    /**
     * @memberOf EPG.ProgramInfo
     * @function show
     * @description Shows the program information.
     * @param {object} program A program object.
     * @param {object} now Date object representing the current time.
     */
    show: function (program, now) 
    {
      try
      {
        var locale,
        start,
        stop,
        channel;
        
        if(!now)
        {
          now = new Date();
        }
                
        if(program)
        {

          if(programInfoNode.program !== program)
          {
            programInfoNode.durationContainer.style.top = "0px";
            programInfoNode.descriptionContainer.style.top = "0px";
            programInfoNode.program = program;
            channel = Settings.getChannel(program.channel);
            if(channel && channel.icon)
            {
              logo.setAttribute("src",File.getHomePath() + "Library/Xmltv/logos/" + program.channel + ".png");
              logo.style.visibility = "inherit";
            }
            else
            {
              logo.style.visibility = "hidden";
            }
            
            // Title
            if(program.isTheEmptyProgram)
            {
              programInfoNode.titleNode.nodeValue = Translator.translate("No program");
              programInfoNode.descriptionNode.nodeValue = Translator.translate("No program") + ".";
              programInfoNode.startNode.nodeValue = "";
              programInfoNode.stopNode.nodeValue = "";
              programInfoNode.durationNode.nodeValue = "";
              progressbarFull.style.visibility = "hidden";
            }
            else if(typeof(program.title) === "undefined")
            {
              programInfoNode.titleNode.nodeValue = Translator.translate("Program title missing :-(");
            } 
            else
            {
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
              }
              else
              {
                programInfoNode.descriptionNode.nodeValue = Translator.translate("No description.");
              }
              
              // Start & stop
              if(typeof(program.start) !== "undefined")
              {
                programInfoNode.startNode.nodeValue = getHHMM(program.start);
                programInfoNode.stopNode.nodeValue = getHHMM(program.stop);
                // progressbar
                start = new Date(program.start * 1000);
                stop = new Date(program.stop * 1000);
                updateProgressbar(start, stop, now);
              }
              else
              {
                programInfoNode.startNode.nodeValue = "";
                programInfoNode.stopNode.nodeValue = "";
                programInfoNode.durationNode.nodeValue = "";
                progressbarFull.style.visibility = "hidden";
              }
              
              // Duration & time to/left
              
              // Category (and episode number if category = series)
              
              // Director(s)
              
              // Actor(s)
              
              if(programInfoNode.descriptionFrameNode.scrollHeight - programInfoNode.descriptionFrameNode.offsetHeight > 0)
              {
                programInfoNode.scrollUpButton.style.visibility = "inherit";
                programInfoNode.scrollDownButton.style.visibility = "inherit";
              }
              else
              {
                programInfoNode.scrollUpButton.style.visibility = "hidden";
                programInfoNode.scrollDownButton.style.visibility = "hidden";
              }
              
              if(scalableContainer.style.visibility !== "visible")
              {
                scalableContainer.style.visibility = "visible";
              }
            }
            programInfoNode.titleNode.parentNode.setAttribute("title", programInfoNode.titleNode.nodeValue);
            
          } 
          else if(scalableContainer.style.visibility !== "visible")
          {
            programInfoNode.durationContainer.style.top = "0px";
            programInfoNode.descriptionContainer.style.top = "0px";
            scalableContainer.style.visibility = "visible";
          }
          else if(scalableContainer.style.visibility !== "hidden")
          {
            scalableContainer.style.visibility = "hidden";
          }
          
        }
        else
        {
          Debug.warn("ProgramInfo.show: Program was undefined!");
        }
      }
      catch (error)
      {
        Debug.alert("Error in ProgramInfo.show: " + error + " (program = " + program + ")");
      }
    },
    
    /**
     * @memberOf EPG.ProgramInfo
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
    },
    
    /**
     * @memberOf EPG.ProgramInfo
     * @function update
     * @description Updates the program information.
     * @param {object} now Date object representing the current time.
     */
    update: function (now) 
    {
      try
      {
        var stop,
        start;
        
        if(!now)
        {
          now = new Date();
        }
        
        if(scalableContainer.style.visibility === "visible" && programInfoNode.program)
        {
          if(typeof(programInfoNode.program.stop) !== "undefined")
          {
            stop = new Date(programInfoNode.program.stop * 1000);
            if(now < stop) // program ends some time in the future
            {
              start = new Date(programInfoNode.program.start * 1000);
              updateProgressbar(start,stop,now);
              //Debug.inform("ProgramInfo.update ran at " + now + " and changed width of progressbar.");
            }
            else // program has ended
            {
              that.hide(); // Hide program information since the program has ended.
            }
          } // else ignore progressbar (this might be the empty program)
        }
      }
      catch (error)
      {
        Debug.alert("Error in ProgramInfo.update: " + error);
      }
    },
    
    /**
     * @memberOf EPG.ProgramInfo
     * @function scroll
     * @description Listens to and consumes scroll events if program information is visible.
     */
    scroll: function (event, program, amount) 
    {
      try
      {
        if(scalableContainer.style.visibility !== "hidden" && program && programInfoNode.program === program)
        {
          if(!amount)
          {
            event.preventDefault();
            event.stopPropagation();
          
            if(event.detail)
            {
              amount = event.detail * -1;
            }
            else
            {
              amount = event.wheelDelta / 40;
            }
            scrollDescription(amount);
          }
          else
          {
            scrollDescription(amount);
          }
          
        }
      }
      catch (error)
      {
        Debug.alert("Error in ProgramInfo.scroll: " + error);
      }
    }
  };
}(EPG.debug, EPG.UIcreator, EPG.translator, EPG.settings, EPG.skin, EPG.file, EPG.Reminder);
EPG.ProgramInfo.init();
