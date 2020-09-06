/*
    https://www.youtube.com/watch?v=uaa9HVC-tQA
    Define Variables
    Focus the Input
*/

// Create placeholder input to serve as background
var $acp_input_box = $('#project1_box'),
    $acp_background_box = $('#project1_box2'),
    acp_matches = [],
    acp_all_authors = null,
    cur_author_string = "",
    punct_delimiter_codes = [32, 16, 188, 190, 186, 191] //space ! , . : ; ?
    $temp = null;
    inside_tab_processing = false;
    invisible_char = "\ufeff";

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
        if (!inside_tab_processing){
            inside_tab_processing = true;
            $(this).focus();
            event.preventDefault();
            var cand = $acp_background_box.val()
            if (cand.length > 0){
                if (cand.length > 1){
                    var c_m1 = cand.charAt(cand.length-1)
                    var c_m2 = cand.charAt(cand.length-2)
                    // console.log(cand, c_m1, c_m2)
                    if (".,:!?".includes(c_m1) && c_m2 == " ") {
                        var new_cand = cand.substring(0, cand.length - 1).trim() + c_m1;
                        $acp_input_box.val(new_cand);
                    } else 
                        $acp_input_box.val(cand);
                } else
                    $acp_input_box.val(cand);
            }
            if (this.value.length > 0)
                getMatchesAPI(this.value);
        }
    } else {
        $acp_background_box.val('');
    }
 });



$tmp = null

function getMatchesAPI(inputText) {
    var last_tokens = processInputTextGPT2(inputText, cur_author_string, 10)
    console.log('last_tokens', last_tokens)
    var matchList = [];
    var request = new XMLHttpRequest();
    var url = 'https://api.zhengyuanma.us/api/gpt2_autocomplete/predict' //?text=' + encodeURIComponent(last_tokens);
    
    request.open('POST', url);
    request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    request.send(JSON.stringify({"text":last_tokens}));

    request.onreadystatechange = function() {//Call a function when the state changes.
        if(request.readyState == 4 && request.status == 200) {
            // console.log(request.responseText)
            $tmp = request.responseText
            api_response = JSON.parse(request.responseText);
            
            // Post-process: Convert string to int
            acp_matches = api_response["response"];
            acp_matches_ = []
            for (ix in acp_matches)
                acp_matches_.push([acp_matches[ix][0], parseFloat(acp_matches[ix][1])]);
            acp_matches = acp_matches_
            acp_matches_top_k = acp_matches.slice(Math.max(acp_matches.length - 20, 0))
            acp_sample_token = api_response["sample_token"];
            if (acp_matches.length > 0) {
                displaySampledMatches (acp_sample_token, acp_matches_top_k);
                updateChart(acp_matches_top_k, myChart);
            }
        }
        if (inside_tab_processing == true)
            inside_tab_processing = false;
    }
}

function displaySampledMatches (sample_token, topk_matches) {
    var last_whitespace = $acp_input_box.val().match(/\s+$/)
    if (last_whitespace && last_whitespace[0].includes("\n")){
        if (sample_token.match(/\s+/)){
            for (var i = topk_matches.length-1; i >= 0; i--){
                if (/^[a-zA-Z]+$/.test(topk_matches[i][0].trim())){ //only contains alpha, and at least one alpha char
                    sample_token = topk_matches[i][0]
                    $acp_background_box.val($acp_input_box.val() + sample_token);
                    break;
                }
            }
        } else 
            $acp_background_box.val($acp_input_box.val() + sample_token);
    } else
        $acp_background_box.val($acp_input_box.val().trim() + sample_token);
}


function processInputTextGPT2(inputText, cur_author_string, num_lines){
    if (num_lines <=0) num_lines = 10
    const split_text_max_len = 70
    split_Text = inputText.split("\n")
    final_text = []
    for (ix in split_Text){
        if(split_Text[ix].length > split_text_max_len){
            total_len = 0
            cur_split = []
            space_split = split_Text[ix].split(" ")
            for (ix2 in space_split){
                if (total_len + space_split[ix2].length <= split_text_max_len){
                    cur_split.push(space_split[ix2])
                    total_len += space_split[ix2].length
                } else {
                    final_text.push(cur_author_string + " " + cur_split.join(" ").trim())
                    total_len = 0
                    cur_split = []
                }
            }
            if (cur_split.length > 0)
                final_text.push(cur_author_string + " " + cur_split.join(" ").trim())
        } else{
            final_text.push(cur_author_string + " " + split_Text[ix].trim())
        }
    }
    final_text = final_text.slice(Math.max(final_text.length-num_lines, 0))
    return final_text.join("\n")
}

  
function updateChart(topKList, chart) {
    chart.data.datasets[0].data = topKList.map((x) => x[1]);
    chart.data.labels= topKList.map((x) => x[0]);
    chart.update();
}


// Updating the Current Author
$('#authorLookupForm').submit(function(event){
    event.preventDefault();
    author_name = $('#authorLookup').val()
    console.log(author_name)
    if (Object.keys(acp_all_authors).includes(author_name)){
        possible_cats = acp_all_authors[author_name]
        selected_cat = possible_cats[Math.floor(Math.random() * possible_cats.length)]
        updateCurrentAuthor(author_name, selected_cat)
    }
    
})

function updateCurrentAuthor(author_name, author_cat){
    cur_author_string = author_cat + "| "+author_name+" ??>>>"
    $('#authorDisplay p b').text(author_name)
}
updateCurrentAuthor("Abraham Lincoln", "E456")


//Dropdown many with authors
$.getJSON("./assets/projects/autocomplete/authors_category.json", function(authors){
    acp_all_authors = authors;
    authors_names = Object.keys(authors);
    var $input = $("#authorLookup").autocomplete({
        source: function(request, response) {
            var results = $.ui.autocomplete.filter(authors_names, request.term);
            response(results.slice(0, 10));
        },
        select: function (event, ui) {
            $(this).val(ui.item.value);
            $('#authorLookupForm').submit();
            event.stopPropagation()
        }
    });
});


$(".autocomplete").select(function(event){
    event.preventDefault()
})

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

function chunkString(str, length) {
    return str.match(new RegExp('.{1,' + length + '}', 'g'));
}


/* Displays*/
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
