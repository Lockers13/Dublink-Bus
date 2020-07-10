/*var pred_button = document.getElementById('predict_btn')
var pred_form = document.getElementById('predict_form')
var journey_info = document.getElementById('journey_info')*/


//Commented out, was returning error: "Cannot read property 'addEventListener' of null"

/*pred_button.addEventListener("click", function() {
    pred_form.submit
})*/


/*function handleForm(event) {
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

pred_form.addEventListener("submit", handleForm)*/

var submitBtn = document.getElementById('planRouteSubmit');
var startLocation = document.getElementById('startLocation');
var endLocation = document.getElementById('endLocation');
var results = document.getElementById('results1');

submitBtn.addEventListener("click", function (event) {
    var start = startLocation.value
    var end = endLocation.value
    fetch("http://localhost:8000/api/profile/12")
    .then(response => {
        return response.json();
    })
    .then(data => {
        results.innerHTML = start + " " + end + " " + data.co2points;
    })
});

