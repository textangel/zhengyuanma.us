var $style_transfer_error_div = $("#style_transfer_error");
var style_transfer_error_msg = "One or more of the images is missing!";
var $style_transfer_submit_button = $("#style_transfer input[type='submit']")
var oom_status_code = 507;
$("#style_transfer_img_submit").submit(function(event){
    event.preventDefault();
})

/* Logic for Image Upload*/
// Encode the uploaded image as DataURI (base64) and display it
function display_image(canvas_name) {
    if (! (canvas_name == "base" || canvas_name == "style"))
        return
    var img_canvas_id = "img_canvas_" + canvas_name
    var img_input_id = "finput_" + canvas_name
    
    var imgcanvas = document.getElementById(img_canvas_id);
    var fileinput = document.getElementById(img_input_id).files[0];
    const reader = new FileReader();
    
    reader.addEventListener("load", function(){
        imgcanvas.src = reader.result;
        imgcanvas.style.display="block"
    }, false)

    if (fileinput) {
        reader.readAsDataURL(fileinput);
    }
}

/* Logic for Form Submit*/
// Event Listener For Submission of Images
var style_transfer_user_has_submitted = false;
$style_transfer_submit_button.click(function(event){
    if (!style_transfer_user_has_submitted){
        event.preventDefault();
        upload_images()
    } else {
        event.preventDefault();
        displayError($style_transfer_error_div, "You can only submit once per session! Please refresh the page.")
    }
})

// Callback for Submission of Images
function upload_images(){
    var base = document.getElementById("img_canvas_base");
    var style = document.getElementById("img_canvas_style");
    var base_src = base.src;
    var style_src = style.src;
    var dir_id = Math.random().toString(36).substring(2, 15); //Random uid
    if (base_src && style_src && base_src.length > 1 && style_src.length > 1
        && base.style.display!="none" && style.style.display!="none"){
        $style_transfer_error_div.text("\xa0")
        testAndRunStyleTransferAPI(base_src, style_src)
        //MAKE THIS UNCOMMENTED AGAIN // style_transfer_user_has_submitted = true;
        $style_transfer_submit_button.val("RUNNING")
        $style_transfer_submit_button.addClass('active').removeClass('primary')
        //MAKE THIS UNCOMMENTED AGAIN  //$style_transfer_submit_button.attr("disabled", "disabled")// .get()[0].style.="none";
    } else {
        displayError($style_transfer_error_div, style_transfer_error_msg)
    }
}

function displayError($error_div, error_msg){
    if ($error_div.text() == error_msg){
        $error_div.text("\xa0")
        setTimeout(function(){
            $error_div.text(error_msg)
        }, 100)
    } else 
        $error_div.text(error_msg)
}

/* Logic for sending Base64 Image to Server
 *
 *   Code from Stack Overflow: https://stackoverflow.com/questions/34972072/how-to-send-image-to-server-with-http-post-in-javascript-and-store-base64-in-mon
*/

// Here we define the function that will send the request to the server. 
// CORS issue when response is not 200: https://stackoverflow.com/questions/43871637/no-access-control-allow-origin-header-is-present-on-the-requested-resource-whe
// This solved my issue: https://stackoverflow.com/questions/24162076/cors-and-non-200-statuscode
// (basically add 'always' to the end of NGINX headers)
// https://stackoverflow.com/questions/29954037/why-is-an-options-request-sent-and-can-i-disable-it
// When does Browser do a preflight https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS#The_HTTP_request_headers
// When does Browser do a preflight  https://fetch.spec.whatwg.org/#forbidden-header-name

// More info about CORS: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
// https://developer.mozilla.org/en-US/docs/Web/Security/Same-origin_policy
// ALso this https://gist.github.com/michiel/1064640

//You may have to handle errors https://www.nginx.com/blog/capturing-5xx-errors-debug-server/
var testAndRunStyleTransferAPI = function(base_src, style_src){
    var http = new XMLHttpRequest()
    var path = 'https://api.zhengyuanma.us/test_api/style_transfer_test/check_memory'
    
    http.onreadystatechange = function(err) {
        if (http.readyState == 4){
            if (http.status == 200){
                runStyleTransferAPI(base_src, style_src)
            } else if (http.status == 507){
                $style_transfer_error_div.text("Too many people are using the application at the moment. Why don't you refresh and try again in a couple of minutes? We generally have reasonable load so should be able to serve your request soon :)")
            } else {
                $style_transfer_error_div.text("Too many people are using the application at the moment. Why don't you refresh and try again in a couple of minutes? We generally have reasonable load so should be able to serve your request soon")
                console.log("HTTP POST Status", http.status); 
                console.log("Error", err); 
            }
        }
    };
    http.open("GET", path, true);
    http.send();

}
var runStyleTransferAPI = function(base_src, style_src){
    var httpPost = new XMLHttpRequest(),
        path = 'https://api.zhengyuanma.us/test_api/style_transfer_test/image_upload',
        data = JSON.stringify({base_img: base_src, style_img: style_src});
    httpPost.onreadystatechange = function(err) {
        if (httpPost.readyState == 4){
            if (httpPost.status == 200){
                var imgcanvas_result = document.getElementById('img_canvas_result');
                imgcanvas_result.src = httpPost.responseText;
                imgcanvas_result.style.display="block"
                $("#style_transfer_result_header").get()[0].style.display="block"
            // } else if (httpPost.status == 507){
                // $style_transfer_error_div.text("Too many people are using the application at the moment. Why don't you refresh and try again in a couple of minutes? We generally have reasonable load so should be able to serve your request soon :)")
            } else {
                $style_transfer_error_div.text("Well, it seems too many people are using the application at the moment. Why don't you refresh and try again in a couple of minutes? We generally have reasonable load so should be able to serve your request soon :)")
                console.log("HTTP POST Status", httpPost.status); 
                console.log("Error", err); 
            }
        }
    };
    // Set the content type of the request to json since that's what's being sent
    // path = path + "?data=" + encodeURI(data)
    httpPost.open("POST", path, true);
    // httpPost.setRequestHeader('Content-Type', 'multipart/form-data');
    httpPost.setRequestHeader('Content-Type', 'application/json');
    httpPost.send(data);

    // var formData = new FormData();
    // formData.append("json", data);
    // httpPost.send(formData);
};
