const get_button = document.getElementById('planRouteSubmit')
const directions = document.getElementById('results2')

function handleClick(event) {
    let addr1 = document.getElementById('startLocation').value
    let addr2 = document.getElementById('endLocation').value
    addr1 = addr1.replace(" ", "%20").replace("'", "%27")
    addr2 = addr2.replace(" ", "%20").replace("'", "%27")

    fetch("http://localhost:8000/routes/api/find_route?start_addr=" + addr1 +
            "&end_addr=" + addr2)
    .then(response => response.json())
    .then(function (data) {
        directions.innerHTML = ""
        let route_keys = Object.keys(data)
        var count = 1
        for(let i = 0; i < route_keys.length; i++) {
  
            let route = route_keys[i]
            step_keys = Object.keys(data[route])
            if(data[route]["routable"] == "b") {
                directions.innerHTML += "<h2>Route " + count++ + "</h2>"
                for(let j = 0; j < step_keys.length; j++) {
                    let step = "Step_" + (j+1)
                    directions.innerHTML += "-> " + data[route][step]["Instructions"] + "<br>"
                    if(Object.keys(data[route][step]).length > 1) {
                        directions.innerHTML += "<ul style'margin-left:200px;'>"
                        directions.innerHTML += "<li>Line: " + data[route][step]["Line"] + "</li>"
                        directions.innerHTML += "<li>Departure Stop: " + data[route][step]["Departure Stop Name"] + "</li>"
                        directions.innerHTML += "<li>Arrival Stop: " + data[route][step]["Arrival Stop Name"] + "</li>"
                        directions.innerHTML += "</ul><br>"
                    }
                }
                directions.innerHTML += "<br>"
            }
        }
    })
}

get_button.addEventListener("click", handleClick)
