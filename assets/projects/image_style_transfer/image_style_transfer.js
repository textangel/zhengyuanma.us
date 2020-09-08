var $style_transfer_error_div = $("#style_transfer_error");
var style_transfer_error_msg = "One or more of the images is missing!";

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
    console.log(imgcanvas, fileinput)
    
    reader.addEventListener("load", function(){
        imgcanvas.src = reader.result;
        imgcanvas.style.display="inline"
    }, false)

    if (fileinput) {
        reader.readAsDataURL(fileinput);
    }
}

/* Logic for Form Submit*/
// Event Listener For Submission of Images
var style_transfer_user_has_submitted = false;
$("#style_transfer_img_submit").submit(function(event){
    if (!style_transfer_user_has_submitted){
        console.log("submitted")
        event.preventDefault();
        upload_images()
        style_transfer_user_has_submitted = true;
    } else {
        event.preventDefault();
        displayError($style_transfer_error_div, "You can only submit once per session! Please refresh the page.")
    }
})

// Callback for Submission of Images
function upload_images(){
    var base_src = document.getElementById("img_canvas_base").src;
    var style_src = document.getElementById("img_canvas_style").src;
    
    var dir_id = Math.random().toString(36).substring(2, 15); //Random uid
    
    if (base_src && style_src && base_src.length > 1 && style_src.length > 1){
        $style_transfer_error_div.text("\xa0")
        uploadImage(base_src, style_src)
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
var uploadImage = function(base_src, style_src){
    var httpPost = new XMLHttpRequest(),
        path = 'https://api.zhengyuanma.us/test_api/style_transfer_test/image_upload',
        data = JSON.stringify({base_img: base_src, style_img: style_src});
        // console.log("Sending ", data)
    httpPost.onreadystatechange = function(err) {
            if (httpPost.readyState == 4 && httpPost.status == 200){
                console.log("Successfully uploaded: ", tag);
                console.log(httpPost.responseText);
            } else {
                console.log(err);
            }
        };
    // Set the content type of the request to json since that's what's being sent
    httpPost.open("POST", path, true);
    httpPost.setRequestHeader('Content-Type', 'application/json');
    httpPost.send(data);
};
