/*
    File: autocomplete.js
    This file contains the code for the GPT-2 Autocomplete Web App for zhengyuanma.us

    All globals have prefix `acp_` to avoid clashing with other files.
    Inspiration from: https://www.youtube.com/watch?v=uaa9HVC-tQA
*/

/* 1. Variables and Setup*/
var $acp_input_box = $('#project1_box'), // The box that the user types into
    $acp_background_box = $('#project1_box2'), // The box that displays the proposed word. It is behind the input box, and a different color, so the user sees them as one box.
    acp_authors_category_list_path = "./assets/projects/autocomplete/authors_category.json",
    acp_max_input_lines_to_send_to_api = 10;
    acp_matches = [],
    acp_all_authors = null, // The list of all possible authors and author categories, to be loaded from file. See  `2. Updating the GPT2 Author Mode`
    acp_gpt2_author_id_string = "",
    acp_inside_tab_processing = false;
    acp_invisible_char = "\ufeff";


/* 2. Updating the GPT2 Author Mode

    GPT2 changes author modes by sending each line with a prefix which lets it know which author is currently active.
    That is, instead of 
         `Hello, dear man! What is this? I have long felt that the true philosopher is not in himself, that he is one who can speak truth without being...`
    The input to GPT2 is
         `B| Friedrich Wilhelm Nietzsche ??>>> Hello, dear man! What is this? I have long felt that the true philosopher
          B| Friedrich Wilhelm Nietzsche ??>>> is not in himself, that he is one who can speak truth without being`
    The prefix `B| Friedrich Wilhelm Nietzsche ??>>>` is called the `acp_gpt2_author_id_string`, and it determines the author mode.
    In this section, we allow the user to pick from a list of available authors in a lookup field, and update the mode if the user picks an author.
 */

 /* 2.1 Helper Functions - Update Author Mode.
    These functions allow us to update the current author mode by updating the `acp_gpt2_author_id_string`.
    Note that we do not make use of the author categories in this case
    The author category is selected randomly from avaialble ones given the author.
*/
function updateCurrentAuthor(author_name, author_cat){
    acp_gpt2_author_id_string = author_cat + "| "+author_name+" ??>>>"
    $('#authorDisplay p b').text(author_name)
}
function updateCurrentAuthorRandomCat(author_name){
    possible_cats = acp_all_authors[author_name]
    selected_cat = possible_cats[Math.floor(Math.random() * possible_cats.length)] //Javascript version of select random
    updateCurrentAuthor(author_name, selected_cat)
}

/* 2.2 Load the list of all authors into the author into the author lookup field `$("#authorLookup")`
    The lookup field makes use of `jqery-ui`'s `autocomplete` feature.
    Initialize the app to a random author mode.
*/
$.getJSON(acp_authors_category_list_path, function(authors){
    acp_all_authors = authors;
    var authors_names = Object.keys(authors);
    var acp_random_init_selected_author = authors_names[Math.floor(Math.random() * authors_names.length)]
    updateCurrentAuthorRandomCat(acp_random_init_selected_author) //We initialize the author mode to a random author.
    var $input = $("#authorLookup").autocomplete({
        source: function(request, response) {
            var results = $.ui.autocomplete.filter(authors_names, request.term);
            response(results.slice(0, 10)); //Limit responses to length 10 so we don't overwhelm the user. 
        },
        select: function (event, ui) {
            $(this).val(ui.item.value);
            $('#authorLookupForm').submit();
            event.stopPropagation() //Like .preventDefault(). Prevents user from leaving the page when clicking on selection.
        }
    });
});

/* 2.3 If a new author is selection from the lookup field, we set the app's author mode to the selected author.
*/
$('#authorLookupForm').submit(function(event){
    event.preventDefault();
    author_name = $('#authorLookup').val()
    console.log(author_name)
    if (Object.keys(acp_all_authors).includes(author_name)){
        updateCurrentAuthorRandomCat(author_name)
    }
    
})

