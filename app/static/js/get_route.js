// const get_button = document.getElementById('planRouteSubmit')
// const directions = document.getElementById('results2')

// function get_markers(route_obj) {
//     fetch("http://localhost:8000/routes/api/routemaps?lineid=" + route_obj["Line"] +
//                                                     "&start=" + route_obj["Departure Stop"] +
//                                                     "&end=" + route_obj["Arrival Stop"] + 
//                                                     "&routeid=" + route_obj["Route ID"])
//         .then(response => response.json())
//         .then(function (data) {
//             console.log(data)
//         })
// }

// function handleClick(event) {
//     let addr1 = document.getElementById('startLocation').value
//     let addr2 = document.getElementById('endLocation').value
//     addr1 = addr1.replace(" ", "%20").replace("'", "%27")
//     addr2 = addr2.replace(" ", "%20").replace("'", "%27")

//     fetch("http://localhost:8000/routes/api/find_route?start_addr=" + addr1 +
//         "&end_addr=" + addr2)
//         .then(response => response.json())
//         .then(function (data) {
//             directions.innerHTML = ""
//             let route_keys = Object.keys(data)
//             let count = 0
//             let route_info = []
//             for (let i = 0; i < route_keys.length; i++) {
//                 let route = route_keys[i]
//                 step_keys = Object.keys(data[route])
//                 if (data[route]["routable"] == "b") {
//                     directions.innerHTML += "<h2>Route " + ++count + "</h2><button class='route_plot' id='route" + count + "' style='display:block;clear:both;'>Plot Route</button><br>"
//                     for (let j = 0; j < step_keys.length; j++) {
//                         let step = "Step_" + (j + 1)
//                         try {
//                             directions.innerHTML += "-> " + data[route][step]["Instructions"] + "<br>"

//                             if (Object.keys(data[route][step]).length > 1) {
//                                 route_info.push({
//                                     "Line": data[route][step]["Line"],
//                                     "Departure Stop": data[route][step]["Route Validation"]["Start_stop"],
//                                     "Arrival Stop": data[route][step]["Route Validation"]["End stop"],
//                                     "Route ID": data[route][step]["Route Validation"]["Route ID"]
//                                 })
//                                 directions.innerHTML += "<ul style'margin-left:200px;'>"
//                                 directions.innerHTML += "<li>Line: " + data[route][step]["Line"] + "</li>"
//                                 directions.innerHTML += "<li>Departure Stop: " + data[route][step]["Departure Stop Name"] + "</li>"
//                                 directions.innerHTML += "<li>Arrival Stop: " + data[route][step]["Arrival Stop Name"] + "</li>"
//                                 directions.innerHTML += "</ul><br>"
//                             }
//                         }
//                         catch {
//                             ;
//                         }
//                     }
//                     directions.innerHTML += "<br>"
//                 }
//             }

//             let plot_btns = document.getElementsByClassName('route_plot')
//             for(let i = 0; i < plot_btns.length; i++) {
//                 plot_btns[i].addEventListener("click", get_markers.bind(event, route_info[i]))
//             }
            
//         })
// }


// get_button.addEventListener("click", handleClick)
