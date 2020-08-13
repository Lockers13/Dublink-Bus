var submitBtn = document.getElementById('planRouteSubmit');
var startLocation = document.getElementById('startLocation');
var endLocation = document.getElementById('endLocation');
var results = document.getElementById('results1');

var weekdays = ["MON","TUE","WEN","THU","FRI","SAT","SUN"];
var weekdayNums = [];
//Need to create list of next five days as weather forecast is for five days
//var fiveDays = [];
//Chosen day is what is passed to the model
var chosenDay;
var chosenDate;
var count = 0;
var datesIndex = 0;
var dates = [];


function getDays () {
    //Using moment.js lib
    let days = [];
    let months = [];
    let fiveDays = [];
    let daysRequired = 5
    for (let i = 0; i <= daysRequired; i++) {
      days.push( moment().add(i, 'days').format('Do') )
      months.push( moment().add(i, 'days').format('MMMM') )
      dates.push( moment().add(i, 'days').format('DD/MM/YYYY').substring(0,10) )
      fiveDays.push( moment().add(i, 'days').format('dddd').substring(0,3).toUpperCase() )
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
        weekdayNums.push(i);
    }

    let daySelect = document.getElementById('daySelect');
    let innerHTML = "";
    chosenDay = weekdayNums[0];
    //Quick fix for weekday number of sunday being -1
    if (chosenDay === -1){
        chosenDay = 6
    }
    for(var j =0; j < weekdayNums.length; j++){
        if( j === 0) {
            innerHTML += "<div class='dayBox'> <button id="+weekdayNums[j]+" class='dayButton dayCurrent' value="+weekdayNums[j]+" onClick=selectDay("+weekdayNums[j]+")> <h6>"+ fiveDays[j] +"</h6> <p>"+days[j]+"</p> <p class='dayMonth'>"+months[j].substring(0,3).toUpperCase() +"</p> </button> </div>"
        } else {
        innerHTML += "<div class='dayBox'> <button id="+weekdayNums[j]+" class='dayButton' value="+weekdayNums[j]+" onClick=selectDay("+weekdayNums[j]+")> <h6>"+ fiveDays[j] +"</h6> <p>"+days[j]+"</p> <p class='dayMonth'>"+ months[j].substring(0,3).toUpperCase() +"</p> </button> </div>"
        }
        daySelect.innerHTML= innerHTML;
    }
    chosenDate = dates[0];
}

getDays();

function selectDay (value) {
    var dateIndex = weekdayNums.indexOf(value);
    chosenDate = dates[dateIndex]
    chosenDay = value;
    //Quick fix for error when selecting sunday
    if (chosenDay === -1){
        chosenDay = 6
    }
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


//Error handling for date times in the past
var timeBox = document.getElementById('time');
var currentTime = moment().format("HH:mm");
timeBox.value = currentTime;


setInterval(()=>{
    currentTime = moment().format("HH:mm");
    timeBox.value = currentTime; 
},60000)

timeBox.addEventListener('input', ()=>{
    var updatedTime = moment().format("HH:mm");
    if(chosenDay === weekdayNums[0] && timeBox.value < updatedTime){
        document.getElementById('timeError').style.display = 'block'
        timeBox.value = updatedTime; 
        setTimeout(()=>{
            document.getElementById('timeError').style.display = 'none'
        },6000)
    }  
})

timeBox.addEventListener('input', ()=>{
    var futureTime = moment().add(3, "hours").format("HH:mm");
    console.log(futureTime)
    let dapArrOption;
    if(document.getElementById('radio-a').checked) {
        depArroption = "depart_at"
    }else if(document.getElementById('radio-b').checked) {
        depArroption = "arrive_by"
    }
    if(chosenDay === weekdayNums[0] && timeBox.value < futureTime && depArroption === "arrive_by"){
        document.getElementById('futuretimeError').style.display = 'block'
        timeBox.value = futureTime; 
        setTimeout(()=>{
            document.getElementById('futuretimeError').style.display = 'none'
        },6000)
    }  
})


//Error handling for missing inputs of stop boxes
document.getElementById('planRouteSubmit').addEventListener('click', () =>{
    if(document.getElementById('startLocation').value === ""){
        document.getElementById('startStopError').style.display = 'block';
        document.getElementById('planRouteSectionContainter').scrollIntoView(true)
    }
    if(document.getElementById('endLocation').value === ""){
        document.getElementById('endStopError').style.display = 'block';
        document.getElementById('planRouteSectionContainter').scrollIntoView(true)
    }

})

//Clear error messages
document.getElementById('startLocation').addEventListener('click', () => {
    document.getElementById('startStopError').style.display = 'none';
})

document.getElementById('endLocation').addEventListener('click', () => {
    document.getElementById('endStopError').style.display = 'none';
})






