<?php

	

function downloadChannelsXmlJsontv($channelsXmlUrl,$pathToChannelsXml,$pathToChannelsXmlTemp,$userAgent,$pathToChannelsJs,$pathToChannelsJsTemp)
{
	if(file_exists($pathToChannelsXml))
	{
		$channelsXmlContents = file_get_contents($pathToChannelsXml);
		if(strpos($channelsXmlContents,"<tv") === false)
		{
			// file exists but is corrupt. Delete it.
			unlink($pathToChannelsXml);
		}
	}
  if(file_exists($pathToChannelsJs))
  {
    $channelsJsContents = file_get_contents($pathToChannelsJs);
    if(strpos($newChannelsJsContents,"jsontv") === false)
    {
      // file exists but is corrupt. Delete it.
      unlink($pathToChannelsJs);
    }
  }
	// download new channels.xml as channels.temp.xml
	system("/usr/bin/curl -s -R --user-agent $userAgent --compressed http://tv.swedb.se/xmltv/channels.xml.gz -o $pathToChannelsXmlTemp -z $pathToChannelsXml");
	system("/usr/bin/curl -s -R --user-agent $userAgent --compressed http://xmltv.tvsajten.com/json/channels.js.gz -o $pathToChannelsJsTemp -z $pathToChannelsJs");	
	
	if(file_exists($pathToChannelsJsTemp))
	{
		$newChannelsJsContents = file_get_contents($pathToChannelsJsTemp);
		
		
		if(strpos($newChannelsJsContents,"jsontv") === false)
		{
			// file exists but is corrupt. Delete it.
			unlink($pathToChannelsJsTemp);
			
		}
		else
		{
			// delete old file if it exists
			if(file_exists($pathToChannelsJs))
			{
				unlink($pathToChannelsJs);
			}
			// rename new file to name of old file
			system("/bin/mv $pathToChannelsJsTemp $pathToChannelsJs");
			// success! 
			
		}
	}
	
	if(file_exists($pathToChannelsXmlTemp))
	{
		$newChannelsXmlContents = file_get_contents($pathToChannelsXmlTemp);
		
		
		if(strpos($newChannelsXmlContents,"<tv") === false)
		{
			// file exists but is corrupt. Delete it.
			unlink($pathToChannelsXmlTemp);
			return false;
		}
		else
		{
			// delete old file if it exists
			if(file_exists($pathToChannelsXml))
			{
				unlink($pathToChannelsXml);
			}
			// rename new file to name of old file
			system("/bin/mv $pathToChannelsXmlTemp $pathToChannelsXml");
			// success! 
			return true;
		}
	}
	else
	{
		// Could not download a new channels.xml. 
		// Return true if the old one exists and is usable 
		// (which we checked if it was in the beginning of the function),
		// otherwise return false.
		return file_exists($pathToChannelsXml);
	}
}

function createDays($numberOfDays)
{
	$days = array();
	// start yesterday
	$oneDay = (24 * 60 * 60);
	$timestamp = time() - $oneDay;
	for($i = 0; $i < $numberOfDays; $i++)
	{
		$days[$i] = date("Y-m-d",$timestamp);
		$timestamp += $oneDay;
	}
	return $days;
}

function createFilenamesJsontv($usersChannels,$numberOfDays)
{
	$filenames = array();
	$days = createDays($numberOfDays); // change to respect vacationmode
	foreach($usersChannels as $channelId => $value)
	{
		$filenames[$channelId] = array();
		foreach($days as $day)
		{
			
			array_push($filenames[$channelId],$channelId."_".$day.".js");
		}
	}
	
	return $filenames;
}

