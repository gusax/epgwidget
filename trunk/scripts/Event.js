var Event = Class.create();

Event.prototype = {

	initialize: function(programme) 
	{
		
		this._title;
		this._keyword;
		this._description;
		this._start;
		this._stop;
		this._summer = false;
		this._channel;
		this._date; // Date of production, not date of broadcast
		
		this._actors;
		this._directors;
		
		this._destroyed = true;
		
		try 
		{
			// Title, start, stop, channel and keyword
			if(programme.getElementsByTagName("title"))
			{
				var theTitle = programme.getElementsByTagName("title")[0];
				this._title = theTitle.firstChild.Value;
				this._keyword = this._title.toLowerCase();
				this._start = theTitle.getAttribute("start").substring(0,14);
				this._stop = theTitle.getAttribute("stop").substring(0,14);
				this._channel = theTitle.getAttribute("channel");
				
				if(localizedStrings["Default"].match("Swedish")){
					// Find out if it's summer or winter
					var dst = theTitle.getAttribute("start").substring(16,20)
					if(dst.match("2")){
						// Daylight savings time is active - it's summer!
						this._summer = true;
					}
				}
					
			} 
			else
				throw "No title!";
				
			// Description
			if(programme.getElementsByTagName("desc"))
				this._description = programme.getElementsByTagName("desc")[0].firstChild.Value;
			else
				this._description = localizedStrings["No description :-("];
			
			// Actors
			if(programme.getElementsByTagName("actor"))
			{
				this._actors = new Array();
				for(var i=0; i < programme.getElementsByTagName("actor").length;i++)
				{
					this._actors.push(programme.getElementsByTagName("actor")[i].firstChild.value);
				}
			}
			
			// Directors
			if(programme.getElementsByTagName("director"))
			{
				this._directors = new Array();
				for(var i=0; i < programme.getElementsByTagName("director").length;i++)
				{
					this._directors.push(programme.getElementsByTagName("director")[i].firstChild.value);
				}
			}
			
			// Date (of production)
			if(programme.getElementsByTagName("date"))
			{
				this._date = programme.getElementsByTagName("date")[0].firstChild.value;
			}
			
			// Destroy the programme
			programme = null;
		} 
		catch (error) 
		{
			// Destroy the programme
			programme = null;
			alert("Event.initialize(): "+error);
			throw "Event: Could not create event!";
		}
	},
	
	title: function()
	{
		return this._title;
	},
	
	description: function()
	{
		return this._description;
	},
	
	start: function()
	{
		return this._start;
	},
	
	keyword: function()
	{
		// Used when searching the eventlist
		return this._keyword;
	},
	
	destroy: function()
	{
		this._destroyed = true;
	},
	
	destroyed: function()
	{
		return this._destroyed;
	},
	
	getActors: function()
	{
		return this._actors;
	},
	
	getDirectors: function()
	{
		return this._directors;
	}
}

if(debug)
	alert("Event.js loaded");