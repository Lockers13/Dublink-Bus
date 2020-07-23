let weatherList = [];

fetch('http://api.openweathermap.org/data/2.5/forecast?id=2964574&appid=b1ee46f8fbe84528da68642cbfa3ff78&units=metric')
  .then((response) => {
    return response.json();
  })
  .then((data) => {
  	for (var i =0; i<data.list.length; i++){
  		weatherList.push(data.list[i]);
  	}
  })