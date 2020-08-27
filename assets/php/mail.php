<?php

// $email = $_POST['email'];
// $subject = $_POST['subject'];
// $message = $_POST['message'];

// function IsInjected($str)
// {
//     $injections = array('(\n+)',
//            '(\r+)',
//            '(\t+)',
//            '(%0A+)',
//            '(%0D+)',
//            '(%08+)',
//            '(%09+)'
//            );
               
//     $inject = join('|', $injections);
//     $inject = "/$inject/i";
    
//     if(preg_match($inject,$str))
//     {
//       return true;
//     }
//     else
//     {
//       return false;
//     }
// }

// if(IsInjected($email))
// {
//     echo "Bad email value!";
//     exit;
// }
// $email = filter_email_header($email);

// // use wordwrap() if lines are longer than 70 characters
// $message = wordwrap($message,70);

// $headers = 'From: ' . $email_address . "\n";

// // send email

// $sent = mail("zhengma86@gmail.com", $subject, $message, $headers);


?>