/* Setup and Utility Functions */
var $style_transfer_error_div = $("#style_transfer_error");
var style_transfer_error_msg = "One or more of the images is missing!";
var $style_transfer_submit_button = $("#style_transfer input[type='submit']")
var oom_status_code = 507;
var style_transfer_submit_button_download_mode = false;

$("#style_transfer_img_submit").submit(function(event){
    event.preventDefault();
})

function displayError($error_div, error_msg){
    if ($error_div.text() == error_msg){
        $error_div.text("\xa0")
        setTimeout(function(){
            $error_div.text(error_msg)
        }, 100)
    } else 
        $error_div.text(error_msg)
}


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
    event.preventDefault();
    if (!style_transfer_submit_button_download_mode){
        if (!style_transfer_user_has_submitted){
            upload_images()
        } else {
            var submit_twice_error = "You can only submit once per session! Please refresh the page.";
            displayError($style_transfer_error_div, submit_twice_error)
        }
    } else {
        var imgcanvas_result = document.getElementById('img_canvas_result');
        var link = document.createElement('a');
        link.href = imgcanvas_result.src;
        link.target = "_blank"
        link.download = 'style_transfer_by_andrew_ma.jpg';
        link.click();
        $style_transfer_submit_button.attr("disabled", "disabled")   
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
        style_transfer_user_has_submitted = true;
        $style_transfer_submit_button.val("RUNNING")
        $style_transfer_submit_button.addClass('active').removeClass('primary')
        $style_transfer_submit_button.attr("disabled", "disabled")
    } else {
        displayError($style_transfer_error_div, style_transfer_error_msg)
    }
}


/**When writing the code, we hit various memory issues on the server.
 * Unfortunately, these errors are blocked by Chrome's CORS policy. The app server is on a different host.
 * I circumvent this by having requests send a "test" ping first, to see if the server has memory.
 * Only if the test ping succeeds do we proceed to the application.
 * Information on CORS that I discovered below.
    
    StackOverflow Questions And helpful discussions
     - CORS issue when response is not 200: https://stackoverflow.com/questions/43871637/no-access-control-allow-origin-header-is-present-on-the-requested-resource-whe
     - This solved my issue: https://stackoverflow.com/questions/24162076/cors-and-non-200-statuscode
    (basically add 'always' to the end of NGINX headers)
     - https://stackoverflow.com/questions/29954037/why-is-an-options-request-sent-and-can-i-disable-it
     - https://gist.github.com/michiel/1064640

     Specs about CORS
    - https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS#The_HTTP_request_headers
    - https://fetch.spec.whatwg.org/#forbidden-header-name

    More info about CORS:
    - https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
    - https://developer.mozilla.org/en-US/docs/Web/Security/Same-origin_policy
    
    Other possible tips:
    - https://www.nginx.com/blog/capturing-5xx-errors-debug-server/
*/
var testAndRunStyleTransferAPI = function(base_src, style_src){
    var http = new XMLHttpRequest()
    var path = 'https://api.zhengyuanma.us/test_api/style_transfer_test/check_memory'
    var not_enough_memory_err =  "Too many people are using the application at the moment. \n Why don't you try again in a couple of minutes?"
    var application_down_err =  "The application seems to be unresponsive at the moment. We're working on getting it fixed!"
    http.onreadystatechange = function(err) {
        if (http.readyState == 4){
            if (http.status == 200){
                runStyleTransferAPI(base_src, style_src)
            } else if (http.status == 507){
                $style_transfer_error_div.text(not_enough_memory_err + " :)")
                $style_transfer_submit_button.val("ERROR")
                $style_transfer_submit_button.removeClass('active')
            } else {
                $style_transfer_error_div.text(application_down_err)
                $style_transfer_submit_button.val("ERROR")
                $style_transfer_submit_button.removeClass('active')
                console.log("HTTP POST Status", http.status); 
                console.log("Error", err); 
            }
        }
    };
    http.open("GET", path, true);
    http.send();

}


/* Logic for sending Base64 Image to Server
 *
 *   Code from Stack Overflow: https://stackoverflow.com/questions/34972072/how-to-send-image-to-server-with-http-post-in-javascript-and-store-base64-in-mon
*/
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
                $("#style_transfer_resource_warning").get()[0].style.display="none"
                $style_transfer_submit_button.val("DOWNLOAD RESULT")
                $style_transfer_submit_button.removeClass('active').addClass('primary')
                $style_transfer_submit_button.attr("disabled", false)
                style_transfer_submit_button_download_mode=true
            } else {
                $style_transfer_submit_button.val("ERROR")
                $style_transfer_submit_button.removeClass('active')
                $style_transfer_error_div.text("This application seems to be unresponsive due to load.")
                console.log("HTTP POST Status", httpPost.status); 
                console.log("Error", err); 
            }
        }
    };

    httpPost.open("POST", path, true);
    httpPost.setRequestHeader('Content-Type', 'application/json');
    // TODO: This size computation is way off because the serialization is seriously expanded. 
    // For example, two MB pictures have a serialized size of 60MB. This is, at best, a heuristic.
    var bytes = data.length * 2 // Chars are 2 bytes in JS
    var megabytes = bytes / 1000000
    console.log("Upload size: ", megabytes, "MB")
    if (megabytes > 60) {
        var size_error = "The uploaded files are too big. The max size for both images is 15 MB. Please try again with smaller images.";
        displayError($style_transfer_error_div, size_error)
    } else {
        httpPost.send(data);
    }
    
};
