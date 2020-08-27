<?php
/* The Docker Container Running the Cortex App Must Be Called `autocomplete` 
The container must be already deployed, and waiting to be `start` or `stop`. */
$mode = $_POST["mode"];
if ($mode === 'start') {
    $output = exec('docker ps 2>&1 | grep autocomplete 2>&1');
    if (empty($output)) {
        $outputs2 = exec('docker start autocomplete');
        if ($output2 === 'autocomplete') {
            $outputs3 = exec('lcp --proxyUrl localhost:8888 | grep error');
            if (empty($outputs3)){
                echo "Started";
            }
        }
        echo "Starting";
    } else {
        echo "Running";
    }
} elseif ($mode === 'stop'){
    $output = exec('docker stop autocomplete 2>&1');
    if ($output === 'autocomplete') {
        $output2 = exec('docker ps 2>&1 | grep autocomplete 2>&1');
        if (empty($output2)) {
            echo "Stopped";
        } else {
            echo "Not Stopped"; 
        }
    } else {
        echo "Not Stopped";
    }
}
?>