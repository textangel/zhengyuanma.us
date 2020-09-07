
// // Handling Model Load, Unload
// var request;
// var model_loaded_str = "Model Loaded (Deactivate)"
// var model_not_loaded_str = "Model Not Loaded (Load Model)"

// window.addEventListener("beforeunload", function(e){
//     console.log('Deactivating model')
//     stopAutocompleteModel(event);
//  }, false);



// $load_button = $('#autocomplete_load')
// $load_button.ready(function(event){
//     loadAutocompleteModel(event);
// });

// $('#autocomplete div.close').click( function(event){
//     console.log('Deactivating model')
//     stopAutocompleteModel(event);
// });

// $load_button.click(function(event){
//     if ($load_button.val() == model_loaded_str){
//         event.preventDefault();
//         $load_button.val("Model Deactivating. Please Wait...")
//         stopAutocompleteModel(event);
//     } else if ($load_button.val() == model_not_loaded_str){
//         event.preventDefault();
//         $load_button.val("Model Starting. Please Wait...")
//         loadAutocompleteModel(event);
//     }
// })


// function loadAutocompleteModel(event){
//     request = autocomplete_loader("start")
//     request.done(function(response, textStatus, jqXHR){
//         if (response == "Running"){
//             $load_button.className = "active"
//             $load_button.val(model_loaded_str)
//         }
//         handleLoadingError(response);
//         console.log(response);
//     })
//     request.fail(ajaxError);
// }

// function stopAutocompleteModel(event){
//     request = autocomplete_loader("stop")
//     request.done(function(response, textStatus, jqXHR){
//         if (response == "Stopped"){
//             $load_button.className = "primary"
//             $load_button.val(model_not_loaded_str)
//         }
//         handleLoadingError(response);
//         console.log(response);
//     })
//     request.fail(ajaxError);
// }

// function handleLoadingError(response) {
//     if (response == "Error") {
//         $load_button.className = "primary"
//         $load_button.val("An Error Occured! Please Refresh The Page And Try Again")
//     }
//     if (response == "Timeout") {
//         $load_button.className = "primary"
//         $load_button.val("An Timeout Occured! Please Refresh The Page And Try Again")
//     }
//     if (response == "DockerError") {
//         $load_button.className = "primary"
//         $load_button.val("This app is not available at this time. Sorry!")
//     }
// }

// function autocomplete_loader(query_mode){
//     return $.ajax({
//         type: "POST",
//         url: 'assets/php/load_autocomplete_model.php',
//         data: jQuery.param( { mode: query_mode} ),
//         contentType: 'application/x-www-form-urlencoded; charset=UTF-8'
//     })
// }

// function ajaxError(jqXHR, textStatus, errorThrown){
//     console.log("Ajax request error");
//     console.log(textStatus, errorThrown);
// };

