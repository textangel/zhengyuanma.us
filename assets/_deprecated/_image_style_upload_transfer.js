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
        console.log("beginning upload")
        var base_img_data = document.getElementById("finput_base").files[0];
        var style_img_data = document.getElementById("finput_style").files[0];
        image_upload(base_img_data, "base", dir_id)
        image_upload(style_img_data, "style", dir_id)
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

function run_style_transfer(){
    var a = 5;
}

function image_upload(image_data, image_name, directory_name){
    //Image Upload - uploads image to /uploads/{directory_name}/
    var fd = new FormData();
    fd.append('fname', image_name);
    fd.append('name', image_name);
    fd.append('data', image_data);
    fd.append('dir_hash', directory_name);
    $.ajax({
        type: 'POST',
        url: '/upload.php',
        data: fd,
        processData: false,
        contentType: false
    }).done(function(data) {
        console.log(directory_name + "/" + image_name + " uploaded.");
    });
}