/* 3. Processing The Text and Calling the API
    Given Some User text, we preprocess it into the format desired by the API and call the API.
 */

 /* 3.1 Processing The Text
    As noted above, our version of GPT-2 requires the text in a certain format (dependent on our training data). In particular, instead of 
         `Hello, dear man! What is this? I have long felt that the true philosopher is not in himself, that he is one who can speak truth without being...`
    The input to our GPT2 should be
         `B| Friedrich Wilhelm Nietzsche ??>>> Hello, dear man! What is this? I have long felt that the true philosopher
          B| Friedrich Wilhelm Nietzsche ??>>> is not in himself, that he is one who can speak truth without being`

    Given some user text, several preprocessing steps are necessary:
        1. Break up long paragraphs into separate lines
        2. Append the `acp_gpt2_author_id_string` to the beginning of each line
 */
function processInputTextGPT2(inputText, acp_gpt2_author_id_string, max_lines_to_keep){
    const split_text_max_len = 70 //break up lines if longer than 70 characters
    if (max_lines_to_keep <= 0) max_lines_to_keep = 10 //we retain the last `max_lines_to_keep` lines of user text
    // First we split along any newlines already present in the text
    split_Text = inputText.split("\n") 
    final_text = []
    for (ix in split_Text){
        //Then for every line in the split text, if it is longer than `split_text_max_len` we
        //split it by spaces and traverse it, adding words until the resultant line is longer than `split_text_max_len` 
        // Note that whenever we add a new line, we append the `acp_gpt2_author_id_string` to it first.
        if (split_Text[ix].length <= split_text_max_len)
            final_text.push(acp_gpt2_author_id_string + " " + split_Text[ix].trim())
        else {
            total_len = 0
            cur_split = []
            space_split = split_Text[ix].split(" ")
            for (ix2 in space_split){
                if (total_len + space_split[ix2].length <= split_text_max_len){
                    cur_split.push(space_split[ix2])
                    total_len += space_split[ix2].length
                } else {
                    // When it is longer than `split_text_max_len`, we break at this point, join the line and add the line to our final list of lines.
                    // Note that whenever we add a new line, we append the `acp_gpt2_author_id_string` to it first.
                    final_text.push(acp_gpt2_author_id_string + " " + cur_split.join(" ").trim())
                    total_len = 0
                    cur_split = []
                }
            }
            if (cur_split.length > 0)
                final_text.push(acp_gpt2_author_id_string + " " + cur_split.join(" ").trim()) //Add back the leftover line in last iteration
        }
    }
    //We only keep the last `max_lines_to_keep` lines
    final_text = final_text.slice(Math.max(final_text.length-max_lines_to_keep, 0))
    // We add 10 copies of the empty line (rather, the line with only `acp_gpt2_author_id_string`)
    // This is a hack to make GPT-2 think it's at the beginning of a section, so will write fluently without interruptions.
    for (var i=0; i<10; i++) {
        final_text.unshift(acp_gpt2_author_id_string);        
    }
    // We join the list of lines back by "\n" to send to the server.
    return final_text.join("\n")
}

 /* 3.2 Calling the API
    The GPT2 Model is exposed on our app server at `https://api.zhengyuanma.us/api/gpt2_autocomplete/predict`

 */
function getMatchesAPI(inputText) {
    // Preprocess the text
    var last_tokens = processInputTextGPT2(inputText, acp_gpt2_author_id_string, acp_max_input_lines_to_send_to_api)
    console.log(last_tokens)
    
    //Set Up The Request
    var matchList = [];
    var request = new XMLHttpRequest();
    var url = 'https://api.zhengyuanma.us/api/gpt2_autocomplete/predict'
    
    //Set up the response handler
    request.onreadystatechange = function() {
        if(request.readyState == 4 && request.status == 200) {
            // GPT-2 generates for probabilities for 50,000 possible next words and samples over those probabilies.
            // The response is in JSON format and contains two fields: 
            // - `response`: a list of size 40 most likely candidate next words, entries are tuples of (word, probability (stringified float))
            // - `sample_token`: GPT2's recommendation for the next word. Note that this may not be in `response` as GPT-2 may have sampled from outside the top 40.
            api_response = JSON.parse(request.responseText);
            
            // We first convert the stringified float back to float
            acp_matches = api_response["response"];
            acp_matches_ = []
            for (ix in acp_matches)
                acp_matches_.push([acp_matches[ix][0], parseFloat(acp_matches[ix][1])]);
            acp_matches = acp_matches_
            
            // Out of the top 40 we keep the top 20 to graph
            acp_matches_top_k = acp_matches.slice(Math.max(acp_matches.length - 20, 0))
            acp_sample_token = api_response["sample_token"];
            if (acp_matches.length > 0) {
                // We write the recommended token out to the text field.
                displaySampledMatches (acp_sample_token, acp_matches_top_k);
                // We graph the top 20 responses
                updateChart(acp_matches_top_k, myChart);
            }
        // We don't do any error checking
        }
        //If the user had queried the model using a `tab`, we release the lock on the `tab`. This prevents the user from spamming the model.
        if (acp_inside_tab_processing == true)
            acp_inside_tab_processing = false;
    }
    //Send The Request
    request.open('POST', url);
    request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    request.send(JSON.stringify({"text":last_tokens}));
}

