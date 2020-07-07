var pred_button = document.getElementById('predict_btn')
var pred_form = document.getElementById('predict_form')
var journey_info = document.getElementById('journey_info')



pred_button.addEventListener("click", function() {
    pred_form.submit
})


function handleForm(event) {
    event.preventDefault()
    journey_info.innerHTML = ""
    fetch('http://localhost:8000/routes/api/predict?lineid=68')
    .then(response => response.json())
    .then(function (data) {
        let data_keys = Object.keys(data["journey_info"])
        for(let i = 0; i < data_keys.length; i++) {
            inner_object = data["journey_info"][data_keys[i]]
            if(data_keys[i] == "arrival_startstop") {
                journey_info.innerHTML  += "Your bus will leave at: " +
                inner_object['hours'] + ":" + inner_object['minutes'] + "<br>"
            }
            else if(data_keys[i] == "arrival_endstop") {
                journey_info.innerHTML  += "Your bus will arrive at: " +
                inner_object['hours'] + ":" + inner_object['minutes'] + "<br>"
            }
            else if(data_keys[i] == "journey_time") {
                journey_info.innerHTML  += "Total trip time: " + 
                inner_object['hours'] + " Hrs & " + inner_object['minutes'] + " Minutes<br>"
            }
        }
    })
}

pred_form.addEventListener("submit", handleForm)

