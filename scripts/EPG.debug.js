/**
 * @name EPG.debug
 * @static
 * @type object
 * @description Handles debugging messages.
 */
EPG.debug = function()
{
	// Private variables
	var debuggingEnabled = true,
	that;
	
	// Private methods
	
	// Public methods
	return /** @scope debug */{
		
		/**
		 * @memberOf EPG.debug
		 * @function init
		 * @description Initializes debug.
		 */
		init: function () 
		{
		  try
		  {
		    if(!that)
		    {
		      that = this;
		    }
		    delete that.init;
		  }
		  catch (error)
		  {
		    Debug.alert("Error in debug.init: " + error);
		  }
		},
		
		/**
		 * @memberOf EPG.debug
		 * @function alert
		 * @description Prints (alerts) a debugging message debugging is enabled.
		 * @param {string} message The message to alert.
		 */
		alert: function(message)
		{
			if(debuggingEnabled)
			{
			  if(typeof(window.console) === "object" && window.console.error)
        {
          window.console.error(message);
        }
        else
        { 
				  alert(message);
        }
			}
		},
		
		/**
		 * @memberOf EPG.debug
		 * @function warning
		 * @description Send a warning message.
		 * @param {string} message The warning message.
		 */
		warn: function (message) 
		{
		  try
		  {
		    if(typeof(window.console) === "object" && window.console.warn)
		    {
		      window.console.warn(message);
		    }
		    else
		    {
		      that.alert(message);
		    }
		  }
		  catch (error)
		  {
		    alert("Error in debug.warning: " + error);
		  }
		},
		
		/**
		 * @memberOf EPG.debug
		 * @function info
		 * @description Send a debugging message.
		 * @param {string} message The message.
		 */
		inform: function (message) 
		{
		  try
		  {
		    if(typeof(window.console) === "object" && window.console.info)
		    {
		      window.console.info(message);
		    }
		    else
		    {
		      that.alert(message);
		    }
		  }
		  catch (error)
		  {
		    alert("Error in debug.info: " + error);
		  }
		},
		
		/**
		 * @memberOf EPG.debug
		 * @function enable
		 * @description Enables debugging messages.
		 */
		enable: function () 
		{
		  try
		  {
		    debuggingEnabled = true;
		  }
		  catch (error)
		  {
		    alert("Error in debug.enable: " + error);
		  }
		}
	};
}();
EPG.debug.init();