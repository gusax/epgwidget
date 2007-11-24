if(!EPG)
{
	var EPG = {};
}

/**
 * @memberOf EPG
 * @name debug
 * @static
 * @type object
 * @description Handles debugging messages.
 */
EPG.debug = function()
{
	// Private variables
	var debuggingEnabled = true;
	
	// Private methods
	
	// Public methods
	return /** @scope debug */{
		
		/**
		 * @memberOf debug
		 * @function alert
		 * @description Prints (alerts) a debugging message debugging is enabled.
		 * @param {string} message The message to alert.
		 */
		alert: function(message)
		{
			if(debuggingEnabled)
			{
				alert(message);
			}
		},
		
		/**
		 * @memberOf debug
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
		    Debug.alert("Error in debug.enable: " + error);
		  }
		}
	};
}();