/* 4. Autocomplete Text Input
        Here we add a string of event listeners to our input box, so that the user may interact with it seamlessly.
        These can be divided into focus/blur, keyup, and keydown events.
    
        1. Focus/blur - When the input box is in focus, we want the text of the background box to be displayed, but semi-translucently (We use '#e0e0e0' for this)
                        When the input box is goes out of focus (blur), we want to hide the background box text. [Note: Testing has confirmed this is not necesary, but we keep it just in case.]
        2. keyup - if one of [space ! , . : ; ?] is pressed, then the contents of the input box will be processed and sent to the API.
                    This is done at max once every 200ms, so the server doesn't get clogged up with old requests if the user types too quickly.
        3. keydown - if a `tab` is pressed, then we perform autocomplete by copying the contents of the background box (recommended next word) to the input box
                    We also trigger the API to generate the next word, but only if the server has finished processing the last `tab` input. (tracked by a flag `acp_inside_tab_processing`).
                    [Note: This is done using keydown while the punct are processed using keyup becasue testing has shown this produces a smoother experience.]
 */

acp_punct_delimiter_codes = [32, 16, 188, 190, 186, 191] //space ! , . : ; ?

//We set the background box to be semi-transluent
$acp_input_box.focus(function(){
    $acp_background_box.css('color', '#e0e0e0');
 }).blur(function(){
    $acp_background_box.css('color', 'transparent');

//We trigger the API every time one of [space ! , . : ; ?] is pressed, but at a delay of 200ms if the last request happened too quickly.
 }).keyup(delay(function(event){
    if(acp_punct_delimiter_codes.includes(event.keyCode)){
         if (this.value.length > 0)
             getMatchesAPI(this.value);
     }
//We autocomplete with the last recommended stentence by copying the contents of the background box to the input box
// every time `tab` is pressed. We also trigger the API to generate the next word, but only if the server has finished processing the last `tab` input.
// We keep track of this through a flag `acp_inside_tab_processing`.
 }, 200)).keydown(function(event) { 
    if (event.keyCode == 9) { //tab
        //Only do anything if server has finished processing last `tab`
        if (!acp_inside_tab_processing){
            //form the `tab` lock. Note: this lock is released in `getMatchesAPI`
            acp_inside_tab_processing = true;
            $(this).focus();
            event.preventDefault();
            // Get the text to autofill 
            var cand = $acp_background_box.val()
            if (cand.length > 1){
                // If the proposed text is a space and then a punctuation, remove the space and update the input box
                var c_m1 = cand.charAt(cand.length-1)
                var c_m2 = cand.charAt(cand.length-2)
                // console.log(cand, c_m1, c_m2)
                if (".,:!?".includes(c_m1) && c_m2 == " ") {
                    var new_cand = cand.substring(0, cand.length - 1).trim() + c_m1;
                    $acp_input_box.val(new_cand);
                } else 
                    // Else update the input box  
                    $acp_input_box.val(cand);
            } else
                // If the poposal is empty also update the input box
                if (cand)
                    $acp_input_box.val(cand);
            // Call the API to get the next value
            if (this.value.length > 0)
                getMatchesAPI(this.value);
        }
    } else {
        // Clear the background box if any other key is pressed, so the experience is clean.
        $acp_background_box.val('');
    }
 });


/* 5. Displaying the matches.
 */

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



  
function updateChart(topKList, chart) {
    chart.data.datasets[0].data = topKList.map((x) => x[1]);
    chart.data.labels= topKList.map((x) => x[0]);
    chart.update();
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
