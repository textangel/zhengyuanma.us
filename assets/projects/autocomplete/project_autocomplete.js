/*
    https://www.youtube.com/watch?v=uaa9HVC-tQA
    Define Variables
    Focus the Input
*/

// Create placeholder input to serve as background
var $acp_input_box = $('#project1_box'),
    $acp_background_box = $('#project1_box2'),
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



$tmp = null

function getMatchesAPI(inputText) {
    var last_tokens = inputText //.split(" ").slice(0).slice(-1 * acp_length_lookback).join(' ').toLowerCase() 
    console.log('last_tokens', last_tokens)
    var matchList = [];
    var request = new XMLHttpRequest();
    var url = 'https://api.zhengyuanma.us/api/gpt2_autocomplete/predict' //?text=' + encodeURIComponent(last_tokens);
    
    request.open('POST', url);
    request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    request.send(JSON.stringify({"text":last_tokens}));

    request.onreadystatechange = function() {//Call a function when the state changes.
        if(request.readyState == 4 && request.status == 200) {
            console.log(request.responseText)
            $tmp = request.responseText
            api_response = JSON.parse(request.responseText);
            
            // Post-process: Convert string to int
            acp_matches = api_response["response"];
            acp_matches_ = []
            for (ix in acp_matches)
                acp_matches_.push([acp_matches[ix][0], parseFloat(acp_matches[ix][1])]);
            acp_matches = acp_matches_
            acp_matches10 = acp_matches.slice(Math.max(acp_matches.length - 20, 0))

            acp_sample_token = api_response["sample_token"];

            // acp_matches = api_response["all_results"];
            // acp_matches10 = api_response["top10"];
            if (acp_matches.length > 0) {
                displaySampledMatches (acp_sample_token);
                // displayMatches (acp_matches);
                updateChart(acp_matches10, myChart);
            }
        }
    }
}
acp_last_token = ' '
function displaySampledMatches (sample_token) {
    if (acp_last_token.includes("\n"))
        $acp_background_box.val($acp_input_box.val() + sample_token);
    else
        $acp_background_box.val($acp_input_box.val().trim() + sample_token);
    acp_last_token = sample_token
}

function displayMatches (matchList) {
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
}

function updateChart(top10List, chart) {
    chart.data.datasets[0].data = top10List.map((x) => x[1]);
    chart.data.labels= top10List.map((x) => x[0]);
    chart.update();

    console.log(myChart.data);
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
var bgColors = ['rgba(255, 99, 132, 0.2)',
                'rgba(54, 162, 235, 0.2)',
                'rgba(255, 206, 86, 0.2)',
                'rgba(75, 192, 192, 0.2)',
                'rgba(153, 102, 255, 0.2)',
                'rgba(255, 159, 64, 0.2)']
var borderColors = ['rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)']

var ctx = $('#myChart');
var myChart = new Chart(ctx, {
    type: 'bar',
    data: {
        labels: [],
        datasets: [{
            label: '# Prob Of Selection',
            data: [],
            backgroundColor: bgColors.concat(bgColors).concat(bgColors).concat(bgColors),
            borderColor: borderColors.concat(borderColors).concat(borderColors).concat(borderColors),
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

//Getting a random line from the file to initialize the textbox


// function getRandomLine(filename){
//     fs.readFile(filename, function(err, data){
//       if(err) throw err;
//       var lines = data.split('\n');
//       /*do something with */ lines[Math.floor(Math.random()*lines.length)];
//    })
//   }
  
//   getRandomLine("./assets/projects/autocomplete/random_en_sentences.txt")

//Dropdown many with authors
$.getJSON("./assets/projects/autocomplete/authors_category.json", function(authors){
    authors_names = Object.keys(authors);
    $("#authorLookup").autocomplete({
        source: function(request, response) {
            var results = $.ui.autocomplete.filter(authors_names, request.term);
            response(results.slice(0, 10));
        }
    });
});