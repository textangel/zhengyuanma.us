function display_image(canvas_name) {
    if (! (canvas_name == "base" || canvas_name == "style"))
        return
    var img_canvas_id = "img_canvas_" + canvas_name
    var img_input_id = "finput_" + canvas_name
    
    var imgcanvas = document.getElementById(img_canvas_id);
    var fileinput = document.getElementById(img_input_id);
    console.log(imgcanvas, fileinput)
    
    imgcanvas.src = window.URL.createObjectURL(fileinput.files[0])
    imgcanvas.style.display="inline"
}

$("#style_transfer_img_submit").submit(function(event){
    console.log("submitted")
    event.preventDefault();
    upload_images()
})

function upload_images(){
    var base_img = document.getElementById("img_canvas_base");
    var style_img = document.getElementById("img_canvas_style");
    var $error_div = $("#style_transfer_error");
    var error_msg = "One or more of the images is missing!";
    var dir_id = Math.random().toString(36).substring(2, 15); //Random uid
    if (base_img.src && style_img.src && base_img.src.length > 1 && style_img.src.length > 1){
        $error_div.text("\xa0")
        var base_img_data = document.getElementById("finput_base").files[0];
        var style_img_data = document.getElementById("finput_style").files[0];
        uploadImage(base_img.src, base_img_data.type, style_img.src, style_img_data.type)
    } else {
        if ($error_div.text() == error_msg){
            $error_div.text("\xa0")
            setTimeout(function(){
                $error_div.text(error_msg)
            }, 100)
        } else 
            $error_div.text(error_msg)
    }
}

// function run_style_transfer(){
//     var a = 5;
// }

// function image_upload(image_data, image_name, directory_name){
//     //Image Upload - uploads image to /uploads/{directory_name}/
//     var fd = new FormData();
//     fd.append('fname', image_name);
//     fd.append('name', image_name);
//     fd.append('data', image_data);
//     fd.append('dir_hash', directory_name);
//     $.ajax({
//         type: 'POST',
//         url: '/upload.php',
//         data: fd,
//         processData: false,
//         contentType: false
//     }).done(function(data) {
//         console.log(directory_name + "/" + image_name + " uploaded.");
//     });
// }

// This function accepts three arguments, the URL of the image to be 
// converted, the mime type of the Base64 image to be output, and a 
// callback function that will be called with the data URL as its argument 
// once processing is complete

var convertToBase64 = function(url, imagetype, callback){

    var img = document.createElement('IMG'),
        canvas = document.createElement('CANVAS'),
        ctx = canvas.getContext('2d'),
        data = '';

    // Set the crossOrigin property of the image element to 'Anonymous',
    // allowing us to load images from other domains so long as that domain 
    // has cross-origin headers properly set

    img.crossOrigin = 'Anonymous'

    // Because image loading is asynchronous, we define an event listening function that will be called when the image has been loaded
    img.onLoad = function(){
        // When the image is loaded, this function is called with the image object as its context or 'this' value
        canvas.height = this.height;
        canvas.width = this.width;
        ctx.drawImage(this, 0, 0);
        data = canvas.toDataURL(imagetype);
        console.log("img_data: ", data)
        callback(data);
    };

    // We set the source of the image tag to start loading its data. We define 
    // the event listener first, so that if the image has already been loaded 
    // on the page or is cached the event listener will still fire

    img.src = url;
};

// Here we define the function that will send the request to the server. 

var sendBase64ToServer = function(base64, tag){
    var httpPost = new XMLHttpRequest(),
        path = 'https://api.zhengyuanma.us/test_api/style_transfer_test/image_upload',
        data = JSON.stringify({tag: base64});
        console.log("Sending ", data)
    httpPost.onreadystatechange = function(err) {
            if (httpPost.readyState == 4 && httpPost.status == 200){
                console.log(httpPost.responseText);
            } else {
                console.log(err);
            }
        };
    // Set the content type of the request to json since that's what's being sent
    httpPost.setHeader('Content-Type', 'application/json');
    httpPost.open("POST", path, true);
    httpPost.send(data);
};

// This wrapper function will accept the name of the image, the url, and the 
// image type and perform the request

var uploadImage = function(base_src, base_type, style_src, style_type){
    console.log("beginning upload")
    convertToBase64(base_src, base_type, function(data){
        sendBase64ToServer(data, "base_img");
    });
    convertToBase64(style_src, style_type, function(data){
        sendBase64ToServer(data, "style_img");
    });
};

// Call the function with the provided values. The mime type could also be png
// or webp
