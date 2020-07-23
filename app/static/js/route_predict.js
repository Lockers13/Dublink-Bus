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

// submitBtn.addEventListener("click", function (event) {
//     var start = startLocation.value
//     var end = endLocation.value
//     fetch("http://localhost:8000/api/profile/12")
//     .then(response => {
//         return response.json();
//     })
//     .then(data => {
//         results.innerHTML = start + " " + end + " " + data.co2points;
//     })
// });


var weekdays = ["MON","TUE","WEN","THU","FRI","SAT","SUN"];
var weekdayNums = [];
//Need to create list of next five days as weather forecast is for five days
var fiveDays = [];
//Chosen day is what is passed to the model
var chosenDay;
var count = 0;
var datesIndex = 0;
var dates = [];


function getDays () {
    //Using moment.js lib
    let days = [];
    let months = [];
    let daysRequired = 5
    for (let i = 0; i <= daysRequired; i++) {
      days.push( moment().add(i, 'days').format('Do') )
      months.push( moment().add(i, 'days').format('MMMM') )
      dates.push( moment().add(i, 'days').format().substring(0,10) )
    }

    var date = new Date();
    day = date.getDay()
    chosenDay = day-1;
    for (i = day-1; count < 5; i++){

        //Have to go back to Monday after Sunday
        if (i == 7){
            i = 0;
        }
        //Need to increase each time incase next day is in new month
        date.setDate(date.getDate() + i);
        var dateNum = date.getDate();
        count += 1;
        fiveDays.push(weekdays[i]);
        weekdayNums.push(i);
    }
    let daySelect = document.getElementById('daySelect');
    let innerHTML = "";
    for(var j =0; j < weekdayNums.length; j++){
        if( j === 0) {
            innerHTML += "<div class='dayBox'> <button id="+weekdayNums[j]+" class='dayButton dayCurrent' value="+weekdayNums[j]+" onClick=selectDay("+weekdayNums[j]+")> <h6>"+ fiveDays[j] +"</h6> <p>"+days[j]+"</p> <p class='dayMonth'>"+months[j].substring(0,3).toUpperCase() +"</p> </button> </div>"
        } else {
        innerHTML += "<div class='dayBox'> <button id="+weekdayNums[j]+" class='dayButton' value="+weekdayNums[j]+" onClick=selectDay("+weekdayNums[j]+")> <h6>"+ fiveDays[j] +"</h6> <p>"+days[j]+"</p> <p class='dayMonth'>"+ months[j].substring(0,3).toUpperCase() +"</p> </button> </div>"
        }
        //console.log(weekdayNums[j], fiveDays[j]);
        daySelect.innerHTML= innerHTML;
    }
    console.log(dates)
    console.log(weekdayNums)
}

getDays();

function selectDay (value) {
    chosenDay = value;
    datesIndex = weekdayNums.indexOf(chosenDay);
    for(let i = 0; i<weekdayNums.length; i++){
        if (weekdayNums[i] != value) {
            document.getElementById(weekdayNums[i]).style.backgroundColor = "#202346";
        }
        else if(weekdayNums[i] === value){
            document.getElementById(value).style.backgroundColor = "#F86379";
        }
    }
}







