/*
    https://www.youtube.com/watch?v=uaa9HVC-tQA
    Define Variables
    Focus the Input
*/

// Create placeholder input to serve as background
var $test = $('#project1_box'),
    $placeholder = $('#project1_box2'),
    $container = $('.placeholder-container'),
    results = document.getElementById("autocomplete-results"),
    matches = [],
    length_lookback = 15,
    delimiter_codes = [32, 16, 188, 190, 186, 191] //space ! , . : ; ?


// Behavior for focus and blur to achieve the visual effect
$test.focus(function(){
    var $input = $(this);
    var $placeholder = $('#project1_box2', $input.parent());
    $placeholder.css('color', '#e0e0e0');
 }).blur(function(){
    var $input = $(this);
    var $placeholder = $('#project1_box2', $input.parent());
    if ($input.val() == '')
        $placeholder.css('color', 'transparent');
 }).keyup(delay(function(event){
    if(delimiter_codes.includes(event.keyCode)){
         if (this.value.length > 0)
             getMatchesAPI(this.value);
     }
 }, 200)).keydown(function(event) { 
    if (event.keyCode == 9) {
        $(this).focus();
        event.preventDefault();
        console.log("asfas")
        if ($placeholder.val().length > 0)
            $test.val($placeholder.val());
        if (this.value.length > 0)
             getMatchesAPI(this.value);
    } else {
        $placeholder.val('');
    }
 });

 
// Define a function for toggling the results list
function toggleResults(action){
    if (action == "show") {
        results.classList.add("visible");
    } else if (action == "hide") {
        results.classList.remove("visible");
    }
}

function getMatchesAPI(inputText) {
    var last_tokens = inputText.split(" ").slice(0).slice(-1 * length_lookback).join(' ')
    console.log('last_tokens', last_tokens)
    var matchList = [];
    var request = new XMLHttpRequest();
    var url = 'http://35.239.212.207:8010/proxy';
    var params = '{"text": "' + last_tokens + '"}';
    request.open('POST', url, true);
    //Send the proper header information along with the request
    request.setRequestHeader('Content-type', 'application/json');
    request.send(params);

    request.onreadystatechange = function() {//Call a function when the state changes.
        if(request.readyState == 4 && request.status == 200) {
            response = JSON.parse(request.responseText);
            matches = response;
            if (matches.length > 0) {
                console.log(matches)
                displayMatches (matches, myChart);
            }
            console.log(matchList)
        }
    }
    return matchList
}


function displayMatches (matchList, chart) {
    var sum_prob = matchList.reduce((acc,val) => acc+val[1], 0);
    var rand = Math.random() * sum_prob;
    var acc = 0;
    var matchProbCum = matchList.map(val => acc = val[1] + acc)
    var random_select = matchList[matchProbCum.filter(val => val <= rand).length]

    if (random_select.length > 0)
        $placeholder.val($test.val().trim() + " " + random_select[0]);
    else
        $placeholder.val($test.val().trim() + " " + matchList[0][0]);
    
    chart.data.datasets[0].data = matchList.map((x) => x[1]);
    chart.data.labels= matchList.map((x) => x[0]);
    chart.update();

    console.log(myChart.data);
    results.innerHTML = ""
    toggleResults("show");
}


// Helper Functions
function delay(callback, ms) {
    var timer = 0;
    return function() {
      var context = this, args = arguments;
      clearTimeout(timer);
      timer = setTimeout(function () {
        callback.apply(context, args);
      }, ms || 0);
    };
  }

// CSS Styling for the Overlapping Boxes
$test.css({
    position: 'absolute',
    left: 0,
    top: 0,
    zIndex: 100,
    backgroundColor: 'transparent',
    borderColor: 'transparent'
});
$placeholder.css('color', 'transparent');


// Chart display
var ctx = $('#myChart');
var myChart = new Chart(ctx, {
    type: 'bar',
    data: {
        labels: [],
        datasets: [{
            label: '# Prob Of Selection',
            data: [],
            backgroundColor: [
                'rgba(255, 99, 132, 0.2)',
                'rgba(54, 162, 235, 0.2)',
                'rgba(255, 206, 86, 0.2)',
                'rgba(75, 192, 192, 0.2)',
                'rgba(153, 102, 255, 0.2)',
                'rgba(255, 159, 64, 0.2)',
                'rgba(255, 99, 132, 0.2)',
                'rgba(54, 162, 235, 0.2)',
                'rgba(255, 206, 86, 0.2)',
                'rgba(75, 192, 192, 0.2)',
                'rgba(153, 102, 255, 0.2)',
                'rgba(255, 159, 64, 0.2)',
            ],
            borderColor: [
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)',
                'rgba(255, 159, 64, 1)',
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)',
                'rgba(255, 159, 64, 1)'
            ],
            borderWidth: 1
        }]
    },
    options: {
        scales: {
            yAxes: [{
                ticks: {
                    beginAtZero: true
                }
            }]
        }
    }
});


var request;

$autocomplete_link = $('#autocomplete_link');
$autocomplete_link.click(function(event){
    loadAutocompleteModel(event);
});

$load_button = $('#autocomplete_load')
$load_button.click(function(event){
    if ($load_button.val() == "Model Loaded (Deactivate)"){

    }

    event.preventDefault();
    loadAutocompleteModel(event);
})
$load_button.ready(loadAutocompleteModel)

function loadAutocompleteModel(event){
    if (request) {
        request.abort();
    }
    request = $.ajax({
        type: "POST",
        url: 'assets/php/load_autocomplete_model.php',
        data: jQuery.param( { mode: "start"} ),
        contentType: 'application/x-www-form-urlencoded; charset=UTF-8'
    })
    request.done(function(response, textStatus, jqXHR){
        if (response == "Starting"){
            $('#autocomplete_load').val("Model Starting. Please Wait...")
        }

        if (response == "Running"){
            console.log($('#autocomplete_load').value)
            $('#autocomplete_load').val("Model Loaded (Deactivate)")
        }

        console.log(response);
    })
    request.fail(function(jqXHR, textStatus, errorThrown){
        console.log("Ajax request error");
        console.log(textStatus, errorThrown);
    })
}

function stopAutocompleteModel(event){
    request = $.ajax({
        type: "POST",
        url: 'assets/php/load_autocomplete_model.php',
        data: jQuery.param( { mode: "stop"} ),
        contentType: 'application/x-www-form-urlencoded; charset=UTF-8'
    })
    request.done(function(response, textStatus, jqXHR){
        if (response == "Starting"){
            $('#autocomplete_load').val("Model Starting. Please Wait...")
        }

        if (response == "Running"){
            console.log($('#autocomplete_load').value)
            $('#autocomplete_load').val("Model Loaded (Deactivate)")
        }

        console.log(response);
    })
    request.fail(function(jqXHR, textStatus, errorThrown){
        console.log("Ajax request error");
        console.log(textStatus, errorThrown);
    })
}
