<?php
// This only uploads to the web server which is not what we want. We want uploads to the app server.
// Also this doesn't quite work yet...
$target_dir = "uploads/" . $_POST["dir_hash"] . "/";
$file_base = $_FILES["finput_base"];
$file_style = $_FILES["finput_style"];
$target_file_base = $target_dir . basename($_FILES["finput_base"]["name"]);
$target_file_style = $target_dir . basename($_FILES["finput_style"]["name"]);
$is_POST_submit = isset($_POST["submit"]);


function uploadImg($target_file, $file, $is_POST_submit)
{
    $uploadOk = 1;
    $imageFileType = strtolower(pathinfo($target_file,PATHINFO_EXTENSION));

    // Check if image file is a actual image or fake image
    if($is_POST_submit) {
      $check = getimagesize($file["tmp_name"]);
      if($check !== false) {
        echo "File is an image - " . $check["mime"] . ".";
        $uploadOk = 1;
      } else {
        echo "File is not an image.";
        $uploadOk = 0;
      }
    }

    // Check if file already exists
    if (file_exists($target_file)) {
      echo "Sorry, file already exists.";
      $uploadOk = 0;
    }

    // Check file size
    if ($file["size"] > 500000) {
      echo "Sorry, your file is too large.";
      $uploadOk = 0;
    }

    // Allow certain file formats
    if($imageFileType != "jpg" && $imageFileType != "png" && $imageFileType != "jpeg"
    && $imageFileType != "gif" ) {
      echo "Sorry, only JPG, JPEG, PNG & GIF files are allowed.";
      $uploadOk = 0;
    }

    // Check if $uploadOk is set to 0 by an error
    if ($uploadOk == 0) {
      echo "Sorry, your file was not uploaded.";
    // if everything is ok, try to upload file
    } else {
      if (move_uploaded_file($file["tmp_name"], $target_file)) {
        echo "The file ". basename( $file["name"]). " has been uploaded.";
      } else {
        echo "Sorry, there was an error uploading your file.";
      }
    }
}

uploadImg($target_file_base, $file_base, $is_POST_submit);
uploadImg($target_file_style, $file_style, $is_POST_submit);
?>