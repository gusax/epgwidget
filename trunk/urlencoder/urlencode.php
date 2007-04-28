#!/usr/bin/php
<?php
$filename = $argv[1];
echo $filename;
$file = fopen($filename, 'r');
$filecontents = fread($file, filesize($filename));
fclose($file);
echo urlencode($filecontents);
?>