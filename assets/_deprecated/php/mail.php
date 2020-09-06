<?php

$SITE_KEY = "6LcEH8UZAAAAAF3j_tEIbO3_bJbFeLSs7lLv3XY2";
$SECRET_KEY = "6LcEH8UZAAAAAHylWKES0tvHUaQtcDHkBsj5_7y1";


if (isset($_POST) && isset($_POST["captcha-token"]) && !empty($_POST["captcha-token"])){
    $ch = curl_init();

    curl_setopt_array($ch, [
        CURLOPT_URL => 'https://www.google.com/recaptcha/api/siteverify',
        CURLOPT_POST => [
            'secret' => $SECRET_KEY,
            'response' => $_POST["captcha-token"],
            'remoteip' => $_SERVER['REMOTE_ADDR']
        ],
        CURLOPT_POSTFIELDS => $post,
        CURLOPT_RETURNTRANSFER => true,
    ]);
    
    $output = curl_exec($ch);
    curl_close($ch);
    if (! $recaptcha['success']) {
        return "CAPTCHA_FAIL";
    }
}

echo "CAPTCHA_SUCCESS";

if (isset($_POST['email'])) {

    // EDIT THE 2 LINES BELOW AS REQUIRED
    $email_to = "zhengma86@gmail.com";

    function problem($error)
    {
        echo "We are very sorry, but there were error(s) found with the form you submitted. ";
        echo "These errors appear below.<br><br>";
        echo $error . "<br><br>";
        echo "Please go back and fix these errors.<br><br>";
        die();
    }

    // validation expected data exists
    if (
        !isset($_POST['subject']) ||
        !isset($_POST['email']) ||
        !isset($_POST['message'])
    ) {
        problem('Please make sure all the fields are filled in!');
    }

    $subject = $_POST['subject']; // required
    $email = $_POST['email']; // required
    $message = $_POST['message']; // required

    $email_to = "zhengma86@gmail.com";

    $error_message = "";
    $email_exp = '/^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}$/';

    if (!preg_match($email_exp, $email)) {
        $error_message .= 'The Email address you entered does not appear to be valid.<br>';
    }

    $string_exp = "/^[A-Za-z .'-]+$/";


    if (strlen($message) < 2) {
        $error_message .= 'The Message you entered do not appear to be valid.<br>';
    }

    if (strlen($error_message) > 0) {
        problem($error_message);
    }

    $email_message = "Form details below.\n\n";

    function clean_string($string)
    {
        $bad = array("content-type", "bcc:", "to:", "cc:", "href");
        return str_replace($bad, "", $string);
    }

    $email_message .= "Subject: " . clean_string($subject) . "\n";
    $email_message .= "Email: " . clean_string($email) . "\n";
    $email_message .= "Message: " . clean_string($message) . "\n";

    echo $email_message;

    // create email headers
    $headers = 'From: ' . $email . "\r\n" .
        'Reply-To: ' . $email . "\r\n" .
        'X-Mailer: PHP/' . phpversion();
    @mail($email_to, $subject, $email_message, $headers);

?>

    <!-- include your success message below -->

    Thank you for contacting us. We will be in touch with you very soon.

<?php
}
?>