var $test = $('#project_nmt_box'),
    $translate_box = $('#project_nmt_box2'),
    $model_select_boxes = $('#nmt .actions li input')

var delimiter_codes = [32, 16, 188, 190, 186, 191] //space ! , . : ; ?
var nmt_api_mode = 'lstm';

$model_select_boxes.on('click', event => {
    event.preventDefault();
    if (event.target.className == "primary"){
        if (event.target.value == "LSTM"){
            nmt_api_mode = 'lstm';
        } else if (event.target.value == "Char LSTM"){
            nmt_api_mode = 'lstm_char';
        }
        $active_box = $('#nmt .actions li .active')[0];
        $active_box.className = "primary";
        event.target.className = "active";
    }
});

$test.keyup(delay(function(event){
    if(delimiter_codes.includes(event.keyCode)){
        if (this.value.length > 0)
            getTranslationAPI(this.value);
    }
}, 200))


function getTranslationAPI(inputText) {
    var matchList = [];
    var request = new XMLHttpRequest();
    var url = 'http://35.239.212.207:5000/' + nmt_api_mode;
    var params = "src_sent="+ inputText;
    request.open('GET', url + "?" + params, true);
    //Send the proper header information along with the request
    request.setRequestHeader('Content-type', 'application/json');
    request.send(null);

    request.onreadystatechange = function() {
        if(request.readyState == 4 && request.status == 200) {
            matches = request.responseText;
            console.log(matches)
            if (matches.length > 0) {
                $translate_box.val(matches);
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