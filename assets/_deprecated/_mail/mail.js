$('#contact-form input[type=submit]').click(function(event){
    grecaptcha.execute('6LcEH8UZAAAAAF3j_tEIbO3_bJbFeLSs7lLv3XY2', {action: 'submit'}).then(function(token) {
        $('#captcha-token').val(token);
    });

    $error_show = $('#contact-form .error-show p');
    event.preventDefault();
    var send=true;
    if ($('#contact-form #subject').val().length == 0 ||
        $('#contact-form #email').val().length == 0 ||
        $('#contact-form #message').val().length == 0){
            var empty_field_msg = "Oops! Please make sure to fill in all the fields!";
            if ($error_show.text() == empty_field_msg){
                $error_show.text("\xa0");
                setTimeout(function(){
                    $error_show.text(empty_field_msg)
                }, 100)
            } else {
                $error_show.text(empty_field_msg)
            }
            
            send=false;
    }
    else if ($('#contact-form #captcha-token').val().length == 0){
        $error_show.text(`Captcha token hasn't loaded so we couldn't authenticate you. Try again in a little bit! \n
                          Reload the page if this persists!`)
        send=false;
    }
    else{
        // var php_url = "https://zhengyuanma.us/assets/php/mail.php?subject=" + $('#contact-form #subject').val() + "&email=" + $('#contact-form #email').val() + "&message=" + $('#contact-form #message').val() + "&captcha-token=" + $('#contact-form #captcha-token').val()
        // $error_show.text("<a href="+ php_url + ">" +php_url+"</a>")
        $error_show.text("\xa0");
        $.ajax({
            url: 'assets/php/mail.php',
            type: 'POST',
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify({ "subject": $('#contact-form #subject').val(),
                    "email": $('#contact-form #email').val(),
                    "message": $('#contact-form #message').val(),
                    "captcha-token": $('#contact-form #captcha-token').val()
                }),
            success: function(response) {
                if (response == "CAPTCHA_FAIL"){
                    $error_show.text("There's an error with the Captcha token! Please refresh the page :)")
                }
                console.log(response)
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                alert("Status: " + textStatus); alert("Error: " + errorThrown); 
        }
        });
    }
});