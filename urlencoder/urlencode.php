#!/usr/bin/php
<?php
$filename = $argv[1];
echo $filename;
$file = fopen($filename, 'r');
if($file != FALSE)
{
	$filecontents = fread($file, filesize($filename));
	fclose($file);
	$stdout = fopen("php://stdout","w");
	fwrite($stdout, urlencode($filecontents));
	fclose($stdout);
} 
else 
{
	fclose($file);
	$stderr = fopen("php://stderr","w");
	fwrite($stderr,"Could not open ".$filename);
	fclose($stderr);
}
?>