function createLinksJsontv($filenames,$usersChannels,$pathToChannelsXml,$links,$iconLinks)
{
	$channelsXmlContents = "";
	if(file_exists($pathToChannelsXml))
	{
		$channelsXmlContents = file_get_contents($pathToChannelsXml);
		
		if($channelsXmlContents)
		{
			// Extract channelid from all channels
			$channelsXmlContents = split("<channel ",$channelsXmlContents);
			foreach($channelsXmlContents as $channelTag)
			{
				$start = 0;
				$end = -1;
				if(strpos($channelTag,"id=\"") === false)
				{
					// piss off
				}
				else
				{
					$start = strpos($channelTag,"id=\"") + 4;
					$end = strpos($channelTag,"\">",$start);
				}
				
				if($start < $end)
				{
					$id = substr($channelTag,$start,$end-$start);
					// If a channel with this id exists among the users channels,
					// we want to get it's base-url
					// This is the proper way to do it, since userchannels from other
					// providers will simply be skipped.
					if($usersChannels[$id] === true)
					{
						$start = strpos($channelTag,"<base-url>",$start) + 10;
						$end = strpos($channelTag,"</base-url>",$start)-1;
						$baseUrl = trim(substr($channelTag,$start,$end-$start));
						if(substr($baseUrl,-1,1) != "/")
						{
							$baseUrl .= "/";
						}
						$baseUrl = str_replace("/xmltv/","/json/",$baseUrl);
						// create one link per filename
						foreach($filenames[$id] as $filename)
						{
							array_push($links,$baseUrl ."". $filename);
						}
						
						// And create one imageLink for the icon (if one exists)
						$start = strpos($channelTag,"<icon src=\"") + 11;
						$end = strpos($channelTag,"\"",$start);
						if($start < $end)
						{
							$iconSrc = trim(substr($channelTag,$start,$end-$start));
							$iconLinks[$id] = $iconSrc;
						}
					}
				}
			}
		}
	}
}

function downloadJsontv($links,$userAgent,$pathToTargetFolder)
{	
	if(file_exists($pathToTargetFolder) === false)
	{
		system("/bin/mkdir $pathToTargetFolder");
	}
	foreach($links as $link)
	{
		// copy the filename from the end of the link by searching for the last / in the link
		$start = strrpos($link,"/")+1;
		$target = $pathToTargetFolder."".substr($link,$start);
    if(strrpos($link, ".js") === (strlen($link) - 3))
    {
      $link .= ".gz";
      if(file_exists($target))
      {
        $filecontents = file_get_contents($target);
        if(substr($filecontents,0,1) != "{")
        {
        	unlink($target); // delete file, it contains garbage
          echo "\nDeleted $target, it contained garbage.";
        }
      }
    }
    else if(strrpos($link, ".png") === (strlen($link) - 4))
    {
    	if(file_exists($target))
      {
        $filecontents = file_get_contents($target);
        //echo "\n" . utf8_encode($target) . " first char: " . substr($filecontents,0,1);
        if(substr($filecontents,0,1) == "<")
        {
          unlink($target); // delete file, it contains garbage
          //echo "\nDeleted $target, it contained garbage.";
        }
      }
    }
		//echo "\nTrying to download ".substr($link,$start);
		system("/usr/bin/curl -s -R --user-agent $userAgent --compressed $link -o $target -z $target");
	}
}





	$channelsXmlUrl = "http://tv.swedb.se/xmltv/channels.xml.gz";
    $channelsJsUrl = "http://xmltv.tvsajten.com/json/channels.js.gz";
  
	$pathToChannelsXml = $pathToXmltvFolder."/channels/tv.xmltv.se.swedb.channels.xml";
	$pathToChannelsXmlTemp = $pathToXmltvFolder."/channels/tv.xmltv.se.swedb.channels.temp.xml";
	$pathToChannelsJs = $pathToXmltvFolder."/channels/tv.jsontv.se.swedb.channels.js";
	$pathToChannelsJsTemp = $pathToXmltvFolder."/channels/tv.jsontv.se.swedb.channels.temp.js";

	$pathToUsersChannels = $pathToXmltvFolder."/channels/epg.users.channels.txt";

	$numberOfDays = 4;	

	if(downloadChannelsXmlJsontv($channelsXmlUrl,$pathToChannelsXml,$pathToChannelsXmlTemp,$userAgent,$pathToChannelsJs,$pathToChannelsJsTemp))
	{
	
		$usersChannels = getUsersChannels($pathToUsersChannels);
		// Only try to download if the user has saved channels
		if(count($usersChannels) > 0)
		{
			$filenames = createFilenamesJsontv($usersChannels,$numberOfDays);
			$links = array();
			$iconLinks = array();
			createLinksJsontv($filenames,$usersChannels,$pathToChannelsXml,&$links,&$iconLinks);
			downloadJsontv($links,$userAgent,$pathToSchedulesFolder);
			downloadJsontv($iconLinks,$userAgent,$pathToIconFolder);
		}
	}


?>