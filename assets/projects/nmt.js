var $nmt_input_box = $('#project_nmt_box'),
    $nmt_output_box = $('#project_nmt_box2'),
    $nmt_model_select_boxes = $('#nmt #nmt_model_select li input'),
    $nmt_lang_select_boxes = $('#nmt #nmt_lang_select li input'),
    banned_words = ["Disponible inconsciente.", "It is independent."]
var punct_delimiter_codes = [32, 16, 188, 190, 186, 191] //space ! , . : ; ?
var nmt_api_model = 'lstm_char';
var nmt_api_lang = 'es_en';


$nmt_model_select_boxes.on('click', event => {
    event.preventDefault();
    if (event.target.className == "primary"){
        if (event.target.value == "LSTM"){
            nmt_api_model = 'lstm';
            if ($nmt_input_box.val().length > 0)
                getTranslationAPI($nmt_input_box.value);
        } else if (event.target.value == "Char LSTM"){
            nmt_api_model = 'lstm_char';
            if ($nmt_input_box.val().length > 0)
                getTranslationAPI($nmt_input_box.value);
        }
        $active_box = $('#nmt #nmt_model_select li .active')[0];
        $active_box.className = "primary";
        event.target.className = "active";
    }
});

$nmt_lang_select_boxes.on('click', event => {
    event.preventDefault();
    if (event.target.className == "primary"){
        if (event.target.value == "SPA - ENG"){
            $('#nmt_src_sent_label').text("Source Language: Spanish")
            $('#nmt_tgt_sent_label').text("Target Language: English")
            nmt_api_lang = 'es_en';
            if ($nmt_input_box.val().length > 0)
                getTranslationAPI($nmt_input_box.value);
        } else if (event.target.value == "ENG - SPA"){
            $('#nmt_src_sent_label').text("Source Language: English")
            $('#nmt_tgt_sent_label').text("Target Language: Spanish")
            nmt_api_lang = 'en_es';
            if ($nmt_input_box.val().length > 0)
                getTranslationAPI($nmt_input_box.value);
        }
        $active_box = $('#nmt #nmt_lang_select li .active')[0];
        $active_box.className = "primary";
        event.target.className = "active";
    }
});

$nmt_input_box.keyup(delay(function(event){
    if(punct_delimiter_codes.includes(event.keyCode)){
        if (this.value.length > 0)
            getTranslationAPI(this.value);
    }
}, 200))

function getTranslationAPI(inputText) {
    var matchList = [];
    var request = new XMLHttpRequest();
    var url = 'https://api.zhengyuanma.us/api/nmt/' + nmt_api_model + "/" + nmt_api_lang;
    var params = "src_sent="+ inputText;
    request.open('GET', url + "?" + params, true);
    //Send the proper header information along with the request
    request.setRequestHeader('Content-type', 'application/json');
    request.send(null);

    request.onreadystatechange = function() {
        if(request.readyState == 4 && request.status == 200) {
            acp_matches = request.responseText;
            console.log(acp_matches)
            if (acp_matches.length > 0 && !banned_words.includes(acp_matches.trim())) {
                $nmt_output_box.val(acp_matches);
            }
        }
    }
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