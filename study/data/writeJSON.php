<?php

//Well iterate through all the properties of the JSON object we're given in the "answer" field.

//IMPORTANT:
// DO NOT commit data.csv to a public repository, it will contain raw Turk IDs, which are personal and should be obscured.
// DO make sure that data.csv is writable.

  echo $_GET['answer']."\n";
  $answer = json_decode($_GET['answer'],true);
  $cleaned = $_GET['clean'];

  if($answer['task']=="Two"){
    $path = 'dataTwo.csv';
  }
  else{
    $path = 'dataOne.csv';
  }

  if($cleaned=='true'){
    $path = 'clean'.$path;
  }


  $file = fopen($path,'a');
  $keys = array_keys($answer);
  if(filesize($path)==0){
    //Make the header if we're the first entry
    $header = "";
    for($i = 0;$i<count($keys)-1;$i++){
      $header.=$keys[$i].',';
    }
    $header.=$keys[count($keys)-1].PHP_EOL;
    fwrite($file,$header);
    echo $header."\n";
  }
  //Write all the values we have.
  echo "Writing line: \n";
  $line = "";
  for($i = 0;$i<count($keys)-1;$i++){
    $line.=$answer[$keys[$i]].',';
  }
  $line.=$answer[$keys[$i]].PHP_EOL;
  echo $line."\n";
  fwrite($file,$line);
  fclose($file);

  echo "Done";
?>
