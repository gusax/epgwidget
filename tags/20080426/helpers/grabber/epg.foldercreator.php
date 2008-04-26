<?php


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
		$grabber = dir($pathToXmltvFolder."/grabber");
		
	}
}


$pathToSchedulesFolder = $pathToXmltvFolder."/schedules/";
$pathToIconFolder = $pathToXmltvFolder."/logos/";
createFolders($pathToXmltvFolder);
?>