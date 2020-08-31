/*
    https://www.youtube.com/watch?v=uaa9HVC-tQA
    Define Variables
    Focus the Input
*/

// Create placeholder input to serve as background
var $acp_input_box = $('#project1_box'),
    $acp_background_box = $('#project1_box2'),
    acp_results = document.getElementById("autocomplete-results"),
    acp_matches = [],
    acp_length_lookback = 40,
    punct_delimiter_codes = [32, 16, 188, 190, 186, 191] //space ! , . : ; ?

    $temp = null;

// Behavior for focus and blur to achieve the visual effect
$acp_input_box.focus(function(){
    var $input = $(this);
    var $acp_background_box = $('#project1_box2', $input.parent());
    $acp_background_box.css('color', '#e0e0e0');
 }).blur(function(){
    var $input = $(this);
    var $acp_background_box = $('#project1_box2', $input.parent());
    if ($input.val() == '')
        $acp_background_box.css('color', 'transparent');
 }).keyup(delay(function(event){
    if(punct_delimiter_codes.includes(event.keyCode)){
         if (this.value.length > 0)
             getMatchesAPI(this.value);
     }
 }, 200)).keydown(function(event) { 
    if (event.keyCode == 9) { //tab
        $(this).focus();
        event.preventDefault();
        var cand = $acp_background_box.val()
        if (cand.length > 0){
            if (cand.length > 1){
                var c_m1 = cand.charAt(cand.length-1)
                var c_m2 = cand.charAt(cand.length-2)
                console.log(cand, c_m1, c_m2)
                if (".,:!?".includes(c_m1) && c_m2 == " ") {
                    var new_cand = cand.substring(0, cand.length - 1).trim() + c_m1;
                    $acp_input_box.val(new_cand);
                } else {
                    $acp_input_box.val(cand);
                }
            } else {
                $acp_input_box.val(cand);
            }
        }
        if (this.value.length > 0)
             getMatchesAPI(this.value);
    } else {
        $acp_background_box.val('');
    }
 });

 
// Define a function for toggling the results list
function toggleResults(action){
    if (action == "show") {
        acp_results.classList.add("visible");
    } else if (action == "hide") {
        acp_results.classList.remove("visible");
    }
}

function getMatchesAPI(inputText) {
    var last_tokens = inputText.split(" ").slice(0).slice(-1 * acp_length_lookback).join(' ')
    console.log('last_tokens', last_tokens)
    var matchList = [];
    var request = new XMLHttpRequest();
    var url = 'https://api.zhengyuanma.us/api/autocomplete/predict?text=' + encodeURIComponent(last_tokens);
    request.open('GET', url, true);
    request.send(null);

    request.onreadystatechange = function() {//Call a function when the state changes.
        if(request.readyState == 4 && request.status == 200) {
            response = JSON.parse(request.responseText);
            acp_matches = response;
            if (acp_matches.length > 0) {
                displayMatches (acp_matches, myChart);
            }
        }
    }
}


function displayMatches (matchList, chart) {
    var sum_prob = matchList.reduce((acc,val) => acc+val[1], 0);
    var rand = Math.random() * sum_prob;
    var acc = 0;
    var matchProbCum = matchList.map(val => acc = val[1] + acc)
    var random_select = matchList[matchProbCum.filter(val => val <= rand).length]
    console.log(matchList)
    $temp = matchList
    console.log(random_select)
    if (random_select.length > 0)
        $acp_background_box.val($acp_input_box.val().trim() + " " + random_select[0]);
    else
        $acp_background_box.val($acp_input_box.val().trim() + " " + matchList[0][0]);
    
    chart.data.datasets[0].data = matchList.map((x) => x[1]);
    chart.data.labels= matchList.map((x) => x[0]);
    chart.update();

    console.log(myChart.data);
    acp_results.innerHTML = ""
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
$acp_input_box.css({
    position: 'absolute',
    left: 0,
    top: 0,
    zIndex: 100,
    backgroundColor: 'transparent',
    borderColor: 'transparent'
});
$acp_background_box.css('color', 'transparent');


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

