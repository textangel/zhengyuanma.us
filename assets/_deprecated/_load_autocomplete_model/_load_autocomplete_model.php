<?php
/* The Docker Container Running the Cortex App Must Be Called `autocomplete` 
The container must be already deployed, and waiting to be `start` or `stop`. */

$mode = $_POST["mode"];
$retval = "Error";
if ($mode === 'start') {
    $retval = (test_docker_active() ? start_model() : "DockerError");
} elseif ($mode === 'stop'){
    $retval = (test_docker_active() ? stop_model() : "DockerError");
}
echo $retval;

function test_docker_active() {
    $output = exec('docker ps | head -1 | cut -d " " -f 1');
    if ($output === "CONTAINER") {
        return true;
    }
    return false;
}

function start_model() {
    $output = exec('docker ps 2>&1 | grep autocomplete 2>&1');
    if (empty($output)) {
        $outputs2 = exec('docker start autocomplete');
    }
    sleep(3);
    $corrtex_job_live = null;
    $start_time = time();
    while(empty($corrtex_job_live)) {
        $corrtex_job_live = exec('cortex get | grep search-completer | grep live');
        sleep(1);
        if ((time() - $start_time) > 45) { return "Timeout"; }
    }
    if(!empty($corrtex_job_live)){
        return "Running";
    }
    return "Error";
}

function stop_model(){
    $output = exec('docker stop autocomplete 2>&1');
    if ($output === 'autocomplete') {
        $corrtex_job_stopped = "not stopped";
        $start_time = time();
        while(empty($corrtex_job_stopped)) {
            $corrtex_job_stopped = exec('docker ps 2>&1 | grep autocomplete 2>&1');
            sleep(1);
            if ((time() - $start_time) > 45) { return "Timeout"; }
        }
        if (empty($output2)) {
            return "Stopped";
        } else {
            return "Running"; 
        }
    }
    return "Error";
}

?>