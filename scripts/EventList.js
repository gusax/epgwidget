var EventList = Class.create();

EventList.prototype = {

	initialize: function()
	{
		this._list = new Array();
		this._currentEvent = -1; // -1 means no program is on right now
		this._nextEvent = -1; // If no program is on now, this is the next program
	},
	
	addEvent: function(programme)
	{
		this._list.push(new Event(programme));
	},
	
	length: function()
	{
		return this._list.length;
	},
	
	removeEvents: function(numberOfEventsToRemove)
	{
		try
		{
			// Remove events from position 0 to numberOfEventsToRemove
			if(numberOfEventsToRemove > 0)
				this._list.splice(0, numberOfEventsToRemove);
		}
		catch (error)
		{
			throw "EventList.removeEvents: could not remove ["+numberOfEventsToRemove+"] events from the EventList!";
		}
	},
	
	searchEventTitle: function(searchString, callback, searchID)
	{
		// Don't search for words with fewer than 3 letters
		if(searchString.length >= 3)
		{
			var results = new Array();
			for(var eventIndex = 0; eventIndex < this._list.length; eventIndex++)
			{
				if(this._list[eventIndex].keyword().match(searchString))
					results.push(this._list[eventIndex]);
			}
			
			// Sort the results alphabetically
			results.sort();
			
			// return the results
			callback(results, searchID);
		}
	}
}

if(debug)
	alert("EventList.js loaded");