#!/usr/bin/php
<?php
function fixPath($path)
{
	return exec ("/bin/echo $path");
}

function createFolders($pathToXmltvFolder)
{
	// ~/Library/Xmltv
	if(file_exists($pathToXmltvFolder) === false)
	{
		system("/bin/mkdir $pathToXmltvFolder");
	}
	
	$subfolders = array($pathToXmltvFolder."/logos", $pathToXmltvFolder."/schedules", $pathToXmltvFolder."/channels", $pathToXmltvFolder."/grabber");
	foreach($subfolders as $subfolder)
	{
		if(file_exists($subfolder) === false)
		{
			system("/bin/mkdir $subfolder");
		}
	}
	
	
}

function installScripts($pathToXmltvFolder)
{
	if(file_exists($pathToXmltvFolder."/grabber"))
	{
		$answer = exec("/bin/cp grabber/*.php $pathToXmltvFolder/grabber");
		$answer = exec("/bin/cp ../Icon.png $pathToXmltvFolder/grabber");
		return true;
	}
	else
	{
		return false;
	}
}

function installCrontab($pathToXmltvFolder)
{
	// check for new schedules three random times every hour.
	// The exact minutes are random so that the load on the server 
	// is spread out evenly among all users.
	$minutes = "";
	$earlierMinutes = array();
	$selectedMinutes = array();
	$i = 0;
	while($i < 3)
	{
		$randomMinute = rand(0,59);
		if($earlierMinutes[$randomMinute] !== true)
		{
			$earlierMinutes[$randomMinute] = true;
			array_push($selectedMinutes,$randomMinute);
			$i++;
		}
	}
	
	sort($selectedMinutes);
	
	//$minutes = $selectedMinutes[0].",".$selectedMinutes[1].",".$selectedMinutes[2];
	
	//$tab = "$minutes * * * * /usr/bin/php $pathToXmltvFolder/grabber/epg.downloader.php >/dev/null 2>&1\n"; 
	//$tab = "* * * * * /usr/bin/php $pathToXmltvFolder/grabber/epg.downloader.php > logger\n";
	$pathToLaunchAgents = fixPath("\$HOME/Library/LaunchAgents");
  if(file_exists($pathToLaunchAgents) === false)
  {
    system("/bin/mkdir $pathToLaunchAgents");
  }
  if(file_exists("se.bizo.epgwidget.grabber.plist"))
  {
  	$plistContents = utf8_decode(file_get_contents("se.bizo.epgwidget.grabber.plist")); // Open template plist
    $plistContents = utf8_encode(str_replace('$PATHTOGRABBER$', $pathToXmltvFolder . "/grabber", $plistContents)); // replace PATHTOGRABBER with real path to grabber 
    if(!file_exists($pathToLaunchAgents . "/se.bizo.epgwidget.grabber.plist"))
    {
      $launchAgentPlist = fopen($pathToLaunchAgents . "/se.bizo.epgwidget.grabber.plist", "w+"); // create launchAgent plist file
      if(fwrite($launchAgentPlist, $plistContents) === FALSE)
      {
    	  // could not write to file :-(
      }
      fclose($launchAgentPlist);
    }
  }
  //$answer = exec("/bin/cp se.bizo.epgwidget.grabber.plist $pathToLaunchAgents");
	/*$epgCrontab = fopen("$pathToXmltvFolder/grabber/epg.crontab","w+");
	fwrite($epgCrontab,utf8_encode($tab));
	fclose($epgCrontab);
	$answer = exec("/usr/bin/crontab $pathToXmltvFolder/grabber/epg.crontab");*/
}

function install()
{
	$pathToXmltvFolder = fixPath("\$HOME/Library/Xmltv");
	createFolders($pathToXmltvFolder);
	if(installScripts($pathToXmltvFolder))
	{
		installCrontab($pathToXmltvFolder);
	}
  if(file_exists($pathToXmltvFolder. "/grabber/epg.downloader.lastupdate.txt"))
  {
  	unlink($pathToXmltvFolder. "/grabber/epg.downloader.lastupdate.txt");
  }
}

install();
?>