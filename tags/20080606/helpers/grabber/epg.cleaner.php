<?php

function removeOldSchedules($pathToXmltvFolder)
{
	$path = $pathToXmltvFolder.'/schedules';
	if(file_exists($path))
	{
		$xmltvFolder = dir($path);
		
		$yesterday = date("Ymd",(time() - (24 * 60 * 60)));
		while(($filename = $xmltvFolder->read()) !== false)
		{
			// only remove files ending with .xml or .js and not beginning with a dot
			$xml = strpos($filename, ".xml");
			$js = strpos($filename, ".js");
			if(strpos($filename,".") > 0 && ($xml > 0 || $js > 0))
			{
				// Remove file only if it is older than yesterday
				$start = strpos($filename,"_")+1;
				if($js > 0)
				{
					$filedate = substr($filename,$start,$js-$start);
				}
				else
				{
					$filedate = substr($filename,$start,$xml-$start);
				}
				$filedate = str_replace("-","",$filedate);
				if($filedate < $yesterday)
				{
					unlink($path."/".$filename);
				}
			}
		}
		
		$xmltvFolder->close();
	}
}
	
?>