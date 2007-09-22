if(!EPG)
{
	var EPG = {};
}

EPG.debug = function()
{
	// Private variables
	var debuggingEnabled = true;
	
	// Private methods
	
	// Public methods
	return {
		alert: function(message)
		{
			if(debuggingEnabled)
			{
				alert(message);
			}
		}
	};
}();