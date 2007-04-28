#!/usr/bin/php
<?php
	$version = argv[1];
	$userAgent = "se.swedb.widget.xmltv/".$version." (grabber.php)";
	$url = "http://xmltv.tvsajten.com/xmltv/";
	$file = fopen("$HOME/Library/Xmltv/widgetexports/mychannels.text","r");
	$localPath = "$HOME/Library/Xmltv/schedules/";
	
	if($file != FALSE){
		$filecontents = fread($file, filesize($filename));
		fclose($file);
		$channels = split(";",$filecontents);
		
		foreach ($channels as $channel)
		{
			$destination = $localPath.''.$channel.'.xml';
			$source = $url.''.$channel.'.xml';
			system('curl -R --user-agent '.$userAgent.' --compressed '.$source.' -o '.$destination.' -z '.$destination.' --write-out "%{http_code}" 2> /dev/null',$statuscode);
			if($statusCode == 200 || $statusCode == 304)
			{
				// everything ok
			}
		}
	}
	else
	{
		$stderr = fopen("php://stderr","w");
		fwrite($stderr,"Could not open mychannels.text - can't download any schedules!");
		fclose($stderr);
	}
	
	fclose($file);
?>