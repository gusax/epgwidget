#!/usr/bin/php
<?php
	// An array of all grabbers (their filename excluding .php)
	//$grabbers = array("tv.xmltv.se.swedb","tv.dvb.dreambox","tv.jsontv.se.swedb");
	$grabbers = array("tv.jsontv.se.swedb");
	$userAgent = "se.swedb.tv.widget/20081123J";
	$useGrowl = false;

	function fixPath($path)
	{
		return exec ("/bin/echo $path");
	}	

	$pathToXmltvFolder = "\$HOME/Library/Xmltv";
	$pathToXmltvFolder = fixPath($pathToXmltvFolder);

	function getUsersChannels($pathToUsersChannels)
	{
		$usersChannels = array();
		if(file_exists($pathToUsersChannels))
		{
			$channelIds = split(";",utf8_decode(file_get_contents($pathToUsersChannels)));
			foreach($channelIds as $channelId)
			{
				if($channelId != "")
				{
					$usersChannels[$channelId] = true;
				}
			}
		}
	
		return $usersChannels;
	}

	// import grabbers
	require_once($pathToXmltvFolder."/grabber/epg.foldercreator.php");
	require_once($pathToXmltvFolder."/grabber/epg.cleaner.php");
	
	$force = $argv[1];
  
	
	$lastupdatefilename = $pathToXmltvFolder."/grabber/epg.downloader.lastupdate.txt";
	
	$today = date("Ymd");
    
  if($force != "1")
  {
  	sleep(10); // sleep for 10 seconds. Used because the downloader is launched automatically by launchd when the user logs in, and the login occurs before the network (especially Airport) is up. In other words, we need to wait for an internet connection before trying to download new schedules.
  }
	$lastupdate = 0;
	if(!file_exists($lastupdatefilename))
	{
		$lastupdatefile = fopen($lastupdatefilename, "w");
		fwrite($lastupdatefile, $today);
		fclose($lastupdatefile);
	}
	else
	{
		$lastupdate = utf8_decode(file_get_contents($lastupdatefilename));
	}
	
	// Download schedules if we haven't downloaded today
	
  if($force == 1 || $today > (int) $lastupdate)
  {
	  foreach($grabbers as $key => $grabber)
	  {
		  // download new schedules
		  if(file_exists(utf8_encode($pathToXmltvFolder."/grabber/".$grabber.".settings.php")) && file_exists(utf8_encode($pathToXmltvFolder."/grabber/".$grabber.".php")))
  		{
	  		include($pathToXmltvFolder."/grabber/".$grabber.".settings.php");
		  	include($pathToXmltvFolder."/grabber/".$grabber.".php");
			  /*$logfile = fopen(utf8_encode($pathToXmltvFolder."/grabber/epg.downloader.log.php"),"a");
			  fwrite($logfile,"\n" . utf8_encode(date("Ymd") ." ".date("H:m")." opened grabber " . $grabber));
		  	fclose($logfile);*/
  		}
  	}
		
	  // remove schedules older than yesterday
  	removeOldSchedules($pathToXmltvFolder);
	
  	// update lastupdatefile
	  $lastupdatefile = fopen($lastupdatefilename, "w+");
  	fwrite($lastupdatefile, utf8_encode($today));
    fclose($lastupdatefile);
    
		/*if($useGrowl === true)
		{
			$answer = exec("/usr/local/bin/growlnotify --name \"DreamEPG\" --message \"DreamEPG:\nLaddade ner dagens tv-tablåer.\" --image \"$pathToXmltvFolder/grabber/Icon.png\"");
		}*/
	}
?>